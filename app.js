const express = require("express");
const socket = require("socket.io");
const fs = require("fs");
const path = require("path");
const app = express();

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

const server = app.listen(3000, () => {
  console.log("listening to requests on port 3000...");
});

app.use(express.static("static"));

const io = socket(server);
io.on("connection", socket => {
  console.log("connectting user with socket...", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
  socket.on("newMessage", data => {
    console.log("got data from user");
    if (data.files) {
      for (let i = 0; i < data.files.length; i++) {
        rawData = data.files[i].content;
        base64Data = rawData.replace(/^data:image\/(.*);base64,/, "");
        // dataimage = new Buffer(base64Data, "base64"); not needed
        const fd = path.join("./static/userFiles", data.files[i].name);
        ensureDirectoryExistence(fd);
        fs.writeFile(fd, base64Data, "base64", err => {
          console.log(err);
        });
      }
    }
    io.sockets.emit("newMessage", data);
  });
  socket.on("typing", data => {
    socket.broadcast.emit("typing", data);
  });
});
