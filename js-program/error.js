// const { exec, spawn, execFile } = require('child_process');
// exec('ls -la', (err, stdout, stderr) => {
//   if (err) throw err;
//   console.log("stdout", stdout);
// });

// const sp = spawn("ls", ["-la"]);
// sp.stdout.on("data", (d)=>{
//   console.log(d.toString())
// })

// execFile("node", ["--version"], (err, stdout)=>{
//   console.log(stdout)
// })

// throw new Error("my custom error")

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // Optional but recommended
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1); // Optional
});


