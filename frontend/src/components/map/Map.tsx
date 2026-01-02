// export default Map;
// src/components/Map.tsx

import React, { useEffect, useState, useRef } from 'react';
import SvgGrid from './SvgGrid';
import Node from '../Node/Node';
import Note from '../Note/Note';
import Toolbar from './Toolbar';
import { useNodesStore } from '../../store/useNodesStore';
import { useNotesStore } from '../../store/useNotesStore';
import { useMapStore, mapRefs } from '../../store/useMapStore';

export default function Map() {

  // Fetch data on mount
  const fetchNodes = useNodesStore((s) => s.fetchNodes);
  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);


  // Nodes and notes
  const nodes = useNodesStore((s) => s.nodes);
  const selectedNodeId = useNodesStore((s) => s.selectedNodeId);
  const selectNode = useNodesStore((s) => s.selectNode);
  const updateNode = useNodesStore((s) => s.updateNode);
  const addNode = useNodesStore((s) => s.addNode);

  const updateNote = useNotesStore((s) => s.updateNote);

  // Map Store
  const {
    offset, scale, mouseMapPos, setMouseMapPos,
    zoomIn, zoomOut, startDrag, drag, endDrag, zoomAt
  } = useMapStore();

  // State for displayed coordinates
  const [displayCoords, setDisplayCoords] = useState<{ x: number; y: number } | null>(null);
  const lastUpdateRef = useRef(0);

  // Ref for raw mouse coordinates
  const mousePosRef = useRef({ x: 0, y: 0 });

  const throttleInterval = 50; // milliseconds

  const gridSize = 100;

  

  const handleBackgroundMouseMove = (e: React.MouseEvent) => {
    drag(e.clientX, e.clientY);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const mapX = (mouseX - offset.x) / scale;
    const mapY = -((mouseY - offset.y) / scale);
    mousePosRef.current = { x: mapX, y: mapY };

     // Throttle updating displayCoords
    const now = performance.now();
    if (now - lastUpdateRef.current > throttleInterval) {
      setDisplayCoords({ ...mousePosRef.current });
      lastUpdateRef.current = now;
    }
  };

  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    // If background clicked (not a note), deselect any selected node
    selectNode(null);

    // Start map drag only if not dragging a note
    if (!mapRefs.noteIsDragging) {
      startDrag(e.clientX, e.clientY);
    }
  };

  const handleBackgroundMouseUp = () => endDrag();
  const handleBackgroundMouseLeave = () => endDrag();

  function isScrollable(el: HTMLElement) {
  const style = getComputedStyle(el);
  return (
    el.scrollHeight > el.clientHeight &&
    ['auto', 'scroll'].includes(style.overflowY)
  );
}

const handleWheel = (e: React.WheelEvent) => {
  let el: HTMLElement | null = e.target as HTMLElement;

  while (el && el !== e.currentTarget) {
    if (el.tagName === 'TEXTAREA' || isScrollable(el)) {
      return; // don't zoom
    }
    el = el.parentElement;
  }

  e.preventDefault();
  const zoomIntensity = 0.001;
  zoomAt(1 - e.deltaY * zoomIntensity, e.clientX, e.clientY);
};


  const handleNodeMove = (id: number, x: number, y: number) => {
    updateNode(id, { x, y });
  };

  const handleNodeDrag = (id: number, x: number, y: number) => {
    updateNode(id, { x, y });
  };

  const createNote = () => {
    const x = (window.innerWidth / 2 - offset.x) / scale;
    const y = (window.innerHeight / 2 - offset.y) / scale;
    addNode(x, y, 'note');
  };

  return (
    <div
      style={{
        width: '100vw', height: '100vh', position: 'relative',
        overflow: 'hidden', background: '#181818', userSelect: 'none',
        touchAction: 'none', cursor: mapRefs.isMapDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleBackgroundMouseDown}
      onMouseMove={handleBackgroundMouseMove}
      onMouseUp={handleBackgroundMouseUp}
      onMouseLeave={handleBackgroundMouseLeave}
      onWheel={handleWheel}
    >
      <div className='nodes' style={{
        position: 'absolute',
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        transformOrigin: '0 0',
        zIndex: 2,
      }}>
        {nodes.map(node => {
          let childElement = null;
          if (node.child) {
            if (node.child_type === 'note') {
              childElement = <Note note={node.child} onUpdate={updateNote} />;
            }
          }
          return (
            <Node
              key={node.id}
              node={node}
              scale={scale}
              isSelected={selectedNodeId === node.id}
              onSelect={selectNode}
              onMove={handleNodeMove}    // Changed
              onDrag={handleNodeDrag}    // Changed
            >
              {childElement}
            </Node>
          );
        })}
      </div>
      <SvgGrid
        width={100000}
        height={100000}
        scale={scale}
        offsetX={offset.x}
        offsetY={offset.y}
        gridSize={gridSize}
      />
      {displayCoords && (
        <div className="coordinates-display-box">
          X: {displayCoords.x.toFixed(0)}, Y: {displayCoords.y.toFixed(0)}
        </div>
      )}
      <Toolbar
        onAddNote={createNote}
        liveUpdate={false}
        onToggleLiveUpdate={() => {}}
      />
      <div id="controls" className="zoom-control-buttons">
        <button onClick={zoomIn}>+</button>
        <button onClick={zoomOut}>-</button>
      </div>
    </div>
  );
}