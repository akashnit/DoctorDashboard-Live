import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FooterLogo from "../../assets/footerLogo.webp";

// WhatsApp configuration
const ADMIN_PHONE = "919876543210"; // Replace with actual admin phone number with country code
const DEFAULT_MESSAGE = "Hello, I would like to register for ArogBharat. Please help me with the registration process.";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStatus, setResetStatus] = useState({ message: "", type: "" });
  
  const navigate = useNavigate();
  const { login, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("Attempting login with:", { username, password: "********" });

    try {
      const userData = await login({ username, password });
      console.log("Login successful, userData:", userData);

      // Determine where to redirect based on role
      let redirectPath;
      switch (userData.user?.role) {
        case "admin":
          redirectPath = "/admin";
          break;
        case "doctor":
          redirectPath = "/doctor/dashboard";
          break;
        case "patient":
          redirectPath = "/patient/dashboard";
          break;
        default:
          redirectPath = userData.dashboardUrl || "/dashboard";
      }

      console.log("Redirecting to:", redirectPath);
      navigate(redirectPath);
    } catch (err) {
      console.error("Login error details:", err);

      if (err.message === "Failed to fetch") {
        setError(
          "Connection error: Please ensure the server is running and CORS is properly configured."
        );
      } else if (err.response && err.response.data) {
        setError(
          err.response.data.message || "Login failed. Please try again."
        );
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppLink = () => {
    const encodedMessage = encodeURIComponent(DEFAULT_MESSAGE);
    return `https://wa.me/${ADMIN_PHONE}?text=${encodedMessage}`;
  };

  const handleResetPasswordRequest = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      setResetStatus({
        message: "Please enter your email address",
        type: "error"
      });
      return;
    }
    
    try {
      setResetStatus({ message: "Processing your request...", type: "info" });
      await resetPassword(resetEmail);
      setResetStatus({
        message: "Password reset link has been sent to your email",
        type: "success"
      });
      
      // Clear the form after successful submission
      setResetEmail("");
      
      // Automatically close the modal after 3 seconds on success
      setTimeout(() => {
        setIsResetModalOpen(false);
        setResetStatus({ message: "", type: "" });
      }, 3000);
      
    } catch (error) {
      setResetStatus({
        message: error.message || "Failed to send reset link. Please try again.",
        type: "error"
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden flex">
        {/* Left side - Login form */}
        <div className="w-full md:w-1/2 px-8 py-12">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Welcome to ArogBharat
          </h1>
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Username or Email
                </label>
                <input
                  type="text"
                  placeholder="Enter username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-end text-sm">
                <button 
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1858F9] text-white rounded-md hover:bg-[#1450e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <div className="text-center text-sm text-gray-600">
                Not registered yet?{" "}
                <a 
                  href={getWhatsAppLink()} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Contact the administrator
                </a>
              </div>
            </form>
          </div>
        </div>
        
        {/* Separator Line */}
        <div className="hidden md:block w-px bg-gray-200 self-stretch"></div>
        
        {/* Right side - Logo */}
        <div className="hidden md:flex md:w-1/2 bg-[#f8fafc] items-center justify-center p-12">
          <div className="flex flex-col items-center justify-center">
            <img
              src={FooterLogo}
              alt="ArogBharat Logo"
              className="max-w-[80%] h-auto"
            />
            <p className="mt-8 text-lg text-center text-gray-600">
              Your Wellness Journey Begins Here
            </p>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Reset Password</h3>
              <button
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetStatus({ message: "", type: "" });
                  setResetEmail("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleResetPasswordRequest}>
              <p className="mb-4 text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              {resetStatus.message && (
                <div 
                  className={`p-3 mb-4 rounded-md text-sm ${
                    resetStatus.type === 'error' 
                      ? 'bg-red-100 text-red-700' 
                      : resetStatus.type === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {resetStatus.message}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setResetStatus({ message: "", type: "" });
                    setResetEmail("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
