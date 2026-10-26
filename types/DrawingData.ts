export interface Stroke {
  color:
    | {
        r: number;
        g: number;
        b: number;
        a: number;
      }
    | "eraser";
  points: [number, number][];
}

export function isStroke(obj: any) {
  return typeof obj.color !== "undefined" && typeof obj.points !== "undefined";
}

export interface User {
  id: string;
}

export interface Room {
  code: string;
  strokes: Stroke[];
  users: User[];
}
