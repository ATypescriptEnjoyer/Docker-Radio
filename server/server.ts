import "dotenv/config";
import express from "express";
import http from "http";
import request from "request";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const PORT = process.env.port || 4000;
const source = process.env.SOURCE_STREAM || "";
const metadataUrl = process.env.SOURCE_METADATA || "";

let connectedUsers = 0;
let metadataCheckInterval: NodeJS.Timeout | null = null;
let currentMetadata = { artist: "", title: "" };

const checkMetadata = () => {
  request(metadataUrl, { json: true }, (err, resp, body) => {
    if (err) return;
    const metadata = body;
    if (
      metadata.icestats.source.artist !== currentMetadata.artist ||
      metadata.icestats.source.title !== currentMetadata.title
    ) {
      currentMetadata = {
        artist: metadata.icestats.source.artist,
        title: metadata.icestats.source.title,
      };
      io.emit("TRACK_CHANGED", currentMetadata);
    }
  });
};

const io = new Server(server, {
  path: "/socket",
});

io.on("connection", (socket) => {
  connectedUsers++;
  if (!metadataCheckInterval) {
    metadataCheckInterval = setInterval(checkMetadata, 1000);
  }
  socket.emit("TRACK_CHANGED", currentMetadata);
  io.emit("LISTENER_COUNT", connectedUsers);
  socket.once("disconnect", () => {
    connectedUsers--;
    if (connectedUsers > 0) {
      io.emit("LISTENER_COUNT", connectedUsers);
    } else {
      clearInterval(metadataCheckInterval);
      metadataCheckInterval = null;
    }
  });
});

app.use(express.static("build"));

app.get("/stream", (req, res) => {
  req.pipe(request.get(source)).pipe(res);
});

server.listen(PORT);
