import React, { useState, useEffect } from "react";
import user from "../../assets/user.webp";
import { FaRupeeSign } from "react-icons/fa";
import { apiRequest, ENDPOINTS } from "../../utils/apiRequest";
import { useParams } from "react-router-dom";

const Membership = () => {
  const { programId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [programData, setProgramData] = useState({
    program: null,
    members: [],
    stats: null
  });

  useEffect(() => {
    const fetchProgramData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch program details and members in parallel
        const [programRes, membersRes] = await Promise.all([
          apiRequest(`${ENDPOINTS.DOCTOR_PROGRAMS}/${programId}`),
          apiRequest(`${ENDPOINTS.DOCTOR_PROGRAMS}/${programId}/members`)
        ]);

        setProgramData({
          program: programRes.data,
          members: membersRes.data,
          stats: {
            currentSubscribers: programRes.data.activeSubscribers || 0,
            totalEarnings: programRes.data.totalEarnings || 0,
            totalSubscribers: programRes.data.totalSubscribers || 0
          }
        });
      } catch (err) {
        setError(err.message || "Failed to fetch program data");
        console.error("Error fetching program data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (programId) {
      fetchProgramData();
    }
  }, [programId]);

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

  const { program, members, stats } = programData;

  return (
    <div className="font-Inter flex flex-col gap-8 py-4 px-8 w-full justify-center font-inter items-center pt-12">
      <div className="text-3xl font-bold font-inter">{program?.name}</div>
      <div className="flex gap-12 font-comfortaa">
        {program?.membershipDurations?.map((duration) => (
          <div key={duration.duration} className="shadow-md font-bold px-4 py-2 rounded-sm hover:bg-[#4FAAFF]">
            <p className="font-bold text-xl">{duration.duration} month Membership</p>
            <div className="flex justify-center items-center">
              <FaRupeeSign size={20} />
              <p className="font-extrabold text-xl">{duration.price}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="px-12 py-4 text-center flex flex-col gap-2 bg-[#DCEEFF] rounded-md">
          <p className="font-medium">Current Subscribers</p>
          <p className="text-3xl font-extrabold">{stats.currentSubscribers}</p>
        </div>
        <div className="px-4 py-4 items-center flex flex-col gap-2 bg-blue-100 rounded-md">
          <p className="font-medium px-12 text-center">Monthly Earnings</p>
          <div className="flex items-center">
            <FaRupeeSign size={25} />
            <p className="text-3xl font-extrabold">{program?.currentEarnings || 0}</p>
          </div>
        </div>
        <div className="px-4 py-4 items-center flex flex-col gap-2 bg-blue-100 rounded-md">
          <p className="font-medium px-12 text-center">Total Earnings</p>
          <div className="flex items-center">
            <FaRupeeSign size={25} />
            <p className="text-3xl font-extrabold">{stats.totalEarnings}</p>
          </div>
        </div>
        <div className="px-12 py-4 text-center flex flex-col gap-2 bg-blue-100 rounded-md">
          <p className="font-medium text-center">Total Subscribers</p>
          <p className="text-3xl font-extrabold">{stats.totalSubscribers}</p>
        </div>
      </div>
      {/* joined members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((member) => (
          <div key={member._id} className="flex flex-col gap-8 border justify-start border-black p-2 rounded-md">
            <div className="flex jsutify-center items-center gap-8">
              <div>
                <img src={user} alt="" className="w-[80px]" />
              </div>
              <div className="font-semibold">
                <p className="text-xl">{member.name}</p>
                <p className="text-md">{member.occupation}</p>
                <p className="text-md">{member.city}, {member.state}</p>
              </div>
            </div>
            <div>
              <div className="flex gap-4 justify-between">
                <p>Current Status</p>
                <p className={`rounded-3xl px-4 py-0 ${
                  member.status === 'active' ? 'bg-[#BCFF92]' : 'bg-[#FF9292]'
                }`}>
                  {member.status === 'active' ? 'Active' : 'Not Active'}
                </p>
              </div>
              <div className="flex justify-between">
                <p>Age</p>
                <p className="font-semibold">{member.age}</p>
              </div>
              <div className="flex justify-between">
                <p>Major Problem</p>
                <p className="font-semibold">{member.problems}</p>
              </div>
              <div className="flex justify-between">
                <p>Start Date</p>
                <p className="font-semibold">
                  {new Date(member.startDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Membership;
