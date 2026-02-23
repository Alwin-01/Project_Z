import { AccessToken } from 'livekit-server-sdk';

const generateToken = async (roomName, participantName) => {
  // 1. Initialize the AccessToken with your Credentials
  // These should be stored in your .env file
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY, 
    process.env.LIVEKIT_API_SECRET, 
    { identity: participantName }
  );

  // 2. Set Permissions (Grants)
  at.addGrant({ 
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true 
  });

  // 3. Return the JWT string
  return await at.toJwt();
};