const express = require('express');
const { SerialPort } = require('serialport');
const WebSocket = require('ws');
const path = require('path');

// console.log("SerialPort.list()", SerialPort.list())

SerialPort.list().then(ports => {
    console.log("portsports=====>>>>>>", ports)
  ports.forEach(port => console.log(port.path));
});
// // Serial setup
// const port = new SerialPort({ path: 'COM3', baudRate: 9600 }); // update COM port

// Web server
const app = express();
const server = app.listen(8080, () => console.log('Web: http://localhost:8080'));
app.use(express.static(path.join(__dirname, './'))); // serve HTML and video

// WebSocket for real-time data
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    try {
      const { pitch, roll } = JSON.parse(msg);
      const cmd = `P:${pitch} R:${roll}\n`;
      console.log('→ Sending to Arduino:', cmd.trim());
      console.log("---------")
    //   port.write(cmd);
    } catch (err) {
      console.error('Invalid message:', err);
    }
  });
});
