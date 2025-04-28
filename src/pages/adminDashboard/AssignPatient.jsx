import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, ENDPOINTS, checkBackendStatus } from '../../utils/apiRequest';
import { getErrorFeedback } from '../../utils/apiError';
import ServerStatusBanner from "../../components/ServerStatusBanner";

const AssignPatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [serverStatus, setServerStatus] = useState("unknown");
  const [successData, setSuccessData] = useState(null);
  
  // Data state
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    programId: "",
    membership: {
      duration: "3 months",
      price: 0
    }
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  
  // Check server status on mount
  useEffect(() => {
    const checkServerConnectionStatus = async () => {
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
    
    checkServerConnectionStatus();
  }, []);
  
  // Fetch data when server is online
  useEffect(() => {
    if (serverStatus === "online") {
      fetchData();
    }
  }, [serverStatus]);
  
  const fetchData = async () => {
    setLoadingOptions(true);
    setError("");
    
    try {
      // Fetch patients, doctors, and programs in parallel
      const [patientsRes, doctorsRes, programsRes] = await Promise.all([
        apiRequest(ENDPOINTS.PATIENTS),
        apiRequest(ENDPOINTS.DOCTORS),
        apiRequest(ENDPOINTS.PROGRAMS)
      ]);
      
      setPatients(patientsRes.data || []);
      setDoctors(doctorsRes.data || []);
      setPrograms(programsRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      const errorFeedback = getErrorFeedback(err);
      setError(errorFeedback.message);
    } finally {
      setLoadingOptions(false);
    }
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "doctorId") {
      // Reset program selection when doctor changes
      setFormData({
        ...formData,
        doctorId: value,
        programId: "",
        membership: {
          duration: "3 months",
          price: 0
        }
      });
    } else if (name === "programId") {
      // Find the program to get default price and membership details
      const selectedProgram = programs.find(p => p._id === value);
      const defaultPrice = selectedProgram?.membership?.price || 0; // Fetch price from membership details
      
      setFormData({
        ...formData,
        programId: value,
        membership: {
          duration: selectedProgram?.membership?.duration || "3 months", // Fetch duration from membership details
          price: defaultPrice
        }
      });
    } else if (name === "duration" || name === "price") {
      // Handle membership fields
      setFormData({
        ...formData,
        membership: {
          ...formData.membership,
          [name]: name === "price" ? parseFloat(value) : value
        }
      });
    } else {
      // Handle other fields
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear related error
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patientId) {
      newErrors.patientId = "Please select a patient";
    }
    
    if (!formData.doctorId) {
      newErrors.doctorId = "Please select a doctor";
    }
    
    // Program is optional, but if selected, needs valid membership
    if (formData.programId) {
      if (!formData.membership.duration) {
        newErrors.duration = "Please select a membership duration";
      }
      
      if (!formData.membership.price || formData.membership.price <= 0) {
        newErrors.price = "Please enter a valid price";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess(false);
    
    try {
      // Prepare payload - only include program data if a program is selected
      const payload = {
        patientId: formData.patientId,
        doctorId: formData.doctorId
      };
      
      if (formData.programId) {
        payload.programId = formData.programId;
        payload.membership = formData.membership;
      }
      
      // Make API call
      const result = await apiRequest(
        ENDPOINTS.ASSIGN_PATIENT_TO_DOCTOR,
        'POST',
        payload
      );
      
      console.log("Assignment successful:", result);
      setSuccess(true);
      setSuccessData(result.data);
      
      // Reset form
      setFormData({
        patientId: "",
        doctorId: "",
        programId: "",
        membership: {
          duration: "3 months",
          price: 0
        }
      });
    } catch (err) {
      console.error("Error assigning patient:", err);
      const errorFeedback = getErrorFeedback(err);
      setError(errorFeedback.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Filter available programs based on selected doctor
  const getAvailablePrograms = () => {
    if (!formData.doctorId) return [];
    
    const selectedDoctor = doctors.find(d => d._id === formData.doctorId);
    if (!selectedDoctor || !selectedDoctor.assignedPrograms) return [];
    
    // Get program IDs assigned to the doctor
    const assignedProgramIds = selectedDoctor.assignedPrograms.map(p => 
      typeof p === 'object' ? p.program : p
    );
    
    // Filter programs available for this doctor
    return programs.filter(program => 
      assignedProgramIds.includes(program._id) && program.membership
    );
  };
  
  // Get patient display info
  const getPatientInfo = (patientId) => {
    const patient = patients.find(p => p._id === patientId);
    if (!patient) return null;
    
    return {
      name: patient.name,
      age: patient.age,
      problems: patient.problems,
      currentDoctor: patient.doctor ? 
        (typeof patient.doctor === 'object' ? patient.doctor.name : 'Assigned') : 
        'None'
    };
  };
  
  // Find patient by ID
  const getSelectedPatient = () => {
    return patients.find(p => p._id === formData.patientId);
  };
  
  // Handle back to list
  const handleBack = () => {
    navigate("/admin/patients");
  };
  
  if (loadingOptions && serverStatus === "online") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-3xl font-bold">Assign Patient to Doctor</h1>
      </div>

      <ServerStatusBanner 
        status={serverStatus} 
        error={error} 
        onRetry={async () => {
          const status = await checkBackendStatus();
          if (status.online) {
            setServerStatus("online");
            fetchData();
          }
        }} 
      />
      
      {error && !submitting && serverStatus !== "offline" && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Success message */}
      {success && successData && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
          <h2 className="font-bold text-xl mb-2">Assignment Successful!</h2>
          <div className="p-3 bg-white rounded-md mb-3">
            <p><strong>Patient:</strong> {successData.patient?.name}</p>
            <p><strong>Doctor:</strong> {successData.doctor?.name}</p>
            {successData.patient?.selectedProgram?.program && (
              <p><strong>Program:</strong> {
                typeof successData.patient.selectedProgram.program === 'object' 
                  ? successData.patient.selectedProgram.program.name 
                  : 'Assigned Program'
              }</p>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleBack}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
            >
              Back to Patients
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setSuccessData(null);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Make Another Assignment
            </button>
          </div>
        </div>
      )}
      
      {/* Assignment Form */}
      {!success && (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          {/* Patient Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="patientId">
              Select Patient *
            </label>
            <select
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.patientId ? 'border-red-500' : 'border-gray-300'}`}
              disabled={submitting}
            >
              <option value="">-- Select a Patient --</option>
              {patients.map(patient => (
                <option key={patient._id} value={patient._id}>
                  {patient.name} ({patient.age} yrs) - {
                    patient.doctor 
                      ? `Currently assigned to ${typeof patient.doctor === 'object' ? patient.doctor.name : 'a doctor'}` 
                      : 'Not assigned'
                  }
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>
            )}
            
            {/* Selected Patient Details */}
            {formData.patientId && getSelectedPatient() && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <h3 className="font-medium">Patient Details:</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <p><strong>Name:</strong> {getSelectedPatient().name}</p>
                  <p><strong>Age:</strong> {getSelectedPatient().age} years</p>
                  <p><strong>Problems:</strong> {getSelectedPatient().problems}</p>
                  <p><strong>City:</strong> {getSelectedPatient().city}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Doctor Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="doctorId">
              Select Doctor *
            </label>
            <select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.doctorId ? 'border-red-500' : 'border-gray-300'}`}
              disabled={submitting}
            >
              <option value="">-- Select a Doctor --</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.domain} ({doctor.city})
                </option>
              ))}
            </select>
            {errors.doctorId && (
              <p className="text-red-500 text-sm mt-1">{errors.doctorId}</p>
            )}
          </div>
          
          {/* Program Selection */}
          {formData.doctorId && (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="programId">
                Select Program *
              </label>
              <select
                id="programId"
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={submitting || getAvailablePrograms().length === 0}
              >
                <option value="">-- No Program / Keep Current --</option>
                {getAvailablePrograms().map(program => (
                  <option key={program._id} value={program._id}>
                    {program.name}
                  </option>
                ))}
              </select>
              {getAvailablePrograms().length === 0 && (
                <p className="text-amber-500 text-sm mt-1">This doctor has no programs assigned.</p>
              )}
            </div>
          )}
          
          {/* Membership details (if program selected) */}
          {formData.programId && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-3">Membership Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="duration">
                    Duration *
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.membership.duration}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={submitting}
                  >
                    <option value="1 month">1 Month</option>
                    <option value="3 months">3 Months</option>
                    <option value="6 months">6 Months</option>
                  </select>
                  {errors.duration && (
                    <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2" htmlFor="price">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.membership.price}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={submitting}
                    min="0"
                    step="100"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || serverStatus === "offline"}
              className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition ${
                (submitting || serverStatus === "offline") ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Assigning...' : 'Assign Patient'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AssignPatient; 