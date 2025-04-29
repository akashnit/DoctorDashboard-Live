import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Category from "../../data/courses";
import {
  apiRequest,
  ENDPOINTS,
  checkBackendStatus,
} from "../../utils/apiRequest";
import { formatErrorMessage, getErrorFeedback } from "../../utils/apiError";
import ServerStatusBanner from "../../components/ServerStatusBanner";
import { toast } from "react-toastify";
import { qualifications } from "../../../server/models/doctor.models";
import SuccessMessage from "../../components/messages/SuccessMessage";
import AddDoctorForm from "../../components/features/AddDoctorForm";

// Helper function to get the auth token
const getAuthToken = () => {
  // Try to get token from both possible storage keys
  const accessToken = localStorage.getItem("accessToken");
  const token = localStorage.getItem("token");

  // Return the first valid token found
  return accessToken || token;
};

// Function to refresh token if needed
const refreshTokenIfNeeded = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const response = await fetch(
      "http://localhost:8080/api/v1/auth/refresh-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.data && data.data.accessToken) {
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("token", data.data.accessToken);
      if (data.data.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }
      return data.data.accessToken;
    }

    return null;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
};

const AddDoctor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    domain: "",
    yearsOfExperience: "",
    city: "",
    email: "",
    programIds: [], // Allow multiple program assignments
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [dbPrograms, setDbPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [serverStatus, setServerStatus] = useState("unknown"); // unknown, online, offline
  const [fieldErrors, setFieldErrors] = useState({});
  const [formDirty, setFormDirty] = useState(false);
  const [selectedQualifications, setSelectedQualifications] = useState([]);

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
    let error = "";

    switch (name) {
      case "name":
        if (!value) error = "Name is required";
        else if (value.length < 3) error = "Name must be at least 3 characters";
        break;
      case "age":
        if (!value) error = "Age is required";
        else if (parseInt(value) < 18) error = "Age must be at least 18";
        else if (parseInt(value) > 100) error = "Age must be less than 100";
        break;
      case "domain":
        if (!value) error = "Domain/Specialty is required";
        break;
      case "yearsOfExperience":
        if (!value) error = "Years of experience is required";
        else if (parseInt(value) < 0)
          error = "Years of experience cannot be negative";
        else if (parseInt(value) > 70)
          error = "Years of experience seems too high";
        break;
      case "city":
        if (!value) error = "City is required";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Please enter a valid email address";
        break;
      default:
        break;
    }

    return error;
  };

  // Debounced validation function
  const debouncedValidate = useDebounce((name, value) => {
    const error = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
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

  // Log the Category structure for debugging
  useEffect(() => {
    console.log("Category structure:", Category);
    // Check if Category is an array with the expected structure
    if (Array.isArray(Category)) {
      console.log("Category is an array with", Category.length, "items");

      // Log information about each category
      Category.forEach((category, index) => {
        console.log(`Category ${index}:`, {
          name: category.name,
          hasPrograms: Boolean(category.programs),
          programsIsArray: Array.isArray(category.programs),
          programsCount: category.programs ? category.programs.length : 0,
          programsTypes: category.programs
            ? category.programs.map((p) => typeof p)
            : [],
        });
      });
    } else {
      console.warn("Category is not an array:", typeof Category);
    }
  }, []);

  const fetchPrograms = async () => {
    setLoadingPrograms(true);

    if (serverStatus === "offline") {
      setError(
        "Cannot connect to the server. Please ensure the backend server is running."
      );
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

  function getCategoryForProgram(programName) {
    // Check if programName is null, undefined or not a string
    if (!programName || typeof programName !== "string") {
      return "Other"; // Default category for invalid program names
    }

    // First, check if Category is an array
    if (!Array.isArray(Category)) {
      console.warn("Category is not an array:", Category);
      return "Other";
    }

    try {
      // Convert program name to lowercase for case-insensitive comparison
      const lowerProgramName = programName.toLowerCase();

      // Find matching category based on program name
      for (const category of Category) {
        // Check if category has a programs array
        if (!category.programs || !Array.isArray(category.programs)) {
          continue;
        }

        for (const program of category.programs) {
          // Make sure program is a string before calling toLowerCase
          if (typeof program === "string") {
            const lowerProgram = program.toLowerCase();

            // Check if there's a match
            if (
              lowerProgram.includes(lowerProgramName) ||
              lowerProgramName.includes(lowerProgram)
            ) {
              return category.name || "Unknown Category";
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in getCategoryForProgram:", error);
    }

    return "Other"; // Default category if no match or error occurs
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Simply update the form data with the raw input value
    setFormData({
      ...formData,
      [name]: value,
    });

    // Mark form as dirty when values change
    setFormDirty(true);

    // Validate the field
    debouncedValidate(name, value);
  };

  const handleProgramChange = (e) => {
    try {
      const programId = e.target.value;

      if (!programId) {
        // No program selected (e.g., user selected the "Select a program" option)
        return;
      }

      // Check if this program is already selected
      if (formData.programIds.includes(programId)) {
        console.log("Program already selected:", programId);
        return;
      }

      // Find the program from dbPrograms
      const program = dbPrograms.find((p) => p._id === programId);

      // Only add if we found a valid program
      if (program && program._id) {
        // Log the program for debugging
        console.log("Adding program:", program);

        // Add program to selected list
        setSelectedPrograms((prevSelected) => [...prevSelected, program]);

        // Update formData
        setFormData((prevData) => ({
          ...prevData,
          programIds: [...prevData.programIds, programId],
        }));

        // Mark form as dirty
        setFormDirty(true);
      } else {
        console.warn("Selected program not found in dbPrograms:", programId);
      }
    } catch (error) {
      console.error("Error in handleProgramChange:", error);
    }
  };

  const removeProgram = (programId) => {
    setSelectedPrograms(selectedPrograms.filter((p) => p._id !== programId));
    setFormData({
      ...formData,
      programIds: formData.programIds.filter((id) => id !== programId),
    });
    setFormDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Validate all fields
    const errors = {};
    for (const [field, value] of Object.entries(formData)) {
      if (field !== "programIds") {
        const error = validateField(field, value);
        if (error) {
          errors[field] = error;
        }
      }
    }

    // Validate qualifications
    if (selectedQualifications.length === 0) {
      errors.qualifications = "At least one qualification is required.";
    }

    // If there are validation errors, stop submission
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      setError("Please fix all validation errors before submitting");
      return;
    }

    try {
      // Add the doctor with qualifications included
      const doctorResponse = await apiRequest(ENDPOINTS.ADD_DOCTOR, "POST", {
        ...formData,
        qualifications: selectedQualifications,
        programIds: formData.programIds, // Send just the programIds array as expected by the backend
      });

      console.log("Doctor added successfully:", doctorResponse);

      // Show success notification
      toast.success("Doctor added successfully!");

      // Show credentials if returned
      if (doctorResponse.data && doctorResponse.data.credentials) {
        setCredentials({
          email: doctorResponse.data.credentials.email,
          username: doctorResponse.data.credentials.username,
          password: doctorResponse.data.credentials.password,
        });
      }

      setSuccess(true);
      setFormData({
        name: "",
        age: "",
        domain: "",
        yearsOfExperience: "",
        city: "",
        email: "",
        programIds: [],
      });
      setSelectedPrograms([]);
      setSelectedQualifications([]); // Reset selected qualifications
      setFormDirty(false);
    } catch (err) {
      console.error("Error adding doctor:", err);

      const errorFeedback = getErrorFeedback(err);
      setError(errorFeedback.message);

      // Show error notification
      toast.error(`Error adding doctor: ${errorFeedback.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    navigate("/admin/doctors");
  };

  // Add a form submission blocker if form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (formDirty) {
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formDirty]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center items-center mb-6">
        <h1 className="text-3xl font-bold">Add New Doctor</h1>
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
        <SuccessMessage
          credentials={credentials}
          onDone={handleDone}
          onViewAll={() => navigate("/admin/doctors")}
        />
      )}

      {!success && (
        <AddDoctorForm
          formData={formData}
          fieldErrors={fieldErrors}
          handleChange={handleChange}
          handleProgramChange={handleProgramChange}
          selectedQualifications={selectedQualifications}
          setSelectedQualifications={setSelectedQualifications}
          selectedPrograms={selectedPrograms}
          loadingPrograms={loadingPrograms}
          dbPrograms={dbPrograms}
          removeProgram={removeProgram}
          handleSubmit={handleSubmit}
          navigate={navigate}
          loading={loading}
          serverStatus={serverStatus}
          qualifications={qualifications}
        />
      )}
    </div>
  );
};

export default AddDoctor;
