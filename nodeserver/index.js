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
socket.on('new-user-joined', ({ name, avatar }) => {
  console.log("New user", name);
  users[socket.id] = { name, avatar };
  socket.broadcast.emit("user-joined", { name, avatar });
});


socket.on("send", message => {
  const user = users[socket.id];

  if (!user) {
    console.warn("Message received from unidentified user:", socket.id);
    return;
  }

  socket.broadcast.emit("receive", {
    avatar: user.avatar,
    name: user.name,
    message: message
  });
});


socket.on('typing',userName => {
  socket.broadcast.emit('show-typing', userName);
});

socket.on("disconnect", () => {
  const user = users[socket.id];
  if (user) {
    socket.broadcast.emit("left", {
      name: user.name,
      avatar: user.avatar
    });
    delete users[socket.id];
  }
});
});

const PORT = process.env.PORT || 8000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
