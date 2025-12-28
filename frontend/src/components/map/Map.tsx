// export default Map;
// src/components/Map.tsx

import React, { useEffect } from 'react';
import SvgGrid from './SvgGrid';
import Node from '../Node/Node';
import Note from '../Note/Note';
import Toolbar from './Toolbar';
import { useNodesStore } from '../../store/useNodesStore';
import { useNotesStore } from '../../store/useNotesStore'; // ADD THIS LINE
import { useMapStore, mapRefs } from '../../store/useMapStore';

export default function Map() {
  // Fetch data on mount
  const fetchNodes = useNodesStore((s) => s.fetchNodes);
  
  useEffect(() => {
    fetchNodes(); // This fetches everything
  }, [fetchNodes]);

  // Select only what you need from stores
  const nodes = useNodesStore((s) => s.nodes);
  const selectedNodeId = useNodesStore((s) => s.selectedNodeId);
  const selectNode = useNodesStore((s) => s.selectNode);
  const updateNode = useNodesStore((s) => s.updateNode);
  const addNode = useNodesStore((s) => s.addNode);

  const notes = useNotesStore((s) => s.notes);
  const updateNote = useNotesStore((s) => s.updateNote);

  const {
    offset, scale, mouseMapPos, setMouseMapPos,
    zoomIn, zoomOut, startDrag, drag, endDrag, zoomAt
  } = useMapStore();

  const gridSize = 100;

  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    if (mapRefs.noteIsDragging) return;
    startDrag(e.clientX, e.clientY);
  };

  const handleBackgroundMouseMove = (e: React.MouseEvent) => {
    drag(e.clientX, e.clientY);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const mapX = (mouseX - offset.x) / scale;
    const mapY = -((mouseY - offset.y) / scale);
    setMouseMapPos({ x: mapX, y: mapY });
  };

  const handleBackgroundMouseUp = () => endDrag();
  const handleBackgroundMouseLeave = () => endDrag();

  const handleWheel = (e: React.WheelEvent) => {
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
      {mouseMapPos && (
        <div className="coordinates-display-box">
          X: {mouseMapPos.x.toFixed(0)}, Y: {mouseMapPos.y.toFixed(0)}
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