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

async function pushMsg(msg) {
  return axios
    .post(
        `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=1e864af4-2e69-446b-8135-308ffc777b37`,
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


function getTimeByTimeZone(timeZone){
    var d=new Date();
        localTime = d.getTime(),
        localOffset=d.getTimezoneOffset()*60000, //获得当地时间偏移的毫秒数,这里可能是负数
        utc = localTime + localOffset, //utc即GMT时间
        offset = timeZone, //时区，北京市+8  美国华盛顿为 -5
        localSecondTime = utc + (3600000*offset);  //本地对应的毫秒数
    var date = new Date(localSecondTime);
    return date
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
  var date = getTimeByTimeZone(8);
  

  var dateStr = formatTime(date - 24 * 60 * 60 * 1000, "yyyy/MM/dd");
  console.log(dateStr)
  console.log(path.join(__dirname, "src/", dateStr + ".md"))
  var mdData = await readFile(path.join(__dirname, "src/", dateStr + ".md"));
  console.log(mdData)

  mdData = mdData.split("---")[0];

  console.log(mdData,1)


  mdData = mdData.split("\r\n\r\n");
  console.log(mdData,2)

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
    // await pushMsg(msg);
    await sleep(1000 * 60);
  }

    pushMsg(mdData);
}

fire();