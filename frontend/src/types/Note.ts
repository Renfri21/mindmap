export interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  scale: number;
}
console.log("NoteData module loaded"); // to confirm runtime import