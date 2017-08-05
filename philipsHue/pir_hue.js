var hue = require("node-hue-api"),
    HueApi = hue.HueApi,
    lightState = hue.lightState;

var displayResult = function(result) {
    console.log("displayResult: " + result);
};

var displayError = function(err) {
    console.error("displayError: " + err);
};

var host = "192.168.11.111",
    username = "X15-ihaT99EEkfmxCkozmcwZ1r1JMs9DbLl0SbBZ",
    api = new HueApi(host, username),
    state = lightState.create();

var five = require("johnny-five");
var edison = require("edison-io");
var moment = require("moment");

var board = new five.Board({io:new edison()});
board.on("ready", function() {

  // Create a new `motion` hardware instance.
  var motion = new five.Motion(2);
  var led    = new five.Led(3);

  // "calibrated" occurs once, at the beginning of a session,
  motion.on("calibrated", function() {
    console.log("calibrated", moment().format());
  });

  // "motionstart" events are fired when the "calibrated"
  // proximal area is disrupted, generally by some form of movement
  motion.on("motionstart", function() {
    console.log("Detecting moving object", moment().format());

    // Set the lamp with id '1' to on
    api.setLightState(1, state.on(), function(err, result) {
      if (err) throw err;
      displayResult("on " + result);
    });

    led.on();
  });

  // "motionend" events are fired following a "motionstart" event
  // when no movement has occurred in X ms
  motion.on("motionend", function() {
    console.log("No moving objects detected", moment().format());

    // Now turn off the lamp
    api.setLightState(1, state.off(), function(err, result) {
      if (err) throw err;
      displayResult("off " + result);
    });

    led.off();
  });

  motion.on("change", function(value) {
    console.log("pir status changed", moment().format());
    console.log(value);
  })
});
