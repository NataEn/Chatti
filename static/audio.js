const audioRecord = document.querySelector("#audio");
const audioAmount = document.querySelector("#audioAmount");
//const videoAmount = 0; //to be created in the index html;
const photoRecord = document.querySelector("#photo");
const photoAmount = document.querySelector("#photoAmount");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const photos = document.getElementById("photos");
const photoButton = document.getElementById("photo-button");
const clearButton = document.getElementById("clear-button");
const photoFilter = document.querySelector("#photoFilter");
//utility:
let audioRecordNum = 0;
let photoRecordNum = 0;
let videoStreaming = false;
let chosenConstrains = null;
let streaming = false;
let filter = "none";
const constrains = {
  voice: { audio: true, video: false },
  photo: { audio: false, video: true },
  film: { audio: false, video: true }
};
const typesState = {
  voice: null,
  photo: null,
  film: null
};

const createWrapper = (childelement, counter, elemAmount, fileType) => {
  console.log("in wrapper got element", childelement.tagName);
  counter += 1;
  elemAmount.innerText = counter;
  const wrapper = document.createElement("div");
  const trash = document.createElement("span");
  wrapper.appendChild(childelement);
  wrapper.appendChild(trash);
  wrapper.setAttribute("data-id", `${fileType}_${childelement.dataset.num}`);

  const classes = ["fas", "fa-trash-alt", "removeRecord"];
  trash.classList.add(...classes);
  trash.setAttribute("data-num", childelement.dataset.num);
  trash.onclick = () => {
    for (let i = 0; i < userData.files.length; i++) {
      if (
        userData.files[i].name.includes(
          `rec${childelement.dataset.num}.${fileType}`
        )
      ) {
        userData.files.splice(i, 1);
        chat.removeChild(childelement.parentNode);
        counter -= 1;
        elemAmount.innerHTML = counter;
        console.log("counter reduced to: ", counter);
      }
    }
  };
  return wrapper;
};
// Take picture from canvas
function takePicture() {
  // Create canvas
  console.log("pic taken");
  const context = canvas.getContext("2d");
  // canvas.classList.toggle("d-none"); just for the beggining
  context.drawImage(video, 0, 0, "300", "200");
  const imgUrl = canvas.toDataURL("image/png");
  const img = document.createElement("img");
  photoRecordNum += 1;
  photoAmount.innerText = photoRecordNum;
  img.setAttribute("data-num", `${photoRecordNum}`);
  img.setAttribute("src", imgUrl);
  img.style.filter = filter;
  //add image to userdata
  let base64data = imgUrl;
  //for sending to server:
  //size should be blob.size.. let blob = new Blob(chunks, { type: fileType });
  userData.files.push({
    name: `recPhoto_${photoRecordNum}.png`,
    size: base64data.length,
    content: base64data
  });

  const photoWrappwer = createWrapper(img, photoRecordNum, photoAmount, "png");
  chat.appendChild(photoWrappwer);
}

///presenting the audio record amounts:
const handelRecordAmounts = (element, counter) => {
  if (counter == 0) {
    element.classList.add("d-none");
    element.innerHTML = 0;
  } else {
    element.innerHTML = counter;
    element.classList.remove("d-none");
  }
};
// html-elements functionality

// Play when ready
video.addEventListener(
  "canplay",
  function(e) {
    if (!streaming) {
      videoStreaming = true;
    }
  },
  false
);
// Filter event
photoFilter.onchange = e => {
  console.log("changed filter to", e.target.value);
  filter = e.target.value;
  video.style.filter = filter;
  e.preventDefault();
};
//take photo
photoButton.onclick = e => {
  takePicture();
  e.preventDefault();
};
// Clear event
clearButton.onclick = e => {
  filter = "none";
  video.style.filter = filter;
  console.log("changed filter to:", video.style.filter);
  photoFilter.selectedIndex = 0;
};

//recording
navigator.mediaDevices
  .enumerateDevices()
  .then(devices => {
    devices.forEach(device => {
      console.log(device.kind, device.label);
    });
  })
  .catch(err => {
    console.log(`an error occured: ${err.name}: ${err.message}`);
  });

async function getMediaStrem(
  recType,
  chosenConstrains,
  fileType,
  counter,
  elemAmount
) {
  try {
    const mediaStreamObj = await navigator.mediaDevices.getUserMedia(
      chosenConstrains
    );
    let chunks = [];
    if (typesState[recType] === null) {
      const mediaRecorder = new MediaRecorder(mediaStreamObj);
      typesState[recType] = mediaRecorder;
    }
    //turn on video when taking a photo
    if (recType === "photo" || recType === "video") {
      video.srcObject = mediaStreamObj;
      video.play();
    }

    typesState[recType].ondataavailable = function(ev) {
      chunks.push(ev.data);
    };

    typesState[recType].onstop = ev => {
      let blob = new Blob(chunks, { type: fileType });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        let base64data = reader.result;
        //for sending to server:
        userData.files.push({
          name: `rec${fileType}_${counter}.${fileType.split("/")[1]}`,
          size: blob.size,
          content: base64data
        });
      };

      chunks = [];
      let recordOutput = document.createElement(fileType.split("/")[0]);
      if (
        fileType.split("/")[0] === "audio" ||
        fileType.split("/")[0] === "video"
      ) {
        recordOutput.controls = true;
      } else if (fileType.split("/")[0] === "image") {
        recordOutput = document.createElement("img");
      }
      recordOutput.setAttribute("type", fileType);
      recordOutput.setAttribute("data-num", `${counter}`);
      recordOutput.src = URL.createObjectURL(blob);
      const recordWrapper = createWrapper(
        recordOutput,
        counter,
        elemAmount,
        fileType.split("/")[1]
      );
      chat.appendChild(recordWrapper);

      handelRecordAmounts(elemAmount, counter);
    };
    console.log("before media recorder state: ", typesState[recType].state);
    if (typesState[recType].state == "inactive") {
      typesState[recType].start();
      console.log("media recorder state: ", typesState[recType].state);
    } else if (typesState[recType].state == "recording") {
      counter += 1;
      console.log(elemAmount);
      elemAmount.innerText = counter;
      typesState[recType].stop();
      console.log("media recorder stopped: ");
    }
  } catch (err) {
    console.log(`an error occured: ${err.name}: ${err.message}`);
  }
}
audioRecord.onclick = e => {
  console.log("clicked to record audio", e.target.dataset.rectype);
  chosenConstrains = constrains.voice;
  getMediaStrem(
    e.target.dataset.rectype,
    chosenConstrains,
    "audio/mp3",
    audioRecordNum,
    audioAmount
  );
};
photoRecord.onclick = e => {
  console.log("clicked to take a photo", e.target.dataset.rectype);
  chosenConstrains = constrains.photo;
  getMediaStrem(
    e.target.dataset.rectype,
    chosenConstrains,
    "image/jpg",
    photoRecordNum,
    photoAmount
  );
};
