import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest, ENDPOINTS } from "../../utils/apiRequest";
import { FaUserCircle, FaSearch } from "react-icons/fa";

const DoctorPatients = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch doctor details
        const doctorResponse = await apiRequest(ENDPOINTS.DOCTORS);
        const doctorData = doctorResponse.data.find(d => d._id === doctorId);
        setDoctor(doctorData);

        // Fetch patients
        const patientsResponse = await apiRequest(ENDPOINTS.ADMIN_DOCTOR_PATIENT(doctorId));
        setPatients(patientsResponse.data);
        setFilteredPatients(patientsResponse.data);
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId]);

  useEffect(() => {
    // Filter patients based on search term
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        patient =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.problems.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md m-4">
        <h2 className="font-bold">Error</h2>
        <p>{error}</p>
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          {doctor && (
            <p className="text-gray-600">
              Doctor: {doctor.name} ({doctor.domain})
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/admin/doctors")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back to Doctors
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <div className="text-center p-8 bg-gray-100 rounded-md">
            <p className="text-xl text-gray-600">No patients found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm ? "Try a different search term" : "This doctor has no assigned patients"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <FaUserCircle className="text-4xl text-gray-400" />
                  <div>
                    <h3 className="text-lg font-semibold">{patient.name}</h3>
                    <p className="text-gray-600">{patient.age} years old</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium">{patient.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Program:</span>
                    <span className="font-medium">
                      {patient.selectedProgram?.program?.name || 'Not assigned'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Problems:</h4>
                  <p className="text-gray-800">{patient.problems}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatients; 