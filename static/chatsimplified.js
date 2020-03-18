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
  for (let i = 0; i < inputPicture.files.length; i++) {
    const reader = new FileReader();
    reader.readAsText(inputPicture.files[i]);
    reader.onload = e => {
      console.log(typeof e.target.result);
      userData.files.push({
        name: inputPicture.files[i].name,
        size: inputPicture.files[i].size,
        content: e.target.result
      });
    };
  }
  console.log(userData);
};

picture.onclick = e => {
  inputPicture.click();
  console.log("clicked button");
};
