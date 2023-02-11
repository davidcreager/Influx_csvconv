const splitter = require('split-file')
const inpFile = process.argv[2] || "/cleaninstance/TestTemp.txt"
console.log(" Reading " + inpFile);

splitter.splitFileBySize(inpFile, 9000000)
  .then((names) => {
    console.log(names);
	console.log("Done")
  })
  .catch((err) => {
    console.log('Error: ', err);
  });