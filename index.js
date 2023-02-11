const csv = require('csv-parser')
const fs = require('fs')
const inpFile = process.argv[2] || "/cleaninstance/TestTemp.csv"
const outFile = process.argv[3] || "/cleaninstance/TestTemp.txt"
console.log(" Reading " + inpFile + " Writing " + outFile);
const results = [];
const writableStream = fs.createWriteStream(outFile);
writableStream.on("finish", () => console.log("finished") );

fs.createReadStream(inpFile)
  .pipe(csv(["timestamp", "device", "measure", "value"]))
  //.on('data', (data) => results.push(data))
  .on('data', procRecord)
  .on('end', () => {
    console.log("Read " + results.length + " records", results);
	writableStream.end();
  });
  
function procRecord( data ) {
	if (data.measure == "type" || !data.value || data.value == "[object Object]" || data.value == "") return;
	if (!data.value || data.value == "") return null;
	if (isNaN(Date.parse(data.timestamp))) return;
	if ( data.measure == "temperature" && parseFloat(data.value) > 150 ) return null;
	let tmpMeasure = data.measure.replace("device_","") ; // weird motion zigbee sometimes has device_temperature
	if (tmpMeasure.includes("motion/")) return null;
	const tmpDevice = ((data.device.indexOf("/") == -1) ? data.device : data.device.slice(data.device.indexOf("/")+1)).replace(/ /g, "_");
	let tmpFields = {};
	if (tmpMeasure == "motion") {
		tmpFields[tmpMeasure] = (data.value == "active") ? 1 : 0;
	} else if (tmpMeasure == "power" && (data.value == "on" || data.value == "off") ) {
		tmpFields[tmpMeasure] = (data.value == "on") ? 1 : 0;
	} else if (isNaN(parseFloat(data.value))) {
		try { parsedValue = JSON.parse(data.value) } catch (er) { parsedValue = null}
		if (!parsedValue || !parsedValue.hasOwnProperty("sensorType") ) return null;
		tmpMeasure = parsedValue.sensorType.toLowerCase();
		tmpFields = Object.keys(parsedValue).reduce( (ret, key) => {
			if (key.slice(0,6) == "sensor" && key != "sensorType" ) ret[key] = parsedValue[key];
			return ret;
		}, {} );
		tmpFields[tmpMeasure] = parsedValue.sensorAdjAvg || parsedValue.sensorAvg || parsedValue.sensor1Raw;
	} else {
		tmpFields[tmpMeasure] = parseFloat(data.value);
	}
	const flatFields = Object.keys(tmpFields).reduce( (stri, field) => 
						((stri == "") ? field + "=" + tmpFields[field] : stri + "," + field + "=" + tmpFields[field]),
					"" );
	//writableStream.write( tmpMeasure + "_" + tmpDevice + " " + flatFields + " " + Date.parse( data.timestamp ) + "\n");
	writableStream.write( tmpDevice + " " + flatFields + " " + Date.parse( data.timestamp ) + "\n");
	//results.push({measurement: tmpMeasure + "_" + tmpDevice, fields: tmpFields, timestamp:  Date.parse( data.timestamp ) });
	return
}

function write(filePath) {
    const writableStream = fs.createWriteStream(outFile);
    writableStream.on('error',  (error) => {
        console.log(`An error occured while writing to the file. Error: ${error.message}`);
    });
}