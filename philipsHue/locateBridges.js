var hue = require("node-hue-api");

var displayBridges = function(bridge) {
	console.log("Hue Bridges Found: " + JSON.stringify(bridge));
  console.log(bridge[0].ipaddress);
};

// --------------------------
// Using a promise
hue.nupnpSearch().then(displayBridges).done();

// --------------------------
// Using a callback
hue.nupnpSearch(function(err, result) {
	if (err) throw err;
	displayBridges(result);
});
