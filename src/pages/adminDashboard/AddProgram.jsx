// src/pages/adminDashboard/AddProgram.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  apiRequest,
  ENDPOINTS,
  checkBackendStatus,
} from "../../utils/apiRequest";
import { formatErrorMessage, getErrorFeedback } from "../../utils/apiError";
import ServerStatusBanner from "../../components/ServerStatusBanner";

const AddProgram = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    memberships: [
      { duration: "1 month", price: 999 },
      { duration: "3 months", price: 2499 },
      { duration: "6 months", price: 4499 },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [serverStatus, setServerStatus] = useState("unknown");

  // Check server status
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const status = await checkBackendStatus();
        if (status.online) {
          setServerStatus("online");
        } else {
          setServerStatus("offline");
          setError(`Server connectivity issue: ${status.message}`);
        }
      } catch (err) {
        setServerStatus("offline");
      }
    };

    checkServerStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMembershipChange = (index, field, value) => {
    const updatedMemberships = [...formData.memberships];
    updatedMemberships[index][field] = value;
    setFormData({
      ...formData,
      memberships: updatedMemberships,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await apiRequest(
        ENDPOINTS.ADD_PROGRAM,
        "POST",
        formData
      );
      console.log("Program added successfully:", response);
      setSuccess(true);
      setFormData({
        name: "",
        description: "",
        memberships: [
          { duration: "1 month", price: 999 },
          { duration: "3 months", price: 2499 },
          { duration: "6 months", price: 4499 },
        ],
      });
    } catch (err) {
      const errorFeedback = getErrorFeedback(err);
      setError(errorFeedback.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Add New Program</h1>
      <ServerStatusBanner status={serverStatus} error={error} />
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-md">
          Program added successfully!
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
      >
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Program Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <h2 className="text-lg font-semibold mb-2">Membership Options</h2>
        {formData.memberships.map((membership, index) => (
          <div key={index} className="mb-4">
            <div className="flex gap-4">
              {/* Duration */}
              <div className="w-1/2">
                <label className="block text-gray-700 mb-1">Duration *</label>
                <input
                  type="text"
                  value={membership.duration}
                  onChange={(e) =>
                    handleMembershipChange(index, "duration", e.target.value)
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              {/* Price */}
              <div className="w-1/2">
                <label className="block text-gray-700 mb-1">Price *</label>
                <input
                  type="number"
                  value={membership.price}
                  onChange={(e) =>
                    handleMembershipChange(index, "price", e.target.value)
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          {loading ? "Adding..." : "Add Program"}
        </button>
      </form>
    </div>
  );
};

export default AddProgram;
