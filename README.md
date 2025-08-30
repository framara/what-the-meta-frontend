# What the Meta? - WoW Mythic+ Leaderboard & Meta Analysis

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Website](https://img.shields.io/badge/Website-whatthemeta.io-blue.svg)](https://whatthemeta.io)

A comprehensive World of Warcraft Mythic+ leaderboard and meta analysis platform that provides real-time data, group composition analysis, meta evolution tracking, and AI-powered insights for the WoW Mythic+ community.

## 🌟 Features

### **Core Analytics**
- **Real-time Leaderboards**: Track top Mythic+ runs across all dungeons and seasons with progressive loading
- **Group Composition Analysis**: Deep analysis of successful team compositions, role distributions, and class synergies
- **Meta Evolution Tracking**: Watch how the meta changes over time with interactive charts (line, bar, area, heatmap, treemap)
- **Historical Composition**: Compare group compositions across all seasons with infinite scroll performance

### **AI-Powered Insights**
- **AI Predictions**: Get AI-powered insights about upcoming meta shifts and trends
- **AI Tier List**: S–D tier ranking of specializations based on usage and performance analysis
- **Meta Health**: Comprehensive analysis of current meta balance and diversity

### **Interactive Visualizations**
- **Race Bars**: Animated visual representation of spec popularity and performance trends over time
- **Season Landing Pages**: Dedicated pages for current season meta analysis
- **Cutoff Tracking**: Real-time Mythic+ score cutoffs and thresholds

### **Performance Optimizations**
- **Web Workers**: Background processing for heavy computations without blocking UI
- **Progressive Loading**: Smart pagination with loading indicators and infinite scroll
- **Lazy Loading**: Route-level code splitting for optimal initial load times
- **Caching**: Intelligent API response caching for improved performance

## 🚀 Live Demo

Visit [whatthemeta.io](https://whatthemeta.io) to see the application in action.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Build Tool**: Vite with custom optimization scripts
- **Deployment**: Render.com (Static Site)
- **Performance**: Web Workers with Comlink for background processing
- **Charts**: Recharts with custom Racing Bars for animations
- **Routing**: React Router DOM v7 with lazy loading
- **Styling**: Tailwind CSS with PostCSS
- **Analytics**: Google Analytics integration
- **Data Source**: Custom WoW API Backend

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or yarn
- Modern browser with ES2020+ support

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

6. **Build for production**
   ```bash
   npm run build
   ```
   The build includes automatic image optimization and creates optimized bundles.

## 📁 Project Structure

```
src/
├── components/                    # React components
│   ├── HomePage.tsx              # Main leaderboard with progressive loading
│   ├── MetaEvolutionPage/        # Meta evolution charts and analysis
│   ├── GroupCompositionPage/     # Group composition analysis with web workers
│   ├── CompAllSeasonsPage/       # Historical season comparison with infinite scroll
│   ├── AIPredictionsPage.tsx     # AI-powered meta predictions
│   ├── AITierListPage.tsx        # AI-generated tier lists
│   ├── RaceBarsPage.tsx          # Animated spec popularity racing bars
│   ├── MetaHealthPage.tsx        # Meta balance and diversity analysis
│   ├── CutoffPage.tsx            # Mythic+ score cutoffs and thresholds
│   ├── Season3LandingPage.tsx    # Current season dedicated page
│   ├── FilterContext.tsx         # Global filter state management
│   ├── FilterBar.tsx             # Advanced filtering interface
│   ├── LeaderboardTable.tsx      # Optimized table with lazy loading
│   ├── SummaryStats.tsx          # Statistical summaries
│   ├── Navigation.tsx            # Main navigation
│   ├── Footer.tsx                # Site footer
│   ├── LoadingScreen.tsx         # Loading states and skeletons
│   ├── ErrorBoundary.tsx         # Error handling
│   ├── SEO.tsx                   # SEO optimization component
│   └── ...                       # Other shared components
├── services/                     # API services and caching
│   ├── api.ts                    # Main API client with intelligent caching
│   └── ...                       # Other services
├── hooks/                        # Custom React hooks
│   ├── useSeasonLabel.ts         # Season labeling logic
│   └── ...                       # Other hooks
├── constants/                    # App constants
│   ├── spec-icons.ts             # WoW specialization icons
│   ├── wow-constants.ts          # WoW-specific constants
│   └── ...                       # Other constants
├── types/                        # TypeScript type definitions
├── utils/                        # Utility functions and helpers
├── charts/                       # Chart components and configurations
├── assets/                       # Static assets and images
└── App.tsx                       # Main app with routing and lazy loading
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (includes pre-build image optimization)
- `npm run prebuild` - Pre-build image optimization script
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm run optimize:images` - Manually run image optimization

## 🏗️ Architecture & Performance

### **Performance Optimizations**
- **Progressive Loading**: Smart pagination with loading indicators for faster initial paint
- **Infinite Scroll**: Implemented on CompAllSeasonsPage for smooth historical data browsing
- **Web Workers**: Background processing with Comlink for heavy computations (composition analysis)
- **Code Splitting**: Route-level lazy loading reduces initial bundle size
- **Caching Strategy**: Intelligent API response caching with TTL-based invalidation
- **Image Optimization**: Automated image compression and format optimization in build process

### **Web Workers Implementation**
- `composition-worker.js` - Handles heavy group composition analysis
- Progress tracking with real-time updates
- Non-blocking UI during intensive calculations
- Intelligent cancellation of stale requests

### **State Management**
- **FilterContext**: Global filter state with React Context
- **Local State**: Component-level state for UI interactions
- **API Caching**: Service-level caching for API responses
- **Error Boundaries**: Graceful error handling and recovery

## 📊 Data Sources

All data is sourced from the official World of Warcraft API through our custom backend. We do not claim ownership of game data and acknowledge that it belongs to Blizzard Entertainment.

## 🚀 Pages & Features

### **Main Application Pages**
- **`/`** - Home page with real-time leaderboards and progressive loading
- **`/meta-evolution`** - Interactive meta evolution charts with multiple visualization types
- **`/group-composition`** - Deep group composition analysis with web worker processing
- **`/historical-composition`** - Historical season comparison with infinite scroll
- **`/ai-predictions`** - AI-powered meta predictions and insights
- **`/ai-tier-list`** - AI-generated tier lists for current meta
- **`/race-bars`** - Animated racing bars showing spec popularity over time
- **`/meta-health`** - Meta balance and diversity analysis
- **`/cutoff`** - Real-time Mythic+ score cutoffs and thresholds

### **Season-Specific Pages**
- **`/wow-meta-season-3`** - Dedicated current season analysis
- **`/wow-meta-tww-s3`** - Alternative season 3 URL for SEO
- **`/tww-s3-meta`** - Short-form season 3 URL

### **Utility Pages**
- **`/about`** - About the project and team
- **`/privacy`** - Privacy policy
- **`/terms`** - Terms of service

## 🛠️ Development Features

### **Modern React Patterns**
- React 19 with Suspense and lazy loading
- Custom hooks for reusable logic
- Error boundaries for graceful error handling
- TypeScript for type safety

### **Performance Monitoring**
- Core Web Vitals tracking
- Real-time performance metrics
- Progressive loading indicators
- Optimized bundle analysis

### **SEO Optimization**
- Dynamic meta tags and structured data
- Semantic HTML structure
- Optimized social media previews
- Canonical URLs and redirects

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

## 🎉 Acknowledgments

- Blizzard Entertainment for providing the WoW API
- The WoW Mythic+ community for inspiration and feedback
- Open source contributors who have helped improve this project
- The React and TypeScript communities for excellent tooling

---

**Made with ❤️ for the WoW community**

*Not affiliated with Blizzard Entertainment*
