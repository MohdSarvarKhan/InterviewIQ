import React from 'react'
import { motion } from "motion/react"
import {
    FaUserTie,
    FaBriefcase,
    FaFileUpload,
    FaMicrophoneAlt,
    FaChartLine,
    FaGithub,
} from "react-icons/fa";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { useState } from 'react';
import axios from "axios"
import { ServerUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';
function Step1SetUp({ onStart }) {
    const {userData}= useSelector((state)=>state.user)
    const dispatch = useDispatch()
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("Technical");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [targetCompany, setTargetCompany] = useState("");
    const [difficulty, setDifficulty] = useState("Intermediate");
    const [isPractice, setIsPractice] = useState(false);
    const [language, setLanguage] = useState("English");
    // GitHub states
    const [githubUsername, setGithubUsername] = useState("");
    const [githubRepos, setGithubRepos] = useState([]);
    const [selectedRepos, setSelectedRepos] = useState([]);
    const [githubScanning, setGithubScanning] = useState(false);
    const [githubError, setGithubError] = useState("");


    const handleUploadResume = async () => {
        if (!resumeFile || analyzing) return;
        setAnalyzing(true)

        const formdata = new FormData()
        formdata.append("resume", resumeFile)

        try {
            const result = await axios.post(ServerUrl + "/api/interview/resume", formdata, { withCredentials: true })

            console.log(result.data)

            setRole(result.data.role || "");
            setExperience(result.data.experience || "");
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");
            setAnalysisDone(true);

            setAnalyzing(false);

        } catch (error) {
            console.log(error)
            setAnalyzing(false);
        }
    }

    const handleScanGithub = async () => {
        if (!githubUsername.trim() || githubScanning) return;
        setGithubScanning(true);
        setGithubError("");
        setGithubRepos([]);
        setSelectedRepos([]);
        try {
            const result = await axios.post(ServerUrl + "/api/interview/github-scan", { username: githubUsername }, { withCredentials: true });
            const reposList = result.data.repos || [];
            setGithubRepos(reposList);
            setSelectedRepos(reposList.map(r => r.name));
        } catch (error) {
            setGithubError(error.response?.data?.message || "GitHub scan failed.");
        } finally {
            setGithubScanning(false);
        }
    };

    const handleStart = async () => {
        if (!userData) {
            alert("Please log in to start an interview.");
            return;
        }
        setLoading(true)
        try {
           const dynamicGithubContext = githubRepos
               .filter(r => selectedRepos.includes(r.name))
               .map(r => `- ${r.name} (${r.language})${r.description !== "No description" ? ": " + r.description : ""}${r.topics?.length ? " [" + r.topics.join(", ") + "]" : ""}`)
               .join("\n");

           const result = await axios.post(ServerUrl + "/api/interview/generate-questions" , {role, experience, mode , resumeText, projects, skills, targetCompany, difficulty, isPractice, language, githubContext: dynamicGithubContext } , {withCredentials:true}) 
           console.log(result.data)
           if(userData){
            dispatch(setUserData({...userData , credits:result.data.creditsLeft}))
           }
           setLoading(false)
           onStart({...result.data, mode, language})

        } catch (error) {
            console.log(error)
            alert(error.response?.data?.message || "Failed to start interview. Please try again.");
            setLoading(false)
        }
    }
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-gray-900 px-4 transition-colors pt-24 pb-12'>

            <div className='w-full max-w-6xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden transition-colors border dark:border-gray-800'>

                <motion.div
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className='relative bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-900 p-12 flex flex-col justify-center transition-colors'>

                    <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
                        Start Your AI Interview
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-10">
                        Practice real interview scenarios powered by AI.
                        Improve communication, technical skills, and confidence.
                    </p>

                    <div className='space-y-5'>

                        {
                            [
                                {
                                    icon: <FaUserTie className="text-green-600 text-xl" />,
                                    text: "Choose Role & Experience",
                                },
                                {
                                    icon: <FaMicrophoneAlt className="text-green-600 text-xl" />,
                                    text: "Smart Voice Interview",
                                },
                                {
                                    icon: <FaChartLine className="text-green-600 text-xl" />,
                                    text: "Performance Analytics",
                                },
                            ].map((item, index) => (
                                <motion.div key={index}
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 + index * 0.15 }}
                                    whileHover={{ scale: 1.03 }}
                                    className='flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm cursor-pointer transition-colors'>
                                    {item.icon}
                                    <span className='text-gray-700 dark:text-gray-300 font-medium'>{item.text}</span>

                                </motion.div>
                            ))
                        }
                    </div>



                </motion.div>



                <motion.div
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="p-12 bg-white dark:bg-gray-900 transition-colors">

                    <h2 className='text-3xl font-bold text-gray-800 dark:text-white mb-8'>
                        Interview SetUp
                    </h2>


                    <div className='space-y-6'>

                        <div className='relative'>
                            <FaUserTie className='absolute top-4 left-4 text-gray-400' />

                            <input type='text' placeholder='Enter role'
                                className='w-full pl-12 pr-4 py-3 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-colors'
                                onChange={(e) => setRole(e.target.value)} value={role} />
                        </div>


                        <div className='relative'>
                            <FaBriefcase className='absolute top-4 left-4 text-gray-400' />

                            <input type='text' placeholder='Experience (e.g. 2 years)'
                                className='w-full pl-12 pr-4 py-3 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-colors'
                                onChange={(e) => setExperience(e.target.value)} value={experience} />



                        </div>

                        <select value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            className='w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-colors'>

                            <option value="Technical">Technical Interview</option>
                            <option value="HR">HR Interview</option>
                            <option value="Behavioral">Behavioral (STAR Method)</option>
                            <option value="System Design">System Design</option>
                            <option value="DSA">Data Structures & Algorithms</option>

                        </select>

                        <div className='relative'>
                            <FaBriefcase className='absolute top-4 left-4 text-gray-400' />
                            <input type='text' placeholder='Target Company (Optional, e.g. Amazon)'
                                className='w-full pl-12 pr-4 py-3 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-colors'
                                onChange={(e) => setTargetCompany(e.target.value)} value={targetCompany} />
                        </div>

                        <select value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className='w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-colors'>
                            <option value="Beginner">Difficulty: Beginner</option>
                            <option value="Intermediate">Difficulty: Intermediate</option>
                            <option value="Advanced">Difficulty: Advanced</option>
                            <option value="Expert">Difficulty: Expert</option>
                        </select>

                        <select value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className='w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-colors'>
                            <option value="English">Language: English</option>
                            <option value="Hindi">Language: Hindi</option>
                            <option value="Spanish">Language: Spanish</option>
                            <option value="French">Language: French</option>
                        </select>

                        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
                            <input type="checkbox" id="practiceMode" 
                                checked={isPractice} onChange={(e) => setIsPractice(e.target.checked)}
                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500" />
                            <label htmlFor="practiceMode" className="text-gray-700 dark:text-gray-300 font-medium cursor-pointer flex-1 transition-colors">
                                Practice Mode <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">(No credits used, results not saved)</span>
                            </label>
                        </div>

                        {!analysisDone && (
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                onClick={() => document.getElementById("resumeUpload").click()}
                                className='border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-gray-800 transition-colors'>

                                <FaFileUpload className='text-4xl mx-auto text-green-600 mb-3' />

                                <input type="file"
                                    accept="application/pdf"
                                    id="resumeUpload"
                                    className='hidden'
                                    onChange={(e) => setResumeFile(e.target.files[0])} />

                                <p className='text-gray-600 dark:text-gray-400 font-medium transition-colors'>
                                    {resumeFile ? resumeFile.name : "Click to upload resume (Optional)"}
                                </p>

                                {resumeFile && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUploadResume()
                                        }}

                                        className='mt-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold px-5 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors'>
                                        {analyzing ? "Analyzing..." : "Analyze Resume"}



                                    </motion.button>)}

                            </motion.div>


                        )}

                        {analysisDone && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4 transition-colors'>
                                <h3 className='text-lg font-semibold text-gray-800 dark:text-white transition-colors'>
                                    Resume Analysis Result</h3>

                                {projects.length > 0 && (
                                    <div>
                                        <p className='font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors'>
                                            Projects:</p>

                                        <ul className='list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 transition-colors'>
                                            {projects.map((p, i) => (
                                                <li key={i}>{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {skills.length > 0 && (
                                    <div>
                                        <p className='font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors'>
                                            Skills:</p>

                                        <div className='flex flex-wrap gap-2'>
                                            {skills.map((s, i) => (
                                                <span key={i} className='bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm transition-colors'>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        )}


                        {/* GitHub Scan Section */}
                        <div className='space-y-3'>
                            <div className='flex gap-2'>
                                <div className='relative flex-1'>
                                    <FaGithub className='absolute top-4 left-4 text-gray-400' />
                                    <input
                                        type='text'
                                        placeholder='GitHub Username (Optional)'
                                        value={githubUsername}
                                        onChange={(e) => setGithubUsername(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleScanGithub()}
                                        className='w-full pl-12 pr-4 py-3 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-colors'
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={handleScanGithub}
                                    disabled={!githubUsername.trim() || githubScanning}
                                    className='px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl disabled:opacity-40 text-sm font-semibold whitespace-nowrap transition-colors'
                                >
                                    {githubScanning ? "Scanning..." : "Scan GitHub"}
                                </motion.button>
                            </div>

                            {githubError && (
                                <div className='flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2'>
                                    <BsXCircleFill />
                                    {githubError}
                                </div>
                            )}

                            {githubRepos.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className='bg-gray-900 rounded-xl p-4 space-y-2'
                                >
                                    <div className='flex items-center gap-2 mb-3'>
                                        <BsCheckCircleFill className='text-green-400' />
                                        <span className='text-white text-sm font-semibold'>{selectedRepos.length} repos selected for AI context</span>
                                    </div>
                                    <div className='max-h-60 overflow-y-auto pr-1 space-y-2 custom-scrollbar'>
                                        {githubRepos.map((repo, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => setSelectedRepos(prev => prev.includes(repo.name) ? prev.filter(n => n !== repo.name) : [...prev, repo.name])}
                                                className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition ${selectedRepos.includes(repo.name) ? 'bg-gray-800 border border-gray-600' : 'bg-gray-800/40 border border-transparent opacity-60'}`}
                                            >
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedRepos.includes(repo.name)} 
                                                    readOnly 
                                                    className="w-4 h-4 text-green-500 rounded bg-gray-700 border-gray-500 focus:ring-green-500 focus:ring-2 cursor-pointer pointer-events-none" 
                                                />
                                                <FaGithub className={`${selectedRepos.includes(repo.name) ? 'text-gray-300' : 'text-gray-500'} shrink-0`} />
                                                <div className='min-w-0 flex-1'>
                                                    <p className={`text-xs font-semibold truncate ${selectedRepos.includes(repo.name) ? 'text-white' : 'text-gray-400'}`}>{repo.name}</p>
                                                    <p className='text-gray-500 text-xs truncate'>{repo.language} {repo.description !== 'No description' ? `· ${repo.description}` : ''}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <motion.button
                        onClick={handleStart}
                            disabled={!role || !experience || loading}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.95 }}
                            className='w-full disabled:bg-gray-600 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md'>
                            {loading ? "Starting...":"Start Interview"}


                        </motion.button>
                    </div>

                </motion.div>
            </div>

        </motion.div>
    )
}

export default Step1SetUp
