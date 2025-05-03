
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/autogen_crud");

app.use("/api/user", require("./routes/user.routes"));
app.use("/api/post", require("./routes/post.routes"));

app.listen(5000, () => console.log("Server running on port 5000"));
