import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const pageContent = {
  '/tips': {
    title: 'Interview Tips',
    content: `
      <h2>Top Tips for Acing Your Interview</h2>
      <p>1. <strong>Research the company:</strong> Understand their mission, products, and recent news.</p>
      <p>2. <strong>Practice the STAR method:</strong> Structure your behavioral answers using Situation, Task, Action, and Result.</p>
      <p>3. <strong>Prepare questions:</strong> Always have thoughtful questions ready for your interviewer.</p>
      <p>4. <strong>Mock Interviews:</strong> Use platforms like InterviewIQ to simulate real interview pressure.</p>
      <p>5. <strong>Follow up:</strong> Send a polite thank-you email within 24 hours of your interview.</p>
    `
  },
  '/questions': {
    title: 'Common Interview Questions',
    content: `
      <h2>Frequently Asked Questions</h2>
      <ul>
        <li><strong>Tell me about yourself.</strong> Keep it concise, professional, and relevant to the role.</li>
        <li><strong>What are your greatest strengths and weaknesses?</strong> Be honest and show how you are working to improve your weaknesses.</li>
        <li><strong>Why do you want to work here?</strong> Connect your goals with the company's mission.</li>
        <li><strong>Describe a time you overcame a challenge.</strong> Use the STAR method to structure your answer.</li>
        <li><strong>Where do you see yourself in 5 years?</strong> Show ambition while remaining realistic and aligned with the role.</li>
      </ul>
    `
  },
  '/blog': {
    title: 'Career Blog',
    content: `
      <h2>Welcome to the InterviewIQ Career Blog</h2>
      <p>We are currently writing amazing content to help you navigate your career journey. Check back soon for articles on:</p>
      <ul>
        <li>Negotiating your salary</li>
        <li>Transitioning into tech</li>
        <li>Building a standout portfolio</li>
        <li>Mastering remote interviews</li>
      </ul>
    `
  },
  '/privacy': {
    title: 'Privacy Policy',
    content: `
      <h2>Privacy Policy</h2>
      <p>Last updated: Today</p>
      <p>At InterviewIQ, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>
      <h3>Information We Collect</h3>
      <p>We collect information you provide directly to us, such as your name, email, and resume data when you use our services.</p>
      <h3>How We Use Your Information</h3>
      <p>We use your information to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
      <h3>Data Security</h3>
      <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access.</p>
    `
  },
  '/terms': {
    title: 'Terms of Service',
    content: `
      <h2>Terms of Service</h2>
      <p>Welcome to InterviewIQ. By using our website and services, you agree to these terms.</p>
      <h3>Use of Services</h3>
      <p>You must use our services lawfully and not misuse our AI tools or attempt to bypass our security measures.</p>
      <h3>Account Responsibilities</h3>
      <p>You are responsible for safeguarding your account credentials and for all activities that occur under your account.</p>
      <h3>Modifications</h3>
      <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of the new terms.</p>
    `
  },
  '/cookies': {
    title: 'Cookie Policy',
    content: `
      <h2>Cookie Policy</h2>
      <p>InterviewIQ uses cookies to improve your experience on our platform.</p>
      <h3>What are cookies?</h3>
      <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and actions.</p>
      <h3>How we use cookies</h3>
      <p>We use essential cookies to keep you logged in and analytics cookies to understand how our site is used so we can improve it.</p>
      <h3>Managing cookies</h3>
      <p>You can control and/or delete cookies through your browser settings. However, disabling essential cookies may impact site functionality.</p>
    `
  },
  '/contact': {
    title: 'Contact Us',
    content: `
      <h2>Get in Touch</h2>
      <p>Have questions, feedback, or need support? We'd love to hear from you!</p>
      <p><strong>Email:</strong> support@interviewiq.ai</p>
      <p><strong>Address:</strong> 123 Tech Lane, Innovation City, CA 94000</p>
      <p>Our support team typically responds within 24-48 hours during regular business days.</p>
    `
  }
};

function StaticPage() {
  const location = useLocation();
  const pageData = pageContent[location.pathname] || {
    title: 'Page Not Found',
    content: '<p>The content you are looking for does not exist or has been moved.</p>'
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black transition-colors">
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 pt-28 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12 transition-colors"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
            {pageData.title}
          </h1>
          
          <div 
            className="prose prose-lg prose-green max-w-none text-gray-600 dark:text-gray-300
                       prose-h2:text-2xl prose-h2:font-semibold prose-h2:text-gray-800 dark:prose-h2:text-white prose-h2:mt-8 prose-h2:mb-4
                       prose-h3:text-xl prose-h3:font-semibold prose-h3:text-gray-800 dark:prose-h3:text-white prose-h3:mt-6 prose-h3:mb-3
                       prose-p:mb-4 prose-li:mb-2 prose-ul:list-disc prose-ul:pl-5
                       prose-strong:text-gray-800 dark:prose-strong:text-gray-200"
            dangerouslySetInnerHTML={{ __html: pageData.content }}
          />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default StaticPage;
