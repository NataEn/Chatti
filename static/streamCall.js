ss(socket).on("calling", function(stream) {
  console.log("got calling from server");
  videoContainer.classList.toggle("d-none");
  video.srcObject = window.URL.createObjectURL(stream);
  video.play();
  let binaryString = "";
  stream.on("data", function(data) {
    for (var i = 0; i < data.length; i++) {
      binaryString += String.fromCharCode(data[i]);
      //play when ready

      video.srcObject = stream; //should be media stream object
      video.play();
    }
  });

  stream.on("end", function(data) {
    console.log(binaryString);
    binaryString = "";
  });
});
