import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MdNavigateNext } from "react-icons/md";
import {
  FaUser,
  FaUsers,
  FaChartLine,
  FaUserMd,
  FaLock,
  FaListAlt,
} from "react-icons/fa";

const AdminDashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top header */}
      <header className="bg-[#DCEEFF] shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200">
        <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="bg-[#DCEEFF] w-64 shadow-md flex flex-col">
          <div className="p-4 border-b border-gray-200 text-center">
            <h2 className="text-xl font-semibold text-blue-600">ArogBharat</h2>
          </div>

          <div className="p-4 border-b">
            <div className="mb-2 text-center">
              <p className="text-sm text-gray-500">
                Logged in as{" "}
                <span className="font-semibold capitalize">{user?.role}</span>
              </p>
              <p className="text-sm">{user?.name}</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 p-4">
            <div
              className={`p-2 ${
                isActive("/admin/dashboard") ? "bg-[#1858F9] text-white" : ""
              } hover:bg-blue-50 hover:text-black cursor-pointer rounded-md`}
            >
              <div className="flex items-center justify-between px-4">
                <Link to="/admin/dashboard" className="flex items-center">
                  <FaChartLine className="mr-2" />
                  <span>Dashboard</span>
                </Link>
                <MdNavigateNext size={20} />
              </div>
            </div>
            <div
              className={`p-2 ${
                isActive("/admin/doctors") ? "bg-[#1858F9] text-white" : ""
              } hover:bg-blue-50 hover:text-black cursor-pointer rounded-md`}
            >
              <div className="flex items-center justify-between px-4">
                <Link to="/admin/doctors" className="flex items-center">
                  <FaUserMd className="mr-2" />
                  <span>Doctors</span>
                </Link>
                <MdNavigateNext size={20} />
              </div>
            </div>
            <div
              className={`p-2 ${
                isActive("/admin/patients") ? "bg-[#1858F9] text-white" : ""
              } hover:bg-blue-50 hover:text-black cursor-pointer rounded-md`}
            >
              <div className="flex items-center justify-between px-4">
                <Link to="/admin/patients" className="flex items-center">
                  <FaUsers className="mr-2" />
                  <span>Patients</span>
                </Link>
                <MdNavigateNext size={20} />
              </div>
            </div>
            <div
              className={`p-2 ${
                isActive("/admin/addDoctor") ? "bg-[#1858F9] text-white" : ""
              } hover:bg-blue-50 hover:text-black cursor-pointer rounded-md`}
            >
              <div className="flex items-center justify-between px-4">
                <Link to="/admin/addDoctor" className="flex items-center">
                  <FaUserMd className="mr-2" />
                  <span>Add Doctor</span>
                </Link>
                <MdNavigateNext size={20} />
              </div>
            </div>
            <div
              className={`p-2 ${
                isActive("/admin/addPatient") ? "bg-[#1858F9] text-white" : ""
              } hover:bg-blue-50 hover:text-black cursor-pointer rounded-md`}
            >
              <div className="flex items-center justify-between px-4">
                <Link to="/admin/addPatient" className="flex items-center">
                  <FaUser className="mr-2" />
                  <span>Add Patient</span>
                </Link>
                <MdNavigateNext size={20} />
              </div>
            </div>
            <div
              className={`p-2 ${
                isActive("/admin/assign-patient")
                  ? "bg-[#1858F9] text-white"
                  : ""
              } hover:bg-blue-50 hover:text-black cursor-pointer rounded-md`}
            >
              <div className="flex items-center justify-between px-4">
                <Link to="/admin/assign-patient" className="flex items-center">
                  <FaUser className="mr-2" />
                  <span>Assign Patient</span>
                </Link>
                <MdNavigateNext size={20} />
              </div>
            </div>
            <div
              className={`p-2 ${
                isActive("/admin/programs") ? "bg-[#1858F9] text-white" : ""
              } hover:bg-blue-50 hover:text-black cursor-pointer rounded-md`}
            >
              <div className="flex items-center justify-between px-4">
                <Link to="/admin/programs" className="flex items-center">
                  <FaListAlt className="mr-2" />
                  <span>Programs</span>
                </Link>
                <MdNavigateNext size={20} />
              </div>
            </div>
            <div
              className={`p-2 ${
                isActive("/admin/addProgram") ? "bg-[#1858F9] text-white" : ""
              } hover:bg-blue-50 hover:text-black cursor-pointer rounded-md`}
            >
              <div className="flex items-center justify-between px-4">
                <Link to="/admin/addProgram" className="flex items-center">
                  <FaListAlt className="mr-2" />
                  <span>Add Program</span>
                </Link>
                <MdNavigateNext size={20} />
              </div>
            </div>
          </div>

          {/* Change Password Button at bottom */}
          <div className="p-4 pt-0 mt-auto border-t">
            <button
              onClick={() => navigate("/change-password")}
              className={`w-full p-2 flex items-center justify-between ${
                isActive("/change-password")
                  ? "bg-[#1858F9] text-white"
                  : "bg-blue-50 text-blue-600"
              } hover:bg-blue-100 rounded-md transition-colors`}
            >
              <div className="flex items-center">
                <FaLock className="mr-2" />
                <span className="text-sm">Change Password</span>
              </div>
              <MdNavigateNext size={20} />
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
