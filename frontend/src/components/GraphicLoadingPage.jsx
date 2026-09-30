import React, { useState, useEffect } from 'react';

export default function GraphicLoadingPage({ isLoading, progress = 100, onComplete }) {
  const [show, setShow] = useState(true);
  const [waveState, setWaveState] = useState(''); // 'show' or 'hideTop'

  useEffect(() => {
    if (!isLoading) {
      // Trigger wave transition
      setWaveState('showTransition');
      const timer = setTimeout(() => {
        setWaveState('hideTopTransition');
        setTimeout(() => {
          setShow(false);
          if (onComplete) onComplete();
        }, 800);
      }, 600);

      return () => clearTimeout(timer);
    } else {
      setShow(true);
      setWaveState('');
    }
  }, [isLoading]);

  if (!show && !isLoading) return null;

  // Calculate mask y offset: 61 is bottom (empty), 0 is top (full)
  const rectHeight = Math.min(61, Math.max(0, (progress / 100) * 61));
  const rectY = 61 - rectHeight;

  return (
    <>
      {/* Intro Center Graphic Loading Container */}
      <div
        id="intro-container"
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#12211c] transition-opacity duration-700 ${
          !isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="relative flex flex-col items-center">
          <svg
            id="intro-svg"
            viewBox="0 0 56 61"
            xmlns="http://www.w3.org/2000/svg"
            className="w-32 h-32 mb-6"
          >
            <defs>
              <path
                id="retail-logo-path"
                d="M3 14 24 2C28 0 28 0 32 2L53 14C56 16 56 17 56 19L56 43C56 46 55 47 51 49L32 59C28 61 28 61 24 59L5 49C1 47 0 46 0 43L0 19C0 17 0 16 3 14M28 4 5 17 28 28 51 17 28 4M53 20 30 31 30 56 53 44 53 20M40 42 33 35C33 35 32 34 33 33 34 32 35 33 36 34L36 34 43 41C44 42 44 42 43 43L35 51C35 51 34 52 33 51 32 50 33 49 33 49L40 42M16 42 23 35C23 35 24 34 23 33 22 32 21 33 20 34L13 41C12 42 12 42 13 43L21 51C21 51 22 52 23 51 24 50 23 49 23 49L16 42"
              />
              <mask id="intro-mask">
                <rect fill="black" height="61" width="61" x="0" y="0" />
                <rect
                  fill="white"
                  height={rectHeight}
                  width="61"
                  x="0"
                  y={rectY}
                  id="loading-rect"
                />
              </mask>
            </defs>

            {/* Background Faint Track */}
            <use href="#retail-logo-path" fill="#e6a94a" opacity="0.15" />

            {/* Masked Active Fill in Glowing Amber */}
            <use href="#retail-logo-path" fill="#e6a94a" mask="url(#intro-mask)" />
          </svg>

          {/* Loading status typography */}
          <div className="text-center font-headline font-bold text-xl text-[#f0f6f3] mb-1 tracking-wide">
            Small Retail Survival Agent
          </div>
          <div className="text-xs font-mono text-amber tracking-widest uppercase mb-3">
            Loading Multi-Agent Core • {Math.round(progress)}%
          </div>

          <div className="w-48 h-1 bg-[#1b2d26] rounded-full overflow-hidden border border-panel-border">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-amber shadow-glow-amber transition-all duration-200 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Wave Transition Overlay Container */}
      <div
        id="transition-container"
        className={waveState}
        style={{ display: waveState ? 'block' : 'none' }}
      >
        {/* Top Wave */}
        <svg id="transition-wave-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#e6a94a"
            d="M0,128L21.8,138.7C43.6,149,87,171,131,154.7C174.5,139,218,85,262,69.3C305.5,53,349,75,393,101.3C436.4,128,480,160,524,186.7C567.3,213,611,235,655,213.3C698.2,192,742,128,785,122.7C829.1,117,873,171,916,186.7C960,203,1004,181,1047,160C1090.9,139,1135,117,1178,96C1221.8,75,1265,53,1309,53.3C1352.7,53,1396,75,1418,85.3L1440,96L1440,320L1418.2,320C1396.4,320,1353,320,1309,320C1265.5,320,1222,320,1178,320C1134.5,320,1091,320,1047,320C1003.6,320,960,320,916,320C872.7,320,829,320,785,320C741.8,320,698,320,655,320C610.9,320,567,320,524,320C480,320,436,320,393,320C349.1,320,305,320,262,320C218.2,320,175,320,131,320C87.3,320,44,320,22,320L0,320Z"
          />
        </svg>

        {/* Center Push */}
        <div id="transition-push" />

        {/* Bottom Wave */}
        <svg id="transition-wave-svg-bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#e6a94a"
            d="M0,128L21.8,138.7C43.6,149,87,171,131,154.7C174.5,139,218,85,262,69.3C305.5,53,349,75,393,101.3C436.4,128,480,160,524,186.7C567.3,213,611,235,655,213.3C698.2,192,742,128,785,122.7C829.1,117,873,171,916,186.7C960,203,1004,181,1047,160C1090.9,139,1135,117,1178,96C1221.8,75,1265,53,1309,53.3C1352.7,53,1396,75,1418,85.3L1440,96L1440,320L1418.2,320C1396.4,320,1353,320,1309,320C1265.5,320,1222,320,1178,320C1134.5,320,1091,320,1047,320C1003.6,320,960,320,916,320C872.7,320,829,320,785,320C741.8,320,698,320,655,320C610.9,320,567,320,524,320C480,320,436,320,393,320C349.1,320,305,320,262,320C218.2,320,175,320,131,320C87.3,320,44,320,22,320L0,320Z"
          />
        </svg>
      </div>
    </>
  );
}
