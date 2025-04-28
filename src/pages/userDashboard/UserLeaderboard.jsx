import React, { useState, useEffect } from "react";
import cooker from "../../assets/cooker.png";
import { apiRequest, ENDPOINTS, checkBackendStatus } from '../../utils/apiRequest';
import { getErrorFeedback } from '../../utils/apiError';
import ServerStatusBanner from "../../components/ServerStatusBanner";

const UserLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [rewardsData, setRewardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState("unknown");

  useEffect(() => {
    const checkServerConnectionStatus = async () => {
      try {
        const status = await checkBackendStatus();
        if (status.online) {
          setServerStatus("online");
          fetchLeaderboardData();
          fetchRewardsData();
        } else {
          console.error("Backend server issue:", status.message);
          setServerStatus("offline");
          setError(`Server connectivity issue: ${status.message}`);
        }
      } catch (err) {
        console.error("Server status check failed:", err);
        setServerStatus("offline");
      }
    };

    checkServerConnectionStatus();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(ENDPOINTS.LEADERBOARD);
      
      if (response.data) {
        setLeaderboardData(response.data.slice(0, 10)); // Get top 10 entries
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching leaderboard data:", err);
      const errorFeedback = getErrorFeedback(err);
      setError(errorFeedback.message);
      setLoading(false);
    }
  };

  const fetchRewardsData = async () => {
    try {
      const response = await apiRequest(ENDPOINTS.REWARDS);
      
      if (response.data) {
        setRewardsData(response.data.slice(0, 3)); // Top 3 rewards
      }
    } catch (err) {
      console.error("Error fetching rewards data:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no real data, use placeholder data
  const topRewards = rewardsData.length > 0 ? rewardsData : [
    { rank: 1, name: "Premium Health Package", image: cooker },
    { rank: 2, name: "Health Monitoring Device", image: cooker },
    { rank: 3, name: "Wellness Gift Box", image: cooker }
  ];

  return (
    <div className="pt-8 flex flex-col gap-4">
      <ServerStatusBanner 
        status={serverStatus} 
        error={error} 
        onRetry={async () => {
          const status = await checkBackendStatus();
          if (status.online) {
            setServerStatus("online");
            fetchLeaderboardData();
            fetchRewardsData();
          }
        }} 
      />

      <h1 className="text-3xl text-center mb-20 font-extrabold">Rewards</h1>
      <div className="flex gap-4 px-12 py-8 border-b-2 border-black mx-8">
        {topRewards.map((reward, index) => {
          // Determine the layout based on position
          const isFirst = reward.rank === 1;
          const positionClass = isFirst ? "" : "mt-8";
          const topClass = isFirst ? "-top-24" : "-top-20";
          const textSizeClass = isFirst ? "text-7xl mb-2" : "text-5xl mb-4";
          
          return (
            <div key={index} className={`flex flex-col ${positionClass} relative border border-blue-500 p-8 rounded-xl justify-center items-center`}>
              <div className="p-4 border flex flex-col justify-center items-centerl border-black rounded-lg">
                <img 
                  src={reward.image || cooker} 
                  alt={reward.name} 
                  className="w-[200px]" 
                />
                <p className="text-xl font-semibold text-center">{reward.name}</p>
              </div>
              <div className={`absolute ${topClass} bg-white text-2xl px-2 left-24 flex flex-col justify-center items-center`}>
                <p className={`${textSizeClass} font-bold`}>{reward.rank}</p>
                <p>Place</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 px-12 my-4">
        <h1 className="text-3xl text-center font-bold">LeaderBoard</h1>
        <div className="flex font-medium rounded-lg border border-black p-2">
          <p className="w-[10%]">Position</p>
          <p className="w-[30%]">Name</p>
          <p className="w-[60%] text-right mr-4">Referrals</p>
        </div>
        
        {leaderboardData.length > 0 ? (
          leaderboardData.map((entry, index) => (
            <div key={index} className="flex gap-8 border font-medium border-black hover:border-blue-400 hover:bg-blue-100 p-2 rounded-lg items-center">
              <p className="bg-blue-100 rounded-full px-4 py-2">{index + 1}</p>
              <div>
                <p className="w-[30%]">{entry.name}</p>
                <p className="w-[30%]">{entry.city}{entry.state ? `, ${entry.state}` : ""}</p>
              </div>
              <p className="w-[80%] font-bold text-xl flex justify-end text-end mr-2">
                {entry.referrals}
              </p>
            </div>
          ))
        ) : (
          <>
            <div className="flex gap-8 border font-medium border-black hover:border-blue-400 hover:bg-blue-100 p-2 rounded-lg items-center">
              <p className="bg-blue-100 rounded-full px-4 py-2">1</p>
              <div>
                <p className="w-[30%]">Aarav Kumar</p>
                <p className="w-[30%]">Delhi, India</p>
              </div>
              <p className="w-[80%] font-bold text-xl flex justify-end text-end mr-2">
                23
              </p>
            </div>
            <div className="flex gap-8 border font-medium border-black hover:border-blue-400 hover:bg-blue-100 p-2 rounded-lg items-center">
              <p className="bg-blue-100 rounded-full px-4 py-2">2</p>
              <div>
                <p className="w-[30%]">Priya Singh</p>
                <p className="w-[30%]">Mumbai, Maharashtra</p>
              </div>
              <p className="w-[80%] font-bold text-xl flex justify-end text-end mr-2">
                19
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserLeaderboard;
