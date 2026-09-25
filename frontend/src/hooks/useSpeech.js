import { useEffect, useRef, useState } from "react";
import { getBackendVoices, generateBackendAudio } from "../services/api";

const useSpeech = () => {
    const [speaking, setSpeaking] = useState(false);
    const [paused, setPaused] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [rate, setRate] = useState(1);
    const [volume, setVolume] = useState(1);
    const [currentChunk, setCurrentChunk] = useState(0);
    const [totalChunks, setTotalChunks] = useState(0);

    const textRef = useRef("");
    const chunksRef = useRef([]);
    const currentChunkRef = useRef(0);
    const isPausedRef = useRef(false);
    const audioRef = useRef(null);

    // Save selected voice to localStorage
    const handleSetSelectedVoice = (voice) => {
        setSelectedVoice(voice);
        if (voice) {
            const voiceKey = voice.voiceURI || voice.name;
            localStorage.setItem("bookreader_voice", voiceKey);
        }
    };

    useEffect(() => {
        const parseVoiceMetadata = (voice) => {
            const nameLower = voice.name.toLowerCase();
            const lang = voice.lang || "en-US";
            let gender = "Neutral";
            if (nameLower.includes("female") || nameLower.includes("zira") || nameLower.includes("eva") || nameLower.includes("jenny") || nameLower.includes("aria") || nameLower.includes("sonia")) {
                gender = "Female";
            } else if (nameLower.includes("male") || nameLower.includes("david") || nameLower.includes("guy") || nameLower.includes("ryan") || nameLower.includes("andrew")) {
                gender = "Male";
            }

            let region = "Global";
            if (lang.includes("US") || lang.includes("en-US")) region = "US English";
            else if (lang.includes("GB") || lang.includes("en-GB")) region = "UK English";
            else if (lang.includes("AU") || lang.includes("en-AU")) region = "Australian English";
            else if (lang.includes("es")) region = "Spanish";
            else if (lang.includes("fr")) region = "French";
            else if (lang.includes("de")) region = "German";

            return {
                ...voice,
                displayName: voice.name.replace(/Microsoft |Google |Apple /gi, "").trim(),
                gender,
                region,
                isBackend: false,
            };
        };

        const loadVoices = async () => {
            const browserVoices = window.speechSynthesis.getVoices().map(parseVoiceMetadata);
            const backendVoices = await getBackendVoices();

            const combinedVoices = [...browserVoices];

            // Add backend voices with explicit provider info
            backendVoices.forEach((bv) => {
                if (!combinedVoices.some((v) => v.name === bv.name)) {
                    combinedVoices.push({
                        name: bv.name,
                        displayName: `${bv.displayName || bv.name} [Azure]`,
                        lang: bv.language,
                        gender: bv.gender,
                        region: bv.region || "Azure Neural",
                        isBackend: true,
                        voiceURI: bv.name,
                    });
                }
            });

            setVoices(combinedVoices);

            const savedVoiceKey = localStorage.getItem("bookreader_voice");

            if (combinedVoices.length > 0) {
                let initialVoice = null;

                if (savedVoiceKey) {
                    initialVoice = combinedVoices.find(
                        (v) => (v.voiceURI || v.name) === savedVoiceKey || v.name === savedVoiceKey
                    );
                }

                if (!initialVoice) {
                    initialVoice =
                        combinedVoices.find(
                            (v) =>
                                (v.lang || "").startsWith("en") &&
                                (v.name.toLowerCase().includes("natural") ||
                                 v.name.toLowerCase().includes("online") ||
                                 v.gender === "Female")
                        ) ||
                        combinedVoices.find((v) => (v.lang || "").startsWith("en")) ||
                        combinedVoices[0];
                }

                if (initialVoice && (!selectedVoice || (selectedVoice.name !== initialVoice.name))) {
                    setSelectedVoice(initialVoice);
                }
            }
        };

        loadVoices();

        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            stopAudioElement();
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    const stopAudioElement = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
    };

    const cleanText = (text) => {
        if (!text) return "";
        return text
            .replace(/https?:\/\/\S+/gi, " ")
            .replace(/www\.\S+/gi, " ")
            .replace(/\b[a-zA-Z0-9-]+\.(com|org|net|edu|gov|co\.za)\S*/gi, " ")
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const splitText = (text) => {
        const cleanedText = cleanText(text);
        if (!cleanedText) return [];
        const matched = cleanedText.match(/[^.!?]+[.!?]+(\s|$)|.{1,200}(?:\s|$)/g);
        return (matched || [cleanedText]).map((s) => s.trim()).filter(Boolean);
    };

    const speakChunk = async () => {
        if (currentChunkRef.current >= chunksRef.current.length) {
            setSpeaking(false);
            setPaused(false);
            isPausedRef.current = false;
            return;
        }

        setCurrentChunk(currentChunkRef.current);

        const chunkText = chunksRef.current[currentChunkRef.current];
        if (!chunkText) {
            currentChunkRef.current += 1;
            speakChunk();
            return;
        }

        stopAudioElement();
        window.speechSynthesis.cancel();

        // Route through Backend Azure TTS if backend voice selected
        if (selectedVoice && selectedVoice.isBackend) {
            try {
                const blob = await generateBackendAudio({
                    text: chunkText,
                    voice: selectedVoice.name,
                    rate,
                });

                if (blob && blob.size > 0 && !isPausedRef.current) {
                    const audioUrl = URL.createObjectURL(blob);
                    const audio = new Audio(audioUrl);
                    audio.volume = volume;

                    audio.onended = () => {
                        URL.revokeObjectURL(audioUrl);
                        if (!isPausedRef.current) {
                            currentChunkRef.current += 1;
                            speakChunk();
                        }
                    };

                    audio.onerror = (e) => {
                        console.warn("Backend audio element playback error, falling back to Web Speech:", e);
                        speakWithBrowserUtterance(chunkText);
                    };

                    audioRef.current = audio;
                    await audio.play();
                    return;
                }
            } catch (err) {
                console.warn("Failed to generate backend audio, falling back to Web Speech:", err);
            }
        }

        // Web Speech API fallback / browser voice handling
        speakWithBrowserUtterance(chunkText);
    };

    const speakWithBrowserUtterance = (chunkText) => {
        const utterance = new SpeechSynthesisUtterance(chunkText);

        if (selectedVoice && !selectedVoice.isBackend) {
            utterance.voice = selectedVoice;
        }
        utterance.rate = rate;
        utterance.volume = volume;
        utterance.pitch = 1;

        utterance.onend = () => {
            if (!isPausedRef.current) {
                currentChunkRef.current += 1;
                speakChunk();
            }
        };

        utterance.onerror = (e) => {
            console.warn("Speech synthesis error:", e);
            if (isPausedRef.current) {
                return;
            }
            if (currentChunkRef.current < chunksRef.current.length - 1) {
                currentChunkRef.current += 1;
                speakChunk();
            } else {
                setSpeaking(false);
                setPaused(false);
                isPausedRef.current = false;
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const speak = (text, startFromChunk = 0) => {
        if (!text) return;

        stopAudioElement();
        window.speechSynthesis.cancel();

        textRef.current = text;
        const chunks = splitText(text);
        chunksRef.current = chunks;
        setTotalChunks(chunks.length);

        currentChunkRef.current = Math.min(startFromChunk, chunks.length - 1);
        if (currentChunkRef.current < 0) currentChunkRef.current = 0;

        setCurrentChunk(currentChunkRef.current);
        setPaused(false);
        isPausedRef.current = false;
        setSpeaking(true);

        speakChunk();
    };

    const pause = () => {
        isPausedRef.current = true;
        if (audioRef.current) {
            audioRef.current.pause();
        }
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
        setPaused(true);
    };

    const resume = () => {
        isPausedRef.current = false;
        setPaused(false);
        setSpeaking(true);
        if (audioRef.current && selectedVoice?.isBackend) {
            audioRef.current.play().catch(() => speakChunk());
        } else {
            speakChunk();
        }
    };

    const stop = () => {
        isPausedRef.current = false;
        stopAudioElement();
        window.speechSynthesis.cancel();
        setSpeaking(false);
        setPaused(false);
        currentChunkRef.current = 0;
        setCurrentChunk(0);
    };

    const changeRate = (newRate) => {
        setRate(newRate);
        if (speaking && !paused) {
            stopAudioElement();
            window.speechSynthesis.cancel();
            setTimeout(() => {
                speakChunk();
            }, 50);
        }
    };

    const changeVoice = (newVoice) => {
        handleSetSelectedVoice(newVoice);
        if (speaking && !paused) {
            stopAudioElement();
            window.speechSynthesis.cancel();
            setTimeout(() => {
                speakChunk();
            }, 50);
        }
    };

    const skipForward = () => {
        if (chunksRef.current.length === 0) return;
        stopAudioElement();
        window.speechSynthesis.cancel();
        currentChunkRef.current = Math.min(currentChunkRef.current + 1, chunksRef.current.length - 1);
        setCurrentChunk(currentChunkRef.current);
        if (speaking && !paused) {
            speakChunk();
        }
    };

    const skipBackward = () => {
        if (chunksRef.current.length === 0) return;
        stopAudioElement();
        window.speechSynthesis.cancel();
        currentChunkRef.current = Math.max(currentChunkRef.current - 1, 0);
        setCurrentChunk(currentChunkRef.current);
        if (speaking && !paused) {
            speakChunk();
        }
    };

    const jumpToChunk = (index) => {
        if (chunksRef.current.length === 0) return;
        stopAudioElement();
        window.speechSynthesis.cancel();
        currentChunkRef.current = Math.max(0, Math.min(index, chunksRef.current.length - 1));
        setCurrentChunk(currentChunkRef.current);
        if (speaking && !paused) {
            speakChunk();
        }
    };

    return {
        speaking,
        paused,
        voices,
        selectedVoice,
        setSelectedVoice: changeVoice,
        rate,
        changeRate,
        volume,
        setVolume,
        currentChunk,
        totalChunks,
        speak,
        pause,
        resume,
        stop,
        skipForward,
        skipBackward,
        jumpToChunk,
        chunks: chunksRef.current,
    };
};

export default useSpeech;
