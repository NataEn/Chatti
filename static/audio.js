const audio = document.querySelector("#audio");
const audioAmount = document.querySelector("#audioAmount");
let numRecords = 0;

const constrains = {
  audio: true,
  video: false
};
const createWrapper = childelement => {
  const wrapper = document.createElement("div");
  const trash = document.createElement("span");
  wrapper.appendChild(childelement);
  wrapper.appendChild(trash);

  const classes = ["fas", "fa-trash-alt", "removeRecord"];
  trash.classList.add(...classes);
  trash.onclick = () => {
    for (let i = 0; i < userData.files.length; i++) {
      console.log(childelement.dataset.num);
      if (userData.files[i].name.includes(childelement.dataset.num)) {
        userData.files.splice(i, 1);
        wrapper.remove();
        numRecords -= 1;
        audioAmount.innerHTML = numRecords;
      }
    }
  };
  return wrapper;
};
///presenting the audio record amounts:
const handelRecordAmounts = () => {
  if (numRecords == 0) {
    audioAmount.classList.add("d-none");
    audioAmount.innerHTML = 0;
  } else {
    audioAmount.innerHTML = numRecords;
    audioAmount.classList.remove("d-none");
  }
};

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

navigator.mediaDevices
  .getUserMedia(constrains)
  .then(mediaStreamObj => {
    const mediaRecorder = new MediaRecorder(mediaStreamObj);
    let chunks = [];
    audio.onclick = e => {
      console.log("keydown to record audio");
      if (mediaRecorder.state === "inactive") {
        mediaRecorder.start();
      } else {
        mediaRecorder.stop();
      }
      console.log(mediaRecorder.state);
    };

    mediaRecorder.ondataavailable = function(ev) {
      chunks.push(ev.data);
    };
    mediaRecorder.onstop = ev => {
      numRecords += 1;
      let blob = new Blob(chunks, { type: "audio/mp3;" });
      //for sending to server:
      userData.files.push({
        name: `rec${numRecords}.mp3`,
        size: blob.size,
        content: blob
      });
      chunks = [];
      const audioOutput = document.createElement("audio");
      audioOutput.controls = true;
      audioOutput.setAttribute("type", "audio/mp3");
      audioOutput.setAttribute("data-num", `${numRecords}`);
      audioOutput.src = URL.createObjectURL(blob);
      const audioWrapper = createWrapper(audioOutput);
      chat.appendChild(audioWrapper);

      handelRecordAmounts();
    };
    audioOutput.onloadedmetadata = event => {
      //chat.appendChild(audioOutput);
      console.log("loaded new audio");
    };
  })
  .catch(err => {
    console.log(`an error occured: ${err.name}: ${err.message}`);
  });
