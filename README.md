# Smart Home Energy Monitor

An AI-powered smart home energy monitoring application built with React, TypeScript, and a Node.js/MongoDB backend. This application simulates IoT device monitoring, provides real-time energy consumption visualization, and offers AI-generated recommendations for optimizing energy usage using Groq AI.

![Project Preview](screencapture-smart-home-energy-monitor.png)


## 🚀 Features

- **🤖 Groq-Powered AI Assistant**: Ask questions about your energy usage and get instant, personalized answers powered by Llama 3.3.
- **📊 Real-time Energy Monitoring**: Track energy consumption across multiple smart devices with live updates.
- **📈 Interactive Dashboard**: Beautiful charts and graphs showing consumption patterns and device breakdowns.
- **💡 AI recommendations**: Get personalized energy-saving tips and estimated cost savings.
- **🔌 Device Control & Scheduling**: Toggle devices on/off and set automated schedules for energy optimization.
- **🎯 Energy Goals**: Set and track daily/weekly/monthly energy consumption targets.
- **🏆 Achievements System**: Unlock badges for hitting energy-saving milestones.
- **🌤️ Weather-Aware Monitoring**: Integration with local weather to understand its impact on energy usage.
- **🌓 Dark Mode**: Seamlessly switch between light and dark themes.
- **📥 Data Export**: Download your energy consumption history as CSV for external analysis.

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Chart.js / Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web server framework
- **MongoDB** - Database for persistence
- **Mongoose** - ODM for MongoDB
- **Groq SDK** - AI integration (Llama 3.3)

## 📁 Project Structure

```
smart-home-energy-monitor/
├── server/                 # Express backend
│   ├── routes/            # API endpoints (AI, Energy, Devices, etc.)
│   └── index.ts           # Server entry point
├── src/                    # React frontend
│   ├── components/        # UI components
│   ├── services/          # API client services
│   ├── aiService.ts       # AI logic
│   └── App.tsx            # Main application
├── .env                    # Environment variables
├── package.json           # Scripts and dependencies
└── vite.config.ts         # Vite configuration
```

## 🏁 Getting Started

### Prerequisites

- **Node.js**: Version 20+
- **MongoDB**: A running instance (local or Atlas)
- **Groq API Key**: Get one at [console.groq.com](https://console.groq.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd smart-home-energy-monitor
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   # Backend
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/energy-monitor
   GROQ_API_KEY=your_groq_api_key_here

   # Frontend (Optional customization)
   VITE_API_URL=http://localhost:3001/api
   ```

### Running the Application

You can run both the frontend and backend simultaneously using a single command:

```bash
npm run dev:all
```

Alternatively, you can run them separately:

- **Start Backend**: `npm run server`
- **Start Frontend**: `npm run dev`

The application will be available at `http://localhost:5173`.

## 🤖 AI Integration

This project uses the **Groq SDK** with the **Llama 3.3 70B Versatile** model to provide:
- Real-time analysis of device consumption patterns.
- Context-aware answers to user queries in the chatbot.
- Actionable recommendations for reducing energy waste.

The chatbot maintains historical context to provide more relevant advice over time.

## 📈 IoT Simulation

The dashboard features a realistic simulation of home energy usage, including:
- **Baseline Loads**: Appliances like refrigerators that remain on 24/7.
- **HVAC Simulation**: Heating and cooling patterns based on (simulated) weather data.
- **Time-of-Use (TOU)**: Visualization of peak vs. off-peak pricing impact.

## 📄 License

This project is licensed under the MIT License.
