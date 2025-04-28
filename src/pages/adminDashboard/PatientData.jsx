import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest, ENDPOINTS } from "../../utils/apiRequest";
import { getErrorFeedback } from "../../utils/apiError";
import { FaUserCircle } from "react-icons/fa";

const PatientData = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const result = await apiRequest(ENDPOINTS.PATIENT_DETAILS(patientId));
        setPatient(result.data);
      } catch (err) {
        const errorFeedback = getErrorFeedback(err);
        setError(errorFeedback.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  if (loading) {
    return <div className="flex justify-center py-16 text-gray-500">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-6 rounded-md max-w-lg mx-auto mt-8 shadow">
        <h2 className="text-xl font-semibold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const { selectedProgram, emergencyContact, programHistory } = patient;

  return (
    <div className="bg-white shadow-lg rounded-2xl p-8 max-w-4xl mx-auto mt-10">
      <div className="flex flex-col items-center gap-2 mb-6 text-center">
        <FaUserCircle className="text-6xl text-gray-400" />
        <h1 className="text-3xl font-bold text-gray-800">{patient.name}</h1>
        <p className="text-sm text-gray-500">{}</p>
        <p className="text-sm text-gray-500">ID: {patient._id}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 mb-6">
        <div><strong>Age:</strong> {patient.age}</div>
        <div><strong>City:</strong> {patient.city}</div>
        <div className="sm:col-span-2"><strong>Problems:</strong> {patient.problems}</div>
        {patient.medicalHistory && (
          <div className="sm:col-span-2"><strong>Medical History:</strong> {patient.medicalHistory}</div>
        )}
        {patient.allergies?.length > 0 && (
          <div className="sm:col-span-2">
            <strong>Allergies:</strong> {patient.allergies.join(", ")}
          </div>
        )}
        {emergencyContact?.name && (
          <div className="sm:col-span-2 bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Emergency Contact</h3>
            <p><strong>Name:</strong> {emergencyContact.name}</p>
            <p><strong>Relationship:</strong> {emergencyContact.relationship}</p>
            <p><strong>Phone:</strong> {emergencyContact.phone}</p>
          </div>
        )}
      </div>

      {selectedProgram && (
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Current Program</h3>
          <p><strong>Status:</strong> {selectedProgram.status}</p>
          <p><strong>Enrollment Date:</strong> {new Date(selectedProgram.enrollmentDate).toLocaleDateString()}</p>
          <p><strong>Membership:</strong> {selectedProgram.membership.duration}</p>
          <p><strong>Price:</strong> ₹{selectedProgram.membership.price}</p>
          <p><strong>End Date:</strong> {new Date(selectedProgram.membership.endDate).toLocaleDateString()}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 text-gray-700">
        <div><strong>Referral Code:</strong> {patient.referralCode}</div>
        <div><strong>Total Referrals:</strong> {patient.referrals}</div>
        {patient.referredBy && (
          <div><strong>Referred By ID:</strong> {patient.referredBy}</div>
        )}
      </div>

      {programHistory?.length > 0 && (
        <div className="bg-green-50 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Program History</h3>
          {programHistory.map((prog, idx) => (
            <div key={idx} className="mb-4 border-b pb-2 last:border-b-0 last:pb-0">
              <p><strong>Program:</strong> {prog.programName || prog.program}</p>
              <p><strong>Doctor:</strong> {prog.doctorName || prog.doctorId}</p>
              <p><strong>Duration:</strong> {prog.membership?.duration}</p>
              <p><strong>Status:</strong> {prog.status}</p>
              <p><strong>Start:</strong> {new Date(prog.startDate).toLocaleDateString()}</p>
              <p><strong>End:</strong> {new Date(prog.endDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientData;
