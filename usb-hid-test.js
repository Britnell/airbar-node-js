// * * * * * * * * * * * 
// *
// *		Test to read USB HID devices and airbar data buffer

var HID = require('node-hid');
var devices = HID.devices();
console.log(' HID devices : ', devices.length);

var airbar, airdev;

devices.forEach((dev)=>{
	if(dev.manufacturer.includes('Neonode')){
		if(!airdev ) airdev = dev;
	}
})

if(airdev){
    console.log(' airbar ', airdev )
    airbar = new HID.HID(airdev.path)
    setTimeout(function(){ 
		airbar.close();
		setTimeout(()=>{
			airbar = new HID.HID(airdev.path);
			airbar.on("data", function(data) {
				// console.log(' [data] ', data );
				airbar_packet(data);
			});

			airbar.on("error", function(err) {
				console.log(' [Error] ', err );
				airbar.close();
			});
		},800);
	},800);
}


function airbar_packet(data){
    console.log(data)
}