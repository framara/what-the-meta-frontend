import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-300">
            Last updated: August 5, 2025
          </p>
        </div>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Introduction</h2>
            <p>
              What the Meta? ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, and safeguard your information 
              when you use our World of Warcraft Mythic+ leaderboard and meta analysis tool.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-400">Public Game Data</h3>
                <p>
                  We collect publicly available World of Warcraft data through the official Blizzard API, 
                  including leaderboard information, character statistics, and group composition data. 
                  This data is publicly accessible and does not contain personal information.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-400">Usage Analytics</h3>
                <p>
                  We use Google Analytics to understand how users interact with our website. 
                  This includes information about your device, browser, and usage patterns. 
                  This data is anonymized and helps us improve our service.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-400">Cookies</h3>
                <p>
                  We use essential cookies to improve your browsing experience and remember 
                  your preferences. These cookies do not contain personal information.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide and maintain our Mythic+ leaderboard and meta analysis services</li>
              <li>Analyze usage patterns to improve our website functionality</li>
              <li>Display relevant game data and statistics</li>
              <li>Ensure the security and integrity of our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Data Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties. 
              We may share anonymized, aggregated data for analytical purposes. We may also share 
              information if required by law or to protect our rights and safety.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Data Security</h2>
            <p>
              We implement appropriate security measures to protect against unauthorized access, 
              alteration, disclosure, or destruction of your information. However, no method of 
              transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Third-Party Services</h2>
            <p>
              Our website uses Google Analytics for usage analysis. Google's privacy policy 
              applies to the data collected by their services. We also use Vercel for hosting, 
              which may collect basic server logs for security and performance purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Your Rights</h2>
            <div className="space-y-2">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Access any personal information we may have about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of analytics tracking</li>
                <li>Contact us with privacy concerns</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If you are a parent or guardian 
              and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, 
              please contact us at:
            </p>
            <div className="bg-gray-800 p-4 rounded-lg mt-2">
              <p className="font-semibold">Email:</p>
              <p className="text-blue-400">contact@whatthemeta.io</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 