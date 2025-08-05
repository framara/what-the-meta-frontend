# What the Meta? - WoW Mythic+ Leaderboard & Meta Analysis

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Website](https://img.shields.io/badge/Website-whatthemeta.io-blue.svg)](https://whatthemeta.io)

A comprehensive World of Warcraft Mythic+ leaderboard and meta analysis tool that provides real-time data, group composition analysis, and meta evolution tracking.

## 🌟 Features

- **Real-time Leaderboards**: Track top Mythic+ runs across all dungeons and seasons
- **Group Composition Analysis**: Analyze successful team compositions and class combinations
- **Meta Evolution Tracking**: Watch how the meta changes over time with detailed charts
- **AI Predictions**: Get AI-powered insights about upcoming meta shifts
- **Race Bars**: Visual representation of spec popularity and performance trends
- **Meta Health**: Comprehensive analysis of current meta balance

## 🚀 Live Demo

Visit [whatthemeta.io](https://whatthemeta.io) to see the application in action.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: Vercel
- **Analytics**: Google Analytics
- **Data Source**: Blizzard API

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/framara/wow-leaderboard-frontend.git
   cd wow-leaderboard-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Add your Google Analytics ID to `.env.local`:
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── AboutPage.tsx   # About page
│   ├── Footer.tsx      # Site footer
│   ├── Navigation.tsx  # Main navigation
│   └── ...             # Other components
├── services/           # API services
├── constants/          # App constants
├── utils/              # Utility functions
└── App.tsx            # Main app component
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📊 Data Sources

All data is sourced from the official World of Warcraft API. We do not claim ownership of game data and acknowledge that it belongs to Blizzard Entertainment.

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Important Notice

- **Code Ownership**: All code in this repository is owned by What the Meta? and is protected by copyright law.
- **Game Data**: World of Warcraft data belongs to Blizzard Entertainment. We only display publicly available information.
- **Commercial Use**: This code is provided for educational and personal use. Commercial use requires explicit permission.
- **Attribution**: If you use this code, you must include proper attribution to What the Meta?.

## 🆘 Support

- **Website**: [whatthemeta.io](https://whatthemeta.io)
- **Email**: contact@whatthemeta.io
- **GitHub Issues**: [Report bugs or request features](https://github.com/framara/wow-leaderboard-frontend/issues)

## �� Acknowledgments

- Blizzard Entertainment for providing the WoW API
- The WoW Mythic+ community for inspiration and feedback
- Open source contributors who have helped improve this project

---

**Made with ❤️ for the WoW community**

*Not affiliated with Blizzard Entertainment*
