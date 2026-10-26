import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { isStroke, type Room, type Stroke } from "./types/DrawingData.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
  connectionStateRecovery: {},
});

const rooms = new Map<string, Room>();

io.on("connection", (socket) => {
  console.log("User Connected");
  let curRoom: undefined | string = undefined;

  socket.on("joinroom", (code) => {
    if (typeof code !== "string") return;
    if (rooms.has(code)) {
      socket.join(code);
      const room = rooms.get(code)!;
      room.users.push({ id: socket.id });
      socket.emit("joinsuccess", room);
    } else {
      rooms.set(code, {
        code: code,
        users: [{ id: socket.id }],
        strokes: [],
      });
      socket.emit("joinsuccess", rooms.get(code)!);
    }
    curRoom = code;
  });

  socket.on("drawline", (data) => {
    if (!isStroke(data) || !curRoom) return;
    const stroke = data as Stroke;
    const room = rooms.get(curRoom);
    if (!room) return;
    room.strokes.push(stroke);
    socket.broadcast.emit("linedrawn", stroke, room.strokes.length);
  });

  socket.on("leaveroom", () => {
    if (curRoom) {
      socket.leave(curRoom);
      const room = rooms.get(curRoom);
      if (!room) return;
      room.users.splice(
        room.users.findIndex((v) => v.id === socket.id),
        1,
      );
      if (room.users.length == 0) {
        rooms.delete(curRoom);
      }
    }
  });

  socket.on("disconnect", () => {
    if (curRoom) {
      const room = rooms.get(curRoom);
      if (!room) return;
      room.users.splice(
        room.users.findIndex((v) => v.id === socket.id),
        1,
      );
      if (room.users.length == 0) {
        rooms.delete(curRoom);
      }
    }
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
