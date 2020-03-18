const socket = io.connect("http://localhost:3000");
//dom elements
const message = document.querySelector("#message");
const name = document.querySelector("#name");
const submitBtn = document.querySelector("#submit");
const typing = document.querySelector("#typing");
const chat = document.querySelector("#chat-window");
const picture = document.querySelector("#picture");
const inputPicture = document.querySelector("input.picture");
const file = document.querySelector("#file");
const inputFile = document.querySelector("input.file");
const picAmount = document.querySelector("#picAmount");
//data
const userData = { name: "", text: "", files: [] };

socket.on("connect", () => {
  console.log("connected to server");
});
socket.on("disconnect", () => {
  console.log("disconnected from server");
});
socket.on("newMessage", data => {
  const incomingMessage = document.createElement("li");
  incomingMessage.classList = "bg-light list-group-item";

  const sender = document.createElement("span");
  sender.className = "text-primary";
  sender.innerText = `${data.name}: `;
  const content = document.createElement("span");
  content.innerText = data.text;
  incomingMessage.appendChild(sender);
  incomingMessage.appendChild(content);
  chat.appendChild(incomingMessage);
});
socket.on("typing", data => {
  typing.innerText = `${data.name} is typing...`;
});

name.oninput = e => {
  userData.name = e.target.value;
};
message.oninput = e => {
  userData.text = e.target.value;
  socket.emit("typing", { name: userData.name });
};
submitBtn.addEventListener("click", e => {
  e.preventDefault();
  typing.innerText = "";
  console.log(inputPicture.files);
  socket.emit("newMessage", userData);
});
inputPicture.onchange = e => {
  console.log("entered input file");
  console.log(
    inputPicture.value,
    inputPicture.files,
    inputPicture.files.length
  );
  picAmount.classList.toggle("d-none");
  picAmount.innerText = inputPicture.files.length;
};

picture.onclick = e => {
  inputPicture.click();
  console.log("clicked button");
};
