import React, { Suspense, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Canvas } from "@react-three/fiber";
import AudioPlayer from "./Music.jsx";
import Score from "./Score";
import "./index.css";

function WelcomeOverlay() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!showWelcome) return null;

  return (
    <div className="welcome-overlay">
      Welcome to CodeMonsters Jet Fighter Final Project
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#000',
      color: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '24px',
      zIndex: 1000
    }}>
      Loading Game Assets...
    </div>
  );
}

function Game() {
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleScoreUpdate = (points) => {
    setScore(prevScore => Math.max(0, prevScore + points));
  };

  useEffect(() => {
    window.onScoreUpdate = handleScoreUpdate;
    return () => {
      window.onScoreUpdate = null;
    };
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <Score score={score} />
      <Canvas 
        shadows
        gl={{
          outputColorSpace: 'srgb',
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
          precision: 'lowp'
        }}
        dpr={[0.5, 1]}
      >
        <Suspense fallback={null}>
          <App onScoreUpdate={handleScoreUpdate} onLoad={() => setIsLoading(false)} />
        </Suspense>
      </Canvas>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <WelcomeOverlay />
    <AudioPlayer />
    <Game />
  </>
);
