var five = require("johnny-five");
var edison = require("edison-io");
var board = new five.Board({io:new edison()});

var awsIot = require('aws-iot-device-sdk');
var moment = require('moment');
var lcd    = require('jsupm_i2clcd');
var light_change_threshold = 400;
var light_on_limit = 500;

var request = require('request');

var myLCD = new lcd.Jhd1313m1(6, 0x3E, 0x62);
var clearStr = "                       ";

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

  // Connect to Message Broker
  device.on('connect', function() {
    console.log('Connected to Message Broker.');

    light_sensor.on('change', function () {
      composeRecordAndPublish(this.value);
    });
  });
});

function composeRecordAndPublish(value) {
  console.log("light_sensor value is " + value);
  if (value > light_on_limit) {
    console.log("light is on");
    slackPost("light is on");
    var record = {
      "timestamp": moment().toISOString(),   // ISO8601 format
      "value": value,
      "light_status": "on"
    };
      myLCD.setColor(0, 255, 0);
      myLCD.setCursor(0,0);
      myLCD.write(clearStr);
      myLCD.setCursor(0,0);
      myLCD.write("used");
  } else {
      var record = {
        "timestamp": moment().toISOString(),   // ISO8601 format
        "value": value,
        "light_status": "off"
      };
      slackPost("light is off");
      console.log("light is off");
      myLCD.setColor(0, 255, 0);
      myLCD.setCursor(0,0);
      myLCD.write(clearStr);
      myLCD.setCursor(0,0);
      myLCD.write("not used");
  }

  // Serialize record to JSON format and publish a message
  var message = JSON.stringify(record);
  console.log("Publish: " + topic +": " + message);
  device.publish(topic, message);
}

function slackPost(message) {
  var options = {
        url:  'https://hooks.slack.com/services/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',
        form: 'payload={"text": "raspi: ${message}", "username": "raspi1", "channel": "#bot_test"}',
        json: true
  };

  request.post(options, function(error, response, body){
    if (!error) {
      console.log("slack response: " + body);
    } else {
      console.log('error: '+ body);
    }
  });
}
