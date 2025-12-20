export type ChildType = "note" | "image" | "folder";

export interface Node {
  id: number;
  x: number;                // References the x coordinate from the centerpoint
  y: number;                // References the y coordinate from the centerpoint
  width: number;            // References the width of the Node
  height: number;           // References the height of the Node
  childType: ChildType;     // References the type of the Node's Child (note, image, folder)
  childId: number | null;   // References the Id of the Node's Child
  groupId?: number | null;  // References the Group the Node belongs to if assigned
  zIndex?: number;          // References the z-index (layer) of the Node on the map
}
