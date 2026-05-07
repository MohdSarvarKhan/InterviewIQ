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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500 font-medium text-lg">{error}</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading Public Report...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Public Interview Report for {report.userName}
          </h2>
          <p className="text-gray-500 mt-1">
            Role: <span className="font-medium text-gray-700">{report.role}</span> | 
            Company: <span className="font-medium text-gray-700">{report.targetCompany || "N/A"}</span> |
            Difficulty: <span className="font-medium text-gray-700">{report.difficulty}</span>
          </p>
        </div>
      </div>
      <Step3Report report={report} />
    </div>
  )
}

export default PublicReport
