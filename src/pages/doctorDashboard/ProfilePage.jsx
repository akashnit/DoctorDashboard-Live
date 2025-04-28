import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Profile from "./Profile";
import Membership from "./Membership";
import { MdNavigateNext } from "react-icons/md";
import {
  FaUser,
  FaUserMd,
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaCog,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [component, setComponent] = useState("profile");

  const handleClick = (compo) => {
    setComponent(compo);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top header */}
      <header className="bg-[#DCEEFF] shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200">
        <h1 className="text-2xl font-extrabold">Doctor Dashboard</h1>
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
                component === "profile" ? "bg-[#1858F9] text-white" : ""
              } hover:bg-blue-50 hover:text-black cursor-pointer rounded-md`}
            >
              <div className="flex items-center justify-between px-4">
                <Link
                  to="/doctor/profile"
                  onClick={() => handleClick("profile")}
                  className="flex items-center"
                >
                  <FaUser className="mr-2" />
                  Profile
                </Link>
                <MdNavigateNext size={20} />
              </div>
            </div>
            <div
              className={`p-2 ${
                component === "patients" ? "bg-[#1858F9] text-white" : ""
              } hover:bg-blue-50 hover:text-black cursor-pointer rounded-md`}
              onClick={() => handleClick("patients")}
            >
              <div className="flex items-center justify-between px-4">
                <Link to="/doctor/patients" className="flex items-center">
                  <FaUsers className="mr-2" />
                  My Patients
                </Link>
                <MdNavigateNext size={20} />
              </div>
            </div>
            <div
              className={`p-2 ${
                component === "earnings" ? "bg-[#1858F9] text-white" : ""
              } hover:bg-blue-50 hover:text-black cursor-pointer rounded-md`}
              onClick={() => handleClick("earnings")}
            >
              <div className="flex items-center justify-between px-4">
                <Link to="/doctor/earnings" className="flex items-center">
                  <FaChartLine className="mr-2" />
                  Earnings
                </Link>
                <MdNavigateNext size={20} />
              </div>
            </div>
            <div
              className={`p-2 ${
                component === "member" ? "bg-[#1858F9] text-white" : ""
              } hover:bg-blue-50 hover:text-black cursor-pointer rounded-md`}
              onClick={() => handleClick("member")}
            >
              <div className="flex items-center justify-between px-4">
                <Link to="/doctor/membership" className="flex items-center">
                  <FaUserMd className="mr-2" />
                  Memberships
                </Link>
                <MdNavigateNext size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {component === "member" ? <Membership /> : <Profile />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
