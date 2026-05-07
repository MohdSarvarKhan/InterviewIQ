import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from "axios"
import { ServerUrl } from '../App';
import Step3Report from '../components/Step3Report';

function PublicReport() {
  const { token } = useParams()
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/interview/public/" + token)
        setReport(result.data)
      } catch (error) {
        console.error(error)
        setError("Public report not found or link is invalid.")
      }
    }
    fetchReport()
  }, [token])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors">
        <p className="text-red-500 dark:text-red-400 font-medium text-lg">{error}</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Loading Public Report...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-10 transition-colors pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white transition-colors">
            Public Interview Report for {report.userName}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">
            Role: <span className="font-medium text-gray-700 dark:text-gray-300">{report.role}</span> | 
            Company: <span className="font-medium text-gray-700 dark:text-gray-300">{report.targetCompany || "N/A"}</span> |
            Difficulty: <span className="font-medium text-gray-700 dark:text-gray-300">{report.difficulty}</span>
          </p>
        </div>
      </div>
      <Step3Report report={report} />
    </div>
  )
}

export default PublicReport
