import React, { useState, useEffect, useRef } from 'react';
import { Room, RoomEvent, VideoPresets } from 'livekit-client';
import { VideoGrid } from './VideoGrid';
import { ControlPanel } from './ControlPanel';
import { ChatSidebar } from './ChatSidebar';
import { ParticipantList } from './ParticipantList';
import { useSocket } from '../hooks/useSocket';

export const VideoConference = ({ roomName, token, participantName, onLeave }) => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const videoContainerRef = useRef(null);
  const streamRef = useRef(null);
  const videoRef = useRef(null);
  const peerConnections = useRef(new Map());
  
  const { socket, isConnected } = useSocket();

  const createWebRTCConnection = async (participantId) => {
    const pc = createPeerConnection(participantId);
    peerConnections.current.set(participantId, pc);
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    socket.emit('offer', {
      to: participantId,
      offer: offer
    });
  };

  const createPeerConnection = (participantId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: participantId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote stream from:', participantId);
      setRemoteStreams(prev => new Map(prev).set(participantId, event.streams[0]));
    };

    // Add local stream if available
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, streamRef.current);
      });
    }

    return pc;
  };

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        // Request camera access
        let stream = null;
        try {
          // Try to get devices first to see what's available
          const devices = await navigator.mediaDevices.enumerateDevices();
          console.log('Available devices:', devices);
          
          // Filter for video devices specifically
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          console.log('Video devices found:', videoDevices);
          
          if (videoDevices.length === 0) {
            console.log('No video devices found - trying audio only');
            throw new Error('No camera devices available');
          }
          
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
          streamRef.current = stream;
        } catch (error) {
          console.log('Camera access denied or not available:', error);
          // Try with just audio if video fails
          try {
            stream = await navigator.mediaDevices.getUserMedia({ 
              video: false, 
              audio: true 
            });
            streamRef.current = stream;
          } catch (audioError) {
            console.log('Audio access also denied:', audioError);
          }
        }

        // Create mock room for testing without LiveKit
        const mockRoom = {
          name: roomName,
          localParticipant: {
            identity: participantName,
            sid: `local-participant-${Date.now()}`,
            tracks: []
          },
          participants: [],
          on: (event, callback) => {
            console.log(`Mock room event: ${event}`);
            // Store event handlers for mock implementation
            if (!mockRoom.eventHandlers) mockRoom.eventHandlers = {};
            mockRoom.eventHandlers[event] = callback;
          },
          connect: async () => {
            console.log('Mock room connected');
            // Simulate participant connected event
            setTimeout(() => {
              if (mockRoom.eventHandlers?.RoomEvent?.ParticipantConnected) {
                mockRoom.eventHandlers.RoomEvent.ParticipantConnected(mockRoom.localParticipant);
              }
            }, 100);
          },
          disconnect: async () => {
            console.log('Mock room disconnected');
          }
        };

        // Connect to mock room
        await mockRoom.connect();
        
        // Set room and participants (exclude local participant from participants array)
        setRoom(mockRoom);
        setParticipants([]); // Start with empty participants array

        // Join the socket room to receive events
        if (socket) {
          socket.emit('join-meeting', {
            meetingId: roomName,
            userId: participantName
          });
        }

        // Attach local video stream if available
        if (streamRef.current && videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          console.log('Video stream attached:', streamRef.current);
          
          // Notify other participants about video stream
          if (socket) {
            socket.emit('video-stream', {
              roomName,
              participantName,
              hasVideo: true,
              timestamp: new Date()
            });
          }
        }

      } catch (error) {
        console.error('Error connecting to room:', error);
      }
    };

    // Handle incoming chat messages via Socket.io
    if (socket) {
      socket.on('chat-message', (data) => {
        if (data.roomName === roomName) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: data.sender,
            message: data.message,
            timestamp: new Date(data.timestamp)
          }]);
        }
      });

      // Handle participant join events
      socket.on('participant-joined', (data) => {
        console.log('Participant joined:', data);
        if (data.roomName === roomName || data.meetingId === roomName) {
          setParticipants(prev => {
            // Avoid duplicates
            const exists = prev.find(p => p.sid === data.participant.sid);
            if (!exists) {
              // Create WebRTC connection to new participant
              createWebRTCConnection(data.participant.sid);
              return [...prev, data.participant];
            }
            return prev;
          });
        }
      });

      // Handle participant leave events
      socket.on('participant-left', (data) => {
        console.log('Participant left:', data);
        if (data.roomName === roomName || data.meetingId === roomName) {
          setParticipants(prev => prev.filter(p => p.sid !== data.participant.sid));
          // Clean up WebRTC connection
          const pc = peerConnections.current.get(data.participant.sid);
          if (pc) {
            pc.close();
            peerConnections.current.delete(data.participant.sid);
          }
          // Remove remote stream
          setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.delete(data.participant.sid);
            return newStreams;
          });
        }
      });

      // Handle video stream from other participants
      socket.on('video-stream', (data) => {
        console.log('Received video stream from:', data.participantName);
        // In a real implementation, you'd handle WebRTC peer connections here
        // For now, we'll just log it
      });

      // Handle WebRTC signaling
      socket.on('offer', async (data) => {
        const { from, offer } = data;
        console.log('Received offer from:', from);
        
        if (!peerConnections.current.has(from)) {
          const pc = createPeerConnection(from);
          peerConnections.current.set(from, pc);
        }
        
        const pc = peerConnections.current.get(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit('answer', { to: from, answer });
      });

      socket.on('answer', async (data) => {
        const { from, answer } = data;
        console.log('Received answer from:', from);
        
        const pc = peerConnections.current.get(from);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket.on('ice-candidate', async (data) => {
        const { from, candidate } = data;
        console.log('Received ICE candidate from:', from);
        
        const pc = peerConnections.current.get(from);
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });
    }

    if (token && roomName) {
      initializeRoom();
    }

    return () => {
      if (socket) {
        socket.off('chat-message');
        socket.off('participant-joined');
        socket.off('participant-left');
        socket.off('video-stream');
      }
      if (room) {
        room.disconnect();
      }
      // Clean up video stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [token, roomName, participantName, socket]);

  const toggleMute = async () => {
    if (room) {
      try {
        // For mock room, just toggle the state and handle actual mic
        setIsMuted(!isMuted);
        
        // Get current audio stream and toggle mute
        if (streamRef.current) {
          const audioTracks = streamRef.current.getAudioTracks();
          audioTracks.forEach(track => {
            track.enabled = !isMuted;
          });
        }
        
        console.log('Microphone toggled:', !isMuted);
      } catch (error) {
        console.error('Error toggling microphone:', error);
      }
    }
  };

  const toggleCamera = async () => {
    if (room) {
      try {
        setIsCameraOff(!isCameraOff);
        
        // Get current video stream and toggle
        if (streamRef.current) {
          const videoTracks = streamRef.current.getVideoTracks();
          videoTracks.forEach(track => {
            track.enabled = !isCameraOff;
          });
          
          // Also toggle video element visibility
          const videoElement = videoRef.current;
          if (videoElement) {
            videoElement.style.display = !isCameraOff ? 'block' : 'none';
          }
          
          // Notify other participants about camera toggle
          if (socket) {
            socket.emit('camera-toggle', {
              roomName,
              participantName,
              isCameraOff: !isCameraOff,
              timestamp: new Date()
            });
          }
        }
        
        console.log('Camera toggled:', !isCameraOff);
      } catch (error) {
        console.error('Error toggling camera:', error);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (room) {
      try {
        // For mock room, just toggle the state
        setIsScreenSharing(!isScreenSharing);
        console.log('Screen share toggled:', !isScreenSharing);
      } catch (error) {
        console.error('Error toggling screen share:', error);
      }
    }
  };

  const sendMessage = (message) => {
    if (socket && message.trim()) {
      socket.emit('chat-message', {
        roomName,
        message,
        sender: participantName,
        timestamp: new Date()
      });
    }
  };

  const handleLeave = () => {
    if (room) {
      room.disconnect();
    }
    onLeave();
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Video Container */}
        <div 
          ref={videoContainerRef}
          className="flex-1 relative overflow-hidden bg-black"
        >
          {/* Video Grid for all participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-full">
            {/* Local Video */}
            {streamRef.current && (
              <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                  {participantName} (You)
                </div>
              </div>
            )}
            
            {/* Remote Videos */}
            {Array.from(remoteStreams.entries()).map(([participantId, stream]) => {
              const participant = participants.find(p => p.sid === participantId);
              return (
                <div key={participantId} className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                    ref={(el) => {
                      if (el && stream) {
                        el.srcObject = stream;
                      }
                    }}
                  />
                  <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    {participant?.identity || 'Unknown User'}
                  </div>
                </div>
              );
            })}
            
            {/* Empty slots for participants without video */}
            {participants
              .filter(p => p.sid !== room?.localParticipant?.sid)
              .filter(p => !remoteStreams.has(p.sid))
              .map(participant => (
                <div key={participant.sid} className="bg-gray-800 rounded-lg flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">
                        {participant.identity.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm">{participant.identity}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Control Panel */}
        <ControlPanel
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={toggleScreenShare}
          onLeave={handleLeave}
          onToggleChat={() => setShowChat(!showChat)}
          onToggleParticipants={() => setShowParticipants(!showParticipants)}
        />
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <ChatSidebar
          messages={messages}
          onSendMessage={sendMessage}
          onClose={() => setShowChat(false)}
          participantName={participantName}
        />
      )}

      {/* Participants Sidebar */}
      {showParticipants && (
        <ParticipantList
          participants={participants}
          localParticipant={room?.localParticipant}
          onClose={() => setShowParticipants(false)}
        />
      )}
    </div>
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all peer connections
      peerConnections.current.forEach((pc, participantId) => {
        pc.close();
      });
      peerConnections.current.clear();
      
      // Leave socket room
      if (socket) {
        socket.emit('leave-meeting', {
          meetingId: roomName,
          userId: participantName
        });
      }
      
      // Stop local stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [socket, roomName, participantName]);
};
