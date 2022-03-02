import "dotenv/config";
import express from "express";
import http from "http";
import request from "request";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const PORT = process.env.port || 4000;
const source = process.env.SOURCE_STREAM || "";
const backupSource = process.env.SOURCE_BACKUP_STREAM || "";
const metadataUrl = process.env.SOURCE_METADATA || "";

let connectedUsers = 0;
let metadataCheckInterval: NodeJS.Timeout | null = null;
let currentMetadata = { artist: "", title: "" };

const checkMetadata = () => {
  request(metadataUrl, { json: true }, (err, resp, body) => {
    if (err) return;
    const metadata: { artist: string; title: string } =
      body.icestats.source.find(
        (source: { listenurl: string }) =>
          source.listenurl === "http://localhost:8000/stream"
      );
    if (!metadata) {
      return;
    }
    if (
      metadata.artist !== currentMetadata.artist ||
      metadata.title !== currentMetadata.title
    ) {
      currentMetadata = {
        artist: metadata.artist,
        title: metadata.title,
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

app.get("/backup_stream", (req, res) => {
  req.pipe(request.get(backupSource)).pipe(res);
});

server.listen(PORT);
