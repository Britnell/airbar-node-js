# airbar-node-js
node.js implementation for Neonode zForce air USB HID device

# Welcome
this is for using the airbar (as i like to call it) with node.js on raspberry pi, but should work quite similarly on other systems.

- [Neonode zForce Air A.K.A. Airbar](https://neonode.com/products-and-solutions/touch-sensor-modules)
- [sold on digikey](https://www.digikey.com/en/products/filter/evaluation-boards-sensors/795?s=N4IgTCBcDaIHYFMD2ckBMEgLoF8g)
- I'm using Neopixel for feedback
- See some videos of these interactions [on my blog](https://workout.wonday.eu/2021/07/08/air-gesture-interfaces/)


# Guide

1. Reading USB-HID device with node.js
[npm : node-hid](https://www.npmjs.com/package/node-hid) is doing all the work here. npm install was not straightforward here, I had to pre-install some other modules first, as it didnt work initially for me on the pi, some forum had the answer though (good luck)

Try this out with [usb-hid-test.js](https://github.com/Britnell/airbar-node-js/blob/main/usb-hid-test.js)
This will list all devices, try to connect to an airbar, and read the raw hid data

2. [airbar_hid.js](https://github.com/Britnell/airbar-node-js/blob/main/airbar_hid.js)
So I wrote a class that connects, figures out all the hid data packets, tracks touches and spits it all out again  via events as separate touch-begin touch-drag & touch-end for each 1finger or 2finger. ( much more is possible but this was enough for me for now)
See [airbar-test.js](https://github.com/Britnell/airbar-node-js/blob/main/airbar-test.js) for demo / usage


3. LEDs
The important thing for me here was to have some direct feedback, so I am also using neopixels. I like controlling Neopixels from raspberry pi with an Arduino in between that allows them to be controlled via Serial connectiong, rather than HW GPIO control. I reckon this is easier on processing etc as separate HW & queue are used for Serial. So I used my own [Raspi neopixel](https://github.com/Britnell/Raspi-Neopixel) lib for that. Upload the arduino code, and try it out once. Important here is that the number of pixels defined in arduino is the same as in this project. As the arudino lib is optimised for speed, and expects just the right number of bytes. If the end char 255 does not come when it expects then it will drop the frame and not display anything.

4. [pixels.js](https://github.com/Britnell/airbar-node-js/blob/main/pixels.js)
This is a class that uses npm : serialport to connect to the Arduino-neopixel from step 3. It handles the array of LED RGB values, lets you set one, many, or all pixel values, and writes these to the arduino when you tell it to. 
Connecting is done simply atm and you need to give it the right USB device path.

Try this out with [led_test.js](https://github.com/Britnell/airbar-node-js/blob/main/led_test.js)

5. Interactions
Now were ready to go, this is what we have been waiting for, we can get touch data and provide LED feedback, check its working with [airbar-led-test.js](https://github.com/Britnell/airbar-node-js/blob/main/airbar-led-test.js)

Now I tried out my first simple interactions with this, creating digital buttons and sliders, see
- [ix-follow.js](https://github.com/Britnell/airbar-node-js/blob/main/ix-buttonfollow.js) - a blob following the finger, ix demo
- [ix-buttons.js](https://github.com/Britnell/airbar-node-js/blob/main/ix-buttons.js) - 3 buttons 
- [ix-player.js](https://github.com/Britnell/airbar-node-js/blob/main/ix-player.js) - buttons and sliders as an audio player example
- [ix-spotify.js](https://github.com/Britnell/airbar-node-js/blob/main/ix-spotify.js) - connects to spotify api and lets you control your spotify music playback - funsies
- MORE TO COME

