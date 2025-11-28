// src/components/Toolbar.tsx

// Import icons
import { Plus } from "lucide-react";

interface ToolbarProps {
  onAddNote: () => void;
  onToggleLiveUpdate: () => void;
  liveUpdate: boolean;
}

export default function Toolbar({
  onAddNote,
  onToggleLiveUpdate,
  liveUpdate,
}: ToolbarProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
        color: "white",
        padding: "12px 24px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        zIndex: 9999,
      }}
    >
      {/* Add Note */}
      <button
        onClick={onAddNote}
        className="p-2 hover:bg-white/10 rounded-lg transition"
        title="Add new note"
      >
        <Plus size={22} />
      </button>


      {/*<button className={`update-mode-toggle ${liveUpdate ? 'live' : 'enter-blur'}`} 
              onClick={() => setLiveUpdate(prev => !prev)}>
        {liveUpdate ? 'Switch to on Enter/Deselect Mode' : 'Switch to Per Letter mode'}
      </button>*/}

      <button
        onClick={onToggleLiveUpdate}
        title={
          liveUpdate
            ? "Currently in Save Per-Letter mode. Click to switch to Save On Enter/Deselect mode."
            : "Currently in Save On Enter/Deselect mode. Click to switch to Save Per-Letter mode."
        }
        style={{
          position: "relative",
          display: "inline-block",
          width: "60px",
          height: "34px",
          backgroundColor: liveUpdate ? "#2196F3" : "#ccc",
          borderRadius: "34px",
          cursor: "pointer",
          transition: "background-color 0.4s",
          border: "none",
          padding: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            content: '""',
            height: "26px",
            width: "26px",
            left: liveUpdate ? "30px" : "4px",
            bottom: "4px",
            backgroundColor: "white",
            transition: "transform 0.4s",
            borderRadius: "50%",
            transform: liveUpdate ? "translateX(0)" : "translateX(0)", 
          }}
        />
      </button>

    </div>
  );
}
