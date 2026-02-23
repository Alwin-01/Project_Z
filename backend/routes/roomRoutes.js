import express from 'express';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  getRooms,
  getRoomById,
} from '../controllers/roomController.js';

const router = express.Router();

router.post('/', createRoom);
router.get('/', getRooms);
router.get('/:roomId', getRoomById);
router.post('/:roomId/join', joinRoom);
router.post('/:roomId/leave', leaveRoom);

export default router;
