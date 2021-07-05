// * * * * * * * * * * * * * * * * * * * * * * 
// * 
// * 	Button IX
// * 

// *	***	  Pixels
const NLED = 50
const Pixels = require('./pixels.js')
const pixel = new Pixels({ LEDS: NLED, RGBW: true, })

// * Colours 
let re = { r: 100, g:0, b:0, w:0 }
let gr = { r:0, g:100, b:0, w:0 }
let bl = { r:0, g:10, b:100, w:0 }
let off = { r:0, g:0, b:0, w:0 }
let _col = {r:0,g:0,b:0,w:0}

// *	***	  Airbar
const events = require('events');
var AirbarF = require('./airbar_hid.js');
var airbarEvents = new events.EventEmitter();

var debouncer = false

airbarEvents.on('EVENT', function(ev){
	// console.log(ev)
	let pos;
	if(ev.touch)
		pos = touch_to_led_x(ev.touch)

	switch(ev.type){
		case '1F-BEGIN':
			break;
		case '1F-MOVE':
			click_buttons(pos)
			break;
		case '1F-END':
			debouncer = false
			if(slider.state=='ON'){
				slider.state = 'OFF'
			}
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

function touch_to_led_x(pos){
	return {
		x: scale(pos.x,0,652,0,NLED),
		y: pos.y/10,
	}
}

// * ************************************ * 
// *		 Drawing 

const button_a = {
	pos: 8,
	w: 2,
	cols: {
		'r': re,
		'y': {r:60,g:15,b:0,w:0},
		'g': {r:0,g:80,b:3,w:0},
		'b': {r:0,g:0,b:100,w:0},
		't': {r:0,g:15,b:60,w:0},
	},
	states: ['r','y','g'],
	s: 0,
}

const button_b = {
	pos: 25,
	w: 2,
	cols: {
		'ON': {r:80,g:20,b:0,w:0},
	},
	state: 'ON',
}

const button_c = {
	pos: 45,
	w: 2,
	cols: {
		'ON': {r:0,g:0,b:0,w:80},
		'OFF': {r:0,g:0,b:0,w:5},
	},
	state: 'OFF',
}

const slider = {
	state: 'OFF',
	val: 25,
}
var lastDraw = 0
function millis(){
	return Date.now();
}

var state = 'butts'

// **** DRAWING LOOP
setInterval(()=>{
	if(slider.state==='ON')
		draw_slider()
	else
		draw_buttons()
},50)

function draw_slider(){
	let border = 2

	if(millis()-lastDraw>20){
		let val = scale(slider.val,0,NLED,border,NLED-border)
		val = Math.floor(val)
		let col = button_b.cols[button_b.state]

		pixel.set_pixels(off,0,border)
		pixel.set_pixels(col,border,val)
		pixel.set_pixels(off,val,NLED-1)
		pixel.send_pixels()
		lastDraw = millis()
	}
}

function click_buttons(touch){
	// console.log(touch)

	if(slider.state==='ON'){
		slider.val = Math.floor(touch.x) //(scale(touch.x,0,NLED,0,100))
		if(touch.y>12){
			slider.state='OFF'
		}
		else{
			
			return;
		}
	}

	if(debouncer){
		if(touch.y>10)
			debouncer = false
		else
			return;
	}

	// A
	if(over_button(button_a,touch.x)){	
		if(touch.y<6.5){
			if(++button_a.s>=button_a.states.length)
				button_a.s = 0;
			debouncer = true
			draw_buttons()
		}
	}

	// B 
	if(over_button(button_b,touch.x)){	
		if(touch.y<6.5){
			slider.state = 'ON'
		}
	}

	// C
	if(over_button(button_c,touch.x)){	
		if(touch.y<6.5){
			button_c.state = (button_c.state==='ON')?'OFF':'ON'
			debouncer = true
			draw_buttons()
		}
	}
}

function over_button(butt,x){
	let dif = Math.abs(butt.pos-x)
	if(dif<butt.w)	return true;
	else			return false
}
function draw_buttons(){
	pixel.set_all(off)
	let stateA = button_a.states[button_a.s]
	draw_button(button_a,button_a.cols[stateA])
	draw_button(button_b,button_b.cols[button_b.state])
	draw_button(button_c,button_c.cols[button_c.state])
	pixel.send_pixels()
}

function draw_button(butt,col){
	pixel.set_pixels(col, butt.pos-butt.w, butt.pos+butt.w )
}

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