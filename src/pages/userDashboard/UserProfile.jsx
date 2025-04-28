import React, { useState, useEffect } from "react";
import { MdOutlineContentCopy } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import profile from "../../assets/Group 11.png";
import {
  apiRequest,
  ENDPOINTS,
  checkBackendStatus,
} from "../../utils/apiRequest";
import { getErrorFeedback } from "../../utils/apiError";
import ServerStatusBanner from "../../components/ServerStatusBanner";

const UserProfile = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverStatus, setServerStatus] = useState("unknown");

  useEffect(() => {
    const checkServerConnectionStatus = async () => {
      try {
        const status = await checkBackendStatus();
        if (status.online) {
          setServerStatus("online");
          fetchPatientProfile();
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

  const fetchPatientProfile = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(ENDPOINTS.PATIENT_PROFILE);

      if (response.data) {
        setPatientData(response.data);

        // Fetch referral code
        try {
          const referralResponse = await apiRequest(ENDPOINTS.REFERRAL_CODE);
          if (referralResponse.data && referralResponse.data.referralCode) {
            setReferralCode(referralResponse.data.referralCode);
          }
        } catch (refErr) {
          console.error("Error fetching referral code:", refErr);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching patient profile:", err);
      const errorFeedback = getErrorFeedback(err);
      setError(errorFeedback.message);
      setLoading(false);
    }
  };

  const handleCopyReferral = () => {
    navigator.clipboard
      .writeText(referralCode)
      .then(() => alert("Referral code copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="font-inter px-8 py-8">
      <ServerStatusBanner
        status={serverStatus}
        error={error}
        onRetry={async () => {
          const status = await checkBackendStatus();
          if (status.online) {
            setServerStatus("online");
            fetchPatientProfile();
          }
        }}
      />

      {patientData && (
        <div className="flex min-h-screen gap-8 py-0 pt-8">
          {/* Profile Section */}
          <div className="h-4/6 mr-8 flex items-center rounded-2xl border border-black p-4 flex-col gap-8">
            {/* Profile Header */}
            <div className="flex gap-10 bg-[#DCEEFF] p-4 rounded-3xl max-h-[240px] w-full">
              <img
                src={profile}
                alt=""
                className="h-[200px] w-[200px] rounded-3xl"
              />
              <div className="flex flex-col gap-2 justify-center mt-2 leading-[1.3]">
                <p className="text-[#041FA8] text-3xl font-bold">
                  {patientData.selectedProgram
                    ? patientData.selectedProgram.program.name ||
                      "ASSIGNED PROGRAM"
                    : "NO PROGRAM ASSIGNED"}
                </p>
                <p className="text-[24px] font-medium">Welcome</p>
                <p className="text-3xl font-medium">{patientData.name}</p>
                <p className="font-medium text-[24px] -mt-2">
                  {patientData.occupation || ""}
                </p>
                <p className="text-slate-500">
                  {patientData.city}
                  {patientData.state ? `, ${patientData.state}` : ""}
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="px-12 py-4 text-center flex flex-col gap-2 bg-[#DCEEFF] rounded-md">
                <p className="font-semibold px-4">Your Referrals</p>
                <p className="text-3xl font-bold">
                  {patientData.referrals || 0}
                </p>
              </div>
              <div className="px-12 py-4 text-center flex flex-col gap-2 bg-[#DCEEFF] rounded-md">
                <p className="font-semibold px-6">Your Rank</p>
                <p className="text-3xl font-bold">{patientData.rank || "-"}</p>
              </div>
              <div className="px-4 py-4 text-center flex flex-col gap-2 bg-blue-100 rounded-md">
                <p className="font-semibold px-8">Membership Period</p>
                <p className="text-3xl font-bold">
                  {patientData.selectedProgram
                    ? patientData.selectedProgram.membership?.duration || "-"
                    : "-"}
                </p>
              </div>
              <div className="px-12 py-4 text-center flex flex-col gap-2 bg-blue-100 rounded-md">
                <p className="font-semibold">Program Status</p>
                <p className="text-2xl font-bold">
                  {patientData.selectedProgram
                    ? patientData.selectedProgram.status || "Active"
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="w-[95%] mt-4 flex flex-col gap-2 border border-black p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">
                Profile Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{patientData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium">{patientData.age}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-medium">{patientData.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">State</p>
                    <p className="font-medium">{patientData.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Occupation</p>
                    <p className="font-medium">{patientData.occupation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Problems</p>
                    <p className="font-medium">{patientData.problems}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Medical History</p>
                    <p className="font-medium">{patientData.medicalHistory}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Allergies</p>
                    <p className="font-medium">{patientData.allergies}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Emergency Contact</p>
                  {patientData.emergencyContact ? (
                    <div className="space-y-1">
                      <p className="font-medium">
                        Name: {patientData.emergencyContact.name}
                      </p>
                      <p className="font-medium">
                        Relationship:{" "}
                        {patientData.emergencyContact.relationship}
                      </p>
                      <p className="font-medium">
                        Phone: {patientData.emergencyContact.phone}
                      </p>
                    </div>
                  ) : (
                    <p className="font-medium">No emergency contact provided</p>
                  )}
                </div>
              </div>
            </div>

            {/* Referral Code Section */}
            <div className="w-[95%] mt-4 flex flex-col gap-2 border border-black p-6 rounded-lg">
              <p>
                Share your referral code with friends and family to increase
                your referrals
              </p>
              <div className="flex justify-between gap-4">
                <input
                  type="text"
                  value={referralCode || "Loading referral code..."}
                  readOnly
                  className="border border-black text-md rounded-md w-[80%] p-1"
                />
                <button
                  onClick={handleCopyReferral}
                  className="border bg-blue-500 rounded-md p-2"
                  disabled={!referralCode}
                >
                  <MdOutlineContentCopy size={25} color="white" />
                </button>
              </div>
            </div>

            {/* Doctor Information */}
            {patientData.doctor && (
              <div className="w-[80%] mt-4 flex flex-col gap-2 border border-black p-6 rounded-lg">
                <h3 className="font-semibold text-lg">Your Doctor</h3>
                <p className="text-xl">{patientData.doctor.name}</p>
                <p className="text-md">{patientData.doctor.domain}</p>
                <p className="text-sm text-gray-600">
                  {patientData.doctor.hospital}
                </p>
                <p className="text-sm text-gray-600">
                  {patientData.doctor.city}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
