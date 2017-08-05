var five = require("johnny-five");
var edison = require("edison-io");
var board = new five.Board({io:new edison()});

var awsIot = require('aws-iot-device-sdk');
var moment = require('moment');

var light_change_threshold = 250;
var light_on_limit = 400;

var request = require('request');
var bocco = require('./bocco/bocco.js');
bocco.setRoomId("5b7a1aa7-3bed-4c22-955d-83275818d0dc")
.setAccessToken("b7bf245a1d619d836869458746c4ebc8b31fb75bf9997f8b3b784f10ae484578");

// Define paramerters to publish a message
var device = awsIot.device({
  keyPath: 'certs/edison1.private.key',
  certPath: 'certs/edison1.cert.pem',
  caPath: 'certs/root-CA.crt',
  clientId: 'eison_pub_client',
  region: 'ap-northeast-1'
});


if (process.argv.length < 3) {
    console.log('usage: node main.js <topic name ex) nexway/meetingroom/dunk/edison*/light*>');
    process.exit(1);
} else {
    var topic = process.argv[2];
}

board.on("ready", function() {
  var light_sensor = new five.Sensor({
    pin: 'A0',
    threshold: light_change_threshold
  });

  var motion = new five.Motion(2);
  var led    = new five.Led(8);

  // "calibrated" occurs once, at the beginning of a session,
  motion.on("calibrated", function() {
    console.log("calibrated", moment().format());
  });

  motion.on("motionstart", function() {
    console.log("Detecting moving object", moment().format());
    led.on();
  });

  motion.on("motionend", function() {
    console.log("No moving objects detected", moment().format());
    led.off();
  });

  // Connect to Message Broker
  device.on('connect', function() {
    console.log('Connected to Message Broker.');

    light_sensor.on('change', function () {
      composeRecordAndPublish(this.value);
    });
  });
});

//メッセージ送信
//コールバック
var callback_postMessageText = function(json){
  console.log("callback_getMessages");
  console.log(json);
};

function composeRecordAndPublish(value) {
  console.log("light_sensor value is " + value);
  if (value > light_on_limit) {
    console.log("light is on");
    bocco.postMessageText("お腹がだいぶ空いたので、そろそろ昼ごはんを食べましょうか",callback_postMessageText);

    slackPost("light is on");
    var record = {
      "timestamp": moment().toISOString(),   // ISO8601 format
      "value": value,
      "light_status": "on"
    };
  } else {
      var record = {
        "timestamp": moment().toISOString(),   // ISO8601 format
        "value": value,
        "light_status": "off"
      };
      slackPost("light is off");
      console.log("light is off");
  }

  // Serialize record to JSON format and publish a message
  var message = JSON.stringify(record);
  console.log("Publish: " + topic +": " + message);
  device.publish(topic, message);
}

function slackPost(message) {
  var options = {
        url:  'https://hooks.slack.com/services/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',
        form: 'payload={"text": "raspi: ${message}", "username": "raspi1", "channel": "分かルームsensor"}',
        json: true
  };

  request.post(options, function(error, response, body){
    if (!error && response.statusCode == 200) {
      console.log("slack response: " + body);
    } else {
      console.log('error: '+ response.statusCode + body);
    }
  });
}
