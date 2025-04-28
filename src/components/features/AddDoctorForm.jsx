import React, { useState } from "react";

const AddDoctorForm = ({
  formData,
  fieldErrors,
  handleChange,
  handleProgramChange,
  selectedQualifications,
  setSelectedQualifications,
  selectedPrograms,
  loadingPrograms,
  dbPrograms,
  removeProgram,
  handleSubmit,
  navigate,
  loading,
  serverStatus,
  qualifications,
}) => {
  const [selectedMemberships, setSelectedMemberships] = useState({});

  const handleProgramSelection = (e) => {
    const programId = e.target.value;
    handleProgramChange(e); // Call the existing program change handler

    // Automatically add memberships for the selected program
    const selectedProgram = dbPrograms.find((program) => program._id === programId);
    if (selectedProgram) {
      const memberships = selectedProgram.memberships.map((membership) => ({
        duration: membership.duration,
        price: membership.price,
      }));
      setSelectedMemberships((prev) => ({
        ...prev,
        [programId]: memberships,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="name">
            Doctor Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              fieldErrors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter doctor's full name"
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
            className={`w-full p-2 border rounded-md ${
              fieldErrors.age ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter age"
            min="18"
            max="100"
          />
          {fieldErrors.age && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.age}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2" htmlFor="domain">
            Medical Specialty/Domain *
          </label>
          <input
            type="text"
            id="domain"
            name="domain"
            value={formData.domain}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              fieldErrors.domain ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="E.g., Cardiologist, Neurologist"
          />
          {fieldErrors.domain && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.domain}</p>
          )}
        </div>

        <div>
          <label
            className="block text-gray-700 mb-2"
            htmlFor="yearsOfExperience"
          >
            Years of Experience *
          </label>
          <input
            type="number"
            id="yearsOfExperience"
            name="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              fieldErrors.yearsOfExperience
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Years of professional experience"
            min="0"
          />
          {fieldErrors.yearsOfExperience && (
            <p className="text-red-500 text-sm mt-1">
              {fieldErrors.yearsOfExperience}
            </p>
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
            className={`w-full p-2 border rounded-md ${
              fieldErrors.city ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="City, State (e.g., Bengaluru, Karnataka)"
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
            className={`w-full p-2 border rounded-md ${
              fieldErrors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Email address for login"
          />
          {fieldErrors.email && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Qualifications *</label>
        <div className="flex items-center gap-2">
          <select
            className="p-2 border border-gray-300 rounded-md flex-grow"
            onChange={(e) => {
              const value = e.target.value;
              if (value && !selectedQualifications.includes(value)) {
                setSelectedQualifications((prev) => [...prev, value]);
              }
            }}
            value="" // Reset to default after selection
          >
            <option value="">Select a qualification</option>
            {qualifications
              .filter((q) => !selectedQualifications.includes(q))
              .map((qualification, index) => (
                <option key={index} value={qualification}>
                  {qualification}
                </option>
              ))}
          </select>
        </div>

        {selectedQualifications.length > 0 && (
          <div className="mt-3">
            <h3 className="font-medium mb-2">Selected Qualifications:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedQualifications.map((qualification, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-blue-50 rounded-md"
                >
                  <span className="font-medium">{qualification}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedQualifications((prev) =>
                        prev.filter((q) => q !== qualification)
                      )
                    }
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedQualifications.length === 0 && (
          <p className="text-gray-500 text-sm mt-2">
            Please select at least one qualification.
          </p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Assign Programs</label>
        <div className="flex items-center gap-2">
          <select
            className="p-2 border border-gray-300 rounded-md flex-grow"
            onChange={handleProgramSelection}
            value=""
            disabled={loadingPrograms || dbPrograms.length === 0}
          >
            <option value="">Select a program to assign</option>
            {dbPrograms.map((program) => (
              <option key={program._id} value={program._id}>
                {program.name}
              </option>
            ))}
          </select>
          {loadingPrograms && (
            <span className="ml-2 text-gray-500">Loading programs...</span>
          )}
        </div>

        {selectedPrograms.length > 0 && (
          <div className="mt-3">
            <h3 className="font-medium mb-2">Selected Programs:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedPrograms.map((program) => {
                if (!program || !program._id) {
                  return null; // Skip rendering this program if it's invalid
                }

                return (
                  <div key={program._id} className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                    <div>
                      <span className="font-medium">{program.name}</span>
                      {selectedMemberships[program._id] && (
                        <div>
                          <h4 className="font-semibold">Memberships:</h4>
                          {selectedMemberships[program._id].map((membership, index) => (
                            <div key={index}>
                              <span>{membership.duration} - ${membership.price}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProgram(program._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {formData.programIds.length === 0 && (
          <p className="text-gray-500 text-sm mt-2">
            No programs assigned yet. Assign at least one program to the doctor.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={() => navigate("/admin/doctors")}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || serverStatus === "offline"}
          className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition ${
            loading || serverStatus === "offline"
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {loading ? "Adding Doctor..." : "Add Doctor"}
        </button>
      </div>
    </form>
  );
};

export default AddDoctorForm;
