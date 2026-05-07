import React from 'react';
import { BsRobot, BsTwitter, BsLinkedin, BsGithub } from 'react-icons/bs';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <BsRobot size={20} />
              </div>
              <h2 className="font-bold text-xl text-gray-800">InterviewIQ</h2>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              AI-powered interview preparation platform designed to improve
              communication skills, technical depth, and professional confidence.
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              <a href="#" className="hover:text-green-600 transition"><BsTwitter size={20} /></a>
              <a href="#" className="hover:text-green-600 transition"><BsLinkedin size={20} /></a>
              <a href="#" className="hover:text-green-600 transition"><BsGithub size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Platform</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/interview" className="hover:text-green-600 transition">Practice Interview</Link></li>
              <li><Link to="/history" className="hover:text-green-600 transition">My History</Link></li>
              <li><Link to="/leaderboard" className="hover:text-green-600 transition">Leaderboard</Link></li>
              <li><Link to="/pricing" className="hover:text-green-600 transition">Pricing & Credits</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-green-600 transition">Interview Tips</a></li>
              <li><a href="https://resume-buildersss.netlify.app/" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition">Resume Builder</a></li>
              <li>
                <a href="https://algosforge.netlify.app/" target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition flex items-center gap-1">
                  AlgoSforge <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full font-semibold">DSA</span>
                </a>
              </li>
              <li><a href="#" className="hover:text-green-600 transition">Common Questions</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Career Blog</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><a href="#" className="hover:text-green-600 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} InterviewIQ.AI. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Made with ❤️ for Job Seekers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
