// * * * * * * * * * * * * * * * * * * * * * * 
// * 
// * 	Combined Airbar + LED interactions
// * 

// *	***	  Pixels
const NLED = 50
const Pixels = require('./pixels.js')
const pixel = new Pixels({ LEDS: NLED, RGBW: true, })

// * Colours 
let re = { r: 100, g:0, b:0, w:0 }
let gr = { r:0, g:100, b:0, w:0 }
let bl = { r:0, g:0, b:100, w:0 }
let off = { r:0, g:0, b:0, w:0 }
let _col = {r:0,g:0,b:0,w:0}

// *	***	  Airbar
const events = require('events');
var AirbarF = require('./airbar_hid.js');
var airbarEvents = new events.EventEmitter();

airbarEvents.on('EVENT', function(touch){
	// console.log(val)

	switch(touch.type){
		case '1F-BEGIN':
			break;
		case '1F-MOVE':
			let val = scale(touch.touch.x,0,652,0,50)
			finger = Math.floor(val)			
			break;
		case '1F-END':
			break;
		case '2F-BEGIN':
			break;
		case '2F-MOVE':
			break;
		case '2F-END':
			break;
			
	}

	// Eo airbar event
})

console.log(' Starting Airbar gesture interface ');
AirbarF(airbarEvents);


// * ************************************ * 
// *
// *		 Drawing Loop
//
var finger = 0
setInterval(()=>{
	pixel.set_all(off)
	pixel.set_pixel(bl,finger)
	pixel.send_pixels()
}, 50)

// ########################################################################################


function scale(x,min,max, ymin,ymax ){
	let r = (x-min)/(max-min);
	return ymin + r * (ymax-ymin);
}


function limit(x,min,max){
	if( x >max)
		x = max;
	else if(x<min)
		x = min;
	return x;
}