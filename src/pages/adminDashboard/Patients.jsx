import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import user from "../../assets/user.webp";
import {
  apiRequest,
  ENDPOINTS,
  checkBackendStatus,
} from "../../utils/apiRequest";
import { formatErrorMessage, getErrorFeedback } from "../../utils/apiError";
import ServerStatusBanner from "../../components/ServerStatusBanner";

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState("unknown"); // unknown, online, offline

  // Check server status
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const status = await checkBackendStatus();
        if (status.online) {
          setServerStatus("online");
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

    checkServerStatus();
  }, []);

  // Fetch patients
  useEffect(() => {
    // Attempt to fetch data if server isn't confirmed offline
    if (serverStatus !== "offline") {
      fetchPatients();
    }
  }, [serverStatus]);

  const fetchPatients = async () => {
    if (serverStatus === "offline") {
      setError(
        "Cannot connect to the server. Please ensure the backend server is running."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching patients...");
      const result = await apiRequest(ENDPOINTS.PATIENTS);
      console.log("Patients fetched successfully:", result);
      setPatients(result.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patients:", err);

      const errorFeedback = getErrorFeedback(err);

      if (errorFeedback.type === "connection") {
        // Try checking the backend status again
        const status = await checkBackendStatus();
        if (!status.online) {
          setServerStatus("offline");
          setError(`Server connectivity issue: ${status.message}`);
        } else {
          setError(errorFeedback.message);
        }
      } else {
        setError(errorFeedback.message);
      }

      setLoading(false);
    }
  };

  const handleRemovePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to remove this patient?")) {
      return;
    }

    try {
      await apiRequest(ENDPOINTS.PATIENT_DELETE(patientId), "DELETE");

      // Refresh the patient list
      fetchPatients();
    } catch (err) {
      console.error("Error removing patient:", err);

      const errorFeedback = getErrorFeedback(err);
      alert(`Failed to remove patient: ${errorFeedback.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Patients</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin/assign-patient")}
            className="px-4 py-1.5 bg-green-500 text-white rounded-md"
          >
            Assign to Doctor
          </button>
          <button
            onClick={() => navigate("/admin/addPatient")}
            className="px-4 py-1.5 bg-blue-500 text-white rounded-md"
          >
            Add New Patient
          </button>
        </div>
      </div>

      <ServerStatusBanner
        status={serverStatus}
        error={error}
        onRetry={async () => {
          // Retry connection to server
          const status = await checkBackendStatus();
          if (status.online) {
            setServerStatus("online");
            fetchPatients();
          }
        }}
      />

      {error && !loading && serverStatus !== "offline" && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md m-4">
          <h2 className="font-bold">Error</h2>
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-4 py-8 font-inter mx-4 mt-4">
        {patients.length === 0 ? (
          <div className="text-center p-8 bg-gray-100 rounded-md">
            <p className="text-xl text-gray-600">No patients found</p>
            <p className="text-gray-500 mt-2">
              Add your first patient to get started.
            </p>
            <button
              onClick={() => navigate("/admin/addPatient")}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md"
            >
              Add Patient
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border justify-start p-4 rounded-md">
            {patients.map((patient) => (
              <div
                key={patient._id}
                className="flex flex-col gap-4 border border-black p-3 rounded-lg"
              >
                <div className="flex justify-center items-center gap-2">
                  <div>
                    <img src={user} alt="" className="w-[80px]" />
                  </div>
                  <div>
                    <p className="font-semibold">{patient.name}</p>
                    <p>{patient.occupation || "Not specified"}</p>
                    <p>{patient.city || "Not specified"}</p>
                  </div>
                </div>
                <div>
                  <div className="flex gap-12 justify-between">
                    <p>Status</p>
                    <p className="bg-green-500 rounded-3xl px-4 py-0 text-white">
                      {patient.selectedProgram?.status || "Inactive"}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p>Age</p>
                    <p>{patient.age || "N/A"}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Problems</p>
                    <p>
                      {Array.isArray(patient.problems)
                        ? patient.problems.join(", ")
                        : patient.problems || "Not specified"}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p>Enrollment Date</p>
                    <p>
                      {patient.selectedProgram?.enrollmentDate
                        ? new Date(
                            patient.selectedProgram.enrollmentDate
                          ).toLocaleDateString()
                        : "Not enrolled"}
                    </p>
                  </div>
                  <div className="flex justify-between items-center gap-2 mt-4">
                    <div className="bg-blue-500 rounded-sm px-2 py-1 text-white">
                      <button
                        onClick={() =>
                          navigate(`/admin/patients/${patient._id}`)
                        }
                      >
                        View Details
                      </button>
                    </div>
                    <div className="rounded-sm border-[1.2px] border-blue-500 px-2 py-1 text-blue-500 font-medium">
                      <button onClick={() => handleRemovePatient(patient._id)}>
                        Remove Patient
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;
