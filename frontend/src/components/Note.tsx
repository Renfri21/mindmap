import React from 'react';

interface NoteProps {
  x: number; // x coordinate on map
  y: number; // y coordinate on map
  children?: React.ReactNode; // note content
}

const Note: React.FC<NoteProps> = ({ x, y, children }) => {
  return (
    <div class="note"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: '200px',
        height: 'auto',
        color: 'black',
        backgroundColor: 'yellow',
        border: '2px solid black',
        borderRadius: 6,
        padding: 8,
        boxSizing: 'border-box',
        userSelect: 'none',
        cursor: 'auto',
        display: 'flex',
        alignItems: 'center',
        zIndex: 2,
        //justifyContent: 'center',
        //fontWeight: 'bold',
      }}
    >
      {children}
    </div>
  );
};

export default Note;
