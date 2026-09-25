import useSpeech from "../../hooks/useSpeech";

const AudioPlayer = ({
    text,
    filename,
    speechControl,
    onExplainClick,
}) => {
    // Internal speech instance if not provided externally
    const internalSpeech = useSpeech();
    const speech = speechControl || internalSpeech;

    const {
        speaking,
        paused,
        voices,
        selectedVoice,
        setSelectedVoice,
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
        chunks = [],
    } = speech;

    const handlePlay = () => {
        speak(text);
    };

    // Group voices by region/language
    const groupedVoices = voices.reduce((acc, voice) => {
        const group = voice.region || voice.lang || "Other";
        if (!acc[group]) acc[group] = [];
        acc[group].push(voice);
        return acc;
    }, {});

    // Calculate remaining reading time
    const calculateRemainingTime = () => {
        if (!chunks || chunks.length === 0) return null;
        const remainingChunks = chunks.slice(currentChunk);
        const remainingText = remainingChunks.join(" ");
        const wordCount = remainingText.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount === 0) return "0 min";

        const baseWpm = 160; // average words per minute at 1.0x rate
        const effectiveWpm = baseWpm * (rate || 1);
        const totalMinutes = wordCount / effectiveWpm;

        const minutes = Math.floor(totalMinutes);
        const seconds = Math.round((totalMinutes - minutes) * 60);

        if (minutes === 0) {
            return `${seconds} sec`;
        }
        return `${minutes} min ${seconds > 0 ? `${seconds}s` : ""}`;
    };

    const progressPercentage = totalChunks > 0
        ? Math.round(((currentChunk + 1) / totalChunks) * 100)
        : 0;

    return (
        <section className="audio-player">
            <div className="audio-player-header">
                <div>
                    <span className="audio-label">NOW READING</span>
                    <h2>{filename}</h2>
                </div>

                <div className="audio-status-box">
                    <span className="audio-status">
                        {speaking
                            ? paused
                                ? "⏸ Paused"
                                : `▶ Reading (${currentChunk + 1}/${totalChunks || 1})`
                            : "⏹ Ready"}
                    </span>
                    {speaking && (
                        <span className="remaining-time">
                            ⏱ ~{calculateRemainingTime()} remaining
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-container">
                <div className="progress-bar-bg" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const ratio = clickX / rect.width;
                    const targetIndex = Math.floor(ratio * totalChunks);
                    jumpToChunk(targetIndex);
                }}>
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <div className="progress-labels">
                    <span>Chunk {currentChunk + 1} of {totalChunks || 1}</span>
                    <span>{progressPercentage}% completed</span>
                </div>
            </div>

            {/* Main Audio Controls */}
            <div className="audio-controls">
                <button
                    onClick={skipBackward}
                    disabled={!speaking}
                    title="Skip backward"
                    className="control-btn secondary"
                >
                    ⏪ Back
                </button>

                {!speaking && (
                    <button onClick={handlePlay} className="control-btn primary">
                        ▶ Read to me
                    </button>
                )}

                {speaking && !paused && (
                    <button onClick={pause} className="control-btn primary">
                        ⏸ Pause
                    </button>
                )}

                {speaking && paused && (
                    <button onClick={resume} className="control-btn primary">
                        ▶ Resume
                    </button>
                )}

                {speaking && (
                    <button onClick={stop} className="control-btn danger">
                        ■ Stop
                    </button>
                )}

                <button
                    onClick={skipForward}
                    disabled={!speaking}
                    title="Skip forward"
                    className="control-btn secondary"
                >
                    Forward ⏩
                </button>

                {onExplainClick && (
                    <button
                        onClick={onExplainClick}
                        className="control-btn explain-btn"
                        title="Pause and explain selected or typed text"
                    >
                        ✨ Explain
                    </button>
                )}
            </div>

            {/* Audio Settings */}
            <div className="audio-settings">
                <div className="setting">
                    <label htmlFor="voice">Voice</label>
                    <select
                        id="voice"
                        value={selectedVoice?.name || ""}
                        onChange={(event) => {
                            const voice = voices.find(
                                (item) => item.name === event.target.value
                            );
                            if (voice) setSelectedVoice(voice);
                        }}
                    >
                        {Object.entries(groupedVoices).map(([group, groupVoices]) => (
                            <optgroup key={group} label={group}>
                                {groupVoices.map((voice) => (
                                    <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                                        {voice.displayName || voice.name} ({voice.gender || "Voice"})
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                <div className="setting">
                    <label htmlFor="speed">Speed: {rate}x</label>
                    <select
                        id="speed"
                        value={rate}
                        onChange={(event) => changeRate(Number(event.target.value))}
                    >
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="1.75">1.75x</option>
                        <option value="2">2x</option>
                    </select>
                </div>

                <div className="setting">
                    <label htmlFor="volume">Volume: {Math.round(volume * 100)}%</label>
                    <input
                        id="volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                    />
                </div>
            </div>
        </section>
    );
};

export default AudioPlayer;
