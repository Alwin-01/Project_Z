import { createToken, LIVEKIT_CONFIG } from '../config/livekit.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory room storage for testing without MongoDB
let rooms = [];

export const createRoom = async (req, res) => {
  try {
    const { name, description, isPrivate, maxParticipants } = req.body;
    
    const room = {
      _id: uuidv4(),
      name: name || `room-${uuidv4()}`,
      description: description || '',
      isPrivate: isPrivate || false,
      maxParticipants: maxParticipants || 50,
      createdBy: req.user?.id || 'anonymous',
      participants: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    rooms.push(room);
    
    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { participantName, isHost } = req.body;

    const room = rooms.find(r => r._id === roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    if (!room.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Room is not active',
      });
    }

    if (room.participants.length >= room.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Room is full',
      });
    }

    const token = createToken(room.name, participantName, isHost);

    const participant = {
      id: uuidv4(),
      name: participantName,
      joinedAt: new Date(),
      isHost: isHost || false,
    };

    room.participants.push(participant);
    room.updatedAt = new Date();

    res.status(200).json({
      success: true,
      data: {
        token,
        room,
        participant,
        liveKitUrl: LIVEKIT_CONFIG.host,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { participantId } = req.body;

    const room = rooms.find(r => r._id === roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    room.participants = room.participants.filter(
      participant => participant.id !== participantId
    );

    if (room.participants.length === 0) {
      room.isActive = false;
    }

    room.updatedAt = new Date();

    res.status(200).json({
      success: true,
      message: 'Left room successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRooms = async (req, res) => {
  try {
    const activeRooms = rooms.filter(room => room.isActive && !room.isPrivate)
      .sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      data: activeRooms,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = rooms.find(r => r._id === roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
