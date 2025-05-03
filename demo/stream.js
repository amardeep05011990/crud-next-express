const fs = require('fs');


// Readable stream (input file)
const readStream = fs.createReadStream('input.txt');

// Writable stream (output file)
const writeStream = fs.createWriteStream('output.txt');



// Pipe the read stream into the write stream
// readStream.pipe(writeStream);

readStream.on('data', (chunck)=>{
    writeStream.write(chunck.toString().toUpperCase())
})

// Handle events
readStream.on('error', (err) => console.error('Read error:', err));
writeStream.on('error', (err) => console.error('Write error:', err));

writeStream.on('finish', () => {
  console.log('File has been written successfully!');
});
