const startVideoCall = () => {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(stream => {
      const peer = new SimplePeer({
        initiator: location.hash === "#init",
        trickle: false,
        stream: stream
      });
      otherPeer = new SimplePeer();
      if (peer.initiator) {
        console.log("stream to be sent", stream);
        // peer.signal(recordsState.filmCall.streamObj);
      }

      peer.on("signal", function(data) {
        document.getElementById("yourId").value = JSON.stringify(data);
      });

      document.getElementById("connect").addEventListener("click", function() {
        var otherId = JSON.parse(document.getElementById("otherId").value);
        peer.signal(otherId);
      });

      document
        .getElementById("yourMessage")
        .addEventListener("change", function() {
          var yourMessage = document.getElementById("yourMessage").value;
          peer.send(yourMessage);
        });

      peer.on("data", function(data) {
        document.getElementById("messages").textContent += data + "\n";
      });

      peer.on("stream", stream => {
        const video = document.querySelector("#remoteVideo");
        console.log("got stream:", stream);
        video.srcObject = stream;
        video.play();
      });
    })
    .catch(err => {
      console.log(err);
    });
};

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
