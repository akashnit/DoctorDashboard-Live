import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, ENDPOINTS, checkBackendStatus } from '../../utils/apiRequest';
import { formatErrorMessage, getErrorFeedback } from '../../utils/apiError';
import ServerStatusBanner from "../../components/ServerStatusBanner";

const AddPatient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    problems: "",
    city: "",
    email: "",
    medicalHistory: "",
    allergies: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: ""
    },
    selectedProgram: {
      program: "",
      membership: {
        duration: "1 month",
        price: 0
      }
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [dbPrograms, setDbPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [serverStatus, setServerStatus] = useState("unknown"); // unknown, online, offline
  const [fieldErrors, setFieldErrors] = useState({});
  const [formDirty, setFormDirty] = useState(false);
  
  // Custom debounce function
  const useDebounce = (callback, delay) => {
    const timeoutRef = React.useRef(null);
    
    React.useEffect(() => {
      // Cleanup function
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);
    
    return (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  };
  
  // Validate a specific field
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value) error = 'Name is required';
        else if (value.length < 3) error = 'Name must be at least 3 characters';
        break;
      case 'age':
        if (!value) error = 'Age is required';
        else if (parseInt(value) < 1) error = 'Age must be at least 1';
        else if (parseInt(value) > 120) error = 'Age must be less than 120';
        break;
      case 'problems':
        if (!value) error = 'Health problems are required';
        break;
      case 'city':
        if (!value) error = 'City is required';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address';
        break;
      case 'selectedProgram.program':
        if (!value) error = 'Program selection is required';
        break;
      default:
        break;
    }
    
    return error;
  };
  
  // Debounced validation function
  const debouncedValidate = useDebounce((name, value) => {
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, 500);
  
  // Fetch actual programs from database
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        await fetchPrograms();
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch initial program data:", error);
        }
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Check server status
  useEffect(() => {
    let isMounted = true;
    
    const checkServerConnectionStatus = async () => {
      try {
        const status = await checkBackendStatus();
        
        if (!isMounted) return;
        
        if (status.online) {
          setServerStatus("online");
        } else {
          console.error("Backend server issue:", status.message);
          setServerStatus("offline");
          setError(`Server connectivity issue: ${status.message}`);
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error("Server status check failed:", err);
        setServerStatus("offline");
      }
    };
    
    checkServerConnectionStatus();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);
  
  const fetchPrograms = async () => {
    setLoadingPrograms(true);
    
    if (serverStatus === "offline") {
      setError("Cannot connect to the server. Please ensure the backend server is running.");
      setLoadingPrograms(false);
      return;
    }
    
    try {
      const result = await apiRequest(ENDPOINTS.PROGRAMS);
      setDbPrograms(result.data || []);
      setLoadingPrograms(false);
    } catch (err) {
      console.error("Error fetching programs:", err);
      
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
      
      setLoadingPrograms(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects in formData
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Mark form as dirty when values change
    setFormDirty(true);
    
    // Validate the field
    debouncedValidate(name, value);
  };
  
  const handleNestedChange = (parent, child, value) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [child]: value,
      },
    });
    
    // Mark form as dirty
    setFormDirty(true);
    
    // Validate the field if needed
    debouncedValidate(`${parent}.${child}`, value);
  };
  
  const handleEmergencyContactChange = (field, value) => {
    setFormData({
      ...formData,
      emergencyContact: {
        ...formData.emergencyContact,
        [field]: value,
      },
    });
    
    // Mark form as dirty
    setFormDirty(true);
  };
  
  const handleMembershipChange = (field, value) => {
    // Calculate price based on duration
    let price = 0;
    if (field === 'duration') {
      switch (value) {
        case '1 month':
          price = 999;
          break;
        case '3 months':
          price = 2499;
          break;
        case '6 months':
          price = 4499;
          break;
        default:
          price = 0;
      }
    }
    
    setFormData({
      ...formData,
      selectedProgram: {
        ...formData.selectedProgram,
        membership: {
          ...formData.selectedProgram.membership,
          [field]: value,
          ...(field === 'duration' && { price }),
        },
      },
    });
    
    // Mark form as dirty
    setFormDirty(true);
  };
  
  const handleProgramChange = (e) => {
    const programId = e.target.value;
    
    // Update the selected program in the form data
    setFormData({
      ...formData,
      selectedProgram: {
        ...formData.selectedProgram,
        program: programId,
      }
    });
    
    // Mark form as dirty
    setFormDirty(true);
    
    // Validate the field
    debouncedValidate('selectedProgram.program', programId);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    
    // Validate all required fields
    const errors = {};
    const requiredFields = ['name', 'age', 'problems', 'city', 'email', 'selectedProgram.program'];
    
    for (const field of requiredFields) {
      let value;
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        value = formData[parent][child];
      } else {
        value = formData[field];
      }
      
      const error = validateField(field, value);
      if (error) {
        errors[field] = error;
      }
    }
    
    // If there are validation errors, stop submission
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      setError("Please fix all validation errors before submitting");
      return;
    }
    
    // Format allergies as an array
    const allergiesArray = formData.allergies
      ? formData.allergies.split(',').map(item => item.trim())
      : [];
    
    // Prepare the data for API submission
    const patientData = {
      ...formData,
      allergies: allergiesArray,
      // Add any additional transformations needed for the API
    };
    
    try {
      // Add the patient
      const patientResponse = await apiRequest(
        ENDPOINTS.ADD_PATIENT,
        'POST',
        patientData
      );
      
      console.log("Patient added successfully:", patientResponse);
      
      // Show credentials if returned
      if (patientResponse.data && patientResponse.data.password) {
        setCredentials({
          email: formData.email,
          username: patientResponse.data.username,
          password: patientResponse.data.password
        });
      }
      
      setSuccess(true);
      setFormData({
        name: "",
        age: "",
        problems: "",
        city: "",
        email: "",
        medicalHistory: "",
        allergies: "",
        emergencyContact: {
          name: "",
          relationship: "",
          phone: ""
        },
        selectedProgram: {
          program: "",
          membership: {
            duration: "1 month",
            price: 0
          }
        }
      });
      setFormDirty(false);
      
    } catch (err) {
      console.error("Error adding patient:", err);
      
      const errorFeedback = getErrorFeedback(err);
      setError(errorFeedback.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDone = () => {
    navigate('/admin/patients');
  };
  
  // Add a form submission blocker if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (formDirty) {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formDirty]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center items-center mb-6">
      <h1 className="text-3xl font-bold">Add New Patient</h1>
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
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {success && credentials && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
          <h2 className="font-bold text-xl mb-2">Patient Added Successfully!</h2>
          <p className="mb-2">The patient account has been created with the following credentials:</p>
          <div className="p-3 bg-white rounded-md mb-3 border border-green-200">
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold">Login Credentials</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`Email: ${credentials.email}\nUsername: ${credentials.username}\nPassword: ${credentials.password}`);
                  alert('Credentials copied to clipboard!');
                }}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Copy All
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center">
                <span className="font-medium mr-2">Email:</span>
                <span className="text-gray-700">{credentials.email}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(credentials.email);
                    alert('Email copied to clipboard!');
                  }}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Username:</span>
                <span className="text-gray-700">{credentials.username}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(credentials.username);
                    alert('Username copied to clipboard!');
                  }}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Password:</span>
                <span className="text-gray-700">{credentials.password}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(credentials.password);
                    alert('Password copied to clipboard!');
                  }}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-md mb-3 border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              <span className="font-bold">Important:</span> Please securely share these credentials with the patient. 
              They will need to change their password upon first login.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDone}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
            >
              Done
            </button>
            <button
              onClick={() => navigate('/admin/assign-patient')}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Assign to Doctor
            </button>
            <button
              onClick={() => navigate('/admin/patients')}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
            >
              View All Patients
            </button>
          </div>
        </div>
      )}
      
      {!success && (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Basic Information */}
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Patient Name *
              </label>
          <input
            type="text"
                id="name"
            name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter patient's full name"
              />
              {fieldErrors.name && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="age">
                Age *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${fieldErrors.age ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter age"
                min="1"
                max="120"
              />
              {fieldErrors.age && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.age}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="problems">
                Health Problems/Concerns *
              </label>
              <textarea
                id="problems"
                name="problems"
                value={formData.problems}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${fieldErrors.problems ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Describe health problems or concerns"
                rows="3"
              />
              {fieldErrors.problems && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.problems}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="city">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${fieldErrors.city ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="City of residence"
              />
              {fieldErrors.city && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.city}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Email address for login"
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="medicalHistory">
                Medical History
              </label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Past medical conditions, surgeries, etc."
                rows="3"
          />
        </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="allergies">
                Allergies
              </label>
          <input
            type="text"
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Separate allergies with commas"
              />
              <p className="text-sm text-gray-500 mt-1">Enter allergies separated by commas</p>
            </div>
        </div>

          {/* Emergency Contact */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Emergency Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="emergencyName">
                  Contact Name
                </label>
          <input
            type="text"
                  id="emergencyName"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Emergency contact name"
          />
        </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="emergencyRelationship">
                  Relationship
                </label>
          <input
            type="text"
                  id="emergencyRelationship"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Spouse, Parent, Child, etc."
          />
        </div>

              <div>
                <label className="block text-gray-700 mb-2" htmlFor="emergencyPhone">
                  Phone Number
                </label>
          <input
            type="text"
                  id="emergencyPhone"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Emergency contact phone"
          />
        </div>
            </div>
          </div>
          
          {/* Program Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Program Selection</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Select Program *
                </label>
                <select
                  className={`w-full p-2 border rounded-md ${fieldErrors['selectedProgram.program'] ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.selectedProgram.program}
                  onChange={handleProgramChange}
                  disabled={loadingPrograms || dbPrograms.length === 0}
                >
                  <option value="">Select a program</option>
                  {dbPrograms.map((program) => (
                    <option key={program._id} value={program._id}>
                      {program.name}
                    </option>
                  ))}
                </select>
                {loadingPrograms && <span className="ml-2 text-gray-500">Loading programs...</span>}
                {fieldErrors['selectedProgram.program'] && (
                  <p className="text-red-500 text-sm mt-1">{fieldErrors['selectedProgram.program']}</p>
                )}
        </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Membership Duration
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.selectedProgram.membership.duration}
                  onChange={(e) => handleMembershipChange('duration', e.target.value)}
                >
                  <option value="1 month">1 Month (₹999)</option>
                  <option value="3 months">3 Months (₹2,499)</option>
                  <option value="6 months">6 Months (₹4,499)</option>
                </select>
              </div>
            </div>
            
            <p className="text-sm text-blue-600 mt-2">
              <i>Note: The program will be marked as active, but you'll still need to assign a doctor after creating the patient.</i>
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-6">
          <button
            type="button"
              onClick={() => navigate('/admin/patients')}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
            <button
              type="submit"
              disabled={loading || serverStatus === "offline"}
              className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition ${
                (loading || serverStatus === "offline") ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Adding Patient...' : 'Add Patient'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default AddPatient;
