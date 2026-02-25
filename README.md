# Project Z - Video Conferencing Web App

A modern, feature-rich video conferencing application built with React, Node.js, and LiveKit.

## Features

### Core Functionality
- **HD Video & Audio**: High-quality video streaming with adaptive bitrate
- **Screen Sharing**: Share your screen with participants
- **Real-time Chat**: Built-in messaging during meetings
- **Participant Management**: View and manage meeting participants
- **Room Management**: Create and join meeting rooms
- **Responsive Design**: Works on desktop and mobile devices

### Technical Features
- **WebRTC**: Low-latency peer-to-peer communication
- **LiveKit Integration**: Professional-grade video infrastructure
- **Socket.io**: Real-time bidirectional communication
- **MongoDB**: Persistent data storage
- **Docker Support**: Easy deployment with containers
- **Authentication**: Secure user management

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- LiveKit Client
- Socket.io Client
- Lucide React Icons
- Axios

### Backend
- Node.js
- Express
- LiveKit Server
- Socket.io
- MongoDB with Mongoose
- JWT Authentication
- bcrypt

### DevOps
- Docker & Docker Compose
- Nginx Reverse Proxy
- Redis (for LiveKit)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Redis (optional, for LiveKit)

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Project_Z
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

4. **LiveKit Server** (Optional - for development)
```bash
# Install LiveKit CLI
go install github.com/livekit/livekit-cli/cmd/livekit-cli@latest

# Start LiveKit server
livekit-server --keys devkey:secret --redis localhost:6379
```

### Docker Setup (Recommended)

1. **Using Docker Compose**
```bash
docker-compose up -d
```

This will start:
- MongoDB (port 27017)
- Redis (port 6379)
- Backend API (port 8000)
- LiveKit Server (port 7880)
- Frontend (port 3000)
- Nginx Reverse Proxy (port 80)

## Environment Variables

### Backend (.env)
```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/project_z
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_HOST=http://localhost:7880
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SERVER_URL=http://localhost:8000
REACT_APP_LIVEKIT_URL=ws://localhost:7880
NODE_ENV=development
```

## API Endpoints

### Rooms
- `GET /api/rooms` - Get all active rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:roomId` - Get room details
- `POST /api/rooms/:roomId/join` - Join a room
- `POST /api/rooms/:roomId/leave` - Leave a room

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

## Usage

1. **Create a Room**
   - Click "Create Room" in the lobby
   - Enter room details and settings
   - Click "Create" to start the meeting

2. **Join a Room**
   - Browse available rooms in the lobby
   - Click on any room to join
   - Enter your name when prompted

3. **During a Meeting**
   - Use the control panel to manage audio/video
   - Share your screen with participants
   - Chat with other participants
   - View participant list and their status

4. **Leave Meeting**
   - Click the red "Leave" button in the control panel
   - You'll return to the room lobby

## Production Deployment

### Using Docker Compose
```bash
# Production environment
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Set up MongoDB and Redis
2. Configure environment variables
3. Build and deploy backend
4. Build and deploy frontend
5. Set up reverse proxy (Nginx)
6. Configure SSL certificates

## Security Considerations

- Use HTTPS in production
- Configure proper CORS settings
- Use strong JWT secrets
- Implement rate limiting
- Set up firewall rules
- Regular security updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## Roadmap

- [ ] Recording capabilities
- [ ] Breakout rooms
- [ ] Virtual backgrounds
- [ ] Advanced moderation tools
- [ ] Mobile apps
- [ ] Integration with calendar systems
- [ ] Advanced analytics and reporting
