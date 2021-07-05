// * * * * * * * * * * *  * * * * * 
// *
// * Class for issuing and maintaining authentication tokens
// *

const fs = require('fs');
const fetch = require('node-fetch');
const secrets = require('./secrets.js');

const api_scope = 'user-read-playback-state user-modify-playback-state';

function write_program_data(data){
	let json = JSON.stringify(data);
    fs.writeFile('./program_data.json', json,'utf8', function(err){ 
    	if(err)
    		return console.log(' Error saving tokens ', err); 
    } );
}


class SpotifyAuthorization
{
	re_authenticate = true;
	program_data = {};

	constructor({access_token_callback, authorized_callback }){
		
		// * BEGIN - try reading stored tokens
		this.access_token_callback = access_token_callback
		this.authorized_callback = authorized_callback
		
		this.stored_tokens()

		// Eo constructor
	}

	stored_tokens(){
		// * Read Program data 
		fs.readFile('./program_data.json', (err, data)=>{
			if (err) {
				console.error(` Error reading program data, are you missing 'program_data.json' ? `);
				return this.re_authentication()
			} 
			try {
				let json = JSON.parse(data)
				if(json.hasOwnProperty('access_token'))
				if(json.hasOwnProperty('refresh_token')){
					console.log(' Loaded stored tokens ' );
					this.program_data = json
					return this.refresh_tokens();
				}
				throw new Error(JSON.stringify(json))
			} 
			catch (e) {
				console.log(` Couldn't retrieve TOKENS from json `,e)
				this.program_data = {};
				this.re_authentication()
			}
		});
	}
	
	re_authentication(){
		const port = 3000;
		const app = require('express')();
		this.express_server(app)
		app.listen(port);
		console.log(' RE-Authentication - server running, please visit HOSTNAME:', port);
	}
	
	receive_tokens(json){
		this.program_data['access_token'] = json['access_token'];
		this.program_data['refresh_token'] = json['refresh_token'];
		write_program_data(this.program_data);
		this.re_authenticate = false;
	}


	express_server(app){

		app.get('/', (req,res) => {
			if(this.re_authenticate)	res.sendFile(__dirname +'/login.html');
			else						res.sendFile(__dirname +'/home.html');
		});
	
		app.get('/login', (req, res)=>{
			res.redirect('https://accounts.spotify.com/authorize'
						+'?response_type=code'
						+'&client_id=' +secrets.client_id
						+'&scope=' +escape(api_scope)
						+'&redirect_uri=' +encodeURIComponent(secrets.redirect_uri)
						+'&state=sawasawasawasawa');	
		});
	
		app.get('/callback', (req, res)=>{
			console.log(' Received access code ');
			var code = req.query.code || null;
			var state = req.query.state || null;
			if (state === null || state == 'sawasawasawasawa') {
				this.access_token_callback(code)
			}
			res.redirect('/');
			// Eo callback 
		});
	
		//* * * * *Eo Express server
	}

	refresh_tokens(){

		const body = 'grant_type=refresh_token'
				 +'&refresh_token=' +this.program_data.refresh_token
				 +'&client_id=' +secrets.client_id
				 +'&client_secret=' +secrets.client_secret;
	
		const response = fetch("https://accounts.spotify.com/api/token", {
			method: 'post',
			body: body,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		})
		.catch(err => console.error(' token POST error ', err))
		.then( res => res.json() )
		.then( json => { 
			json.refresh_token = this.program_data.refresh_token
			console.log(' Tokens refreshed ! ');
			this.receive_tokens(json); 
			this.authorized_callback(json)
		})
		.catch(err => console.log(' recieve error ', err) );
	
	}

	// * * * * * * * 	Eo  Class 
}


module.exports = SpotifyAuthorization;