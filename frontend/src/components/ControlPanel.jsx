import React from 'react';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash, 
  FaDesktop, 
  FaStop, 
  FaCommentDots, 
  FaUsers, 
  FaPhoneSlash 
} from 'react-icons/fa';

export const ControlPanel = ({
  isMuted,
  isCameraOff,
  isScreenSharing,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onLeave,
  onToggleChat,
  onToggleParticipants
}) => {
  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
      <div className="flex items-center justify-center space-x-4">
        {/* Microphone Button */}
        <button
          onClick={onToggleMute}
          className={`p-3 rounded-full transition-all ${
            isMuted 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
        </button>

        {/* Camera Button */}
        <button
          onClick={onToggleCamera}
          className={`p-3 rounded-full transition-all ${
            isCameraOff 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isCameraOff ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
        </button>

        {/* Screen Share Button */}
        <button
          onClick={onToggleScreenShare}
          className={`p-3 rounded-full transition-all ${
            isScreenSharing 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
        >
          {isScreenSharing ? <FaStop size={20} /> : <FaDesktop size={20} />}
        </button>

        {/* Chat Button */}
        <button
          onClick={onToggleChat}
          className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-all"
          title="Toggle chat"
        >
          <FaCommentDots size={20} />
        </button>

        {/* Participants Button */}
        <button
          onClick={onToggleParticipants}
          className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-all"
          title="Toggle participants"
        >
          <FaUsers size={20} />
        </button>

        {/* Leave Meeting Button */}
        <button
          onClick={onLeave}
          className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all ml-8"
          title="Leave meeting"
        >
          <FaPhoneSlash size={20} />
        </button>
      </div>
    </div>
  );
};
