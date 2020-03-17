const express = require("express");
const socket = require("socket.io");
const app = express();

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
    io.sockets.emit("newMessage", data);
  });
  socket.on("typing", data => {
    socket.broadcast.emit("typing", data);
  });
});
