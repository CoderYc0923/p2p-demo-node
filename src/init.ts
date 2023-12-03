import express from "express";
import http from "http";
import { Server as IO } from "socket.io";

//服务初始化
export default function initServer() {
  let app = express();

  //设置跨域
  app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    //  res.header("Access-Control-Max-Age", "3600");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "X-Requested-With,X_Requested_With,Content-Type"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "PUT, POST, GET, DELETE, OPTIONS"
    );
    //res.header("Access-Control-Allow-Credentials", "true");
    next();
  });

  let http_server = http.createServer(app);
  http_server.listen(3007);

  let io = new IO(http_server, {
    path: "/rtcket",
    cors: {
      origin: "*",
    },
  });
  http_server.on("listening", () => {
    let addr = http_server.address();
    if (addr) {
      let port = typeof addr === "string" ? addr : addr.port;
      console.log(`Listening on ${port}`);
    }
  });
  return io;
}
