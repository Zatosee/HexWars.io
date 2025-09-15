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

  return (
    <div className="flex flex-col items-end">
      <div className="mb-1 px-3 py-1 rounded-lg bg-blue-900/90 border border-blue-700 text-white text-sm font-bold shadow-lg">
        Tour du joueur {currentPlayer}
      </div>
      <div className="w-56 h-5 bg-blue-900 rounded-full overflow-hidden border border-blue-700 relative shadow-lg">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
          style={{ width: `${(time / duration) * 100}%` }}
        />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow">
          {time}s
        </span>
      </div>
    </div>
  );
}
