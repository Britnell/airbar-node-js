// * * * * * * * * * * * * * * * * * * * * * * 
// * 
// * 	Music player IX
// * 

const SpotifyAuthorization = require('./spotify-authorization.js')
const SpotifyWebApi = require('spotify-web-api-node');
const secrets = require('./secrets.js');

// *	***	  Pixels
const NLED = 50
const Pixels = require('./pixels.js')
const pixel = new Pixels({ LEDS: NLED, RGBW: true, })

const ix_height = 16
const release_height = 22


// * Colours 
let re = { r: 100, g:0, b:0, w:0 }
let re_off = { r: 24, g:0, b:0, w:0 }
let gr = { r:0, g:100, b:0, w:0 }
let gr_off = { r:0, g:20, b:0, w:0 }

let bl = { r:0, g:10, b:100, w:0 }
let thl = { r:0, g:20, b:70, w:0 }
let off = { r:0, g:0, b:0, w:0 }
let _col = {r:0,g:0,b:0,w:0}

// *	***	  Airbar
const events = require('events');
var AirbarF = require('./airbar_hid.js');
var airbarEvents = new events.EventEmitter();


// * ************************************ * 
// *		 App

const player = {
	state: 'unauthenticated',
}

const gest = {
	type: null,
}

function drawPlayer(){
	switch(player.state){
		case 'idle':
			draw_idle()
			break;
		case 'play':
			draw_player()
			break;
		case 'volume':
			draw_volume()
			break;
		case 'unauthenticated':
			draw_login()
			break;
	}
}

function draw_login(){
	pixel.set_all(off)
	pixel.set_pixels(fade(gr_off,0.1),10,NLED-10)
	pixel.send_pixels()
}

function draw_idle(){
	pixel.set_all(off)
	// pixel.set_pixels(gr_off,7,10)
	pixel.set_pixel(	 re_off,0)
	pixel.set_pixel(fade(re_off,0.7),1)
	pixel.set_pixel(fade(re_off,0.3),2)
	pixel.set_pixel(fade(re_off,0.1),3)
	pixel.send_pixels()
}

function check_idle(pos){
	if(pos.x<=4.5 )
	if(pos.y<ix_height){
		console.log(` Player : ON `)
		player.state = 'play'
		gest.type = 'tapped'
	}
}

function check_off(pos){
	if(pos.x<=3.5)
	if(pos.y<ix_height){
		console.log(` Player : STANDBY `)
		player.state = 'idle'
		gest.type = 'tapped'
	}
}

function draw_player(){
	pixel.set_all(off)
	pixel.set_pixel(re,2)	// * Power button
	draw_playpause()
	draw_volume_butt()
	draw_skipper()
	pixel.send_pixels()
}

const playPause = {
	state: 'pause',
	beg: 6, end: 9,
	cols:{
		'pause': gr_off,
		'play' : gr,
	}
}

function draw_playpause(){
	if(playPause.state=='play')
		pixel.set_pixels(
			playPause.cols['play'],
			playPause.beg,
			playPause.end, )
	else {
		pixel.set_pixel(playPause.cols['pause'],playPause.beg)
		pixel.set_pixel(playPause.cols['pause'],playPause.beg+2)
	}
}

function check_playpause(pos){
	if(pos.x>=playPause.beg-0.5 && pos.x<=playPause.end +0.5)
	if(pos.y<ix_height)
	{
		console.log(` PLAY/PAUSE : ${playPause.state} `)
		gest.type = 'tapped'
		if(playPause.state==='play'){
			playPause.state = 'pause'
			pause()
		}
		else {
			playPause.state = 'play'
			play()
		}
	}
}

const volume = {
	val: 50,	beg: 22,	end: 25,
	border: 5,  factor: 5.0,
}

function draw_volume_butt(){
	pixel.set_pixels(gr_off,volume.beg,volume.end)
}

function draw_volume(){
	let v = scale(volume.val,0,100,volume.border,NLED-volume.border)
	pixel.set_all(off)
	pixel.set_pixels(gr,volume.border,v)
	let col = fade(thl,0.3)
	pixel.set_pixel(col,volume.border)
	pixel.set_pixel(col,NLED-volume.border)
	pixel.send_pixels()
}

function check_volume(pos){
	if(pos.x >= volume.beg -0.5 && pos.x<=volume.end +0.5 )
	if(pos.y<ix_height)
	{
		// begin volume swipe
		player.state = 'volume'
	}
}

var lastVolume = 0
function control_vol(delta){
	volume.val += delta.x / volume.factor
	if(volume.val <0 )	volume.val = 0
	else if(volume.val>100)  volume.val = 100
	// * rounded printout
	let rounded = Math.round(volume.val/10)*10
	if(rounded!=lastVolume){
		console.log(' VOL : ', rounded )
		spotifyApi.setVolume(rounded)
		lastVolume = rounded
	}
}

const skipper = {
	beg: 38, end: 44,
	col: {r:0,g:10,b:60,w:0},
	gestCol: {r:0,g:0,b:40,w:20},
	gest: 0
}

function draw_skipper(){
	if(skipper.gest>0){
		let v = scale(skipper.gest,0,93,skipper.beg,skipper.end)
		v = Math.round(v)
		pixel.set_pixels(skipper.gestCol,skipper.beg,v)
	}
	else if(skipper.gest<0){
		let v = scale(skipper.gest,-93,0,skipper.beg,skipper.end)
		v = Math.round(v)
		pixel.set_pixels(skipper.gestCol,v,skipper.end)
	}
	pixel.set_pixel(skipper.col,skipper.beg)
	pixel.set_pixel(skipper.col,skipper.end)
}

function check_skipper(pos,delta){
	if(pos.x>=skipper.beg -0.5 && pos.x<=skipper.end +0.5)
	if(pos.y < ix_height)
	{
		skipper.gest += delta.x
	}
	// * Swipe events
	if(!gest.type){
		if(skipper.gest>=90){
			console.log(' SKIP - FORW.')
			next_track()
			gest.type = 'skip'
		}
		else if(skipper.gest<=-90){
			console.log(' SKIP - BACK.')
			previous_track()
			gest.type = 'skip'
		}
	}
}

function check_1f_move(pos,delta){
	switch(player.state){
		case 'idle':
			if(!gest.type)
				check_idle(pos)
			break;
		case 'play':
			player_control(pos,delta)
			break;
		case 'volume':
			if(pos.y>release_height)
				player.state = 'play'
			else
				control_vol(delta)
			break;
	}
		
	//
}

function player_control(pos,delta){
	if(gest.type===null)
		check_off(pos)
	if(gest.type===null)
		check_playpause(pos)
	if(gest.type===null)
		check_volume(pos)
	if(gest.type===null)
		check_skipper(pos,delta)
	// Eo player control
}

// **** DRAWING LOOP
setInterval(()=>{
	drawPlayer()

},50)

airbarEvents.on('EVENT', function(ev){
	// console.log(ev)

	let pos;
	if(ev.touch)
		pos = touch_to_led_x(ev.touch)

	switch(ev.type){
		case '1F-BEGIN':
			gest.type = null
			break;
		case '1F-MOVE':
			check_1f_move(pos,ev.delta)
			break;
		case '1F-END':
			if(player.state==='volume')
				player.state = 'play'
			skipper.gest = 0
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

AirbarF(airbarEvents);


// ################################## SPOTIFY ####################


const spotifyApi = new SpotifyWebApi({
    clientId: secrets.client_id,
    clientSecret: secrets.client_secret,
    redirectUri: secrets.redirect_uri
});

function get_tokens(code) {
    spotifyApi.authorizationCodeGrant(code).then(
        (data)=>{
            let json = data.body
            if( json.hasOwnProperty('access_token') && json.hasOwnProperty('refresh_token') ){ 
                console.log(' Received Tokens ')
                authorization.receive_tokens(json);
                spotifyApi.setRefreshToken(json['refresh_token'])
                spotifyApi.setAccessToken(json['access_token'])
                return main()
            }
            throw new Error(' Tokens received without tokens ')
        },
        (err)=>console.log('Access token error ', err.message)
    );
}


const authorization = new SpotifyAuthorization({
    access_token_callback: (code)=>get_tokens(code),
    authorized_callback: (tokens)=>{
        spotifyApi.setRefreshToken(tokens['refresh_token'])
        spotifyApi.setAccessToken(tokens['access_token'])
        main()
    }
});


function error_handler(error){
	console.log(' [SPOTIFY API ERROR] : ', error );
}


function pause(){
	spotifyApi.pause()
	.then(function() {
		console.log('Playback paused');
	}, function(err) {
		error_handler(err);
	})
}

function play(){
	spotifyApi.transferMyPlayback([laptopId],{play: true})
	.then(function(resp) {
		console.log(' ~ Play! ');
	}, 
	function(err) {
		error_handler(err);
	});
}

function next_track(){
	spotifyApi.skipToNext()
	.then(()=>{	}, (err)=>error_handler(err) );
}

function previous_track(){
	spotifyApi.skipToPrevious()
	.then(()=>{},(err)=>error_handler(err) );
}

const volumioId = 'c6e56cf6b68c07041768b06e2f29a439e7724b0e'
const laptopId = '74cb0e77b7113343395faae4499c1845795ff3b5'

function main(){
    console.log(' --> READY ')
	player.state = 'idle'
    
	spotifyApi.getMyCurrentPlaybackState()
	.then(function(data) {
		// Output items
		let playing = data.body.is_playing
		let device = data.body.device
		console.log('pl:',playing,device)
		playPause.state = playing?'play':'pause'

	}, 
	function(err) {
		error_handler(err);
	});
}



// ########################################################################################

function millis(){
	return Date.now();
}

function touch_to_led_x(pos){
	return {
		x: scale(pos.x,0,652,0,NLED),
		y: pos.y/10,
	}
}

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

function fade(obj,f){
	let ret = {}
	Object.keys(obj).forEach((k)=>{
		ret[k] = obj[k] * f
	})
	return ret
}

function limit(x,min,max){
	if( x >max)
		x = max;
	else if(x<min)
		x = min;
	return x;
}