import { useEffect,useRef,useState } from "react"

const useSpeech = () =>{


    const [speaking, setSpeaking] =useState(false);
    const [paused, setPaused] =useState(false);
    const [voices, setVoices] =useState([]);
    const [selectedVoice, setSelectedVoice] =useState(null);
    const [rate, setRate] =useState(1);

    const textRef = useRef("");
    const chunksRef = useRef([]);
    const currentChunkRef = useRef(0);

 useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();

            setVoices(availableVoices);

            if (availableVoices.length > 0 && !selectedVoice) {
                const preferredVoice =
                    availableVoices.find(
                        (voice) =>
                            voice.lang.startsWith("en") &&
                            voice.name.toLowerCase().includes("female")
                    ) ||
                    availableVoices.find((voice) =>
                        voice.lang.startsWith("en")
                    ) ||
                    availableVoices[0];

                setSelectedVoice(preferredVoice);
            }
        };

        loadVoices();

        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.cancel();
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [selectedVoice]);

const cleanText = (text) => {
    return text
        // URLs with http/https
        .replace(/https?:\/\/\S+/gi, " ")

        // www URLs
        .replace(/www\.\S+/gi, " ")

        // Common URL patterns
        .replace(/\b[a-zA-Z0-9-]+\.(com|org|net|edu|gov|co\.za)\S*/gi, " ")

        // Email addresses
        .replace(
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
            " "
        )

        // Multiple spaces/newlines
        .replace(/\s+/g, " ")

        .trim();
};

const splitText = (text) => {
    const cleanedText = cleanText(text);

    return (
        cleanedText.match(/.{1,250}(?:\s|$)/g) || []
    );
};

const speakChunk = () => {
        if (currentChunkRef.current >= chunksRef.current.length) {
            setSpeaking(false);
            setPaused(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(
            chunksRef.current[currentChunkRef.current]
        );

        utterance.voice = selectedVoice;
        utterance.rate = rate;
        utterance.pitch = 1;

        utterance.onend = () => {
            currentChunkRef.current += 1;

            if (!paused) {
                speakChunk();
            }
        };

        utterance.onerror = () => {
            setSpeaking(false);
            setPaused(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const speak = (text) => {
        if (!text) return;

        window.speechSynthesis.cancel();

        textRef.current = text;
        chunksRef.current = splitText(text);
        currentChunkRef.current = 0;

        setPaused(false);
        setSpeaking(true);

        speakChunk();
    };

    const pause = () => {
        window.speechSynthesis.pause();
        setPaused(true);
    };

    const resume = () => {
        window.speechSynthesis.resume();
        setPaused(false);
    };

    const stop = () => {
        window.speechSynthesis.cancel();

        setSpeaking(false);
        setPaused(false);

        currentChunkRef.current = 0;
    };

    const changeRate = (newRate) => {
        setRate(newRate);

        if (speaking) {
            window.speechSynthesis.cancel();

            setTimeout(() => {
                const currentText = chunksRef.current.join(" ");

                speak(currentText);
            }, 100);
        }
    };

    return {
        speaking,
        paused,
        voices,
        selectedVoice,
        setSelectedVoice,
        rate,
        changeRate,
        speak,
        pause,
        resume,
        stop,
    };
};

export default useSpeech;