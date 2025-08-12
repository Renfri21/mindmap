import React, { useState, useEffect, useRef } from 'react';

interface GridProps {
  width: number;     // total width of virtual map, e.g. 100000
  height: number;    // total height of virtual map
  scale: number;     // zoom scale
  offsetX: number;   // pan offset x
  offsetY: number;   // pan offset y
  gridSize: number;  // grid spacing in pixels at scale 1 (e.g. 100)
}

function SvgGrid({ width, height, scale, offsetX, offsetY, gridSize }: GridProps) {
  const lines = [];

  // Calculate visible area in virtual coordinates
  // We want to draw only lines that are visible for performance
  const viewWidth = window.innerWidth / scale;
  const viewHeight = window.innerHeight / scale;
  const startX = -offsetX / scale;
  const startY = -offsetY / scale;

  // Calculate grid line start/end within the visible area
  const endX = startX + viewWidth;
  const endY = startY + viewHeight;

  // Vertical lines
  for (let x = Math.floor(startX / gridSize) * gridSize; x <= endX; x += gridSize) {
    lines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={startY}
        x2={x}
        y2={endY}
        stroke="#ccc"
        strokeWidth={1 / scale} // keep lines thin regardless of zoom
      />
    );
  }

  // Horizontal lines
  for (let y = Math.floor(startY / gridSize) * gridSize; y <= endY; y += gridSize) {
    lines.push(
      <line
        key={`h-${y}`}
        x1={startX}
        y1={y}
        x2={endX}
        y2={y}
        stroke="#ccc"
        strokeWidth={1 / scale}
      />
    );
  }

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
        overflow: 'visible',
        zIndex: 1,
      }}
      viewBox={`${startX} ${startY} ${viewWidth} ${viewHeight}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {lines}
    </svg>
  );
}

export default SvgGrid;