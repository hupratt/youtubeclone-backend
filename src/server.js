require("dotenv").config();
const express = require("express");
const cors = require("cors");
const auth = require("./routes/auth");
const admin = require("./routes/admin");
const video = require("./routes/video");
const user = require("./routes/user");
const errorHandler = require("./middlewares/errorHandler");
var fs = require('fs');
var path = require('path');

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/auth", auth);
app.use("/api/v1/admin", admin);
app.use("/api/v1/videos", video);
app.use("/api/v1/users", user);
app.use("/uploads", express.static('public/uploads'))
app.use("/static", express.static('public/frontend/build/static'))
app.all('*', function(req, res) {
    const jsonPath = path.join(__dirname, '..', 'public', 'frontend', 'build','index.html');
    // console.log('=== jsonPath server.js [25] ===', jsonPath);
    res.sendFile(path.resolve(jsonPath));
  });

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started at http://localhost:${PORT}`));
