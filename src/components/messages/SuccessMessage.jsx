import React from 'react';
import { toast } from 'react-toastify';

const SuccessMessage = ({ credentials, onDone, onViewAll }) => {
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`${text.split(':')[0]} copied to clipboard!`);
  };

  return (
    <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
      <h2 className="font-bold text-xl mb-2">Doctor Added Successfully!</h2>
      <p className="mb-2">
        The doctor account has been created with the following credentials:
      </p>
      <div className="p-3 bg-white rounded-md mb-3 border border-green-200">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold">Login Credentials</p>
          <button
            onClick={() => handleCopy(`Email: ${credentials.email}\nUsername: ${credentials.username}\nPassword: ${credentials.password}`)}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Copy All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center">
            <span className="font-medium mr-2">Email:</span>
            <span className="text-gray-700">{credentials.email}</span>
            <button
              onClick={() => handleCopy(credentials.email)}
              className="ml-2 text-blue-500 hover:text-blue-700"
            >
              Copy
            </button>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Username:</span>
            <span className="text-gray-700">{credentials.username}</span>
            <button
              onClick={() => handleCopy(credentials.username)}
              className="ml-2 text-blue-500 hover:text-blue-700"
            >
              Copy
            </button>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Password:</span>
            <span className="text-gray-700">{credentials.password}</span>
            <button
              onClick={() => handleCopy(credentials.password)}
              className="ml-2 text-blue-500 hover:text-blue-700"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
      <div className="bg-yellow-50 p-3 rounded-md mb-3 border border-yellow-200">
        <p className="text-yellow-800 text-sm">
          <span className="font-bold">Important:</span> Please securely share these credentials with the doctor. They will need to change their password upon first login.
        </p>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={onDone}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
        >
          Done
        </button>
        <button
          onClick={onViewAll}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          View All Doctors
        </button>
      </div>
    </div>
  );
};

export default SuccessMessage;
