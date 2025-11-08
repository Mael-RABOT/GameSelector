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

// --- SVG Geometry Helpers ---

// Converts polar coordinates (angle, radius) to Cartesian coordinates (x, y)
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Describes an SVG path for a single colored wedge of the wheel
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

    setIsSpinning(true);
    const randomGameIndex = Math.floor(Math.random() * numGames);
    const selectedGame = games[randomGameIndex];

    const targetSegmentCenter = (randomGameIndex * degreesPerGame) + (degreesPerGame / 2);
    // This is the corrected line. The pointer is at the top (360 or 0 degrees in our coordinate system), not 270.
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
            {games.map((game, i) => {
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
