# Spit It Server

Backend API for the Spit It application built with Express.js and MongoDB.

## Features

- RESTful API for spits CRUD operations
- MongoDB integration with Mongoose
- Rate limiting and security middleware
- CORS support for client integration
- Environment-based configuration

## API Endpoints

### Spits
- `GET /api/spits` - Get all spits (with pagination)
- `GET /api/spits/today` - Get today's spits
- `GET /api/spits/stats` - Get statistics
- `POST /api/spits` - Create a new spit
- `PUT /api/spits/:id` - Update a spit
- `DELETE /api/spits/:id` - Delete a spit

### Health Check
- `GET /api/health` - Server health status

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp env.example .env
   ```

3. Update `.env` with your MongoDB credentials and configuration

4. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `CLIENT_URL` - Client application URL for CORS
- `JWT_SECRET` - JWT secret for authentication (optional)

## Data Models

### Spit
- `content` (String, max 180 chars) - The spit content
- `mood` (String, enum) - User's mood (happy, neutral, frustrated, inspired)
- `files` (Array) - Attached files with metadata
- `location` (Object) - GPS coordinates (lat, lng)
- `timestamp` (Date) - Creation timestamp
- `user` (String) - User identifier (default: anonymous)
