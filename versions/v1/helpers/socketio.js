let io;

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const init = async (server) => {
  io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    socket.userId = userId;
    s = socket;
    next();
  });

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    addUser(socket.userId, socket.id);
    makeUserOnline(socket.userId).then((data) => {
      io.emit("user-online", data);
    });
    console.log({ users });
    socket.on("notify-post", (data) => {
      socket.broadcast.emit("post-notify", data);
    });
    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);
      makeUserOffline(socket.userId).then((data) => {
        socket.broadcast.emit("user-offline", data);
        removeUser(socket.id);
      });
      console.log({ users });
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = {
  users,
  init,
  getUser,
  getIO,
};

const {
  makeUserOnline,
  makeUserOffline,
} = require("../api/auth/auth.controller");
