"use strict";
import { SOCKET_EMIT, SOCKET_ON_SYS, sendLog } from './utils'
import initServer from './init'
import ClientsController from './clients'
import bindSocketRtc from './on'

//初始化服务
let io = initServer();
let clients = new ClientsController();

//检查客户端内是否已存在相同用户名
io.use((socket, next) => {
  let query = socket.handshake.query;
  if (query.userName) {
    if (clients.has(query.userName as string)) {
      next(new Error("用户已存在"))
    } else {
      next()
    }
  } else {
    next(new Error("参数错误"))
  }
})

//监听连接
io.on(SOCKET_ON_SYS.CONNECTION, (socket) => {
  //获取连接参数（用户信息，房间号）
  const query = socket.handshake.query;
  const userName = query.userName;
  const room = query.room;
  if (!room || !userName) {
    sendLog("未找到用户或房间号")
    return;
  }
  let nowUser = { userId: socket.id, userName }
  clients.add(nowUser);
  socket.join(room);
  //每次连接向房间发送用户列表
  io.to(room).emit(SOCKET_EMIT.SYS_USER_LIST, clients.data)
  //管理rtc相关监听事件
  bindSocketRtc(socket, clients);
  //断开连接
  socket.on(SOCKET_ON_SYS.DISCONNECT, () => {
    clients.remove(nowUser.userName);
    io.to(room).emit(SOCKET_EMIT.SYS_USER_LIST, clients.data)
  })
})

