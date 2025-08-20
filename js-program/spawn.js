const { spawn } = require('child_process');

const py = spawn('python', ['child.py']);



py.stdin.write(JSON.stringify({ name: "Amardeep sdfg" }) + "\n");
py.stdin.end();

py.stdout.on('data', (data) => {
  const result = JSON.parse(data);
  console.log('From Python:', result);
});