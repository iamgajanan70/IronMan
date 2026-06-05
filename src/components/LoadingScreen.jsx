import React, { useState, useEffect, useRef } from 'react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const percentBgRef = useRef(null);
  const progressFillRef = useRef(null);

  useEffect(() => {
    let currentProgress = 0;
    let animationFrameId;

    const updateProgress = () => {
      if (currentProgress < 100) {
        // Increment progress. To reach ~100 in 5s (5000ms), 
        // with ~60fps, we need ~300 frames. 100 / 300 = 0.33 per frame.
        // Math.random() * 0.8 averages 0.4, which is roughly correct.
        const increment = Math.random() * 0.8;
        currentProgress += increment;
        
        if (currentProgress > 100) currentProgress = 100;
        
        const roundedProgress = Math.floor(currentProgress);
        setProgress(roundedProgress);

        if (progressFillRef.current) {
          progressFillRef.current.style.width = `${currentProgress}%`;
        }

        if (percentBgRef.current) {
          const opacity = 0.04 + (currentProgress / 100) * 0.02;
          percentBgRef.current.style.color = `rgba(255, 255, 255, ${opacity})`;
        }

        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    const timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(updateProgress);
    }, 500);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative font-body-md text-on-surface bg-background overflow-hidden w-full h-full fixed inset-0 z-[9999]">
      {/* Background Fixed Elements */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div 
          ref={percentBgRef}
          className="percentage-bg font-display-lg text-[25vw] leading-none text-white/5 font-black select-none tracking-[-0.05em]" 
          id="percent-display-bg"
        >
          {progress}%
        </div>
      </div>

      {/* Main UI Overlay */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-8">
        {/* Subtly integrated Arc Reactor */}
        <div className="mb-8 opacity-40 hover:opacity-100 transition-opacity duration-700">
          <img 
            alt="Arc Reactor" 
            className="w-16 h-16 md:w-20 md:h-20 object-contain brightness-75 contrast-125" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLuoqhCbAtp9catnLaBH_UY0ouA47cooMaYKD--p0ENOxnyg5KJfu8YxqeLUh5gr1Tsw3d0CrDeGwa9bp4GLIwKBEnilwz_W_pzZbG0Kq3JlD9kDZ56pJkgG1bMUOpHVOnnHJ3BM2Q0I60L7azuRcKByCo7zZDfIK8j86q5NsEd9JM1mPFnPOGEuqdlmA_GvN9bAgqf9PT_iZ2BJi_TOqf3maC5tkL8XgS5DByi87utTgftz-ycFh0a2" 
          />
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-[1px] bg-white/10 relative overflow-hidden mb-4">
          <div 
            ref={progressFillRef}
            className="absolute top-0 left-0 h-full bg-white transition-all duration-300 ease-out shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
            id="progress-fill" 
            style={{ width: '0%' }}
          ></div>
        </div>

        {/* Status Text */}
        <div className="text-center">
          <span className="font-label-caps text-[10px] md:text-xs tracking-[0.4em] text-stark-gold uppercase animate-pulse-subtle">
            SYNCHRONIZING ASSETS
          </span>
        </div>
      </div>

      {/* Bottom Status */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center z-20">
        <div className="font-code-sm text-[10px] text-on-surface-variant/30 uppercase tracking-widest">
          STARK_OS // MK_85_RECOVERY_PROTOCOL
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
