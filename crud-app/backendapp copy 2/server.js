
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// mongoose.connect("mongodb://localhost:27017/autogen_crud");
// MongoDB Connection URI
const mongoURI = 'mongodb://localhost:27017/autogen_crud'; // replace with your URI
// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.use("/api/users", require("./routes/users.routes"));
app.use("/api/posts", require("./routes/posts.routes"));
app.use("/api/comments", require("./routes/comments.routes"));

app.listen(5000, () => console.log("Server running on port 5000"));
