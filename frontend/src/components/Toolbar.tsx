// src/components/BottomToolbar.tsx
import { Plus, Minus, MousePointer, Type, ZoomIn, ZoomOut } from "lucide-react";

interface ToolbarProps {
  onAddNote: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleLiveUpdate: () => void;
  liveUpdate: boolean;
}

export default function Toolbar({
  onAddNote,
  onZoomIn,
  onZoomOut,
  onToggleLiveUpdate,
  liveUpdate,
}: ToolbarProps) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 
                 bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-lg z-50"
    >
      {/* Add Note */}
      <button
        onClick={onAddNote}
        className="p-2 hover:bg-white/10 rounded-lg transition"
        title="Add new note"
      >
        <Plus size={22} />
      </button>


      {/* Toggle Update Mode */}
      {/*<button
        onClick={onToggleLiveUpdate}
        className={`p-2 hover:bg-white/10 rounded-lg transition ${
          liveUpdate ? "text-green-400" : "text-orange-400"
        }`}
        title={
          liveUpdate ? "Live update (every keystroke)" : "Enter/Blur update"
        }
      >
        <Type size={22} />
      </button>*/}
      {/* Toggle live/Enter-blur update mode */}
      <button className={`update-mode-toggle ${liveUpdate ? 'live' : 'enter-blur'}`} 
              onClick={() => setLiveUpdate(prev => !prev)}>
        {liveUpdate ? 'Switch to on Enter/Deselect Mode' : 'Switch to Per Letter mode'}
      </button>

    </div>
  );
}
