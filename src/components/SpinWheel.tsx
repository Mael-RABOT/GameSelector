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

// Helper to generate a list of distinct colors for the segments
const generateSegmentColors = (numSegments: number): string[] => {
  const colors: string[] = [];
  const saturation = 70;
  const lightness = 50;
  for (let i = 0; i < numSegments; i++) {
    const hue = (i * 360) / numSegments;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};

export const SpinWheel: React.FC<SpinWheelProps> = ({ games, onSpinEnd }) => {
  const [spinning, setSpinning] = useState(true);
  const [rotation, setRotation] = useState(0);

  const numGames = games.length;
  const degreesPerGame = 360 / numGames;

  // Memoize colors and gradient to prevent recalculation on every render
  const segmentColors = useMemo(() => generateSegmentColors(numGames), [numGames]);
  const conicGradient = useMemo(() => {
    let gradient = 'conic-gradient(';
    games.forEach((game, i) => {
      const startAngle = i * degreesPerGame;
      const endAngle = (i + 1) * degreesPerGame;
      gradient += `${segmentColors[i]} ${startAngle}deg ${endAngle}deg, `;
    });
    return gradient.slice(0, -2) + ')';
  }, [games, degreesPerGame, segmentColors]);


  useEffect(() => {
    // Ensure we don't spin if there are no games
    if (games.length === 0) {
      setSpinning(false);
      return;
    }

    setSpinning(true);
    const randomGameIndex = Math.floor(Math.random() * numGames);
    const selectedGame = games[randomGameIndex];

    // Calculate the final rotation
    // The pointer is at the top (270deg or -90deg). We want the middle of the segment to land there.
    const targetSegmentCenter = (randomGameIndex * degreesPerGame) + (degreesPerGame / 2);
    
    // We need to rotate the wheel so the target angle ends up at 270 degrees.
    // The rotation needed is `270 - targetSegmentCenter`.
    // We add multiple full rotations for the spinning effect.
    const extraRotations = 360 * 7;
    const finalRotation = extraRotations + (270 - targetSegmentCenter);

    setRotation(finalRotation);

    const spinTimeout = setTimeout(() => {
      onSpinEnd(selectedGame);
      setSpinning(false);
    }, 8000); // Must match the CSS transition duration

    // Cleanup function to prevent calling onSpinEnd twice in strict mode
    return () => clearTimeout(spinTimeout);
  }, [games, numGames, degreesPerGame, onSpinEnd]);


  return (
    <div className="wheel-container">
      <div className="wheel-pointer"></div>
      <div
        className="wheel"
        style={{
          background: conicGradient,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {games.map((game, i) => {
          const rotationAngle = (i * degreesPerGame) + (degreesPerGame / 2);
          return (
            <div
              key={game.id}
              className="wheel-label"
              style={{
                transform: `rotate(${rotationAngle}deg) translateX(110px)`,
              }}
            >
              <span className="wheel-label-text">{game.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
