import React, { useState, useEffect } from "react";
import { FaRupeeSign, FaUsers, FaChartLine } from "react-icons/fa";
import { apiRequest, ENDPOINTS } from "../../utils/apiRequest";

const Earnings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earnings, setEarnings] = useState({
    currentEarnings: 0,
    totalEarnings: 0,
    currentSubscribers: 0,
    totalSubscribers: 0,
    programEarnings: []
  });
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [earningsResponse, programsResponse] = await Promise.all([
          apiRequest(ENDPOINTS.DOCTOR_EARNINGS),
          apiRequest(ENDPOINTS.DOCTOR_PROGRAMS)
        ]);

        // Transform programs data to include subscription metrics
        const transformedPrograms = programsResponse.data.map(program => ({
          ...program,
          threeMonthsSubscribers: program.subscriptionMetrics?.find(m => m.duration === 3)?.activeSubscribers || 0,
          sixMonthsSubscribers: program.subscriptionMetrics?.find(m => m.duration === 6)?.activeSubscribers || 0,
          twelveMonthsSubscribers: program.subscriptionMetrics?.find(m => m.duration === 12)?.activeSubscribers || 0,
          threeMonthsEarnings: program.subscriptionMetrics?.find(m => m.duration === 3)?.earnings || 0,
          sixMonthsEarnings: program.subscriptionMetrics?.find(m => m.duration === 6)?.earnings || 0,
          twelveMonthsEarnings: program.subscriptionMetrics?.find(m => m.duration === 12)?.earnings || 0
        }));

        setPrograms(transformedPrograms);
        setEarnings(earningsResponse.data);
      } catch (err) {
        setError(err.message || "Failed to fetch earnings data");
        console.error("Error fetching earnings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <h1 className="text-2xl font-bold text-gray-900">Earnings Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaRupeeSign className="text-blue-600 text-2xl mr-3" />
            <div>
              <p className="text-gray-500 text-sm">Current Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{earnings.currentEarnings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaRupeeSign className="text-green-600 text-2xl mr-3" />
            <div>
              <p className="text-gray-500 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">{earnings.totalEarnings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaUsers className="text-purple-600 text-2xl mr-3" />
            <div>
              <p className="text-gray-500 text-sm">Current Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{earnings.currentSubscribers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <FaUsers className="text-orange-600 text-2xl mr-3" />
            <div>
              <p className="text-gray-500 text-sm">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{earnings.totalSubscribers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Program-wise Earnings</h2>
          <div className="space-y-6">
            {programs.map((program) => (
              <div key={program._id} className="border-b last:border-b-0 pb-6 last:pb-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                  <div className="flex items-center">
                    <FaChartLine className="text-blue-600 mr-2" />
                    <span className="text-gray-600">Total: {program.totalEarnings}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">3 Months</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-900 font-medium">{program.threeMonthsSubscribers} members</span>
                      <span className="text-blue-600 font-medium">{program.threeMonthsEarnings}</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">6 Months</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-900 font-medium">{program.sixMonthsSubscribers} members</span>
                      <span className="text-green-600 font-medium">{program.sixMonthsEarnings}</span>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-gray-600 text-sm">12 Months</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-900 font-medium">{program.twelveMonthsSubscribers} members</span>
                      <span className="text-purple-600 font-medium">{program.twelveMonthsEarnings}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings; 