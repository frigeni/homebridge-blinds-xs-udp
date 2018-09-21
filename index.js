'use strict';

var Service;
var Characteristic;
var udp = require('./udp');
var binding = 0
const dgram = require('dgram');

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-blinds-xs-udp", "BlindsXSUDP", BlindsUDPAccessory);
};

function BlindsUDPAccessory(log, config) {
    // global vars
    this.log = log;

    // configuration vars
    this.name = config.name; 
    this.host = config.host; 
    this.port = config.blinds_port; 
    this.server_port = config.server_port;

    // state vars
    this.lastPosition = 0; // last known position of the blinds, down by default
    this.currentPositionState = 2; // stopped by default
    this.currentTargetPosition = 0; // down by default

    // register the service and provide the functions
    this.service = new Service.WindowCovering(this.name);

    // the current position (0-100%)
    // https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js#L493
    this.service
        .getCharacteristic(Characteristic.CurrentPosition)
        .on('get', this.getCurrentPosition.bind(this));

    // the position state
    // 0 = DECREASING; 1 = INCREASING; 2 = STOPPED;
    // https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js#L1138
    this.service
        .getCharacteristic(Characteristic.PositionState)
        .on('get', this.getPositionState.bind(this));

    // the target position (0-100%)
    // https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js#L1564
    this.service
        .getCharacteristic(Characteristic.TargetPosition)
        .on('get', this.getTargetPosition.bind(this))
        .on('set', this.setTargetPosition.bind(this));


    this.client  = dgram.createSocket('udp4');
    this.client.on('message', (msg, rinfo) => {
	var mes = msg;
	mes = mes.toString().slice(1);
	console.log(`server received udp: ${msg} from ${rinfo.address}`);

	if (rinfo.address == this.host && msg.toString().substr(0,1) == "S" ) {
	    this.lastPosition = parseInt(mes);
	    this.currentTargetPosition = parseInt(mes);
	    this.currentPositionState = 2;

    	    this.service
        	.setCharacteristic(Characteristic.CurrentPosition, this.currentTargetPosition);
	    this.service
        	.setCharacteristic(Characteristic.PositionState, this.currentPositionState);
	}  
    });

    if (binding == 0){
        this.client.bind(this.server_port);
        binding = 1
    }

}

BlindsUDPAccessory.prototype.getCurrentPosition = function(callback) {
    this.log("Requested CurrentPosition: %s", this.lastPosition);
    callback(null, this.lastPosition);
}

BlindsUDPAccessory.prototype.getPositionState = function(callback) {
    this.log("Requested PositionState: %s", this.currentPositionState);
    callback(null, this.currentPositionState);
}

BlindsUDPAccessory.prototype.getTargetPosition = function(callback) {
    this.log("Requested TargetPosition: %s", this.currentTargetPosition);
    callback(null, this.currentTargetPosition);
}

BlindsUDPAccessory.prototype.setTargetPosition = function(pos, callback) {
    this.log("Set TargetPosition: %s", pos);
    this.currentTargetPosition = pos;

        this.udpRequest(this.host, this.port,"A"+pos, function() {
        this.log("Success moving to "+pos);
        this.service
            .setCharacteristic(Characteristic.CurrentPosition, pos);
        this.service
            .setCharacteristic(Characteristic.PositionState, 2);

    }.bind(this));

    callback(null);
}

BlindsUDPAccessory.prototype.udpRequest = function(host, port, payload, callback) {
        udp(host, port, payload, function (err) {
            callback(err);
        });
    },

BlindsUDPAccessory.prototype.getServices = function() {
  return [this.service];
}
