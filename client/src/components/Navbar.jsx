import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from "motion/react"
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut, FaSun, FaMoon } from "react-icons/fa";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';
import { useTheme } from '../context/ThemeContext';
function Navbar() {
    const {userData} = useSelector((state)=>state.user)
    const [showCreditPopup,setShowCreditPopup] = useState(false)
    const [showUserPopup,setShowUserPopup] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showAuth, setShowAuth] = useState(false);
    const { isDarkMode, toggleTheme } = useTheme();

    const handleLogout = async () => {
        try {
            await axios.get(ServerUrl + "/api/auth/logout" , {withCredentials:true})
            dispatch(setUserData(null))
            setShowCreditPopup(false)
            setShowUserPopup(false)
            navigate("/")

        } catch (error) {
            console.log(error)
        }
    }
  return (
    <div className='fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pb-2 bg-transparent pointer-events-none'>
        <motion.div 
        initial={{opacity:0 , y:-40}}
        animate={{opacity:1 , y:0}}
        transition={{duration: 0.3}}
        className='pointer-events-auto w-full max-w-6xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-[24px] shadow-sm border border-gray-200/50 dark:border-gray-700/50 px-8 py-3 flex justify-between items-center relative transition-colors'>
            <div className='flex items-center gap-3 cursor-pointer' onClick={() => navigate("/")}>
                <div className='bg-black dark:bg-white text-white dark:text-black p-2 rounded-lg transition-colors'>
                    <BsRobot size={18}/>

                </div>
                <h1 className='font-semibold hidden md:block text-lg text-gray-900 dark:text-white transition-colors'>InterviewIQ.AI</h1>
            </div>

            <div className='hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors'>
                <button onClick={()=>navigate("/pricing")} className='hover:text-green-600 dark:hover:text-green-400 transition'>Pricing</button>
                <a href="https://algosforge.netlify.app/" target="_blank" rel="noopener noreferrer" className='hover:text-green-600 dark:hover:text-green-400 transition flex items-center gap-1'>
                    AlgoSforge <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full font-bold">DSA</span>
                </a>
                <a href="https://resume-buildersss.netlify.app/" target="_blank" rel="noopener noreferrer" className='hover:text-green-600 dark:hover:text-green-400 transition'>Resume Builder</a>
            </div>

            <div className='flex items-center gap-4 relative'>
                {/* Theme Toggle Button */}
                <button 
                    onClick={toggleTheme} 
                    className='w-10 h-10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
                </button>

                <div className='relative'>
                    <button onClick={()=>{
                        if(!userData){
                            setShowAuth(true)
                            return;
                        }
                        setShowCreditPopup(!showCreditPopup);
                        setShowUserPopup(false)
                    }} className='flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded-full text-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'>
                        <BsCoin size={20} className="text-yellow-500"/>
                        {userData?.credits || 0}
                    </button>
                    
                    {userData && userData.streak > 0 && (
                        <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full text-md font-semibold transition-colors">
                            🔥 {userData.streak}
                        </div>
                    )}

                    {showCreditPopup && (
                        <div className='absolute right-[-50px] mt-3 w-64 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl p-5 z-50 transition-colors'>
                            <p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>Need more credits to continue interviews?</p>
                            <button onClick={()=>navigate("/pricing")} className='w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg text-sm font-medium transition-colors'>Buy more credits</button>

                        </div>
                    )}
                </div>

                <div className='relative'>
                    <button
                    onClick={()=>{
                         if(!userData){
                            setShowAuth(true)
                            return;
                        }
                        setShowUserPopup(!showUserPopup);
                        setShowCreditPopup(false)
                    }} className='w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-semibold transition-colors shadow-sm'>
                        {userData?.name ? userData.name.slice(0,1).toUpperCase() : <FaUserAstronaut size={16}/>}

                        
                    </button>

                    {showUserPopup && (
                        <div className='absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl p-4 z-50 transition-colors'>
                            <p className='text-md text-blue-500 dark:text-blue-400 font-medium mb-1 truncate'>{userData?.name}</p>

                            <button onClick={()=>navigate("/dashboard")} className='w-full text-left text-sm py-2 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300 transition-colors'>Dashboard</button>
                            <button onClick={()=>navigate("/leaderboard")} className='w-full text-left text-sm py-2 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300 transition-colors'>Leaderboard</button>
                            <button onClick={()=>navigate("/history")} className='w-full text-left text-sm py-2 hover:text-black dark:hover:text-white text-gray-600 dark:text-gray-300 transition-colors'>Interview History</button>
                            {userData?.isAdmin && (
                              <button onClick={()=>navigate("/admin")} className='w-full text-left text-sm py-2 hover:text-green-500 text-emerald-600 dark:text-emerald-400 font-medium transition-colors'>Admin Panel</button>
                            )}
                            <button onClick={handleLogout} 
                            className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-500 dark:text-red-400 hover:text-red-600 transition-colors'>
                                <HiOutlineLogout size={16}/>
                                Logout</button>
                        </div>
                    )}
                </div>

            </div>



        </motion.div>

        {showAuth && <AuthModel onClose={()=>setShowAuth(false)}/>}
      
    </div>
  )
}

export default Navbar
