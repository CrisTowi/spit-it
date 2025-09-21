# Spit It 💭

A beautiful React app for capturing your daily thoughts, ideas, and experiences. "Spit It" allows you to quickly jot down what's on your mind with categories, mood tracking, location data, file attachments, and AI-powered daily summaries.

## Features

- ✨ **Elegant Monochrome UI**: Clean, sophisticated design with smooth animations
- 😊 **Simple Mood Tracking**: Express how you're feeling with 4 intuitive mood options
- 📍 **Location Tracking**: Automatically capture your location for each spit
- 📎 **File Attachments**: Add images, videos, and documents to your spits
- 🗺️ **Daily Map View**: See your spits plotted on a map within daily summaries
- 🤖 **AI Daily Summaries**: Get intelligent insights and recommendations about your day
- 📊 **Character Limit**: 180-character limit to keep your thoughts concise
- 💾 **Local Storage**: Your spits are automatically saved to your browser
- ✏️ **Edit & Delete**: Modify or remove your spits anytime
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- ⏰ **Smart Timestamps**: See when you created each spit with relative time display

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd SpitIt
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and visit `http://localhost:3000`

## Usage

### Creating Spits
1. **Write Your Thought**: Use the form to write your thoughts (max 180 characters)
2. **Set Your Mood**: Choose from 4 mood options: Happy, Neutral, Contemplative, or Inspired
3. **Add Attachments**: Upload images, videos, or documents to add context
4. **Location**: Your location is automatically captured (if permission granted)
5. **Save**: Click "Spit It Out!" to save your entry

### Navigation
- **Feed**: View all your spits in chronological order
- **Summary**: Generate AI-powered daily summaries with insights, recommendations, and a map of your day

### Managing Spits
- **Edit**: Click the edit button to modify your spits
- **Delete**: Remove spits you no longer need
- **Preview**: View attached files by clicking the preview button

## Mood Options

- 😊 **Happy**: Feeling positive and cheerful
- 😐 **Neutral**: Balanced and calm
- 🤔 **Contemplative**: Thoughtful and reflective
- ✨ **Inspired**: Creative and motivated

## Data Storage

Your spits are automatically saved to your browser's local storage, so they'll persist between sessions. No data is sent to external servers - everything stays on your device.

## Building for Production

To create a production build:

```bash
npm run build
```

This will create an optimized build in the `build` folder that you can deploy to any static hosting service.

## Technologies Used

- React 18
- React Leaflet for interactive maps
- Lucide React for icons
- Date-fns for date manipulation
- CSS3 with modern features (Grid, Flexbox, Gradients)
- Local Storage API
- Geolocation API
- File API for attachments
- Responsive Design Principles

## Contributing

Feel free to fork this project and submit pull requests for any improvements!

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Happy Spitting! 💭✨**
