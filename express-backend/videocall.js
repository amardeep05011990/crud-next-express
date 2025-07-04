const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mediasoup = require('mediasoup');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

let worker;
const rooms = new Map();

const createWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 20000,
    rtcMaxPort: 29999,
  });

  worker.on('died', () => {
    console.error('mediasoup worker died');
    process.exit(1);
  });

  return worker;
};

createWorker().then(() => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('joinRoom', async ({ roomId, peerName }, callback) => {
      let room = rooms.get(roomId);

      if (!room) {
        const mediaCodecs = [
          {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2,
          },
          {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
            parameters: { 'x-google-start-bitrate': 1500 },
          },
        ];

        const router = await worker.createRouter({ mediaCodecs });
        room = {
          router,
          peers: new Map(),
        };
        rooms.set(roomId, room);
      }

      room.peers.set(socket.id, {
        socket,
        transports: [],
        producers: [],
        consumers: [],
      });

      callback(room.router.rtpCapabilities);

      socket.on('createWebRtcTransport', async (_, callback) => {
        const transport = await room.router.createWebRtcTransport({
          listenIps: [{ ip: '0.0.0.0', announcedIp: null }],
          enableUdp: true,
          enableTcp: true,
          preferUdp: true,
        });

        transport.on('dtlsstatechange', (state) => {
          if (state === 'closed') transport.close();
        });

        room.peers.get(socket.id).transports.push(transport);

        callback({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        });
      });

      socket.on('connectTransport', async ({ transportId, dtlsParameters }) => {
        const transport = room.peers.get(socket.id).transports.find(t => t.id === transportId);
        await transport.connect({ dtlsParameters });
      });

      socket.on('produce', async ({ kind, rtpParameters }, callback) => {
        const transport = room.peers.get(socket.id).transports[0];
        const producer = await transport.produce({ kind, rtpParameters });

        room.peers.get(socket.id).producers.push(producer);

        callback({ id: producer.id });

        // Inform other peers
        for (const [peerId, peer] of room.peers.entries()) {
          if (peerId !== socket.id) {
            peer.socket.emit('newProducer', { producerId: producer.id });
          }
        }
      });

      socket.on('consume', async ({ producerId, rtpCapabilities }, callback) => {
        const router = room.router;
        if (!router.canConsume({ producerId, rtpCapabilities })) {
          return callback({ error: 'Cannot consume' });
        }

        const transport = room.peers.get(socket.id).transports[0];
        const consumer = await transport.consume({
          producerId,
          rtpCapabilities,
          paused: false,
        });

        room.peers.get(socket.id).consumers.push(consumer);

        callback({
          id: consumer.id,
          producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
        });
      });

      socket.on('resumeConsumer', async ({ consumerId }) => {
        const consumer = room.peers.get(socket.id).consumers.find(c => c.id === consumerId);
        if (consumer) await consumer.resume();
      });

      socket.on('disconnect', () => {
        const peer = room.peers.get(socket.id);
        if (!peer) return;
        peer.transports.forEach(t => t.close());
        peer.producers.forEach(p => p.close());
        peer.consumers.forEach(c => c.close());
        room.peers.delete(socket.id);
        if (room.peers.size === 0) rooms.delete(roomId);
      });
    });
  });

  server.listen(3001, () => console.log('Server running on port 3001'));
});
