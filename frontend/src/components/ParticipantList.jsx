import React from 'react';
import { FaTimes, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaCrown } from 'react-icons/fa';

export const ParticipantList = ({ participants, localParticipant, onClose }) => {
  const getParticipantStatus = (participant) => {
    const isMuted = !participant.isMicrophoneEnabled;
    const isCameraOff = !participant.isCameraEnabled;
    const isScreenSharing = participant.isScreenShareEnabled;

    return { isMuted, isCameraOff, isScreenSharing };
  };

  const allParticipants = localParticipant 
    ? [localParticipant, ...participants]
    : participants;

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold">
          Participants ({allParticipants.length})
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {allParticipants.map((participant, index) => {
          const { isMuted, isCameraOff, isScreenSharing } = getParticipantStatus(participant);
          const isLocal = participant === localParticipant;
          const isHost = participant.permissions?.has('roomAdmin');

          // Create unique key for each participant
          const participantKey = isLocal 
            ? `local-participant-${index}` 
            : `remote-participant-${participant.sid || participant.identity || index}`;

          return (
            <div
              key={participantKey}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {participant.identity.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Name and Status */}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium text-sm">
                      {participant.name || participant.identity}
                    </span>
                    {isLocal && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        You
                      </span>
                    )}
                    {isHost && (
                      <FaCrown size={14} className="text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {/* Microphone Status */}
                    <div className="flex items-center space-x-1">
                      {isMuted ? (
                        <FaMicrophoneSlash size={12} className="text-red-500" />
                      ) : (
                        <FaMicrophone size={12} className="text-green-500" />
                      )}
                    </div>

                    {/* Camera Status */}
                    <div className="flex items-center space-x-1">
                      {isCameraOff ? (
                        <FaVideoSlash size={12} className="text-red-500" />
                      ) : (
                        <FaVideo size={12} className="text-green-500" />
                      )}
                    </div>

                    {/* Screen Share Status */}
                    {isScreenSharing && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        Sharing
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
