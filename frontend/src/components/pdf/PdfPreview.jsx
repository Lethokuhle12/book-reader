import { useState, useRef, useEffect } from "react";

const PdfPreview = ({
    filename,
    text,
    currentChunkIndex = -1,
    chunks = [],
    onExplainSelection,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectionInfo, setSelectionInfo] = useState(null);
    const [copied, setCopied] = useState(false);
    const textContainerRef = useRef(null);

    // Handle text selection in the preview
    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            return;
        }

        const selectedText = selection.toString().trim();
        if (selectedText.length > 0 && selectedText.length < 300) {
            const anchorNode = selection.anchorNode;
            let fullParagraph = text;
            if (anchorNode && anchorNode.parentElement) {
                fullParagraph = anchorNode.parentElement.textContent || text;
            }

            // Find context sentence
            const sentenceMatch = fullParagraph.match(
                new RegExp(`[^.!?]*${selectedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^.!?]*[.!?]`, "i")
            );
            const contextSentence = sentenceMatch ? sentenceMatch[0].trim() : fullParagraph.slice(0, 300);

            // Get range coordinates for floating action button
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            setSelectionInfo({
                text: selectedText,
                context: contextSentence,
                top: rect.top + window.scrollY - 45,
                left: rect.left + window.scrollX + rect.width / 2,
            });
        }
    };

    const handleClearSelection = () => {
        setSelectionInfo(null);
    };

    useEffect(() => {
        const handleDocumentClick = (e) => {
            if (selectionInfo && !e.target.closest(".selection-popover")) {
                setTimeout(() => setSelectionInfo(null), 200);
            }
        };
        document.addEventListener("mousedown", handleDocumentClick);
        return () => document.removeEventListener("mousedown", handleDocumentClick);
    }, [selectionInfo]);

    const handleCopyText = () => {
        if (text) {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Calculate search occurrences
    const searchMatches = searchQuery.trim()
        ? (text.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length
        : 0;

    return (
        <section className="pdf-preview">
            <div className="pdf-preview-header-bar">
                <div>
                    <span className="pdf-preview-header">Your Book</span>
                    <h2>{filename}</h2>
                </div>

                <div className="pdf-actions">
                    <button onClick={handleCopyText} className="control-btn secondary mini-btn">
                        {copied ? "✓ Copied!" : "📋 Copy Text"}
                    </button>
                </div>
            </div>

            {/* In-Book Search */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="🔍 Search within book..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery.trim() && (
                    <span className="search-count">
                        {searchMatches} match{searchMatches === 1 ? "" : "es"} found
                    </span>
                )}
            </div>

            {/* Floating Selection Popover */}
            {selectionInfo && (
                <div
                    className="selection-popover"
                    style={{
                        top: `${selectionInfo.top}px`,
                        left: `${selectionInfo.left}px`,
                    }}
                >
                    <button
                        onClick={() => {
                            if (onExplainSelection) {
                                onExplainSelection(selectionInfo.text, selectionInfo.context);
                            }
                            handleClearSelection();
                        }}
                    >
                        ✨ Explain "{selectionInfo.text.length > 20 ? selectionInfo.text.slice(0, 20) + "..." : selectionInfo.text}"
                    </button>
                </div>
            )}

            {/* Book Text Display */}
            <div
                className="pdf-text"
                ref={textContainerRef}
                onMouseUp={handleMouseUp}
            >
                {chunks && chunks.length > 0 ? (
                    chunks.map((chunk, idx) => {
                        const isCurrent = idx === currentChunkIndex;
                        let chunkDisplay = chunk;

                        // Highlight search matches
                        if (searchQuery.trim()) {
                            const parts = chunk.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
                            chunkDisplay = parts.map((part, pIdx) =>
                                part.toLowerCase() === searchQuery.toLowerCase() ? (
                                    <mark key={pIdx} className="search-highlight">{part}</mark>
                                ) : (
                                    part
                                )
                            );
                        }

                        return (
                            <span
                                key={idx}
                                className={`text-chunk ${isCurrent ? "current-reading-chunk" : ""}`}
                            >
                                {chunkDisplay}{" "}
                            </span>
                        );
                    })
                ) : (
                    text
                )}
            </div>
        </section>
    );
};

export default PdfPreview;
