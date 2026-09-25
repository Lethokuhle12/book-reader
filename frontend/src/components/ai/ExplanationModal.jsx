import LoadingSpinner from "../common/LoadingSpinner";

const ExplanationModal = ({ explanation, loading, error, onClose, onResume }) => {
    if (!explanation && !loading && !error) return null;

    const handleContinue = () => {
        onClose();
        if (onResume) onResume();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card explanation-card">
                <div className="modal-header">
                    <span className="ai-badge">✨ AI Explanation</span>
                    <button className="close-btn" onClick={onClose} aria-label="Close">
                        &times;
                    </button>
                </div>

                <div className="modal-body">
                    {loading && (
                        <div className="explanation-loading">
                            <LoadingSpinner />
                            <p>Analyzing context and generating explanation...</p>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            <strong>Could not get explanation</strong>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && explanation && (
                        <div className="explanation-content">
                            <h2 className="explanation-term">
                                {explanation.term}
                                {explanation.pronunciation && (
                                    <span className="pronunciation"> [{explanation.pronunciation}]</span>
                                )}
                            </h2>

                            {explanation.definition && (
                                <div className="explanation-section">
                                    <h4>Definition</h4>
                                    <p>{explanation.definition}</p>
                                </div>
                            )}

                            {explanation.contextualMeaning && (
                                <div className="explanation-section context-meaning">
                                    <h4>In this context</h4>
                                    <p>{explanation.contextualMeaning}</p>
                                </div>
                            )}

                            {explanation.example && (
                                <div className="explanation-section example-box">
                                    <h4>Example</h4>
                                    <p>{explanation.example}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="control-btn primary continue-btn" onClick={handleContinue}>
                        ▶ Resume Reading
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExplanationModal;
