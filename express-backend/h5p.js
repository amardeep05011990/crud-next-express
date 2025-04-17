const express = require("express");
const path = require("path");
const { H5PEditor, H5PPlayer } = require("h5p-nodejs-library");

const app = express();

const h5pConfig = {
  mode: "development",
  h5pTmpStorage: path.join(__dirname, "tmp"),
  h5pStorage: path.join(__dirname, "h5p/content"),
  h5pLibrariesDir: path.join(__dirname, "h5p/libraries"),
  maxFileSize: 2000000,
  url: "/h5p",
};

// Serve static files
app.use("/h5p", express.static(path.join(__dirname, "h5p")));

const player = new H5PPlayer(h5pConfig);

app.get("/h5p/:contentId", async (req, res) => {
  const html = await player.render(req.params.contentId);
  res.send(html);
});

app.listen(3000, () => {
  console.log("H5P server running at http://localhost:3000");
});
