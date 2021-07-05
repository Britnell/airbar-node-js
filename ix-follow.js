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

airbarEvents.on('EVENT', function(ev){
	console.log(ev)

	switch(ev.type){
		case '1F-BEGIN':
			break;
		case '1F-MOVE':
			blob.pos = scale(ev.touch.x,0,652,0,50)
			blob.width = scale_lim(ev.touch.y,50,400, 8,0.6 )
			// finger = Math.floor(val)			
			break;
		case '1F-END':
			blob.pos = -1
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
const blob = {
	pos: 0,
	width: 1.6,
	rad: 1.5,
}
setInterval(()=>{
	if(blob.pos===-1){
		pixel.set_all(off)
		pixel.send_pixels()
		return;
	}

	for(let l=0; l<NLED; l++){
		let val;
		let dif = Math.abs(l-blob.pos)
		if(dif<blob.width)
			val = 100
		else 
			val = scale_lim(dif,blob.width,blob.width*2,100,0)
		// console.log(l,val)
		pixel.set_pixel({r: val,g:0,b:0,w:0},l)
	}
	pixel.send_pixels()
}, 50)

// ########################################################################################


function scale(x,min,max, ymin,ymax ){
	let r = (x-min)/(max-min);
	return ymin + r * (ymax-ymin);
}
function scale_lim(x,min,max, ymin,ymax ){
	if(x<min)	x = min
	else if(x>max)	x = max
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