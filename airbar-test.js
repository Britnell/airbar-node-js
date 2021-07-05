// * * * * * * * * * * * 
// *
// *	 testing airbar class & functionality

const events = require('events');

var AirbarF = require('./airbar_hid.js');
var airbarEvents = new events.EventEmitter();

airbarEvents.on('EVENT', function(val){

	console.log(val)

	switch(val.type){
		case '1F-BEGIN':
			break;
		case '1F-MOVE':
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