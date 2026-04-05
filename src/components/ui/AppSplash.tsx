import { useState, useEffect } from 'react'

export function AppSplash({ onDone }: { onDone: () => void }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2800)
    const t2 = setTimeout(onDone, 3300)
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
      <style>{`
        .splash-loader {
          position: relative;
          font-size: 16px;
          width: 5.5em;
          height: 5.5em;
        }
        .splash-loader:before {
          content: '';
          position: absolute;
          transform: translate(-50%, -50%) rotate(45deg);
          height: 100%;
          width: 4px;
          background: #B38463;
          left: 50%;
          top: 50%;
        }
        .splash-loader:after {
          content: '';
          position: absolute;
          left: 0.2em;
          bottom: 0.18em;
          width: 1em;
          height: 1em;
          background-color: #c8a97e;
          border-radius: 15%;
          animation: rollingRock 2.5s cubic-bezier(.79, 0, .47, .97) infinite;
        }
        @keyframes rollingRock {
          0%   { transform: translate(0, -1em) rotate(-45deg) }
          5%   { transform: translate(0, -1em) rotate(-50deg) }
          20%  { transform: translate(1em, -2em) rotate(47deg) }
          25%  { transform: translate(1em, -2em) rotate(45deg) }
          30%  { transform: translate(1em, -2em) rotate(40deg) }
          45%  { transform: translate(2em, -3em) rotate(137deg) }
          50%  { transform: translate(2em, -3em) rotate(135deg) }
          55%  { transform: translate(2em, -3em) rotate(130deg) }
          70%  { transform: translate(3em, -4em) rotate(217deg) }
          75%  { transform: translate(3em, -4em) rotate(220deg) }
          100% { transform: translate(0, -1em) rotate(-225deg) }
        }
        .splash-text {
          opacity: 0;
          animation: splashFadeIn 0.6s ease-out 0.3s forwards;
        }
        @keyframes splashFadeIn {
          to { opacity: 1; }
        }
      `}</style>

      <div className="splash-loader" />
      <div className="splash-text" style={{
        marginTop: '2.5rem', fontFamily: "'Jost', sans-serif",
        fontSize: '2rem', fontWeight: 200,
        color: '#B38463', letterSpacing: '0.1em',
      }}>
        alina
      </div>
    </div>
  )
}
