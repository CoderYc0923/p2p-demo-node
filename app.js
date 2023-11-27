const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const serveIndex = require("serve-index");

const app = express();

//设置跨域
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  //  res.header("Access-Control-Max-Age", "3600");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With,X_Requested_With,Content-Type"
  );
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  //res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(bodyParser.json({ limit: "2048kb" }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/public"));

var http_server = http.createServer(app);

http_server.listen(3007);

const onListening = () => {
  var addr = http_server.address();
  var bind = typeof addr === "string" ? `pipe${addr}` : `port${addr.port}`;
  console.log("服务启动:", bind);
};

http_server.on("listening", onListening);

var io = require("socket.io")(http_server, {
  path: "/rtcket",
  cors: true,
});

let clients = [];
io.on("connection", (socket) => {
  let query = socket.handshake.query;
  let username = query.username;
  let room = query.room;
  console.log(username + "连接了");
  if (clients.some((v) => v.userId === socket.id)) return;
  socket.join(room);
  clients.push({ userId: socket.id, username });
  if (clients.length > 1) {
    let hash = {};
    clients = clients.reduce((item, next) => {
      hash[next.username]
        ? ""
        : (hash[next.username] = true && item.push(next));
      return item;
    }, []);
    console.log("当前clients：", clients);
  }
  if (clients.length >= 2) io.sockets.in(room).emit("ready");
  socket.emit("joined");
  socket.broadcast.to(room).emit("join", { username });
  io.sockets.in(room).emit("clients", clients);
  //收到对等连接创建的消息
  socket.on("pc message", (data) => {
    socket.to(data.to.userId).emit("pc message", data);
    console.log("pc message收到对等创建的消息");
  });
  //发私信，发起视频互动的请求
  socket.on("interact", (data) => {
    socket.to(data.from.userId).emit("interact", data);
    console.log("interact发起视频互动的请求");
  });
  //对方同意视频互动
  socket.on("agree interact", (data) => {
    socket.to(data.from.userId).emit("agree interact", data);
    console.log("agree interact对方同意视频互动");
  });
  // 对方拒绝视频互动
  socket.on("refuse interact", (data) => {
    socket.to(data.from.userId).emit("refuse interact", data);
    console.log("拒绝视频互动的请求");
  });
  // 对方停止视频互动
  socket.on("stop interact", (data) => {
    socket.to(data.to.userId).emit("stop interact", data);
    console.log("停止视频互动");
  });
  //离开房间
  socket.on("leave", () => {
    socket.emit("left");
    socket.broadcast.to(room).emit("leave", { userId: socket.id, username });
    clients = clients.filter((v) => v.userId !== socket.id);
    io.sockets.in(room).emit("clients", clients);
  });
  //断开连接
  socket.on("disconnect", () => {
    console.log(username + "断开连接了");
    const obj = clients.filter((v) => v.userId === socket.id);
    socket.broadcast.to(room).emit("close_disconnect", obj);
    console.log(room + "close_disconnect", obj);
    clients = clients.filter((v) => v.userId !== socket.id);
    io.sockets.in(room).emit("clients", clients);
    console.log(username + "最终断开连接了");
  });
});
