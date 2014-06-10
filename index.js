// Remaining things to add:
// Communication with SPI wireless nodes

var room1 = 0;
var room2 = 0;

var http = require('http'),
    express = require('express'),
    path = require('path'),
    SPI = require('pi-spi');

var radio = require('nrf').connect("/dev/spidev0.0", 8);
radio.channel(0x4c).dataRate('1Mbps').crcBytes(2).autoRetransmit({count:15, delay:4000});
radio.begin(function () {
    var rx = radio.openPipe('rx', 0xF0F0F0F0E1),
        tx = radio.openPipe('tx', 0xF0F0F0F0D2);
    console.log(tx);
    console.log(rx);
    rx.pipe(tx);        // echo back everything
    radio.sendPayload(Buffer("HUH"),function(){console.log("SHIt?")});
});


// var spi = SPI.initialize("/dev/spidev0.0"),
//     test = Buffer("Hello, World!");

// // reads and writes simultaneously
// spi.transfer(test, test.length, function (e,d) {
//     if (e) console.error(e);
//     else console.log("Got \""+d.toString()+"\" back.");

//     if (test.toString() === d.toString()) {
//         console.log("Good Shit");
//     } else {
//         // NOTE: this will likely happen unless MISO is jumpered to MOSI
//         console.warn("Things happened");
//         process.exit(-2);
//     }
// });
 
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views')); //A
app.set('view engine', 'jade'); //B
app.use(express.json());
 
app.use(express.static(path.join(__dirname, 'public')));
 
app.get('/status', function (req, res) {
	res.setHeader('Content-Type', 'application/json');
	var response = {};
	response['room1'] = room1;
	response['room2'] = room2;
	console.log(JSON.stringify(response));
	res.send(JSON.stringify(response));
});

app.put('/update/:room/:nstatus', function(req, res){
	var response = {};
	var params = req.params;
	console.log(params);
	var room = params.room;
	var roomStatus = parseInt(params.nstatus, 10);
	console.log("ROOM IS:" + room);
	console.log("NEWSTATUSIS:" + roomStatus);
	// Check for invalid room status, must be 0 or 1
	if(!(roomStatus === 0 || roomStatus == 1))
	{
		response['error'] = "Request contained invalid status";
		res.send(JSON.stringify(response));
		return;
	}
	// Check for valid room number. Only two rooms for now.
	if(room == "room1")
	{
		room1 = roomStatus;
	}
	else if(room == "room2")
	{
		room2 = roomStatus;
	}
	else if(room == "all")
	{
		room1 = roomStatus;
		room2 = roomStatus;
	}
	else
	{
		console.log("Invalid room number");
		response['error'] = "Request had an invalid room number";
		res.send(JSON.stringify(response));
		return;
	}
	response['room1'] = room1;
	response['room2'] = room2;
	console.log(JSON.stringify(response));
	// Also need to call function to update the lights.
	res.setHeader('Content-Type', 'application/json');

	res.send(JSON.stringify(response));

});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});