import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Doctors from "./Doctors";
import Patients from "./Patients";
import Programs from "./Programs";
import { apiRequest, ENDPOINTS } from "../../utils/apiRequest";
import usePagination from "../../hooks/usePagination";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

//import useInfiniteScroll from "../../hooks/useInfiniteScroll";

const Admin = () => {
  const [activeSection, setActiveSection] = useState("doctors");
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalPrograms: 0,
    activePrograms: 0,
    recentPatients: [],
    recentDoctors: [],
    programs: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiRequest(ENDPOINTS.ADMIN_DASHBOARD_STATS);
        console.log(response.data)
        setStats(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard statistics");
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const doctorsPagination = usePagination(stats.recentDoctors, 3);
  const patientsPagination = usePagination(stats.recentPatients, 3);
  const programsPagination = usePagination(stats.programs, 6);

  const renderContent = () => {
    switch (activeSection) {
      case "doctors":
        return <Doctors />;
      case "patients":
        return <Patients />;
      case "programs":
        return <Programs />;
      default:
        return <Doctors />;
    }
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
      <div className="p-4 bg-red-100 text-red-700 rounded-md m-4">
        <h2 className="font-bold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  console.log("Rendering dashboard with stats:", stats);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold mb-2">Total Doctors</h3>
          <p className="text-3xl font-bold">{stats.allStats.totalDoctors}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
          <h3 className="text-lg font-semibold mb-2">Total Patients</h3>
          <p className="text-3xl font-bold">{stats.allStats.totalPatients}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold mb-2">Active Programs</h3>
          <p className="text-3xl font-bold">{stats.allStats.activePrograms}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold mb-2">Total Programs</h3>
          <p className="text-3xl font-bold">{stats.allStats.totalPrograms}</p>
        </div>
      </div>

      {/*<div className="bg-white rounded-lg shadow p-6">
          <div className="flex border-b mb-6">
            <button 
              className={`px-4 py-2 font-medium ${activeSection === 'doctors' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveSection('doctors')}
            >
              Recent Doctors
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeSection === 'patients' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveSection('patients')}
            >
              Recent Patients
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeSection === 'programs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveSection('programs')}
            >
              Active Programs
            </button>
          </div>
          
          {renderContent()}
        </div>*/}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Doctors */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">
            Recent Doctors
          </h2>

          {doctorsPagination.currentData.length > 0 ? (
            doctorsPagination.currentData.map((doctor) => (
              <div key={doctor._id} className="mb-3 border-b pb-2">
                <p className="text-md font-medium">{doctor.name}</p>
                <p className="text-gray-700 text-[10px] font-bold">
                  {Array.isArray(doctor?.qualifications) ? doctor.qualifications.join(", ") : ""}
                </p>
                <p className="text-sm text-gray-600">
                  {doctor.domain} • {doctor.city}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No recent doctors found.</p>
          )}

          <div className="flex justify-between mt-4">
            <button
              onClick={doctorsPagination.prev}
              disabled={doctorsPagination.page === 0}
              className="text-blue-600 disabled:text-gray-400"
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              onClick={doctorsPagination.next}
              disabled={doctorsPagination.page === doctorsPagination.maxPage}
              className="text-blue-600 disabled:text-gray-400"
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">
            Recent Patients
          </h2>

          {patientsPagination.currentData.length > 0 ? (
            patientsPagination.currentData.map((patient) => (
              <div key={patient._id} className="mb-3 border-b pb-2">
                <p className="text-md font-medium">{patient.name}</p>
                <p className="text-sm text-gray-600">
                  Age: {patient.age} • {patient.city}
                </p>
                {patient?.doctor && (
                  <p className="text-sm text-gray-500 italic">
                    Doctor: {patient.doctor?.name}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No recent patients found.</p>
          )}

          <div className="flex justify-between mt-4">
            <button
              onClick={patientsPagination.prev}
              disabled={patientsPagination.page === 0}
              className="text-green-600 disabled:text-gray-400"
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              onClick={patientsPagination.next}
              disabled={patientsPagination.page === patientsPagination.maxPage}
              className="text-green-600 disabled:text-gray-400"
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>
      </div>

      {/* Programs */}
      <div className="grid grid-cols-1 my-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-600">
            Programs
          </h2>

          {programsPagination.currentData.length > 0 ? (
            <div className="flex flex-wrap -mx-2">
              {programsPagination.currentData.map((program) => (
                <div key={program._id} className="mb-3 px-2 w-1/2">
                  <div className="border rounded-lg p-4 bg-gray-100">
                    <p className="text-md font-medium">{program.name}</p>
                    <p className="text-sm text-gray-600">
                      {program.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No programs found.</p>
          )}

          <div className="flex justify-between mt-4">
            <button
              onClick={programsPagination.prev}
              disabled={programsPagination.page === 0}
              className="text-green-600 disabled:text-gray-400"
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              onClick={programsPagination.next}
              disabled={programsPagination.page === programsPagination.maxPage}
              className="text-green-600 disabled:text-gray-400"
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
