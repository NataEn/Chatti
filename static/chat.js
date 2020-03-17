const socket = io.connect("http://localhost:3000");
socket.on("connect", () => {
  console.log("connected to server");
});
socket.on("disconnect", () => {
  console.log("disconnected from server");
});
socket.on("newMessage", data => {
  console.log("got data from server: ", data);
});
socket.on("typing", data => {
  console.log(data);
});

//dom elements
const message = document.querySelector("#message");
console.log(message);
const submitBtn = document.querySelector("#submit");

message.onkeydown = e => {
  socket.emit("typing", { name: "someone is typing", text: e.target.value });
};
submitBtn.addEventListener("click", e => {
  e.preventDefault();
  console.log("clicked submit");
  socket.emit("newMessage", {
    from: "user",
    text: "something"
  });
});
