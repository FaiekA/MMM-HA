# MMM-HA
Fork from # MMM-HomeAssstant  - https://github.com/zuo000/MMM-HomeAssistant  -credits. 

WIP - TESTING - hobbyist.

css changes  - Lights and Switches tiles change color when turned on - flips as well as a visual indicator  

HomeAssistant frontend module for [MagicMirror²](https://github.com/MichMich/MagicMirror).

![ScreenShot](screenshot.png?raw=true "ScreenShot")

## Installation

1. Navigate into your MagicMirror `modules` folder and execute<br>
`git clone https://github.com/xxxxxxxxxxxx`.
2. Enter the new `MMM-HA` directory and execute `npm install`.

## Configuration

```
		{
			module: "MMM-HA",
			position: "center",
			config: {
			  host: "<192.168.0.1>",
			  port: 8123,
			  accessToken: "",
			  entities: [""

						],
			  mediaPlayerEntities: ["",			  			
					]
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
