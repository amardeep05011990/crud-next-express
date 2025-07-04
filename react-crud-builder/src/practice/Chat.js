// import React, { useEffect, useRef } from 'react';
// import io from 'socket.io-client';
// import * as mediasoupClient from 'mediasoup-client';

// const socket = io('http://localhost:3001'); // Replace with public URL if needed
// const roomId = 'room1';

// function Chat() {
//   const localVideoRef = useRef(null);

//   useEffect(() => {
//     const run = async () => {
//       const device = new mediasoupClient.Device();

//       socket.emit('joinRoom', { roomId, peerName: 'Guest' }, async (rtpCapabilities) => {
//         await device.load({ routerRtpCapabilities: rtpCapabilities });

//         const sendTransportData = await createTransport();
//         const sendTransport = device.createSendTransport(sendTransportData);

//         sendTransport.on('connect', ({ dtlsParameters }, callback) => {
//           socket.emit('connectTransport', { transportId: sendTransport.id, dtlsParameters }, callback);
//         });

//         sendTransport.on('produce', async ({ kind, rtpParameters }, callback) => {
//           socket.emit('produce', { kind, rtpParameters }, ({ id }) => {
//             callback({ id });
//           });
//         });

//         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = stream;
//         }

//         for (const track of stream.getTracks()) {
//           await sendTransport.produce({ track });
//         }

//         socket.on('newProducer', async ({ producerId }) => {
//           const recvTransportData = await createTransport();
//           const recvTransport = device.createRecvTransport(recvTransportData);

//           recvTransport.on('connect', ({ dtlsParameters }, callback) => {
//             socket.emit('connectTransport', { transportId: recvTransport.id, dtlsParameters }, callback);
//           });

//           const { id, kind, rtpParameters } = await new Promise((resolve) => {
//             socket.emit('consume', { producerId, rtpCapabilities: device.rtpCapabilities }, resolve);
//           });

//           const consumer = await recvTransport.consume({ id, producerId, kind, rtpParameters });

//           socket.emit('resumeConsumer', { consumerId: consumer.id });

//           const remoteStream = new MediaStream();
//           remoteStream.addTrack(consumer.track);

//           const remoteVideo = document.createElement('video');
//           remoteVideo.srcObject = remoteStream;
//           remoteVideo.autoplay = true;
//           remoteVideo.playsInline = true;
//           remoteVideo.style.width = '300px';
//           document.body.appendChild(remoteVideo);
//         });
//       });
//     };

//     run();
//   }, []);

//   const createTransport = () =>
//     new Promise((resolve) => {
//       socket.emit('createWebRtcTransport', {}, resolve);
//     });

//   return (
//     <div>
//       <h2>Mediasoup Video Chat</h2>
//       <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '300px' }} />
//     </div>
//   );
// }

// export default Chat;
