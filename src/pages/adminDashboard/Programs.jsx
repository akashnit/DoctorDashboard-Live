import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  apiRequest,
  ENDPOINTS,
  checkBackendStatus,
  batchRequest,
} from "../../utils/apiRequest";
import { formatErrorMessage, getErrorFeedback } from "../../utils/apiError";
import ServerStatusBanner from "../../components/ServerStatusBanner";
import { useProgramContext } from "../../context/ProgramContext";
import { useServerStatusContext } from "../../context/ServerStatusContext";

const Programs = () => {
  const navigate = useNavigate();
  const {
    programs,
    setPrograms,
    programStats,
    setProgramStats,
    loading,
    setLoading,
    error,
    setError,
    expandedProgram,
    setExpandedProgram,
  } = useProgramContext();

  const { serverStatus, setServerStatus } = useServerStatusContext();

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
  }, [setServerStatus, setError]);

  // Fetch programs
  useEffect(() => {
    if (serverStatus !== "offline") {
      fetchPrograms();
    }
  }, [serverStatus]);

  const fetchPrograms = async () => {
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
      console.log("Fetching programs...");
      const result = await apiRequest(ENDPOINTS.PROGRAMS);
      console.log("Programs fetched successfully:", result);
      setPrograms(result.data || []);

      if (result.data && result.data.length > 0) {
        await fetchProgramStats(result.data);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching programs:", err);

      const errorFeedback = getErrorFeedback(err);

      if (errorFeedback.type === "connection") {
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

  const fetchProgramStats = async (programsList) => {
    try {
      const fetchSingleProgramStats = async (program) => {
        try {
          const statsResult = await apiRequest(
            ENDPOINTS.PROGRAM_STATS(program._id)
          );
          return { programId: program._id, stats: statsResult.data };
        } catch (error) {
          console.error(
            `Error fetching stats for program ${program._id}:`,
            error
          );
          return { programId: program._id, stats: null };
        }
      };

      const allResults = await Promise.all(
        programsList.map(async (program) => {
          try {
            const statsResult = await apiRequest(
              ENDPOINTS.PROGRAM_STATS(program._id)
            );
            return { programId: program._id, stats: statsResult.data };
          } catch (error) {
            console.error(`Error fetching stats for ${program._id}`, error);
            return { programId: program._id, stats: null };
          }
        })
      );
      

      const statsMap = allResults.reduce((acc, result) => {
        if (!result) return acc;
        const { programId, stats } = result;
        acc[programId] = stats || {
          doctorCount: 0,
          patientCounts: {
            total: 0,
            byMembership: [
              { duration: "1 month", count: 0 },
              { duration: "3 months", count: 0 },
              { duration: "6 months", count: 0 },
            ],
          },
        };
        return acc;
      }, {});

      setProgramStats(statsMap);
    } catch (error) {
      console.error("Error fetching program statistics:", error);
    }
  };

  const handleProgramClick = (programId) => {
    if (expandedProgram === programId) {
      setExpandedProgram(null);
    } else {
      setExpandedProgram(programId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Programs Management</h1>
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/admin/addProgram")}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
          >
            Add New Program
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
            fetchPrograms();
          }
        }}
      />

      {error && !loading && serverStatus !== "offline" && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md m-4">
          <h2 className="font-bold">Error</h2>
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-hidden shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
            <tr>
              <th className="py-3 px-6 text-left">Program Name</th>
              <th className="py-3 px-6 text-center">Total Doctors</th>
              <th className="py-3 px-6 text-center">Total Patients</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {programs.map((program) => {
              const stats = programStats[program._id] || {
                doctorCount: 0,
                patientCounts: { total: 0 },
              };

              return (
                <React.Fragment key={program._id}>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">
                      <div className="font-medium">{program.name}</div>
                    </td>
                    <td className="py-3 px-6 text-center">
                      {stats.doctorCount || 0}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {stats.patientCounts?.total || 0}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleProgramClick(program._id)}
                          className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs"
                        >
                          {expandedProgram === program._id
                            ? "Hide Details"
                            : "View Details"}
                        </button>
                        {/*<button
                          onClick={() =>
                            navigate(`/admin/programs/edit/${program._id}`)
                          }
                          className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-xs"
                        >
                          Edit
                        </button>
                        */}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded details row */}
                  {expandedProgram === program._id && (
                    <tr>
                      <td colSpan="4" className="py-3 px-6 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-md shadow">
                            <h3 className="font-semibold text-lg mb-2">
                              Program Details
                            </h3>
                            <p className="text-sm mb-2">
                              {program.description}
                            </p>
                            <div className="mt-3">
                              <h4 className="font-medium">
                                Membership Options:
                              </h4>
                              <div className="grid grid-cols-3 gap-2 mt-2">
                                {program.memberships.map(
                                  (membership, index) => (
                                    <div
                                      key={index}
                                      className="bg-blue-50 p-2 rounded"
                                    >
                                      <div className="font-medium">
                                        {membership.duration}
                                      </div>
                                      <div className="text-blue-700">
                                        ₹{membership.price.toLocaleString()}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-md shadow">
                            <h3 className="font-semibold text-lg mb-2">
                              Enrollment Statistics
                            </h3>

                            {stats.doctorCount > 0 ? (
                              <div className="mb-3">
                                <h4 className="font-medium">
                                  Doctors providing this program:
                                </h4>
                                <p className="text-2xl font-bold text-blue-600">
                                  {stats.doctorCount}
                                </p>
                              </div>
                            ) : (
                              <div className="mb-3 text-yellow-600">
                                No doctors assigned to this program yet
                              </div>
                            )}

                            <h4 className="font-medium">
                              Patient Enrollments by Membership:
                            </h4>
                            {stats.patientCounts?.byMembership?.length > 0 ? (
                              <div className="mt-2 space-y-2">
                                {stats.patientCounts.byMembership.map(
                                  (item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between items-center"
                                    >
                                      <span className="text-sm">
                                        {item.duration}:
                                      </span>
                                      <span className="font-medium text-green-600">
                                        {item.count} patients
                                      </span>
                                    </div>
                                  )
                                )}
                                <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                                  <span>Total:</span>
                                  <span>
                                    {stats.patientCounts.total} patients
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2 text-gray-500">
                                No patient enrollment data available
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {programs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No programs available. Add a new program to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Programs;
