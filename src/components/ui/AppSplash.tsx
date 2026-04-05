import { useState, useEffect } from 'react'

export function AppSplash({ onDone }: { onDone: () => void }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Total animation: ~3.5s, then fade out
    const t1 = setTimeout(() => setFadeOut(true), 3600)
    const t2 = setTimeout(onDone, 4100)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#0e0e0f',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      <svg width="170" height="170" viewBox="30 25 480 480" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          .sp-bubble {
            stroke-dasharray: 1100;
            stroke-dashoffset: 1100;
            animation: drawBubble 1s ease-out forwards;
          }
          .sp-eyes {
            opacity: 0;
            animation: spFadeIn 0.4s ease-out 0.8s forwards;
          }
          .sp-arc1 {
            opacity: 0;
            animation: arcPulse3 2s ease-in-out 1.2s forwards;
          }
          .sp-arc2 {
            opacity: 0;
            animation: arcPulse3 2s ease-in-out 1.4s forwards;
          }
          .sp-text {
            opacity: 0;
            animation: spFadeIn 0.6s ease-out 1.6s forwards;
          }
          @keyframes drawBubble {
            to { stroke-dashoffset: 0; }
          }
          @keyframes spFadeIn {
            to { opacity: 1; }
          }
          @keyframes arcPulse3 {
            0%   { opacity: 0; stroke-width: 8; }
            8%   { opacity: 1; stroke-width: 14; }
            16%  { opacity: 0.4; stroke-width: 8; }
            28%  { opacity: 1; stroke-width: 16; }
            40%  { opacity: 0.3; stroke-width: 8; }
            55%  { opacity: 1; stroke-width: 18; }
            70%  { opacity: 0.8; stroke-width: 12; }
            100% { opacity: 1; stroke-width: 12; }
          }
        `}</style>
        {/* Closed speech bubble (circle-like, no tail) */}
        <ellipse className="sp-bubble"
          cx="230" cy="260" rx="175" ry="170"
          fill="none" stroke="#B38463" strokeWidth="12"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 1100, strokeDashoffset: 1100 }}
        />
        {/* Eyes */}
        <g className="sp-eyes">
          <circle cx="185" cy="265" r="18" fill="#B38463" />
          <circle cx="285" cy="265" r="18" fill="#B38463" />
        </g>
        {/* Signal arcs — pulse 3 times */}
        <path className="sp-arc1" d="M420 140 A55 55 0 0 1 450 195"
          fill="none" stroke="#B38463" strokeWidth="12" strokeLinecap="round" />
        <path className="sp-arc2" d="M440 100 A95 95 0 0 1 490 180"
          fill="none" stroke="#B38463" strokeWidth="12" strokeLinecap="round" />
      </svg>
      <div className="sp-text" style={{
        marginTop: '1.2rem', fontFamily: 'sans-serif',
        fontSize: '2rem', fontWeight: 300,
        color: '#B38463', letterSpacing: '0.08em',
      }}>
        alina
      </div>
    </div>
  )
}
