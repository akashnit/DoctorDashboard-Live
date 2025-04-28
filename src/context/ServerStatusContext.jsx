import React, { createContext, useState, useContext } from 'react';

const ServerStatusContext = createContext();

export const ServerStatusProvider = ({ children }) => {
  const [serverStatus, setServerStatus] = useState("unknown"); // online, offline, unknown

  return (
    <ServerStatusContext.Provider value={{ serverStatus, setServerStatus }}>
      {children}
    </ServerStatusContext.Provider>
  );
};

export const useServerStatusContext = () => {
  return useContext(ServerStatusContext);
};
