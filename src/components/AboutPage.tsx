import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-4">About What the Meta?</h1>
          <p className="text-xl text-gray-300">
            Your ultimate World of Warcraft Mythic+ leaderboard and meta analysis tool
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">What We Do</h2>
            <p className="text-gray-300 leading-relaxed">
              What the Meta? is a comprehensive tool designed for World of Warcraft Mythic+ players 
              who want to understand the current meta, track top performances, and analyze group 
              compositions. We provide real-time data from the WoW API to help you make informed 
              decisions about your gameplay and team composition.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-green-400">Leaderboards</h3>
                <p className="text-gray-300">
                  Track top Mythic+ runs across all dungeons, regions, and seasons. 
                  See which players and groups are setting the pace.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-purple-400">Group Compositions</h3>
                <p className="text-gray-300">
                  Analyze successful group compositions and understand which class 
                  combinations work best for different dungeons.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-yellow-400">Meta Evolution</h3>
                <p className="text-gray-300">
                  Watch how the meta changes over time with detailed charts and 
                  analysis of spec popularity and performance.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-red-400">AI Predictions</h3>
                <p className="text-gray-300">
                  Get AI-powered insights and predictions about upcoming meta shifts 
                  and optimal group compositions.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              We believe that data-driven decisions lead to better gameplay. Our mission is to 
              provide the WoW Mythic+ community with the most accurate, up-to-date information 
              about the current meta, helping players improve their performance and enjoy the 
              game more.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Data Sources</h2>
            <p className="text-gray-300 leading-relaxed">
              All our data comes directly from the official World of Warcraft API, ensuring 
              accuracy and reliability. We update our information regularly to provide you with 
              the most current meta analysis and leaderboard data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Get Started</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Ready to dive into the meta? Start exploring our features:
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/leaderboard" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                View Leaderboards
              </Link>
              <Link 
                to="/compositions" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Analyze Compositions
              </Link>
              <Link 
                to="/meta-evolution" 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Meta Evolution
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 