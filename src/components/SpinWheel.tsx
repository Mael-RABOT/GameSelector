import React, { useState, useEffect, useMemo } from 'react';
import './SpinWheel.css';

interface Game {
  id: string;
  title: string;
  isAlreadyPlayed: boolean;
}

interface SpinWheelProps {
  games: Game[];
  onSpinEnd: (selectedGame: Game) => void;
}

// --- Randomness Helpers ---

function secureRandom(max: number): number {
  const randomValues = new Uint32Array(1);
  window.crypto.getRandomValues(randomValues);
  return randomValues[0] % max;
}

// Returns a secure random float between -1 and 1
function secureRandomFloat(): number {
  return (secureRandom(1000) / 500) - 1;
}

// --- SVG Geometry Helpers ---

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeSlice(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${x} ${y} L ${start.x} ${start.y}`;
}

// --- Component ---

export const SpinWheel: React.FC<SpinWheelProps> = ({ games, onSpinEnd }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [shuffledGames, setShuffledGames] = useState<Game[]>(games);
  const [spinDuration, setSpinDuration] = useState(9000);

  const numGames = games.length;
  const degreesPerGame = 360 / numGames;

  const segmentColors = useMemo(() => {
    const colors: string[] = [];
    for (let i = 0; i < numGames; i++) {
      colors.push(i % 2 === 0 ? '#FFD700' : '#FF6347');
    }
    return colors;
  }, [numGames]);

  const handleSpin = () => {
    if (isSpinning || games.length === 0) return;

    const gamesToShuffle = [...games];
    for (let i = gamesToShuffle.length - 1; i > 0; i--) {
      const j = secureRandom(i + 1);
      [gamesToShuffle[i], gamesToShuffle[j]] = [gamesToShuffle[j], gamesToShuffle[i]];
    }
    setShuffledGames(gamesToShuffle);
    
    setIsSpinning(true);
    
    const randomGameIndex = secureRandom(numGames);
    const selectedGame = gamesToShuffle[randomGameIndex];

    // --- UPDATED THRILLING LOGIC ---
    const randomDuration = secureRandom(5000) + 12000; // 12 to 17 seconds
    setSpinDuration(randomDuration);
    
    const extraRotations = 360 * (secureRandom(5) + 8);
    
    const targetSegmentCenter = (randomGameIndex * degreesPerGame) + (degreesPerGame / 2);
    const randomOffset = secureRandomFloat() * (degreesPerGame / 2) * 0.7;
    const rotationToGo = 360 - (targetSegmentCenter + randomOffset);
    
    const finalRotation = (rotation - (rotation % 360)) + extraRotations + rotationToGo;

    setRotation(finalRotation);

    const spinTimeout = setTimeout(() => {
      onSpinEnd(selectedGame);
      setIsSpinning(false);
    }, randomDuration);

    return () => clearTimeout(spinTimeout);
  };
  
  useEffect(() => {
    const autoSpinTimeout = setTimeout(handleSpin, 100);
    return () => clearTimeout(autoSpinTimeout);
  }, []);

  return (
    <div className="wheel-container">
      <div
        className="wheel-rotator"
        style={{ 
          transform: `rotate(${rotation}deg)`,
          // Use a new bezier curve for a longer, more dramatic slow-down
          transition: `transform ${spinDuration}ms cubic-bezier(0.15, 0.95, 0.45, 1)`
        }}
      >
        <svg className="wheel-svg" viewBox="0 0 200 200">
          <g>
            {shuffledGames.map((game, i) => {
              const startAngle = i * degreesPerGame;
              const endAngle = startAngle + degreesPerGame;
              
              const textAngle = startAngle + degreesPerGame / 2;
              const textPos = polarToCartesian(100, 100, 60, textAngle);

              return (
                <g key={game.id}>
                  <path d={describeSlice(100, 100, 100, startAngle, endAngle)} fill={segmentColors[i]} />
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    transform={`rotate(${textAngle + 90}, ${textPos.x}, ${textPos.y})`}
                    className="wheel-svg-text"
                  >
                    {game.title}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <div className="wheel-pointer"></div>
      <div className="spin-btn" onClick={handleSpin}>SPIN</div>
    </div>
  );
};
