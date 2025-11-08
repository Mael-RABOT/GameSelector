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

// --- Randomness Helper ---

// Generates a cryptographically secure random integer up to a given maximum.
function secureRandom(max: number): number {
  const randomValues = new Uint32Array(1);
  window.crypto.getRandomValues(randomValues);
  return randomValues[0] % max;
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

    // 1. Shuffle the games before the spin
    const gamesToShuffle = [...games];
    for (let i = gamesToShuffle.length - 1; i > 0; i--) {
      const j = secureRandom(i + 1);
      [gamesToShuffle[i], gamesToShuffle[j]] = [gamesToShuffle[j], gamesToShuffle[i]];
    }
    setShuffledGames(gamesToShuffle);
    
    setIsSpinning(true);
    
    // 2. Select a winner from the newly shuffled list
    const randomGameIndex = secureRandom(numGames);
    const selectedGame = gamesToShuffle[randomGameIndex];

    // 3. Calculate rotation to land on the winner in the shuffled list
    const targetSegmentCenter = (randomGameIndex * degreesPerGame) + (degreesPerGame / 2);
    const rotationToGo = 360 - targetSegmentCenter;
    
    const extraRotations = 360 * 8;
    const finalRotation = (rotation - (rotation % 360)) + extraRotations + rotationToGo;

    setRotation(finalRotation);

    const spinTimeout = setTimeout(() => {
      onSpinEnd(selectedGame);
      setIsSpinning(false);
    }, 8000);

    return () => clearTimeout(spinTimeout);
  };
  
  useEffect(() => {
    // Auto-spin on first mount
    const autoSpinTimeout = setTimeout(handleSpin, 100);
    return () => clearTimeout(autoSpinTimeout);
  }, []);

  return (
    <div className="wheel-container">
      <div
        className="wheel-rotator"
        style={{ transform: `rotate(${rotation}deg)` }}
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
