import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ port: 7880 });

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';

// Store active participants
const participants = new Map();

// Mock LiveKit WebSocket server
wss.on('connection', (ws, request) => {
  console.log('Mock LiveKit WebSocket connection established');
  let participantId = null;
  
  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      // LiveKit sends binary data, not JSON
      console.log('Received message type:', typeof data, 'length:', data.length);
      
      // Simulate successful connection by sending mock responses
      if (!participantId) {
        participantId = `mock-participant-${Date.now()}`;
        const participant = {
          identity: 'mock-user',
          sid: participantId,
          state: 'connected',
          tracks: []
        };
        
        participants.set(participantId, participant);
        
        // Send mock connection success
        setTimeout(() => {
          console.log('Sending mock participant data');
          // This simulates LiveKit's participant connection event
          if (ws.readyState === ws.OPEN) {
            ws.send(Buffer.from('mock-connection-success'));
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('Mock LiveKit WebSocket connection closed');
    if (participantId) {
      participants.delete(participantId);
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Mock HTTP endpoints for LiveKit
app.use(express.json());

app.post('/rtc/v1/validate', (req, res) => {
  try {
    const { access_token } = req.query;
    
    if (!access_token) {
      return res.status(400).json({ error: 'No access token provided' });
    }
    
    // Mock validation - in real LiveKit, this would validate JWT
    res.json({
      success: true,
      room: 'mock-room',
      participant: {
        identity: 'mock-user',
        sid: 'mock-participant-id'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

app.listen(7880, () => {
  console.log('Mock LiveKit server running on port 7880');
  console.log('This is a development mock - replace with real LiveKit server for production');
});

export default server;
