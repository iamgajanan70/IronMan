import React, { useEffect, useRef, useState } from 'react';
import './FluidCursor.css';

const FluidCursor = () => {
  const dotRef = useRef(null);
  const mouseRef = useRef({ x: -200, y: -200 });
  const smoothRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef(null);
  const [hoverState, setHoverState] = useState('default'); // 'default' | 'link' | 'button' | 'image' | 'text'
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el) {
        const isLink = el.closest('a') || el.closest('button') || el.closest('[data-cursor="link"]');
        const isImg = el.closest('img') || el.closest('.hero-canvas') || el.closest('[data-cursor="image"]');
        const isText = el.closest('h1') || el.closest('h2') || el.closest('p') || el.closest('[data-cursor="text"]');

        if (isLink) setHoverState('link');
        else if (isImg) setHoverState('image');
        else if (isText) setHoverState('text');
        else setHoverState('default');
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseenter', onMouseEnter);

    const animate = () => {
      const m = mouseRef.current;
      const s = smoothRef.current;

      // Smooth position for the dot and labels
      s.x += (m.x - s.x) * 0.15;
      s.y += (m.y - s.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${s.x}px, ${s.y}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible, hoverState]);

  return (
    <div className="liquid-cursor-container">
      {/* Minimal precise dot instead of large rings */}
      <div 
        ref={dotRef} 
        className={`cursor-dot-simple ${isVisible ? 'visible' : ''} ${hoverState !== 'default' ? 'hovering' : ''}`} 
      />
      
      {/* Interactive labels */}
      <div 
        className={`cursor-label-wrapper ${isVisible ? 'visible' : ''}`}
        style={{ transform: `translate(${smoothRef.current.x}px, ${smoothRef.current.y}px)` }}
      >
        <span className={`cursor-label-text ${hoverState}`}>
          {hoverState === 'image' && 'VIEW'}
          {hoverState === 'link' && 'GO'}
          {hoverState === 'text' && 'READ'}
        </span>
      </div>
    </div>
  );
};

export default FluidCursor;
