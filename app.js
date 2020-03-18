const express = require("express");
const socket = require("socket.io");
const fs = require("fs");
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
    console.log("got data from user");
    if (data.files) {
      for (let i = 0; i < data.files.length; i++) {
        rawData = data.files[i].content;
        base64Data = rawData.replace(/^data:image\/jpeg;base64,/, "");
        // dataimage = new Buffer(base64Data, "base64"); not needed
        require("fs").writeFile(
          data.files[i].name,
          base64Data,
          "base64",
          function(err) {
            console.log(err);
          }
        );

        console.log("writing to:", data.files[i].name);
      }
    }
    io.sockets.emit("newMessage", data);
  });
  socket.on("typing", data => {
    socket.broadcast.emit("typing", data);
  });
});
