import React from 'react';
import SEO from './SEO';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SEO title="Terms of Service – What the Meta?" description="Terms of Service for What the Meta? website and services." />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link to="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-300">
            Last updated: August 5, 2025
          </p>
        </div>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Acceptance of Terms</h2>
            <p>
              By accessing and using What the Meta? ("the Service"), you accept and agree to be bound 
              by the terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Description of Service</h2>
            <p>
              What the Meta? is a World of Warcraft Mythic+ leaderboard and meta analysis tool that 
              provides publicly available game data, statistics, and analysis. Our service aggregates 
              and displays information from the official World of Warcraft API and other public sources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Use License</h2>
            <div className="space-y-4">
              <p>
                Permission is granted to temporarily access the materials on What the Meta?'s website 
                for personal, non-commercial transitory viewing only. This is the grant of a license, 
                not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Data and Content</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-400">Game Data</h3>
                <p>
                  All World of Warcraft data displayed on our service is sourced from the official 
                  Blizzard API and is publicly available. We do not claim ownership of this data 
                  and acknowledge that it belongs to Blizzard Entertainment.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-400">Our Content</h3>
                <p>
                  The design, layout, analysis, and presentation of data on our website are owned 
                  by What the Meta?. This includes our meta analysis, charts, and user interface.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">User Conduct</h2>
            <p>
              You agree to use our service only for lawful purposes and in accordance with these Terms. 
              You agree not to use the service to transmit any material that is defamatory, offensive, 
              or otherwise objectionable, or that infringes on the rights of others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Disclaimers</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">Accuracy of Data</h3>
                <p>
                  While we strive to provide accurate and up-to-date information, we cannot guarantee 
                  the accuracy, completeness, or reliability of any data displayed on our service. 
                  Game data is subject to change and may not reflect the current state of the game.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">Service Availability</h3>
                <p>
                  We do not guarantee that our service will be available at all times. We may 
                  temporarily suspend or discontinue the service for maintenance, updates, or other 
                  reasons without notice.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">Third-Party Services</h3>
                <p>
                  Our service may contain links to third-party websites or services. We are not 
                  responsible for the content, privacy policies, or practices of any third-party 
                  services.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Limitation of Liability</h2>
            <p>
              In no event shall What the Meta? or its suppliers be liable for any damages (including, 
              without limitation, damages for loss of data or profit, or due to business interruption) 
              arising out of the use or inability to use the materials on our website, even if we 
              or our authorized representative has been notified orally or in writing of the possibility 
              of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain 
              the exclusive property of What the Meta? and its licensors. The Service is protected 
              by copyright, trademark, and other laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs 
              your use of the Service, to understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Termination</h2>
            <p>
              We may terminate or suspend your access immediately, without prior notice or liability, 
              for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Governing Law</h2>
            <p>
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which 
              What the Meta? operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any 
              time. If a revision is material, we will try to provide at least 30 days notice prior 
              to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
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

export default TermsPage; 