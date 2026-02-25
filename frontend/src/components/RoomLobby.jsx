import React, { useState, useEffect } from 'react';
import { FaVideo, FaUsers, FaClock, FaLock, FaGlobe } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const RoomLobby = ({ onJoinRoom }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    isPrivate: false,
    maxParticipants: 50,
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/rooms`);
      setRooms(response.data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      // Create the room first
      const createResponse = await axios.post(`${API_URL}/api/rooms`, newRoom);
      const room = createResponse.data.data;
      
      // Then join the room to get a token
      const joinResponse = await axios.post(`${API_URL}/api/rooms/${room._id}/join`, {
        participantName: user?.username || 'Anonymous',
        isHost: true
      });
      
      const roomData = joinResponse.data.data;
      onJoinRoom({
        roomName: room.name,
        token: roomData.token,
        roomId: room._id,
        participant: roomData.participant
      });
      
      setShowCreateForm(false);
      setNewRoom({
        name: '',
        description: '',
        isPrivate: false,
        maxParticipants: 50,
      });
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    }
  };

  const handleJoinExistingRoom = async (room) => {
    try {
      // Join the room to get a token
      const response = await axios.post(`${API_URL}/api/rooms/${room._id}/join`, {
        participantName: user?.username || 'Anonymous',
        isHost: false
      });
      
      const roomData = response.data.data;
      onJoinRoom({
        roomName: room.name,
        token: roomData.token,
        roomId: room._id,
        participant: roomData.participant
      });
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Video Conference Rooms</h1>
              <p className="text-gray-400 mt-2">Join or create a meeting room</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Room</h2>
            <form onSubmit={handleCreateRoom}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Room Name</label>
                  <input
                    type="text"
                    required
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Participants</label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={newRoom.maxParticipants}
                    onChange={(e) => setNewRoom({ ...newRoom, maxParticipants: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="private"
                    checked={newRoom.isPrivate}
                    onChange={(e) => setNewRoom({ ...newRoom, isPrivate: e.target.checked })}
                    className="bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="private" className="text-sm">Private room</label>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rooms List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <FaVideo size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No active rooms</h3>
            <p className="text-gray-400">Create a new room to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => handleJoinExistingRoom(room)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FaVideo size={20} className="text-blue-500" />
                    <h3 className="font-semibold text-lg">{room.name}</h3>
                  </div>
                  {room.isPrivate ? (
                    <FaLock size={16} className="text-gray-400" />
                  ) : (
                    <FaGlobe size={16} className="text-green-500" />
                  )}
                </div>
                
                {room.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {room.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <FaUsers size={14} />
                      <span>{room.participants.length}/{room.maxParticipants}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaClock size={14} />
                      <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="text-green-500 text-xs">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
