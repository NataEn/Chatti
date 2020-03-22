const audio = document.querySelector("#audio");
const inputAudio = document.querySelector(".audio");
// const audioOutput = document.createElement("audio");
// audioOutput.controls = true;
// audioOutput.setAttribute("type", "audio/mp3");

const constrains = {
  audio: true,
  video: false
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
      let blob = new Blob(chunks, { type: "audio/mp3;" });
      chunks = [];
      const audioOutput = document.createElement("audio");
      audioOutput.controls = true;
      audioOutput.setAttribute("type", "audio/mp3");
      audioOutput.src = URL.createObjectURL(blob);
      chat.appendChild(audioOutput);
    };
    audioOutput.onloadedmetadata = event => {
      //chat.appendChild(audioOutput);
      console.log("loaded new audio");
    };
  })
  .catch(err => {
    console.log(`an error occured: ${err.name}: ${err.message}`);
  });
