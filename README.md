# WoW Mythic+ Leaderboard Frontend

A modern dashboard for visualizing World of Warcraft Mythic+ meta, built with React, TypeScript, Vite, Tailwind CSS, and Recharts.

## Features
- **Leaderboard Dashboard:** View top runs, group compositions, and stats for each season, week, and dungeon.
- **Meta Evolution:** Visualize spec/class popularity over time with line charts, stacked bar charts, and a heatmap.
- **Interactive Filters:** Filter by season, week, dungeon, role, and more.
- **Modern UI:** Responsive, dark-mode SaaS look with beautiful charts and tooltips.
- **Heatmap:** Instantly see "hot" specs and meta shifts week by week.
- **Pagination & Sorting:** Fast, client-side table navigation.

## Tech Stack
- **React + TypeScript** (Vite for fast dev)
- **Tailwind CSS** (utility-first styling)
- **Recharts** (data visualizations)
- **Context + useReducer** (state management)
- **API:** Connects to the [WoW API Proxy & Leaderboard backend](../wow-api/README.md)

## Getting Started

### 1. Install dependencies
```sh
npm install
```

### 2. Run the development server
```sh
npm run dev
```
- The app will be available at [http://localhost:5173](http://localhost:5173) by default.

### 3. Connect to the backend API
- By default, the frontend expects the backend at `http://localhost:3000`.
- You can change the API base URL in your environment or config if needed.

### 4. Expose your local frontend to the internet (for demos/testing)
- **LocalTunnel:**
  ```sh
  npx localtunnel --port 5173
  ```
- **ngrok:**
  ```sh
  npx ngrok http 5173
  ```
- Share the public URL provided by the tool.
- If you see a "Blocked request. This host ... is not allowed" error, add `allowedHosts: 'all'` to your `vite.config.ts` under `server`:
  ```js
  // vite.config.ts
  export default defineConfig({
    // ...
    server: {
      allowedHosts: 'all',
    },
  });
  ```

## Development Tips
- **Linting:** Uses ESLint with recommended React/TypeScript rules.
- **Styling:** Tailwind classes are used throughout for rapid UI iteration.
- **Charts:** All charts are built with Recharts; see `MetaEvolutionPage.tsx` for advanced chart logic.
- **API:** All API calls are in `src/api/`.
- **State:** Filter and dashboard state is managed with React Context + useReducer for scalability.

## Troubleshooting
- **API errors:** Make sure the backend is running and accessible at the expected URL.
- **CORS issues:** The backend enables CORS by default, but check your browser console for errors.
- **LocalTunnel/ngrok errors:** If you get a host not allowed error, update `vite.config.ts` as above.
- **Data not updating:** Refresh materialized views on the backend via the `/admin/refresh-views` endpoint after importing new data.

## License
MIT
