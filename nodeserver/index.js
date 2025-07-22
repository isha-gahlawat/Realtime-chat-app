const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const io = require("socket.io")(http, {
  cors: {
    origin: "*", // In production, use your actual frontend domain
    methods: ["GET", "POST"]
  }
});

const users = {};

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", socket => {
  socket.on("new-user-joined", name => {
    console.log("New user", name);
    users[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
  });

  socket.on("send", message => {
    socket.broadcast.emit("receive", {
      message: message,
      names: users[socket.id]
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("left", users[socket.id]);
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 8000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
