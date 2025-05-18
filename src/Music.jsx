import React, { useState, useEffect, useRef } from 'react';

function AudioPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(new Audio('/music.mp3'));

    useEffect(() => {
        const audio = audioRef.current;
        audio.loop = true;
        audio.volume = 0.5;

        // Don't auto-play on mount since we want it muted
        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []); // Only run once on mount

    const togglePlay = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Playback failed:", error);
                });
            }
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '10px',
            borderRadius: '5px',
            color: 'white'
        }}>
            <button 
                onClick={togglePlay}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                {isPlaying ? '🔊' : '🔈'}
            </button>
        </div>
    );
}

export default AudioPlayer;
