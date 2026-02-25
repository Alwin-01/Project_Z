import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  maxParticipants: {
    type: Number,
    default: 50,
  },
  createdBy: {
    type: String,
    required: true,
  },
  participants: [{
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    isHost: {
      type: Boolean,
      default: false,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  recordingEnabled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

roomSchema.index({ name: 1 });
roomSchema.index({ isActive: 1 });
roomSchema.index({ isPrivate: 1 });

export default mongoose.model('Room', roomSchema);
