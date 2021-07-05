/* * * * * * * * * * * * 
 *  	Class to read data from airbar USB HID dev, and keep track of touches & releases
*/

module.exports = function(eventEmitter){

	// const common = require('common');
	const HID = require('node-hid');
	const events = require('events');

	var devices = HID.devices();
	var airdev;
	var airbar;

	devices.forEach((dev)=>{
		if(dev.manufacturer.includes('Neonode')){
			if(!airdev){
				airdev = dev
			}
		}
	});

	if(airdev)
		open_airbar(airdev);

	// eventEmitter.emit('test','123');

	function open_airbar(dev){
		console.log(' opening airbar : ',dev)
		// * Open & close once to reset
		airbar = new HID.HID(dev.path);
		setTimeout(function(){ 
			airbar.close();
			setTimeout(()=>{
				airbar = new HID.HID(dev.path);
				airbar.on("data", function(data) {
					airbar_packet(data);
				});

				airbar.on("error", function(err) {
					console.log(' [Error] ', err );
					airbar.close();
				});
			},800);
		},800);

		

		// setTimeout(function(){
		// 	console.log(' [CLOSE] ')
		// 	airbar.close();
		// }, 4000);
	}

	// https://support.neonode.com/docs/display/AIRTSUsersGuide/zForce+Message+Specification#zForceMessageSpecification-TouchFormatTouchFormat
	var last_released = 0;
	var touch_ids= [];
	var last_touches = 0;

	function airbar_packet(data){
		
		// console.log(data)

		// let time = data[3]*255+data[2];
		let touches = data[1];
		let round = 100;
		let packets = [
			{	
				id: data[4],	
				x:   Math.floor((data[5]+data[6]*255)/round),		
				y:   Math.floor((data[7]+data[8]*255)/round)
			},
			{
				id: data[13],
				x:  Math.floor((data[14]+data[15]*255)/round),
				y:  Math.floor((data[16]+data[17]*255)/round)
			}
		];

		// console.log('--AIR : ', touches, (touches==1)?packets[0]:packets, touch_ids );

		if(touches==1)
		{
			// 1 Finger

			let tch = packets[0];
			if(touch_ids.includes(tch.id)) {
				if(last_touches==2)
					one_finger_begin(tch);
				else
					one_finger_move(tch);
			}
			else if(touch_ids.includes(tch.id+1)){
				touch_ids.splice(touch_ids.indexOf(tch.id+1),1);
				one_finger_end();
			}
			else {
				touch_ids.push(tch.id);
				one_finger_begin(tch);
			}


			// Eo 1 Finger
		}
		else{
			// 2 Fingers
			
			let releases = 0;

			// process events & count changes
			packets.forEach((tch)=>{
				if(touch_ids.includes(tch.id)) {
					// Move
				}
				else if(touch_ids.includes(tch.id+1)){
					releases++;
					touch_ids.splice(touch_ids.indexOf(tch.id+1),1);
				}
				else {
					touch_ids.push(tch.id);
				}
			});

			if(releases==0){
				if(last_touches==2)
					two_finger_move(packets);
				else {
					two_finger_begin(packets);
				}
			}
			else {
				// Release
				two_finger_end();
				// if(touch_ids[0]==packets[0].id)				two_finger_release(packets[0]);				
			}

			// Eo 2 Fingers
		}

		last_touches = touches;

		// Eo airbar
	}

	var state = 'main';

	var finger = {};
	var two = [];

	function one_finger_begin(touch){
		eventEmitter.emit('EVENT', {type:'1F-BEGIN', touch });
		finger.begin = touch;
		finger.last = touch;
		swipe_dist = 0;		// * gesture variables
	}

	function one_finger_move(touch){
		let delta = {
			x: touch.x - finger.last.x,
			y: touch.y - finger.last.y
		}
		
		eventEmitter.emit('EVENT',{ type: '1F-MOVE', delta, touch });

		finger.last = touch;
	}

	function one_finger_end(){
		eventEmitter.emit('EVENT', {type: '1F-END' });
	}


	function two_finger_begin(touches){
		eventEmitter.emit('EVENT',{type:'2F-BEGIN', touches });
		two.begin = touches;
		two.last = touches;
	}

	function two_finger_move(touches){
		// two_finger_slide(touches, two.last);
		eventEmitter.emit('EVENT',{type:'2F-MOVE', touches });
		two.last = touches;
	}

	function two_finger_end(){
		eventEmitter.emit('EVENT',{ type:'2F-END' });
	}

	function round(x, places){
		return Math.round(x*places)/places;
	}

	function limit(x, min,max ){
		if( x< min)
			x = min;
		else if(x>max)
			x = max;
		return x;
	}


}


// #############