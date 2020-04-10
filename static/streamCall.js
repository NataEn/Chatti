const remoteVideo = document.querySelector("#remoteVideo");
const localVideo = document.querySelector("#localVideo");
const usersId = {
  initiator: "",
  contacts: [],
};
const desktopConstarains = {
  video: {
    manadatory: { maxWidth: 800, maxHeight: 600 },
  },
  audio: true,
};
const mobileConstarains = {
  video: {
    manadatory: { maxWidth: 480, maxHeight: 320 },
  },
  audio: true,
};
const setConstrains = () => {
  let constrains = {};
  if (/Android|iPhone|ipad/i.test(navigator.userAgent)) {
    constrains = mobileConstarains;
  } else {
    constrains = desktopConstarains;
  }
  return constrains;
};
const hasUserMedia = () => {
  //check if the browser supports the WebRTC
  return !!(
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia
  );
};
if (hasUserMedia()) {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  //enabling video and audio channels
  navigator.getUserMedia(
    constraints,
    function (stream) {
      var video = document.querySelector("video");

      //inserting our stream to the video tag
      video.src = window.URL.createObjectURL(stream);
    },
    function (err) {}
  );
} else {
  alert("WebRTC is not supported");
}

const startVideoCall = () => {
  let constrains = setConstrains();
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

  navigator
    .getUserMedia(constrains)
    .then((stream) => {
      const peer = new SimplePeer({
        initiator: location.hash === "#init",
        trickle: false,
        stream: stream,
      });
      otherPeer = new SimplePeer();
      if (peer.initiator) {
        console.log("stream to be sent", stream);
        // peer.signal(recordsState.filmCall.streamObj);
      }

      peer.on("signal", function (data) {
        usersId.initiator = data;
        console.log("initiator", data);
        document.getElementById("yourId").value = JSON.stringify(data);
      });

      document.getElementById("connect").addEventListener("click", function () {
        let otherId = JSON.parse(document.getElementById("otherId").value);
        peer.signal(otherId);
      });

      document
        .getElementById("yourMessage")
        .addEventListener("change", function () {
          let yourMessage = document.getElementById("yourMessage").value;
          peer.send(yourMessage);
        });

      peer.on("data", function (data) {
        document.getElementById("messages").textContent += data + "\n";
      });
      //open with other device and see if got stream correctly
      peer.on("stream", (stream) => {
        if (!peer.initiator) {
          remoteVideo.srcObject = stream;
          remoteVideo.play();
        } else if (peer.initiator) {
          localVideo.srcObject = stream;
          localVideo.play();
        }
        console.log("got stream:", stream);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
startVideoCall();

// ss(socket).on("calling", function(stream) {
//   console.log("got calling from server");
//   videoContainer.classList.toggle("d-none");
//   video.srcObject = window.URL.createObjectURL(stream);
//   video.play();
//   let binaryString = "";
//   stream.on("data", function(data) {
//     for (var i = 0; i < data.length; i++) {
//       binaryString += String.fromCharCode(data[i]);
//       //play when ready
//       // video.srcObject = stream; //should be media stream object
//       video.srcObject = window.URL.createObjectURL(binaryString);
//       video.play();
//     }
//   });

//   stream.on("end", function(data) {
//     console.log(binaryString);
//     binaryString = "";
//   });
const start = (document.querySelector("#startButton").onclick = startVideoCall);
