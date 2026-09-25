import { useState, useEffect } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PdfPreview from "../components/pdf/PdfPreview";
import PdfUploader from "../components/pdf/PdfUploader";
import usePdf from "../hooks/usePdf";
import useSpeech from "../hooks/useSpeech";
import AudioPlayer from "../components/audio/AudioPlayer";
import ContinueReadingModal from "../components/common/ContinueReadingModal";
import ExplanationModal from "../components/ai/ExplanationModal";
import { calculateBookId, getBookProgress, saveBookProgress } from "../utils/bookHash";
import { explainText } from "../services/api";

const Home = () => {
    const { pdf, loading, error, uploadPdf } = usePdf();
    const speech = useSpeech();

    // Dark Mode Theme State
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("bookreader_theme") === "dark";
    });

    // Saved Progress & Continue Reading Modal
    const [savedProgress, setSavedProgress] = useState(null);
    const [showContinueModal, setShowContinueModal] = useState(false);
    const [currentBookId, setCurrentBookId] = useState(null);

    // AI Explanation State
    const [explanation, setExplanation] = useState(null);
    const [explainingLoading, setExplainingLoading] = useState(false);
    const [explainingError, setExplainingError] = useState(null);
    const [manualTermInput, setManualTermInput] = useState("");
    const [showManualExplainBox, setShowManualExplainBox] = useState(false);
    const [wasSpeakingBeforeExplain, setWasSpeakingBeforeExplain] = useState(false);

    // Apply dark mode class to document body
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("bookreader_theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("bookreader_theme", "light");
        }
    }, [isDarkMode]);

    // When a PDF is loaded, calculate book ID and check for saved progress
    useEffect(() => {
        if (pdf && pdf.text) {
            const bookId = calculateBookId(pdf.filename, pdf.text);
            setCurrentBookId(bookId);
            const progress = getBookProgress(bookId);
            if (progress && progress.currentChunk > 0) {
                setSavedProgress(progress);
                setShowContinueModal(true);
            }
        }
    }, [pdf]);

    // Save reading progress periodically when chunk or rate or voice changes
    useEffect(() => {
        if (currentBookId && speech.speaking && speech.totalChunks > 0) {
            saveBookProgress(currentBookId, {
                currentChunk: speech.currentChunk,
                totalChunks: speech.totalChunks,
                rate: speech.rate,
                voiceName: speech.selectedVoice?.name || "",
                filename: pdf?.filename,
            });
        }
    }, [currentBookId, speech.currentChunk, speech.speaking, speech.rate, speech.selectedVoice, speech.totalChunks, pdf]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore keypresses inside input or textarea
            if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
                return;
            }

            if (e.code === "Space") {
                e.preventDefault();
                if (speech.speaking) {
                    if (speech.paused) speech.resume();
                    else speech.pause();
                } else if (pdf && pdf.text) {
                    speech.speak(pdf.text);
                }
            } else if (e.code === "ArrowLeft" && speech.speaking) {
                e.preventDefault();
                speech.skipBackward();
            } else if (e.code === "ArrowRight" && speech.speaking) {
                e.preventDefault();
                speech.skipForward();
            } else if (e.code === "Escape") {
                setShowContinueModal(false);
                setExplanation(null);
                setShowManualExplainBox(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [speech, pdf]);

    // Continue where left off
    const handleContinueReading = () => {
        setShowContinueModal(false);
        if (savedProgress && pdf && pdf.text) {
            speech.speak(pdf.text, savedProgress.currentChunk);
        }
    };

    // Start from beginning
    const handleRestartReading = () => {
        setShowContinueModal(false);
        if (pdf && pdf.text) {
            speech.speak(pdf.text, 0);
        }
    };

    // Request AI Explanation
    const handleExplain = async (term, contextText) => {
        if (!term) return;

        // Check if playback was active before triggering explanation
        const currentlyPlaying = speech.speaking && !speech.paused;
        setWasSpeakingBeforeExplain(currentlyPlaying);

        if (currentlyPlaying) {
            speech.pause();
        }

        setExplainingLoading(true);
        setExplainingError(null);
        setExplanation(null);

        try {
            const context = contextText || speech.chunks[speech.currentChunk] || pdf?.text?.slice(0, 300) || "";
            const result = await explainText({
                text: term,
                context,
                bookTitle: pdf?.filename || "Audiobook",
            });
            setExplanation(result);
        } catch (err) {
            setExplainingError(err.message || "Failed to fetch AI explanation.");
        } finally {
            setExplainingLoading(false);
        }
    };

    // Trigger manual text input explain
    const handleManualExplainSubmit = (e) => {
        e.preventDefault();
        if (manualTermInput.trim()) {
            handleExplain(manualTermInput.trim());
            setManualTermInput("");
            setShowManualExplainBox(false);
        }
    };

    return (
        <main className={`home ${isDarkMode ? "dark-theme" : ""}`}>
            <div className="top-nav-bar">
                <div className="brand-logo">📚 BookReader AI</div>
                <div className="nav-controls">
                    <button
                        className="theme-toggle-btn"
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        title="Toggle Dark Mode"
                    >
                        {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                    </button>
                </div>
            </div>

            <section className="hero-section">
                <span className="hero-label">PDF TO INTELLIGENT AUDIOBOOK</span>
                <h1>
                    Let your books
                    <br />
                    <span>read themselves</span>
                </h1>
                <p>
                    Upload a PDF, choose a natural voice, and listen seamlessly.
                    Pause anytime to get instant AI context explanations.
                </p>

                <PdfUploader onUpload={uploadPdf} loading={loading} />
            </section>

            {loading && <LoadingSpinner />}

            {error && (
                <div className="error-message">
                    <strong>Something went wrong</strong>
                    <p>{error}</p>
                </div>
            )}

            {pdf && !loading && (
                <>
                    <AudioPlayer
                        filename={pdf.filename}
                        text={pdf.text}
                        speechControl={speech}
                        onExplainClick={() => setShowManualExplainBox(true)}
                    />

                    {/* Manual Explain Input Popover */}
                    {showManualExplainBox && (
                        <div className="manual-explain-card">
                            <div className="card-header">
                                <h3>✨ Ask AI to Explain a Word or Phrase</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowManualExplainBox(false)}
                                >
                                    &times;
                                </button>
                            </div>
                            <form onSubmit={handleManualExplainSubmit} className="explain-form">
                                <input
                                    type="text"
                                    placeholder="Type word or phrase (e.g. 'ubiquitous')..."
                                    value={manualTermInput}
                                    onChange={(e) => setManualTermInput(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="control-btn primary">
                                    Explain
                                </button>
                            </form>
                            <p className="hint">
                                Tip: You can also highlight any text in the book preview below to explain it!
                            </p>
                        </div>
                    )}

                    <PdfPreview
                        filename={pdf.filename}
                        text={pdf.text}
                        currentChunkIndex={speech.currentChunk}
                        chunks={speech.chunks}
                        onExplainSelection={(term, context) => handleExplain(term, context)}
                    />
                </>
            )}

            {/* Continue Reading Modal */}
            {showContinueModal && (
                <ContinueReadingModal
                    progress={savedProgress}
                    onContinue={handleContinueReading}
                    onRestart={handleRestartReading}
                    onClose={() => setShowContinueModal(false)}
                />
            )}

            {/* AI Explanation Modal */}
            {(explanation || explainingLoading || explainingError) && (
                <ExplanationModal
                    explanation={explanation}
                    loading={explainingLoading}
                    error={explainingError}
                    wasSpeaking={wasSpeakingBeforeExplain}
                    onClose={() => {
                        setExplanation(null);
                        setExplainingError(null);
                    }}
                    onResume={() => speech.resume()}
                />
            )}
        </main>
    );
};

export default Home;
