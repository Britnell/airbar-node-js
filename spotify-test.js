

const SpotifyAuthorization = require('./spotify-authorization.js')

const SpotifyWebApi = require('spotify-web-api-node');
const secrets = require('./secrets.js');

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


function main(){
    console.log(' --> READY ')
    
}