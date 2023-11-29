"use strict";
import { SOCKET_EMIT, SOCKET_ON_RTC, SOCKET_ON_SYS } from './src/utils'
import {initServer} from './src/init'
import  from './src/clients'

//初始化服务
let io = initServer();
let clients = new ClientsController();

let clients = [];
io.on("connection", (socket) => {
  let query = socket.handshake.query;
  let username = query.username;
  let room = query.roomId;
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
  socket.on("pc_message", (data) => {
    socket.to(data.to.userId).emit("pc_message", data);
    console.log("pc_message收到对等创建的消息");
  });
  //发私信，发起视频互动的请求
  socket.on("interact", (data) => {
    socket.to(data.to.userId).emit("interact", data);
    console.log("发起视频互动的请求",data);
  });
  //对方同意视频互动
  socket.on("agree_interact", (data) => {
    socket.to(data.from.userId).emit("agree_interact", data);
    console.log("对方同意视频互动",data);
  });
  // 对方拒绝视频互动
  socket.on("refuse_interact", (data) => {
    socket.to(data.from.userId).emit("refuse_interact", data);
    console.log("拒绝视频互动的请求");
  });
  // 对方停止视频互动
  socket.on("stop_interact", (data) => {
    socket.to(data.to.userId).emit("stop_interact", data);
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
