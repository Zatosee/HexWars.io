import React, { useEffect, useRef } from "react";

export default function TurnTimer({
  duration, onExpire, currentPlayer, keyReset, hud
}: {
  duration: number; // seconds
  onExpire: () => void;
  currentPlayer: number;
  keyReset: any;    // change à chaque début de tour (voir store plus bas)
  hud?: boolean;
}) {
  const [time, setTime] = React.useState(duration);
  const intervalRef = useRef<any>(null);
  const firedRef = useRef(false); // <-- fusible anti double-expire (StrictMode)

  useEffect(() => {
    // reset timer & fusible à chaque nouveau tour (ou joueur, ou duration)
    setTime(duration);
    firedRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          if (!firedRef.current) {
            firedRef.current = true;
            clearInterval(intervalRef.current!);
            onExpire(); // => fin de tour AFK
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [currentPlayer, keyReset, duration]); // <== ces deps déclenchent un vrai reset

  if (!hud) return null;

  // Affichage uniquement dans les 30 dernières secondes
  const showBar = time <= 30;

  return (
    showBar && (
      <div className="w-[340px] h-8 bg-gradient-to-r from-blue-900 via-indigo-700 to-blue-900 rounded-full overflow-hidden border-2 border-yellow-400 shadow-2xl relative flex items-center justify-center pointer-events-auto animate-pulse">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-600 rounded-full transition-all duration-500 shadow-lg"
          style={{ width: `${(time / duration) * 100}%` }}
        />
        <span className="relative z-10 text-lg font-extrabold text-white drop-shadow-lg tracking-widest" style={{fontFamily:'Orbitron, sans-serif'}}>⏳ {time}s</span>
      </div>
    )
  );
}
