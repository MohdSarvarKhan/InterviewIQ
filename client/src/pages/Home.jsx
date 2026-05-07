import React from 'react'
import Navbar from '../components/Navbar'
import { useSelector } from 'react-redux'
import { motion } from "motion/react";
import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthModel from '../components/AuthModel';
import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";
import Footer from '../components/Footer';
import Pricing from './Pricing';

function Home() {
  const { userData } = useSelector((state) => state.user)
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate()
  return (
    <div className='min-h-screen bg-[#f3f3f3] dark:bg-black flex flex-col transition-colors'>
      <Navbar />

      <div className='flex-1 px-6 py-20'>
        <div className='max-w-6xl mx-auto'>

          <div className='flex justify-center mb-6 pt-16'>
            <div className='bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm px-4 py-2 rounded-full flex items-center gap-2 transition-colors'>
              <HiSparkles size={16} className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded" />
              AI Powered Smart Interview Platform
            </div>


          </div>
          <div className='text-center mb-28'>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto text-gray-900 dark:text-white transition-colors'>
              Practice Interviews with
              <span className='relative inline-block ml-2'>
                <span className='bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-5 py-1 rounded-full'>
                  AI Intelligence

                </span>
              </span>



            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className='text-gray-500 dark:text-gray-400 mt-6 max-w-2xl mx-auto text-lg transition-colors'>
              Role-based mock interviews with smart follow-ups,
              adaptive difficulty and real-time performance evaluation.

            </motion.p>

            <div className='flex flex-wrap justify-center gap-4 mt-10'>
              <motion.button
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true)
                    return;
                  }
                  navigate("/interview")
                }}
                whileHover={{ opacity: 0.9, scale: 1.03 }}
                whileTap={{ opacity: 1, scale: 0.98 }}
                className='bg-black dark:bg-white text-white dark:text-black px-10 py-3 rounded-full hover:opacity-90 transition shadow-md font-medium'>
                Start Interview

              </motion.button>

              <motion.button
                onClick={() => {
                  if (!userData) {
                    setShowAuth(true)
                    return;
                  }
                  navigate("/history")
                }}
                whileHover={{ opacity: 0.9, scale: 1.03 }}
                whileTap={{ opacity: 1, scale: 0.98 }}
                className='border border-gray-300 dark:border-gray-700 px-10 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition'>
                View History

              </motion.button>
            </div>
          </div>

          <div className='flex flex-col md:flex-row justify-center items-center gap-10 mb-28'>
            {
              [
                {
                  icon: <BsRobot size={24} />,
                  step: "STEP 1",
                  title: "Role & Experience Selection",
                  desc: "AI adjusts difficulty based on selected job role."
                },
                {
                  icon: <BsMic size={24} />,
                  step: "STEP 2",
                  title: "Smart Voice Interview",
                  desc: "Dynamic follow-up questions based on your answers."
                },
                {
                  icon: <BsClock size={24} />,
                  step: "STEP 3",
                  title: "Timer Based Simulation",
                  desc: "Real interview pressure with time tracking."
                }
              ].map((item, index) => (
                <motion.div key={index}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 + index * 0.2 }}
                  whileHover={{ rotate: 0, scale: 1.06 }}

                  className={`
        relative bg-white dark:bg-gray-900 rounded-3xl border-2 border-green-100 dark:border-gray-800 
        hover:border-green-500 p-10 w-80 max-w-[90%] shadow-md hover:shadow-2xl 
        transition-all duration-300
        ${index === 0 ? "rotate-[-4deg]" : ""}
        ${index === 1 ? "rotate-[3deg] md:-mt-6 shadow-xl" : ""}
        ${index === 2 ? "rotate-[-3deg]" : ""}
      `}>

                  <div className='absolute -top-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border-2 border-green-500 text-green-600 dark:text-green-400 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-colors'>
                    {item.icon}</div>
                  <div className='pt-10 text-center'>
                    <div className='text-xs text-green-600 dark:text-green-400 font-semibold mb-2 tracking-wider'>{item.step}</div>
                    <h3 className='font-semibold mb-3 text-lg text-gray-900 dark:text-white transition-colors'>{item.title}</h3>
                    <p className='text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors'>{item.desc}</p>
                  </div>


                </motion.div>
              ))
            }
          </div>


          <div className='mb-32'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl font-semibold text-center mb-16 text-gray-900 dark:text-white transition-colors'>
              Advanced AI{" "}
              <span className="text-green-600 dark:text-green-400">Capabilities</span>

            </motion.h2>

            <div className='grid md:grid-cols-2 gap-10'>
              {
                [
                  {
                    image: evalImg,
                    icon: <BsBarChart size={20} />,
                    title: "AI Answer Evaluation",
                    desc: "Scores communication, technical accuracy and confidence."
                  },
                  {
                    image: resumeImg,
                    icon: <BsFileEarmarkText size={20} />,
                    title: "Resume Based Interview",
                    desc: "Project-specific questions based on uploaded resume."
                  },
                  {
                    image: pdfImg,
                    icon: <BsFileEarmarkText size={20} />,
                    title: "Downloadable PDF Report",
                    desc: "Detailed strengths, weaknesses and improvement insights."
                  },
                  {
                    image: analyticsImg,
                    icon: <BsBarChart size={20} />,
                    title: "History & Analytics",
                    desc: "Track progress with performance graphs and topic analysis."
                  }
                ].map((item, index) => (
                  <motion.div key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all'>
                    <div className='flex flex-col md:flex-row items-center gap-8'>
                      <div className='w-full md:w-1/2 flex justify-center'>
                        <img src={item.image} alt={item.title} className='w-full h-auto object-contain max-h-64' />
                      </div>

                      <div className='w-full md:w-1/2'>
                        <div className='bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors'>
                          {item.icon}
                        </div>
                        <h3 className='font-semibold mb-3 text-xl text-gray-900 dark:text-white transition-colors'>{item.title}</h3>
                        <p className='text-gray-500 dark:text-gray-400 text-sm leading-relaxed transition-colors'>{item.desc}</p>
                      </div>

                    </div>


                  </motion.div>
                ))
              }
            </div>


          </div>

          <div className='mb-32'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl font-semibold text-center mb-16 text-gray-900 dark:text-white transition-colors'>
              Multiple Interview{" "}
              <span className="text-green-600 dark:text-green-400">Modes</span>

            </motion.h2>

            <div className='grid md:grid-cols-2 gap-10'>
              {
                [
                  {
                    img: hrImg,
                    title: "HR Interview Mode",
                    desc: "Behavioral and communication based evaluation."
                  },
                  {
                    img: techImg,
                    title: "Technical Mode",
                    desc: "Deep technical questioning based on selected role."
                  },

                  {
                    img: confidenceImg,
                    title: "Confidence Detection",
                    desc: "Basic tone and voice analysis insights."
                  },
                  {
                    img: creditImg,
                    title: "Credits System",
                    desc: "Unlock premium interview sessions easily."
                  }
                ].map((mode, index) => (
                  <motion.div key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -6 }}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all">

                    <div className='flex items-center justify-between gap-6'>
                      <div className="w-1/2">
                        <h3 className="font-semibold text-xl mb-3 text-gray-900 dark:text-white transition-colors">
                          {mode.title}
                        </h3>

                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed transition-colors">
                          {mode.desc}
                        </p>
                      </div>

                      {/* RIGHT IMAGE */}
                      <div className="w-1/2 flex justify-end">
                        <img
                          src={mode.img}
                          alt={mode.title}
                          className="w-28 h-28 object-contain"
                        />
                      </div>



                    </div>


                  </motion.div>
                ))
              }
            </div>


          </div>

        </div>
      </div>

      {/* Embedded Pricing Section */}
      <div id="pricing-section" className="bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-black dark:to-gray-900 rounded-t-[3rem] pt-8 pb-10 transition-colors">
        <Pricing isEmbedded={true} />
      </div>

      {/* AlgoSforge Banner */}
      <div className='px-6 pb-20 bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-black dark:to-gray-900 transition-colors'>
        <div className='max-w-6xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className='relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-500 rounded-3xl p-10 md:p-14 shadow-2xl'
          >
            {/* Decorative blobs */}
            <div className='absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none' />
            <div className='absolute -bottom-14 -left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none' />

            <div className='relative flex flex-col md:flex-row items-center justify-between gap-8'>
              <div className='text-white max-w-xl'>
                <div className='inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5'>
                  <span className='text-base'>⚡</span> DSA Practice Platform
                </div>
                <h2 className='text-3xl md:text-4xl font-bold leading-tight mb-4'>
                  Sharpen Your DSA Skills on{' '}
                  <span className='text-yellow-300'>AlgoSforge</span>
                </h2>
                <p className='text-green-50 text-base leading-relaxed'>
                  Practice Data Structures &amp; Algorithms with curated problems, just like LeetCode — built to complement your interview prep. Solve, learn, and get hired faster.
                </p>
              </div>

              <div className='flex flex-col items-center gap-4 shrink-0'>
                <motion.a
                  href='https://algosforge.netlify.app/'
                  target='_blank'
                  rel='noopener noreferrer'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className='bg-white text-green-700 font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg flex items-center gap-2'
                >
                  🚀 Try AlgoSforge
                </motion.a>
                <span className='text-green-100 text-sm'>Free to use · No signup needed</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}

      <Footer />

    </div>
  )
}

export default Home
