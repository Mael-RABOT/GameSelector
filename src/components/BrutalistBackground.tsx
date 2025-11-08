import React, { useMemo } from 'react';

const palette = [
  '#FF00FF', // Magenta
  '#FFFF00', // Yellow
  '#00FFFF', // Cyan
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
];

const shapeTypes = ['square', 'circle', 'triangle'];

interface Shape {
  id: string;
  type: string;
  style: React.CSSProperties;
}

const generateShapes = (count: number): Shape[] => {
  const shapes: Shape[] = [];
  for (let i = 0; i < count; i++) {
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const size = Math.random() * 100 + 50; // 50px to 150px
    const color = palette[Math.floor(Math.random() * palette.length)];

    const style: React.CSSProperties = {
      position: 'absolute',
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      transform: `rotate(${Math.random() * 360}deg) translate(-50%, -50%)`,
      transition: 'transform 0.2s ease-out',
    };

    if (type === 'square') {
      style.width = `${size}px`;
      style.height = `${size}px`;
      style.backgroundColor = color;
      style.border = '3px solid #000';
    } else if (type === 'circle') {
      style.width = `${size}px`;
      style.height = `${size}px`;
      style.backgroundColor = color;
      style.borderRadius = '50%';
      style.border = '3px solid #000';
    } else if (type === 'triangle') {
      style.width = 0;
      style.height = 0;
      style.borderLeft = `${size / 2}px solid transparent`;
      style.borderRight = `${size / 2}px solid transparent`;
      style.borderBottom = `${size}px solid ${color}`;
      // Triangles need a slightly different transform for centering
      style.transform = `rotate(${Math.random() * 360}deg) translate(-50%, -50%)`;
    }

    shapes.push({
      id: `shape-${i}`,
      type,
      style,
    });
  }
  return shapes;
};

export const BrutalistBackground: React.FC = () => {
  const shapes = useMemo(() => generateShapes(50), []); // Generate 50 shapes

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: -1,
        backgroundColor: '#f0f0f0', // A light grey to cover the white
      }}
    >
      {shapes.map(shape => (
        <div key={shape.id} style={shape.style} />
      ))}
    </div>
  );
};
