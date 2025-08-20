// const { spawn } = require("child_process")

// // const isWin = process.platform === "win32";
// // const command = isWin ? "cmd" : "ls";
// // const args = isWin ? ["/c", "dir"] : ['-lh', '/usr'];
// // const child = spawn(command, args);

// // const child = spawn("child.js")
// const child = spawn("ls", ['-lh', '/usr'])
// child.stdout.on("data", (data)=>{
//     console.log(data.toString())
// })

// child.stderr.on("data", (err)=>{
//     console.log("error", error)
// })

// child.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// });

// const { spawn } = require('node:child_process');

// const subprocess = spawn('ls');

// subprocess.stdout.on('data', (data) => {
//   console.log(`Received chunk ${data}`);
// });


// const {spawn} = require("child_process");
// const child = spawn("python", ["spawnchild.js"])

// child.stdout.on("data", (data)=>{
//     console.log("data.toString()", data.toString())
// })

const { spawn } = require('child_process');

// Spawn python process with script.py
const pythonProcess = spawn('python', ['scripts.py']);

pythonProcess.stdout.on('data', (data) => {
    console.log(`Python Output: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
});

pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
});
// pythonProcess.stdin.write('input through the scripts\n');
pythonProcess.stdin.end();  // Important to let Python know you're done sending input