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
  // ///from example:

  // $("input.picture").change(function(e) {
  //   let file = e.target.files[0];
  //   let stream = ss.createStream();
  //   // upload a file to the server.
  //   ss(socket).emit("send-file", stream, file);
  //   ss.createBlobReadStream(file).pipe(stream);
  //   $("input.picture").val("");
  //   $("input.picture").after("<p>File uploaded!</p>");
  // });
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
  if (data.files.length) {
    const img = document.createElement("img");
    // img.src = "data:image/jpeg;base64," + window.btoa(data.files[0].content);
    img.src = data.files[0].content;
    chat.appendChild(img);
  }
});
socket.on("typing", data => {
  typing.innerText = `${data.name} is typing...`;
});
//this doesn't work yet...
socket.on("getFile", (stream, data) => {
  console.log("start file stream from server", data);
  const imgChunks = "";
  stream.on("data", data => {
    console.log("got data from getFile");
    for (let i = 0; i < data.length; i++) {
      imgChunks += String.fromCharCode(data[i]);
    }
  });
  stream.on("end", data => {
    console.log("end of stream");
  });
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
picture.onclick = e => {
  inputPicture.click();
  console.log("clicked button");
};
inputPicture.onchange = e => {
  picAmount.classList.toggle("d-none");
  picAmount.innerText = inputPicture.files.length;
  for (let i = 0; i < inputPicture.files.length; i++) {
    if (!inputPicture.files[i].type.match("image.*")) {
      continue;
    }
    const reader = new FileReader();
    reader.onload = e => {
      console.log(typeof e.target.result);
      userData.files.push({
        name: inputPicture.files[i].name,
        size: inputPicture.files[i].size,
        content: reader.result
      });
      const img = new Image();
      img.src = reader.result;
      chat.appendChild(img);
    };
    reader.readAsDataURL(inputPicture.files[i]);
  }
};
