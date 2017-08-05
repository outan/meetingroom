var hue = require("node-hue-api");
var timeout = 2000; // 2 seconds
var displayBridges = function(bridge) {
	console.log("Hue Bridges Found: " + JSON.stringify(bridge));
  console.log(bridge[0].ipaddress);
};

hue.upnpSearch(timeout).then(displayBridges).done();
