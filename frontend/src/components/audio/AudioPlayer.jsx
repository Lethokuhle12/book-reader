import useSpeech from "../../hooks/useSpeech";

const AudioPlayer = ({ text, filename }) => {
    const {
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
    } = useSpeech();

    const handlePlay = () => {
        speak(text);
    };

    return (
        <section className="audio-player">

            <div className="audio-player-header">

                <div>
                    <span className="audio-label">
                        NOW READING
                    </span>

                    <h2>{filename}</h2>
                </div>

                <div className="audio-status">
                    {speaking
                        ? paused
                            ? "Paused"
                            : "Reading..."
                        : "Ready"}
                </div>

            </div>

            <div className="audio-controls">

                {!speaking && (
                    <button onClick={handlePlay}>
                        ▶ Read to me
                    </button>
                )}

                {speaking && !paused && (
                    <button onClick={pause}>
                        ⏸ Pause
                    </button>
                )}

                {speaking && paused && (
                    <button onClick={resume}>
                        ▶ Resume
                    </button>
                )}

                {speaking && (
                    <button onClick={stop}>
                        ■ Stop
                    </button>
                )}

            </div>

            <div className="audio-settings">

                <div className="setting">

                    <label htmlFor="voice">
                        Voice
                    </label>

                    <select
                        id="voice"
                        value={selectedVoice?.name || ""}
                        onChange={(event) => {

                            const voice = voices.find(
                                (item) =>
                                    item.name === event.target.value
                            );

                            setSelectedVoice(voice);
                        }}
                    >
                        {voices.map((voice) => (
                            <option
                                key={`${voice.name}-${voice.lang}`}
                                value={voice.name}
                            >
                                {voice.name} ({voice.lang})
                            </option>
                        ))}
                    </select>

                </div>

                <div className="setting">

                    <label htmlFor="speed">
                        Speed: {rate}x
                    </label>

                    <select
                        id="speed"
                        value={rate}
                        onChange={(event) =>
                            changeRate(Number(event.target.value))
                        }
                    >
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="1.75">1.75x</option>
                        <option value="2">2x</option>
                    </select>

                </div>

            </div>

        </section>
    );
};

export default AudioPlayer;