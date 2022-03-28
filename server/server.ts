import "dotenv/config";
import express from "express";
import http from "http";
import request from "request";
import { Server } from "socket.io";
import util from "util";
import { exec } from "child_process";

const execAsync = util.promisify(exec);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

const icecastUrl = "http://localhost:8000";
const metadataEndpoint = "/status-json.xsl";
const oggStream = process.env.OGG_STREAM_ENDPOINT || "/stream";
const mpegStream = process.env.MPEG_STREAM_ENDPOINT || "/backup_stream";

const sourceOggUrl = `${icecastUrl}${oggStream}`;
const sourceMpegUrl = `${icecastUrl}${mpegStream}`;
const metadataUrl = `${icecastUrl}${metadataEndpoint}`;

let connectedUsers = 0;
let listeningUsers = 0;
let metadataCheckInterval: NodeJS.Timeout | null = null;
let currentMetadata = { artist: "", title: "" };

const startService = async (
  serviceName: string,
  command: string,
  workingDir = ""
): Promise<void> => {
  const processLog = (logText: string) => {
    console.log(`${serviceName}: ${logText}`);
  };
  console.log(`Starting ${serviceName}`);
  const exec = await execAsync(command, { cwd: workingDir });
  exec.stdout && processLog(exec.stdout);
  exec.stderr && processLog(exec.stderr);
};

const checkMetadata = () => {
  request(metadataUrl, { json: true }, (err, resp, body) => {
    if (err) return;
    let sources = body.icestats.source;
    if (!Array.isArray(sources)) {
      sources = [sources];
    }
    const metadata: { artist: string; title: string } = sources.find(
      (source: { listenurl: string }) => source?.listenurl === sourceOggUrl
    );
    if (!metadata) {
      return;
    }
    if (
      metadata.artist.toString() !== currentMetadata.artist ||
      metadata.title.toString() !== currentMetadata.title
    ) {
      currentMetadata = {
        artist: metadata.artist.toString(),
        title: metadata.title.toString(),
      };
      io.emit("TRACK_CHANGED", currentMetadata);
    }
  });
};

const io = new Server(server, {
  path: "/socket",
});

io.on("connection", (socket) => {
  let listening = false;
  connectedUsers++;
  if (!metadataCheckInterval) {
    metadataCheckInterval = setInterval(checkMetadata, 1000);
  }
  socket.emit("TRACK_CHANGED", currentMetadata);
  socket.emit("LISTENER_COUNT", listeningUsers);
  socket.on("LISTEN_STATE_CHANGED", (value) => {
    listening = value;
    if (listening) listeningUsers++;
    else listeningUsers--;
    io.emit("LISTENER_COUNT", listeningUsers);
  });
  socket.once("disconnect", () => {
    connectedUsers--;
    if (listening) {
      listeningUsers--;
    }
    if (connectedUsers > 0) {
      io.emit("LISTENER_COUNT", listeningUsers);
    } else {
      clearInterval(metadataCheckInterval);
      metadataCheckInterval = null;
      currentMetadata = { artist: "", title: "" };
    }
  });
});

app.use(express.static("build"));

app.get(oggStream, (req, res) => req.pipe(request.get(sourceOggUrl)).pipe(res));

app.get(mpegStream, (req, res) =>
  req.pipe(request.get(sourceMpegUrl)).pipe(res)
);

server.listen(PORT);

const ffmpegCommand = `
  ffmpeg -re -i ${sourceOggUrl} -vn \
  -codec:a libmp3lame -b:a 64k -f mp3 \
  -content_type audio/mpeg \
  icecast://source:${process.env.ICECAST_PASSWORD}@${sourceMpegUrl.replace(
  "http://",
  ""
)}
`;

startService("Icecast2", "/etc/init.d/icecast2 start", "/etc/ices2").then(
  () => {
    startService("Ices2", "ices2 /etc/ices2/ices-playlist.xml", "/etc/ices2");
    startService("MPEG Relay", ffmpegCommand);
  }
);
