const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
const protobuf = require('protobufjs');
const randomInt = require('random-int');
const randomItem = require('random-item');
const cron = require('node-cron');
const moment = require('moment');
moment.locale('zh-cn');

const KEY = fs.readFileSync(path.join(__dirname, 'tls-artifacts/client.key'));
const CERT = fs.readFileSync(path.join(__dirname, 'tls-artifacts/client.pem'));
const TRUSTED_CA_LIST = fs.readFileSync(path.join(__dirname, 'tls-artifacts/ca.pem'));

const options = {
  port: 8883,
  host: 'emq.yfmen.com',
  key: KEY,
  cert: CERT,
  rejectUnauthorized: false,
  // The CA list will be used to determine if server is authorized
  ca: TRUSTED_CA_LIST,
  protocol: 'mqtts'
}
const client = mqtt.connect(options);
client.on('connect', function () {
  console.log('连接成功>>>>');

  protobuf.load("accessrecord.proto", function(err, root) {
    if (err) throw err;

    const AccessRecordMessage = root.lookupType("accessrecord.AccessRecord");

    // 定时模拟发送消息，一分钟发送一次
    cron.schedule('* * * * *', () => {
      const payload = {
        id: randomInt(18446744073709551615),
        sn: randomInt(18446744073709551615),
        time: Date.now(),
        deviceId: randomInt(4294967295),
        opened: randomItem([true, false]),
        codeType: randomInt(4294967295)
      };

      const errMsg = AccessRecordMessage.verify(payload);
      if (errMsg) throw Error(errMsg);

      const message = AccessRecordMessage.create(payload);
      const buffer = AccessRecordMessage.encode(message).finish();

      client.publish('/d/r', buffer);

      console.log('=====================================');
      console.log(`发送消息 @ ${moment().format('LLL')}`);
      console.log(payload);
      console.log('=====================================');
    });
  });
});
