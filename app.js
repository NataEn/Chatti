const express = require("express");
const app = express();
const server = app.listen(3000, () => {
  console.log("listening to requests on port 3000...");
});
