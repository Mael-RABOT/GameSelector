import { useMemo } from 'react';

const palette = {
  primary: '#FF00FF', // Magenta
  secondary: '#FFFF00', // Yellow
  accent: '#00FFFF', // Cyan
  black: '#000000',
};

const styles = {
  background: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: -1,
  },
};

interface Line {
  id: number;
  top: string;
  left: string;
  width: string;
  transform: string;
  backgroundColor: string;
  height: string;
}

export const BrutalistBackground = () => {
  const lines = useMemo(() => {
    const lineCount = 30; // More lines for more chaos
    const colors = [palette.primary, palette.secondary, palette.accent, palette.black];
    const generatedLines: Line[] = [];

    for (let i = 0; i < lineCount; i++) {
      generatedLines.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 200 + 50}px`,
        transform: `rotate(${Math.random() * 360}deg)`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        height: `${Math.random() * 4 + 2}px`, // Thicker lines
      });
    }
    return generatedLines;
  }, []);

  return (
    <div style={styles.background}>
      {lines.map((line) => (
        <div
          key={line.id}
          style={{
            position: 'absolute',
            top: line.top,
            left: line.left,
            width: line.width,
            height: line.height,
            backgroundColor: line.backgroundColor,
            transform: line.transform,
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  );
};
