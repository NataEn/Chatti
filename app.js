const express = require("express");
const socket = require("socket.io");
const http = require("http");
const https = require("https");
const fs = require("fs");
const privateKey = fs.readFileSync("./server_credencials/server.key", "utf8");
const certificate = fs.readFileSync("./server_credencials/server.cert", "utf8");
const credentials = { key: privateKey, cert: certificate };

// p2p=require('socket.io-p2p-server').Server;
// io.use(p2p)

const socketStream = require("socket.io-stream");
const path = require("path");
const app = express();
const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}
const port = process.env.PORT || 3000;
const server = httpServer.listen(port, () => {
  console.log(`listening to requests on port ${port}...`);
});

app.use(express.static("static"));

const io = socket(server);
io.on("connection", (socket) => {
  console.log("connectting user with socket...", socket.id);

  //send stream to client/browser

  // console.log("file being send");
  // let stream = socketStream.createStream();
  // socketStream(socket).emit("getFile", stream);
  // let filename = "./static/userFiles/cat.jpeg";
  // console.log(filename);
  // fs.createReadStream(filename).pipe(stream);

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
  socket.on("newMessage", (data) => {
    console.log("got data from user");
    if (data.files && data.files.length) {
      for (let i = 0; i < data.files.length; i++) {
        let rawData = data.files[i].content;
        let base64Data = rawData.replace(/^data:(.*);base64,/, "");
        const fd = path.join("./static/userFiles", data.files[i].name);
        ensureDirectoryExistence(fd);

        //saving data recieved from client to server on file:
        fs.writeFile(fd, base64Data, "base64", (err) => {
          console.log("error", err);
        });

        // //emitting the data back to the chat window:
        // const stream = socketStream.createStream();
        // socketStream(socket).emit("getFile", stream, {
        //   filename: data.files[i].name
        // });
        // console.log(filename + " is streaming...");
        // fs.createReadStream(fd).pipe(stream);
      }
    }
    io.sockets.emit("newMessage", data);
  });
  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });
  socketStream(socket).on("calling", (stream) => {
    console.log("got calling from client");
    socketStream(socket).broadcast.emit("calling", stream);
  });
});
