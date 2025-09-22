# Spit It 💭

A full-stack React application for capturing your daily thoughts, ideas, and experiences. Built with React frontend and Express.js backend with MongoDB.

## 🏗️ Project Structure

```
SpitIt/
├── client/          # React frontend application
├── server/          # Express.js backend API
├── package.json     # Root package.json for scripts
└── README.md        # This file
```

## ✨ Features

### Frontend (React)
- ✨ **Elegant Monochrome UI**: Clean, sophisticated design with smooth animations
- 😊 **Mood Tracking**: Express how you're feeling with 4 intuitive mood options
- 📍 **Location Tracking**: Automatically capture your location or manually select
- 📎 **File Attachments**: Add images, videos, and documents to your spits
- 🗺️ **Interactive Map**: Search and select locations with debounced autocomplete
- 🤖 **Daily Summaries**: Get insights and statistics about your day
- 📊 **Character Limit**: 180-character limit to keep your thoughts concise
- 💾 **Hybrid Storage**: API-first with localStorage fallback
- ✏️ **Edit & Delete**: Modify or remove your spits anytime
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### Backend (Express.js + MongoDB)
- 🚀 **RESTful API**: Complete CRUD operations for spits
- 🗄️ **MongoDB Integration**: Persistent data storage with Mongoose
- 🔒 **Security**: Rate limiting, CORS, and Helmet middleware
- 📊 **Statistics**: Built-in analytics and reporting endpoints
- 🔄 **Real-time Updates**: Efficient data synchronization
- 🛡️ **Error Handling**: Comprehensive error management

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SpitIt
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Setup environment variables**
   
   **Server Configuration:**
   ```bash
   cd server
   cp env.example .env
   ```
   
   Edit `server/.env` with your MongoDB credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/spitit
   CLIENT_URL=http://localhost:3000
   ```

   **Client Configuration (optional):**
   ```bash
   cd client
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the client (port 3000) and server (port 5000) concurrently.

### Alternative: Manual Setup

**Start the server:**
```bash
cd server
npm run dev
```

**Start the client (in a new terminal):**
```bash
cd client
npm start
```

## 📡 API Endpoints

### Spits
- `GET /api/spits` - Get all spits (with pagination)
- `GET /api/spits/today` - Get today's spits
- `GET /api/spits/stats` - Get statistics
- `POST /api/spits` - Create a new spit
- `PUT /api/spits/:id` - Update a spit
- `DELETE /api/spits/:id` - Delete a spit

### Health Check
- `GET /api/health` - Server health status

## 🗄️ Data Models

### Spit
```javascript
{
  content: String,        // The spit content (max 180 chars)
  mood: String,          // User's mood (happy, neutral, frustrated, inspired)
  files: Array,          // Attached files with metadata
  location: {            // GPS coordinates
    lat: Number,
    lng: Number
  },
  timestamp: Date,       // Creation timestamp
  user: String           // User identifier (default: anonymous)
}
```

## 🛠️ Development

### Available Scripts

**Root level:**
- `npm run install:all` - Install dependencies for both client and server
- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build the client for production
- `npm start` - Start the server in production mode

**Client:**
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests

**Server:**
- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start in production mode

## 🌐 Deployment

### Client (React)
The client can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Server (Express.js)
The server can be deployed to:
- Heroku
- DigitalOcean
- AWS EC2
- Google Cloud Platform

### Database
- MongoDB Atlas (recommended for production)
- Self-hosted MongoDB
- Any MongoDB-compatible service

## 🔧 Configuration

### Environment Variables

**Server (.env):**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `CLIENT_URL` - Client URL for CORS
- `JWT_SECRET` - JWT secret (optional, for future auth)

**Client (.env):**
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

## 📱 Usage

### Creating Spits
1. **Write Your Thought**: Use the form to write your thoughts (max 180 characters)
2. **Set Your Mood**: Choose from 4 mood options: Happy, Neutral, Frustrated, or Inspired
3. **Add Attachments**: Upload images, videos, or documents to add context
4. **Location**: Choose to use current location or manually select a location
5. **Save**: Click "Spit It Out!" to save your entry

### Navigation
- **Feed**: View all your spits in chronological order
- **Summary**: See daily statistics, mood analysis, and location map

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React and Express.js communities
- MongoDB and Mongoose documentation
- OpenStreetMap for location services
- All the amazing open-source libraries used in this project
