const phoneCall = document.querySelector("#phoneCall");
const videoCall = document.querySelector("#videoCall");

ss(socket).on("calling", function(stream) {
  let binaryString = "";

  stream.on("data", function(data) {
    for (var i = 0; i < data.length; i++) {
      binaryString += String.fromCharCode(data[i]);
      //feed the video with this
      video.srcObject = mediaStreamObj;
      video.play();
    }
  });

  stream.on("end", function(data) {
    console.log(binaryString);
    binaryString = "";
  });
});
