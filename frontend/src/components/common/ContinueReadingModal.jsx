const ContinueReadingModal = ({ progress, onContinue, onRestart, onClose }) => {
    if (!progress) return null;

    const chunkNumber = (progress.currentChunk || 0) + 1;
    const totalChunks = progress.totalChunks || 1;
    const percentage = Math.round((chunkNumber / totalChunks) * 100);

    const formattedDate = progress.updatedAt
        ? new Date(progress.updatedAt).toLocaleString()
        : "";

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h3>Continue where you left off?</h3>
                    <button className="close-btn" onClick={onClose} aria-label="Close">
                        &times;
                    </button>
                </div>

                <div className="modal-body">
                    <p>
                        We saved your reading progress from {formattedDate || "earlier"}.
                    </p>
                    <div className="progress-badge">
                        <span>Chunk {chunkNumber} of {totalChunks}</span>
                        <span className="percentage">({percentage}%)</span>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="control-btn primary" onClick={onContinue}>
                        ▶ Continue Reading
                    </button>
                    <button className="control-btn secondary" onClick={onRestart}>
                        🔄 Start from Beginning
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContinueReadingModal;
