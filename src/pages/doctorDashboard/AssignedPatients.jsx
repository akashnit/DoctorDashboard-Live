import React, { useState, useEffect } from "react";
import { FaUserCircle, FaSearch, FaEdit } from "react-icons/fa";
import { apiRequest, ENDPOINTS } from "../../utils/apiRequest";
import { useParams } from "react-router-dom";

const AssignedPatients = () => {
  const { doctorId } = useParams(); 
   
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    notes: ""
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch patients directly using the doctor's profile endpoint
        const response = await apiRequest(ENDPOINTS.DOCTOR_PATIENTS(doctorId));
        setPatients(response.data);
        setFilteredPatients(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch patients");
        console.error("Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

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

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setStatusUpdate({
      status: patient.status || "active",
      notes: patient.notes || ""
    });
  };

  const handleStatusChange = (e) => {
    setStatusUpdate({
      ...statusUpdate,
      status: e.target.value
    });
  };

  const handleNotesChange = (e) => {
    setStatusUpdate({
      ...statusUpdate,
      notes: e.target.value
    });
  };

  const handleUpdateStatus = async () => {
    if (!selectedPatient) return;

    try {
      setLoading(true);
      const response = await apiRequest(
        ENDPOINTS.UPDATE_PATIENT_STATUS(selectedPatient._id),
        'PUT',
        statusUpdate
      );

      // Update the patient in the list
      const updatedPatients = patients.map(p => 
        p._id === selectedPatient._id 
          ? { ...p, status: statusUpdate.status, notes: statusUpdate.notes }
          : p
      );
      
      setPatients(updatedPatients);
      setFilteredPatients(
        filteredPatients.map(p => 
          p._id === selectedPatient._id 
            ? { ...p, status: statusUpdate.status, notes: statusUpdate.notes }
            : p
        )
      );
      
      setSelectedPatient(null); // Close the edit panel
      
    } catch (err) {
      setError("Failed to update patient status: " + err.message);
      console.error("Error updating patient status:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && patients.length === 0) {
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search patients..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Patient list */}
        <div className={`flex-1 ${selectedPatient ? 'hidden md:block' : ''}`}>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issues
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <FaUserCircle className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.age} years • {patient.city}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.problems}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.selectedProgram?.program?.name || "No program"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${patient.status === 'active' ? 'bg-green-100 text-green-800' : 
                          patient.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                          patient.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'}`}>
                        {patient.status || "active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handlePatientSelect(patient)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Patient details and status update */}
        {selectedPatient && (
          <div className="bg-white rounded-lg shadow-md p-6 w-full md:w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Update Patient Status</h2>
              <button 
                onClick={() => setSelectedPatient(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                <div className="mt-1 text-gray-900">{selectedPatient.name}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Current Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={handleStatusChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={statusUpdate.notes}
                  onChange={handleNotesChange}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Add notes about the patient's progress..."
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleUpdateStatus}
                  disabled={loading}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedPatients; 