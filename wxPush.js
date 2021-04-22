const fs = require("fs");
const path = require("path");
const axios = require("axios");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;

console.log(process.env["NODE_TLS_REJECT_UNAUTHORIZED"]);
async function readFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, "utf8", function (err, data) {
      if (err) throw err;

      resolve(data);
    });
  });
}
//https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=2f6d8b12-e5cb-4e99-b020-e7e1ae0958b7
async function pushMsg(msg) {
  return axios
    .post(
        `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${process.env.SKEY}`,
    //   "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=2f6d8b12-e5cb-4e99-b020-e7e1ae0958b7",
      {
        msgtype: "markdown",
        markdown: {
          content: msg,
        },
      }
    )
    .then((res) => {
      //   console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

/**
 * @param  {} secs 时间戳
 * @param  {} format 转换的格式 yyyy-MM-dd hh:mm:ss
 */
function formatTime(secs, format) {
  var t = new Date(secs);
  var date = {
    "M+": t.getMonth() + 1,
    "d+": t.getDate(),
    "h+": t.getHours(),
    "m+": t.getMinutes(),
    "s+": t.getSeconds(),
    "q+": Math.floor((t.getMonth() + 3) / 3),
    "S+": t.getMilliseconds(),
  };
  if (/(y+)/i.test(format)) {
    format = format.replace(
      RegExp.$1,
      (t.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }

  for (var k in date) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1
          ? date[k]
          : ("00" + date[k]).substr(("" + date[k]).length)
      );
    }
  }
  return format;
}

async function sleep(seconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, seconds);
  });
}

async function fire() {
  var date = new Date();
  var dateStr = formatTime(date - 24 * 60 * 60 * 1000, "yyyy/MM/dd");
  var mdData = await readFile(path.join(__dirname, "src/", dateStr + ".md"));

  mdData = mdData.split("---")[0];

  mdData = mdData.split("\r\n\r\n");

  let temArr = [];
  while (mdData.length > 10 && temArr.length < 2) {
    temArr.push(mdData.splice(0, 9));
  }

  console.log(temArr);

  for (const data of temArr) {
    let msg = data.join("\r\n");
    msg = msg.replace(/^# .*/, "# 前端早报-" + formatTime(date, "yyyy.MM.dd"));
    console.log(msg);
    console.log("--------");
    await pushMsg(msg);
    await sleep(1000 * 60);
  }

  //   pushMsg(mdData);
}

fire();