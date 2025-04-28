import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-blue-600">ArogBharat</h2>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-semibold capitalize">{user?.role}</p>
            <p className="text-sm">{user?.name}</p>
          </div>
          
          <nav className="mt-6">
            <ul className="space-y-2">
              <li>
                <a href="#" className="block p-2 rounded hover:bg-blue-50 text-blue-600">
                  Dashboard
                </a>
              </li>
              
              {/* Admin specific links */}
              {user?.role === 'admin' && (
                <>
                  <li>
                    <a href="#" className="block p-2 rounded hover:bg-blue-50">
                      Manage Programs
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block p-2 rounded hover:bg-blue-50">
                      Manage Doctors
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block p-2 rounded hover:bg-blue-50">
                      Manage Patients
                    </a>
                  </li>
                </>
              )}
              
              {/* Doctor specific links */}
              {user?.role === 'doctor' && (
                <>
                  <li>
                    <a href="#" className="block p-2 rounded hover:bg-blue-50">
                      My Programs
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block p-2 rounded hover:bg-blue-50">
                      My Patients
                    </a>
                  </li>
                </>
              )}
              
              {/* Patient specific links */}
              {user?.role === 'patient' && (
                <>
                  <li>
                    <a href="#" className="block p-2 rounded hover:bg-blue-50">
                      Programs
                    </a>
                  </li>
                  <li>
                    <a href="#" className="block p-2 rounded hover:bg-blue-50">
                      My Enrollments
                    </a>
                  </li>
                </>
              )}
              
              <li>
                <a href="#" className="block p-2 rounded hover:bg-blue-50">
                  Profile
                </a>
              </li>
              <li>
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left block p-2 rounded hover:bg-red-50 text-red-600"
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">{user?.role} Dashboard</h1>
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
        
        {/* Content area */}
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 