const audioRecord = document.querySelector("#audio");
const audioAmount = document.querySelector("#audioAmount");

const videoRecord = document.querySelector("#video");
const videoAmount = document.querySelector("#videoAmount");

const photoRecord = document.querySelector("#photo");
const photoAmount = document.querySelector("#photoAmount");

const videoContainer = document.querySelector(".video-container");
const video = document.querySelector(".video");
const canvas = document.getElementById("canvas");
const photos = document.getElementById("photos");
const photoButton = document.getElementById("photo-button");
const videoButton = document.getElementById("video-button");
const clearButton = document.getElementById("clear-button");
const photoFilter = document.querySelector("#photoFilter");

const phoneCall = document.querySelector("#phoneCall");
const videoCall = document.querySelector("#videoCall");
const recieverName = document.querySelector(".recieverName");
recieverName.innerText = "from.."; //to be changed
//utility:

const recordsState = {
  voice: {
    constrains: { audio: true, video: false },
    counter: 0,
    counterElem: audioAmount,
    streamObj: null,
    fileType: "audio/mp3"
  },
  photo: {
    constrains: { audio: false, video: true },
    counter: 0,
    counterElem: photoAmount,
    stremObj: null,
    fileType: "image/jpg"
  },
  film: {
    constrains: { audio: true, video: true },
    counter: 0,
    counterElem: videoAmount,
    streamObj: null,
    fileType: "video/mp4"
  },
  voiceCall: {
    constrains: { audio: true, video: false },
    streamObj: null,
    recieverElem: recieverName
  },
  filmCall: {
    constrains: { audio: true, video: true },
    streamObj: null,
    recieverElem: recieverName
  }
};

let streaming = false;
let filter = "none";

const createWrapper = (childelement, recordData) => {
  console.log("in wrapper got element", childelement.tagName);
  const wrapper = document.createElement("div");
  const trash = document.createElement("span");
  wrapper.appendChild(childelement);
  wrapper.appendChild(trash);
  wrapper.setAttribute(
    "data-id",
    `${recordData.fileType.split("/")[1]}_${childelement.dataset.num}`
  );

  const classes = ["fas", "fa-trash-alt", "removeRecord"];
  trash.classList.add(...classes);
  trash.setAttribute("data-num", childelement.dataset.num);
  trash.onclick = e => {
    console.log("clicked trash", e.currentTarget.parentNode);
    for (let i = 0; i < userData.files.length; i++) {
      if (
        userData.files[i].name.includes(
          `_${childelement.dataset.num}.${recordData.fileType.split("/")[1]}`
        )
      ) {
        userData.files.splice(i, 1);
        chat.removeChild(e.currentTarget.parentNode);
        recordData.counter -= 1;
        handelRecordAmounts(recordData);
        recordData.counterElem.innerHTML = recordData.counter;
        console.log("counter reduced to: ", recordData.counter);
      }
    }
  };
  return wrapper;
};
// Take picture from canvas
function takePicture() {
  // Create canvas
  const context = canvas.getContext("2d");
  // canvas.classList.toggle("d-none"); just for the beggining
  context.drawImage(video, 0, 0, "300", "200");
  const imgUrl = canvas.toDataURL("image/png");
  const img = document.createElement("img");
  recordsState.photo.counter += 1;
  recordsState.photo.counterElem.innerText = recordsState.photo.counter;
  img.setAttribute("data-num", `${recordsState.photo.counter}`);
  img.setAttribute("src", imgUrl);
  img.style.filter = filter;
  let base64data = imgUrl;
  //for sending to server:
  //size should be blob.size.. let blob = new Blob(chunks, { type: fileType });
  userData.files.push({
    name: `recPhoto_${recordsState.photo.counter}.png`,
    size: base64data.length,
    content: base64data
  });

  const photoWrappwer = createWrapper(img, recordsState.photo);
  chat.appendChild(photoWrappwer);
}

///presenting the audio record amounts:
const handelRecordAmounts = recordData => {
  if (recordData.counter === 0) {
    recordData.counterElem.classList.add("d-none");
  } else {
    recordData.counterElem.innerText = recordData.counter;
    recordData.counterElem.classList.remove("d-none");
  }
};
// html-elements functionality
const stopStreamedVideo = () => {
  const stream = video.srcObject;
  const tracks = stream.getTracks();
  console.log("stopping stream");
  tracks.forEach(function(track) {
    console.log("in stop loop");
    track.stop();
  });

  video.srcObject = null;
};
// Play when ready
video.addEventListener(
  "canplay",
  function(e) {
    if (!streaming) {
      streaming = true;
    }
    // videoContainer.classList.toggle("d-none");
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
videoButton.onclick = () => {
  videoRecord.click();
};
// Clear event
clearButton.onclick = e => {
  filter = "none";
  video.style.filter = filter;
  console.log("changed filter to:", video.style.filter);
  photoFilter.selectedIndex = 0;
};

//recording devices
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
//add recorded element to DOM
const addRecordToChat = (recordData, blob) => {
  recordData.counter += 1;
  recordData.counterElem.innerText = recordData.counter;
  let recordOutput = document.createElement(recordData.fileType.split("/")[0]);
  if (recordData.fileType.split("/")[0] === "audio") {
    recordOutput.controls = true;
  } else if (recordData.fileType.split("/")[0] === "image") {
    recordOutput = document.createElement("img");
    recordOutput.style.filter = filter;
  } else if (recordData.fileType.split("/")[0] === "video") {
    recordOutput.controls = true;
    recordOutput.style.filter = filter;
  }
  recordOutput.setAttribute("type", recordData.fileType);

  recordOutput.setAttribute("data-num", `${recordData.counter}`);
  recordOutput.src = URL.createObjectURL(blob);
  const recordWrapper = createWrapper(recordOutput, recordData);

  chat.appendChild(recordWrapper);
  handelRecordAmounts(recordData);
};
//create record element
async function getMediaStrem(recType, recordData) {
  try {
    const mediaStreamObj = await navigator.mediaDevices.getUserMedia(
      recordData.constrains
    );
    let chunks = [];
    if (recordData.streamObj === null) {
      const mediaRecorder = new MediaRecorder(mediaStreamObj);
      recordData.streamObj = mediaRecorder;
    }
    //turn on video when taking a photo, video or video live streaming
    if (recType === "photo" || recType === "film" || recType === "filmcall") {
      video.srcObject = mediaStreamObj;
      video.play();
      ss(socket).emit("calling", recordData.streamObj);
    }

    recordData.streamObj.ondataavailable = function(ev) {
      chunks.push(ev.data);
      if (recType === "voicecall" || recType === "filmcall") {
        console.log("before emmiting call to socket");
        ss(socket).emit("calling", mediaRecorder);
      }
    };

    recordData.streamObj.onstop = ev => {
      let blob = new Blob(chunks, { type: recordData.fileType });
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        let base64data = reader.result;
        //for sending to server:
        userData.files.push({
          name: `rec${recordData.fileType}_${recordData.counter}.${
            recordData.fileType.split("/")[1]
          }`,
          size: blob.size,
          content: base64data
        });
      };
      addRecordToChat(recordData, blob);
      chunks = [];
    };
    console.log("before media recorder state: ", recordData.streamObj.state);
    if (recordData.streamObj.state == "inactive") {
      recordData.streamObj.start();
      console.log("media recorder state: ", recordData.streamObj.state);
    } else if (recordData.streamObj.state == "recording") {
      recordData.streamObj.stop();
      console.log("media recorder stopped: ");
    }
  } catch (err) {
    console.log(`an error occured: ${err.name}: ${err.message}`);
  }
}
audioRecord.onclick = e => {
  getMediaStrem(e.target.dataset.rectype, recordsState.voice);
};
photoRecord.onclick = e => {
  videoContainer.classList.toggle("d-none");
  if (streaming) {
    stopStreamedVideo();
    return;
  }
  getMediaStrem(e.target.dataset.rectype, recordsState.photo);
};

videoRecord.onclick = e => {
  getMediaStrem(e.target.dataset.rectype, recordsState.film);
};

videoCall.onclick = e => {
  debugger;
  console.log("clicked to take a video call", e.target.dataset.rectype);
  videoContainer.classList.toggle("d-none");
  if (streaming) {
    stopStreamedVideo();
    return;
  }
  getMediaStrem(e.target.dataset.rectype, recordsState.filmCall);
};
phoneCall.onclick = e => {
  console.log("clicked to take a phone call", e.target.dataset.rectype);
  getMediaStrem(e.target.dataset.rectype, recordsState.voiceCall);
};
