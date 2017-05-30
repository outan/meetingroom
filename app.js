var five = require("johnny-five");
var edison = require("edison-io");
var board = new five.Board({io:new edison()});

var awsIot = require('aws-iot-device-sdk');
var moment = require('moment');

var light_change_threshold = 250;
var light_on_limit = 500;

var request = require('request');

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
        form: 'payload={"text": "raspi: ${message}", "username": "raspi1", "channel": "#bot_test"}',
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
