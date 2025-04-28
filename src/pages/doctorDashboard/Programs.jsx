import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRupeeSign, FaUsers, FaInfoCircle } from "react-icons/fa";
import { apiRequest, ENDPOINTS } from "../../utils/apiRequest";

const Programs = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiRequest(ENDPOINTS.DOCTOR_PROGRAMS);
        // Transform the data to include subscription metrics
        const transformedPrograms = response.data.map(program => ({
          ...program,
          threeMonthsSubscribers: program.subscriptionMetrics?.find(m => m.duration === 3)?.activeSubscribers || 0,
          sixMonthsSubscribers: program.subscriptionMetrics?.find(m => m.duration === 6)?.activeSubscribers || 0,
          twelveMonthsSubscribers: program.subscriptionMetrics?.find(m => m.duration === 12)?.activeSubscribers || 0
        }));
        setPrograms(transformedPrograms);
      } catch (err) {
        setError(err.message || "Failed to fetch programs");
        console.error("Error fetching programs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleViewProgram = (programId) => {
    navigate(`/doctor/programs/${programId}`);
  };

  const handleViewMembers = (programId) => {
    navigate(`/doctor/programs/${programId}/members`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Programs</h1>
        <div className="text-sm text-gray-600">
          Total Programs: {programs.length}
        </div>
      </div>

      {programs.length === 0 ? (
        <div className="bg-blue-50 p-6 rounded-lg flex items-center">
          <FaInfoCircle className="text-blue-500 mr-3 text-xl" />
          <p>You don't have any programs assigned yet. Please contact the administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div key={program._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-50 p-4 border-b">
                <h2 className="text-xl font-bold text-gray-900">{program.name}</h2>
                <p className="text-gray-600 text-sm mt-1">{program.domain}</p>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Active Members</p>
                    <p className="text-xl font-bold text-gray-900">{program.activeSubscribers}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Total Members</p>
                    <p className="text-xl font-bold text-gray-900">{program.totalSubscribers}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Current Earnings</p>
                    <div className="flex items-center justify-center">
                      <FaRupeeSign className="text-gray-600 text-sm" />
                      <p className="text-xl font-bold text-gray-900">{program.currentEarnings}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Total Earnings</p>
                    <div className="flex items-center justify-center">
                      <FaRupeeSign className="text-gray-600 text-sm" />
                      <p className="text-xl font-bold text-gray-900">{program.totalEarnings}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>3 Months Members</span>
                    <span className="font-medium">{program.threeMonthsSubscribers}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>6 Months Members</span>
                    <span className="font-medium">{program.sixMonthsSubscribers}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>12 Months Members</span>
                    <span className="font-medium">{program.twelveMonthsSubscribers}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button 
                    onClick={() => handleViewProgram(program._id)}
                    className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Program Details
                  </button>
                  <button 
                    onClick={() => handleViewMembers(program._id)}
                    className="py-2 px-4 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors flex items-center justify-center"
                  >
                    <FaUsers className="mr-2" /> View Members
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Programs; 