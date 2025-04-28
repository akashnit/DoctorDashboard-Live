import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ENDPOINTS, getAuthToken } from "../../utils/apiRequest";

const User = () => {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(ENDPOINTS.PATIENT_PROFILE, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Fetch error response:", errorText);
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setPatientData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [user.id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="max-w-5xl m-6">
      <h1 className="text-2xl font-bold mb-6">Your Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Patient Information</h2>
        <p className="text-xl font-bold">{patientData.name}</p>
        <p className="text-sm text-gray-600">Doctor: {patientData.doctor?.name || "N/A"}</p>
        <p className="text-sm text-gray-600">Program: {patientData.selectedProgram?.program?.name || "N/A"}</p>
        <p className="text-sm text-gray-600">Description: {patientData.selectedProgram?.program?.description || "N/A"}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Program Status</p>
              <p className="text-xl font-bold text-blue-600">
                {patientData.selectedProgram?.status || "N/A"}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Referrals</p>
              <p className="text-xl font-bold text-green-600">
                {patientData.referrals}
              </p>
            </div>
          </div>
        </div>

        {/*<div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Next Appointment</h2>
          <p className="text-gray-600">No upcoming appointments</p>
          <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
            Schedule Now
          </button>
        </div>*/}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Health Progress Overview</h2>
        <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">
            Health progress chart will appear here
          </p>
        </div>
      </div>
    </div>
  );
};

export default User;
