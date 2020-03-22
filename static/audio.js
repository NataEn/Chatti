inputAudio.onchange = e => {
  console.log("in audio input", e);
  const file = e.target.files[0];
  const reader = new FileReader();
  const audioPlayer = new Audio();
  reader.readAsDataURL(file);
  reader.onload = e => {
    console.log("from reader", e.target.result);
    const base64 = reader.result.replace(/^data:audio\/(.*);base64,/, "");
    audioPlayer.src = reader.result;
    audioPlayer.controls = true;
    audioPlayer.setAttribute("type", "audio/mpeg");
    chat.appendChild(audioPlayer);
  };
  const rawData = reader.result;
  //data:audio/mp3;base64

  // Do something with the audio file.
  //   player.src = url;
  //   const handleSuccess = function(stream) {
  //     if (window.URL) {
  //       player.srcObject = stream;
  //     } else {
  //       player.src = stream;
  //     }
  //   };

  //   navigator.mediaDevices
  //     .getUserMedia({ audio: true, video: false })
  //     .then(handleSuccess);
};
