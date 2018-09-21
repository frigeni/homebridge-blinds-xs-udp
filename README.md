# homebridge-blinds-xs-udp
Control your Blinds through UDP packets

*inspired by Homebridge-blinds-udp by nitaybz

_________________________________________

<a target="blank" href="https://www.paypal.me/frigeni"><img src="https://img.shields.io/badge/Donate-PayPal-blue.svg"/></a>
_________________________________________

# config.json

```
{
        "accessory": "BlindsXSUDP",
        "name": "My Blinds",
        "host": "192.168.0.X",
        "blinds_port": 10002,
        "server_port": 10001
}
```

## Configuration Params

|             Parameter            |                       Description                       | Required |
| -------------------------------- | ------------------------------------------------------- |:--------:|
| `name`                           | name of the accessory                                   |     ✓    |
| `host`                           | endpoint for whatever is receiving these requests       |     ✓    |
| `blinds_port`                    | port of destination                                     |     ✓    |
| `server_port`                    | server port                                             |     ✓    |


## Help

  - Make sure to specify a ports  and host in the config file.

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-blinds-xs-udp`
3. Update your config file
