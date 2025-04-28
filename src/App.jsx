import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/login/Login";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Admin from "./pages/adminDashboard/Admin";
import Doctors from "./pages/adminDashboard/Doctors";
import Patients from "./pages/adminDashboard/Patients";
import Programs from "./pages/adminDashboard/Programs";
import AddDoctor from "./pages/adminDashboard/AddDoctor";
import AddPatient from "./pages/adminDashboard/AddPatient";
import AssignPatient from "./pages/adminDashboard/AssignPatient";
import Profile from "./pages/doctorDashboard/Profile";
import DoctorPatients from "./pages/adminDashboard/DoctorPatients";
import DoctorPrograms from "./pages/doctorDashboard/Programs";
import Earnings from "./pages/doctorDashboard/Earnings";
import Membership from "./pages/doctorDashboard/Membership";
import User from "./pages/userDashboard/User";
import UserProfile from "./pages/userDashboard/UserProfile";
import UserLeaderboard from "./pages/userDashboard/UserLeaderboard";
import "./App.css";

// Import dashboard layouts
import AdminDashboardLayout from "./components/layout/AdminDashboardLayout";
import DoctorDashboardLayout from "./components/layout/DoctorDashboardLayout";
import PatientDashboardLayout from "./components/layout/PatientDashboardLayout";
import PatientData from "./pages/adminDashboard/PatientData";

import AssignedPatients from "./pages/doctorDashboard/AssignedPatients";
import AddProgram from "./pages/adminDashboard/AddProgram";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProgramProvider } from "./context/ProgramContext";
import { ServerStatusProvider } from "./context/ServerStatusContext"

// Protected route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <ProgramProvider>
        <ServerStatusProvider>
          <Router>
            <ToastContainer
              className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50"
              autoClose={1000}
            />
            <Routes>
              {/* Default route redirects to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/unauthorized"
                element={
                  <div>You don't have permission to access this page</div>
                }
              />

              {/* Change password route (protected) */}
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Admin />} />
                <Route path="doctors" element={<Doctors />} />
                <Route
                  path="doctor/:doctorId/patients"
                  element={<DoctorPatients />}
                />
                <Route path="patients" element={<Patients />} />
                <Route path="patients/:patientId" element={<PatientData />} />
                <Route path="addDoctor" element={<AddDoctor />} />
                <Route path="addPatient" element={<AddPatient />} />
                <Route path="assign-patient" element={<AssignPatient />} />
                <Route path="programs" element={<Programs />} />
                <Route path="addProgram" element={<AddProgram />} />
                {/*<Route path="programs/edit/:id" element={<div>Edit Program Page</div>} />*/}
              </Route>

              {/* Patient routes */}
              <Route
                path="/patient"
                element={<Navigate to="/patient/dashboard" replace />}
              />
              <Route
                path="/patient/*"
                element={
                  <ProtectedRoute allowedRoles={["patient"]}>
                    <PatientDashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<User />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="leaderboard" element={<UserLeaderboard />} />
                <Route path="programs" element={<Programs />} />
              </Route>

              {/* Doctor Routes */}
              <Route
                path="/doctor"
                element={<Navigate to="/doctor/dashboard" replace />}
              />
              <Route
                path="/doctor/*"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Profile />} />
                <Route path="patients" element={<AssignedPatients />} />
                <Route path="earnings" element={<Earnings />} />
                <Route path="programs" element={<DoctorPrograms />} />
                <Route path="programs/:programId" element={<Membership />} />
                <Route
                  path="programs/:programId/members"
                  element={<Membership />}
                />
              </Route>

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
        </ServerStatusProvider>
      </ProgramProvider>
    </AuthProvider>
  );
}

export default App;
