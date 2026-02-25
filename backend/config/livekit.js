import { AccessToken } from 'livekit-server-sdk';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'devkey';
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'secret';
const LIVEKIT_HOST = process.env.LIVEKIT_HOST || 'http://localhost:7880';

export const createToken = (roomName, participantName, isHost = false) => {
  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantName,
    name: participantName,
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canPublishSources: isHost,
    roomAdmin: isHost,
    roomRecord: isHost,
  });

  return token.toJwt();
};

export const LIVEKIT_CONFIG = {
  apiKey: LIVEKIT_API_KEY,
  apiSecret: LIVEKIT_API_SECRET,
  host: LIVEKIT_HOST,
};
