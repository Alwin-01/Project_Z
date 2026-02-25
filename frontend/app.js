import { Room, RoomEvent, VideoPresets } from 'livekit-client';

const joinMeeting = async (url, token) => {
  // 1. Initialize the Room object
  const room = new Room({
    adaptiveStream: true, // Automatically manages video quality
    publishDefaults: {
        videoSimulcast: true,
        videoCodec: 'vp8',
    },
  });

  // 2. Setup Event Listeners (like when others join)
  room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
    // Attach the video/audio track to the DOM
    const element = track.attach();
    document.getElementById('video-container').appendChild(element);
  });

  // 3. Connect to the server
  await room.connect(url, token);
  console.log('Successfully connected to room:', room.name);

  // 4. Publish local camera and mic
  await room.localParticipant.setCameraEnabled(true);
  await room.localParticipant.setMicrophoneEnabled(true);
};