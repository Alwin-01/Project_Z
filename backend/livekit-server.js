import { RoomServiceClient } from 'livekit-server-sdk';

// This is a simple LiveKit server setup for development
// In production, you would run LiveKit as a separate service

const livekitHost = process.env.LIVEKIT_HOST || 'http://localhost:7880';
const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
const apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';

console.log('LiveKit Configuration:');
console.log('Host:', livekitHost);
console.log('API Key:', apiKey);
console.log('Note: LiveKit server needs to be running separately');
console.log('To start LiveKit server, run:');
console.log('docker run -p 7880:7880 -p 7881:7881 -p 7882:7882/udp livekit/livekit-server:latest --dev');

export { livekitHost, apiKey, apiSecret };
