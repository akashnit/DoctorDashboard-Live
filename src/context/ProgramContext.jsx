// src/context/ProgramContext.js
import React, { createContext, useState, useContext } from 'react';

const ProgramContext = createContext();

export const ProgramProvider = ({ children }) => {
  const [programs, setPrograms] = useState([]);
  const [programStats, setProgramStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProgram, setExpandedProgram] = useState(null);

  return (
    <ProgramContext.Provider
      value={{
        programs,
        setPrograms,
        programStats,
        setProgramStats,
        loading,
        setLoading,
        error,
        setError,
        expandedProgram,
        setExpandedProgram,
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
};

export const useProgramContext = () => {
  return useContext(ProgramContext);
};
