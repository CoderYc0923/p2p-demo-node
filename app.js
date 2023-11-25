const express = require("express");
const bodyParser = require("body-parser");

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

app.listen(3007, () => {
  console.log("服务启动，端口号3007");
});
