# MMM-HA
Fork from # MMM-HomeAssstant  - https://github.com/zuo000/MMM-HomeAssistant  -credits. 

WIP - TESTING - hobbyist first time coder

css changes  - Lights and Switches icons  when turned on - flips as well as a visual indicator 

Issues : CSS in diffent regions
  	 Scripts not call HomeAssistant 
    
Entities added : lights,Switches,Sensors,Binary Sensors,Booleans,singel icon entities, custom icon entities

To Do  : Add entity - covers ..........

![Screenshot](https://github.com/FaiekA/MMM-HA/assets/52759676/8cdc7862-386e-4bea-b030-78482745ece8)


## Installation

1. Navigate into your MagicMirror `modules` folder and execute<br>
`git clone https://github.com/xxxxxxxxxxxx`.
2. Enter the new `MMM-HA` directory and execute `npm install`.

## Configuration

```
		{
			module: "MMM-HA",
			position: "center",
			animateIn: 'backInDown',
			animateOut: 'backOutUp',				
			config: {
				host: "IP",
				port: 8123,
				accessToken: "secret longlived token",
				entitiesWithDegreeSymbol: ["sensor.openweathermap_temperature"],
				entities: [
					"light.kitchen_counter",
					"sensor.lights_on",
					"light.passage",
					"binary_sensor.hass_online",
					"switch.main_patio_detect",
					"script.spotify_play",
					"input_boolean.hyper_hdr",
					{ // Entity with custom icons
						entity: "binary_sensor.cctv_online",
								"icon-off": "ha-cctv-off",
								"icon-on": "ha-cctv-on"
					},

					{   entity: "input_boolean.guest_mode",
								"icon-off": "ha-guest-off",
								"icon-on": "ha-guest-on"
					},

					{   entity: "device_tracker.faiek_s_fold",
								"icon": "ha-bell",	
					}											
					
				
					
				],
				mediaPlayerEntities: [
					"media_player.spotify_woftxdpkt13crxrjill0b90ie",

				],
				customIconPath: "http://IP:8080/modules/MMM-HA/icons/"				
			}
		},
```
## The MIT License (MIT)

Copyright (c) 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
