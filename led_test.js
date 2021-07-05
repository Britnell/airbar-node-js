// * * * * * * * 
// *
// *    Test of neopixel class

const NLED = 50 // IMPORTANT, must be == N_LEDS on arduino
const Pixels = require('./pixels.js')
const pixel = new Pixels({ LEDS: NLED, RGBW: true, })

let re = { r: 100, g:0, b:0, w:0 }
let gr = { r:0, g:100, b:0, w:0 }
let off = { r:0, g:0, b:0, w:0 }

let x =0
setInterval(()=>{
    pixel.set_all(off)
    pixel.set_pixels(re, 0,x)
    pixel.send_pixels()
    x++;
    if(x>=NLED)   x=0
},20)