// * * * * * * * * * * 
// *
// *    Neopixel class that handles serial comm and LED data buffer
// *      simple methods to set LEDs

// to find dev just type in terminal ~ls /dev/tty and hit tab to auto completem then plug in / out your arduino and see what is missing
const SerialPort = require('serialport');


class Pixels
{

  constructor({ LEDS=50, port='/dev/ttyUSB0', RGBW }){
    this.N_LEDS = LEDS
    this.port = port
    this.RGB = true
    if(RGBW) {
      delete this.RGB
      this.RGBW = RGBW
    }

    console.log(this)
    this.init()
    
    // Eo constructor
  }
  
  // * Init
  init(){
  
    if(this.RGB)    
      this.pixelArray = new Uint8Array(this.N_LEDS*3+1);   // RGB
    else if(this.RGBW)    
      this.pixelArray = new Uint8Array(this.N_LEDS*4+1);   // RGBW
    
    this.pixelArray[this.pixelArray.length-1]=255;    // END BYTE = 255 
  
    // * 
    this.serial = new SerialPort(this.port, { baudRate: 115200 },(err)=>{
      if (err) return console.log('Error: ', err.message)
      else
        console.log(` Serial : Opened ${this.port} `);
    });
  
  
    this.serial.on('error', function(err) {
    });  
    this.serial.on('data',function(data){
    });

    // * Eo connect
  }

  send_pixels(){
    this.serial.write(this.pixelArray, (err)=>{
      if (err) return console.log('WrErr:', err.message);
    });
  }

  set_pixel(col,x)
  {
    if(this.RGB){
      this.pixelArray[(x*3)+0] =col.r;
      this.pixelArray[(x*3)+1] =col.g;
      this.pixelArray[(x*3)+2] =col.b;
    }
    else if(this.RGBW){
      this.pixelArray[(x*4)+0] =col.r;
      this.pixelArray[(x*4)+1] =col.g;
      this.pixelArray[(x*4)+2] =col.b;
      this.pixelArray[(x*4)+3] =col.w;  
    }
  }



  set_pixels(col,from,to)
  {
    if(from<0)          from = 0
    if(to>=this.N_LEDS) to = this.N_LEDS-1
    
    if(this.RGB){
      for( var x=from; x<to; x++){
          this.pixelArray[(x*3)+0] =col.r;
          this.pixelArray[(x*3)+1] =col.g;
          this.pixelArray[(x*3)+2] =col.b;
      }
    }
    else if(this.RGBW){
      for( var x=from; x<to; x++){
          this.pixelArray[(x*4)+0] =col.r;
          this.pixelArray[(x*4)+1] =col.g;
          this.pixelArray[(x*4)+2] =col.b;
          this.pixelArray[(x*4)+3] =col.w;
      }
    }
  }

  
  set_all(col)
  {
    for( var x=0; x<this.N_LEDS; x++){
        this.pixelArray[(x*4)+0] =col.r;
        this.pixelArray[(x*4)+1] =col.g;
        this.pixelArray[(x*4)+2] =col.b;
        this.pixelArray[(x*4)+3] =col.w;
    }
  }

  // * Eo class -----------------
}





module.exports = Pixels 