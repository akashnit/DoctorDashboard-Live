import React, { useState, useEffect } from "react";
import profile from "../../assets/Group 11.png";
import { FaRupeeSign, FaUser, FaUsers, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import { apiRequest, ENDPOINTS } from "../../utils/apiRequest";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorData, setDoctorData] = useState({
    profile: null,
    earnings: null,
    programs: []
  });

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile, earnings, and programs in parallel
        const [profileRes, earningsRes, programsRes] = await Promise.all([
          apiRequest(ENDPOINTS.DOCTOR_PROFILE),
          apiRequest(ENDPOINTS.DOCTOR_EARNINGS),
          apiRequest(ENDPOINTS.DOCTOR_PROGRAMS)
        ]);

        setDoctorData({
          profile: profileRes.data,
          earnings: earningsRes.data,
          programs: programsRes.data
        });
      } catch (err) {
        setError(err.message || "Failed to fetch doctor data");
        console.error("Error fetching doctor data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
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

  const { profile: doctorProfile, earnings, programs } = doctorData;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <img src={profile} alt="Doctor Profile" className="w-32 h-32 rounded-full object-cover" />
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dr. {doctorProfile?.name}</h2>
              <p className="text-lg text-gray-600">{doctorProfile?.domain}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <FaUser className="text-blue-500" />
                <span>{doctorProfile?.yearsOfExperience} years experience</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUsers className="text-blue-500" />
                <span>{earnings?.totalSubscribers || 0}+ patients treated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <FaUsers className="text-blue-500 text-xl" />
            <h3 className="text-gray-600 font-medium">Current Subscribers</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{earnings?.currentSubscribers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <FaChartLine className="text-green-500 text-xl" />
            <h3 className="text-gray-600 font-medium">Monthly Earnings</h3>
          </div>
          <div className="flex items-center">
            <FaRupeeSign className="text-gray-600" />
            <p className="text-3xl font-bold text-gray-900">{earnings?.currentEarnings || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <FaChartLine className="text-purple-500 text-xl" />
            <h3 className="text-gray-600 font-medium">Total Earnings</h3>
          </div>
          <div className="flex items-center">
            <FaRupeeSign className="text-gray-600" />
            <p className="text-3xl font-bold text-gray-900">{earnings?.totalEarnings || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <FaCalendarAlt className="text-orange-500 text-xl" />
            <h3 className="text-gray-600 font-medium">Total Subscribers</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{earnings?.totalSubscribers || 0}</p>
        </div>
      </div>

      {/* Programs Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div key={program._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{program.name}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Active Members</span>
                  <span className="font-medium">{program.activeSubscribers || 0}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>3 Months Members</span>
                  <span className="font-medium">{program.threeMonthsSubscribers || 0}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>6 Months Members</span>
                  <span className="font-medium">{program.sixMonthsSubscribers || 0}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>12 Months Members</span>
                  <span className="font-medium">{program.twelveMonthsSubscribers || 0}</span>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/doctor/programs/${program._id}/members`)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Members
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
