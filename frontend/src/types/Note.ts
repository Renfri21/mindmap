export interface Note {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  scale: number;
  isSelected: boolean;
}
console.log("NoteData module loaded"); // to confirm runtime import