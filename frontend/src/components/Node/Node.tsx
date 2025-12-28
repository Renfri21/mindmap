import React, { useRef, useEffect } from 'react';
import type { Node as NodeType } from '../types/Node';

interface NodeProps {
  node: NodeType;
  scale: number;
  isSelected?: boolean;
  onMove?: (id: number, x: number, y: number) => void;
  onSelect?: (id: number | null) => void;
  onTakePointer?: (taking: boolean) => void;
  onDrag?: (id: number, x: number, y: number) => void;
  children: React.ReactNode;
}

export default function Node({ node, scale, isSelected = false, onMove, onSelect, onTakePointer, onDrag, children }: NodeProps) {
  const draggingRef = useRef(false);
  const initialMouseRef = useRef<{x:number;y:number} | null>(null);
  const posRef = useRef({ x: node.x, y: node.y });
  const movedBeforeSelectRef = useRef(false);
  const longPressTimerRef = useRef<number | null>(null);
  const scaleRef = useRef(scale);
  useEffect(() => { scaleRef.current = scale }, [scale]);

  useEffect(() => { posRef.current = { x: node.x, y: node.y } }, [node.x, node.y]);

  const onDocumentMouseMove = (e: MouseEvent) => {
    if (!initialMouseRef.current) return;
    if (!draggingRef.current && longPressTimerRef.current) {
      const dx = e.clientX - initialMouseRef.current.x;
      const dy = e.clientY - initialMouseRef.current.y;
      if (dx*dx + dy*dy > 36) {
        movedBeforeSelectRef.current = true;
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
        document.removeEventListener('mousemove', onDocumentMouseMove);
        document.removeEventListener('mouseup', onDocumentMouseUp);
        return;
      }
    }

    if (draggingRef.current) {
      e.preventDefault();
      const prev = posRef.current;
      const dx = (e.clientX - (initialMouseRef.current?.x ?? e.clientX)) / scaleRef.current;
      const dy = (e.clientY - (initialMouseRef.current?.y ?? e.clientY)) / scaleRef.current;
      initialMouseRef.current = { x: e.clientX, y: e.clientY };
      const newPos = { x: prev.x + dx, y: prev.y + dy };
      posRef.current = newPos;
      onDrag?.(node.id, newPos.x, newPos.y);
    }
  }

  const onDocumentMouseUp = () => {
    if (longPressTimerRef.current) { window.clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
    if (draggingRef.current) {
      draggingRef.current = false;
      onTakePointer?.(false);
      onMove?.(node.id, posRef.current.x, posRef.current.y);
    } else if (!movedBeforeSelectRef.current) {
      onSelect?.(node.id);
    }
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('mouseup', onDocumentMouseUp);
    initialMouseRef.current = null;
    movedBeforeSelectRef.current = false;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    initialMouseRef.current = { x: e.clientX, y: e.clientY };
    movedBeforeSelectRef.current = false;

    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mouseup', onDocumentMouseUp);

    if (isSelected) {
      draggingRef.current = true;
      onTakePointer?.(true);
      return;
    }

    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null;
      if (!movedBeforeSelectRef.current) {
        onSelect?.(node.id);
        draggingRef.current = true;
        onTakePointer?.(true);
      }
    }, 300);
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={(e)=>e.stopPropagation()}
      style={{
        position: 'absolute',
        left: posRef.current.x,
        top: posRef.current.y,
        width: node.width,
        height: node.height,
        cursor: draggingRef.current ? 'grabbing' : 'grab',
        userSelect: 'none',
        background: 'transparent',
        boxShadow: isSelected ? '0 0 12px rgba(82,180,255,0.9)' : '0 0 4px rgba(0,0,0,0.2)',
        border: isSelected ? '2px solid #52b4ff' : '2px solid transparent',
        borderRadius: 8,
        padding: 4,
        overflow: 'visible',
      }}
    >
      {children}
    </div>
  )
}
