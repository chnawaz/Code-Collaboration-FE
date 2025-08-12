"use client";

import React, { createContext, useContext, useState } from "react";

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [devName, setDevName] = useState("");
  const [userName, setUserName] = useState("");
  const [cuserName, setCuserName] = useState("");
  const [users, setUsers] = useState([]);
  const [code, setCode] = useState("")

  
  // New state for timer and turn management
  const [roomInfo, setRoomInfo] = useState(null);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [roomTimeRemaining, setRoomTimeRemaining] = useState(0);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(0);
  

  return (
    <AppContext.Provider
      value={{
        joined,
        setJoined,
        roomId,
        setRoomId,
        devName,
        setDevName,
        userName,
        setUserName,
        users, setUsers,
        code, setCode,
        roomInfo, setRoomInfo,
        error, setError,
        isConnected, setIsConnected,
        roomTimeRemaining, setRoomTimeRemaining,
        turnTimeRemaining, setTurnTimeRemaining,
        cuserName, setCuserName
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// 
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
};
