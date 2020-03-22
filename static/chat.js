const socket = io.connect("http://localhost:3000");
//dom elements

const message = document.querySelector("#message");
const name = document.querySelector("#name");
const submitBtn = document.querySelector("#submit");
const typing = document.querySelector("#typing");
const chat = document.querySelector("#chat-window");

const file = document.querySelector("#file");
const inputFile = document.querySelector("input.file");
const fileAmount = document.querySelector("#fileAmount");

const picture = document.querySelector("#picture");
const inputPicture = document.querySelector("input.picture");
const picAmount = document.querySelector("#picAmount");

const audio = document.querySelector("#audio");
const inputAudio = document.querySelector(".audio");
const player = document.querySelector("#player");

//data
const userData = { name: "", text: "", files: [] };
const imageTypes = ["jpeg", "jpg", "png"];
const audioTypes = ["mp3"];
const videoTypes = ["mp4"];
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
    for (let file of data.files) {
      const fileType = file.name.split(".").pop();
      console.log("recieved file:", fileType, " from server");
      console.log(file.content);

      if (imageTypes.includes(fileType)) {
        console.log("in audio");
        const img = document.createElement("img");
        // img.src = "data:image/jpeg;base64," + window.btoa(data.files[0].content);
        img.src = file.content;
        chat.appendChild(img);
      } else if (audioTypes.includes(fileType)) {
        console.log("in audio");
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.setAttribute("type", "audio/mpeg");
        audio.src = file.content;
        chat.appendChild(audio);
      } else if (videoTypes.includes(fileType)) {
        console.log("in video");
        const video = document.createElement("video");
        video.setAttribute("type", "video/mp4");
        video.controls = true;
        video.src = file.content;
        chat.appendChild(video);
      } else {
        console.log("other type of file ");
      }
    }
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
file.onclick = e => {
  inputFile.click();
  console.log("click to input file");
};
picture.onclick = e => {
  inputPicture.click();
  console.log("clicked to input picture or take a picture");
};
audio.onclick = e => {
  inputAudio.click();
  console.log("clicked to record audio");
};
inputFile.onchange = e => {
  fileAmount.classList.toggle("d-none");
  fileAmount.innerText = inputFile.files.length;
  for (let i = 0; i < inputFile.files.length; i++) {
    if (inputFile.files[i].type.match("image.*")) {
      const reader = new FileReader();
      reader.readAsDataURL(inputFile.files[i]);
      reader.onload = e => {
        console.log("added image file");
        userData.files.push({
          name: inputFile.files[i].name,
          size: inputFile.files[i].size,
          content: reader.result
        });
        const img = new Image();
        img.src = reader.result;
        chat.appendChild(img);
      };
    } else if (inputFile.files[i].type.match("audio.*")) {
      const reader = new FileReader();
      const audioPlayer = new Audio();
      reader.readAsDataURL(inputFile.files[i]);
      reader.onload = e => {
        console.log("added audio file");
        userData.files.push({
          name: inputFile.files[i].name,
          size: inputFile.files[i].size,
          content: reader.result
        });
        audioPlayer.src = reader.result;
        audioPlayer.controls = true;
        audioPlayer.setAttribute("type", "audio/mpeg");
        chat.appendChild(audioPlayer);
      };
    } else if (inputFile.files[i].type.match("video.*")) {
      const reader = new FileReader();
      const videoPlayer = document.createElement("video");
      reader.readAsDataURL(inputFile.files[i]);
      reader.onload = e => {
        console.log("added audio file");
        userData.files.push({
          name: inputFile.files[i].name,
          size: inputFile.files[i].size,
          content: reader.result
        });
        videoPlayer.src = reader.result;
        videoPlayer.controls = true;
        videoPlayer.setAttribute("type", "video/mp4");
        chat.appendChild(videoPlayer);
      };
    }
  }
};

inputPicture.onchange = e => {
  picAmount.classList.toggle("d-none");
  picAmount.innerText = inputPicture.files.length;
  for (let i = 0; i < inputPicture.files.length; i++) {
    if (inputPicture.files[i].type.match("image.*")) {
      const reader = new FileReader();
      reader.readAsDataURL(inputPicture.files[i]);
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
    }
  }
};
