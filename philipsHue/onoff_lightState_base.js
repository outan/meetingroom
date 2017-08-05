var hue = require("node-hue-api"),
    HueApi = hue.HueApi,
    lightState = hue.lightState;

var displayResult = function(result) {
    console.log("displayResult: " + result);
};

var displayError = function(err) {
    console.error("displayError: " + err);
};

var host,
    username = "X15-ihaT99EEkfmxCkozmcwZ1r1JMs9DbLl0SbBZ",
    api,
    state;


var createLightState = function(bridge) {
  host = bridge[0].ipaddress;
  console.log(host);
  api = new HueApi(host, username);
  state = lightState.create();

// --------------------------
// Using a promise

// Set the lamp with id '2' to on
api.setLightState(1, state.on())
    .then(displayResult)
    .fail(displayError)
    .done();

// Now turn off the lamp
api.setLightState(1, state.off())
	.then(displayResult)
    .fail(displayError)
    .done();

// --------------------------
// Using a callback
// Set the lamp with id '2' to on
api.setLightState(1, state.on(), function(err, result) {
	if (err) throw err;
	displayResult(result);
});

// Now turn off the lamp
api.setLightState(1, state.off(), function(err, result) {
	if (err) throw err;
	displayResult(result);
});
}

hue.nupnpSearch().then(createLightState).done();
