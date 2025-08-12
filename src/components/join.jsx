
"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/context";
import socket from "@/utils/socket";

export default function Join() {
  const {
    roomId,
    setRoomId,
    userName,
    setUserName,
    setJoined,
    setRoomInfo,
    setUsers,
    setIsConnected,
    setRoomTimeRemaining,
    setTurnTimeRemaining,
  } = useAppContext();

  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinUserName, setJoinUserName] = useState("");
  const [createUserName, setCreateUserName] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    
    setIsConnected(socket.connected);

    
    const handleConnect = () => {
      console.log("Socket connected");
      setIsConnected(true);
    };
    
    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    };

    
    const handleRoomCreated = ({ roomId, message, creator }) => {
      console.log("Room created event:", { roomId, message, creator });
    
      setSuccess(message);
      setRoomId(roomId);
      setUserName(createUserName);
      setJoined(true);
    };

    
    const handleJoinedRoom = ({ roomId, message, users }) => {
      console.log("Joined room event:", { roomId, message, users });
      
      setSuccess(message);
      setRoomId(joinRoomId);
      setUserName(joinUserName);
      setUsers(users);
      setJoined(true);
    };

    
    const handleRoomUpdate = (roomInfo) => {
      console.log("Room update received:", roomInfo);
      setRoomInfo(roomInfo);
      setUsers(roomInfo.users);
      
      
      if (roomInfo.timeRemaining) {
        if (roomInfo.timeRemaining.room) {
          setRoomTimeRemaining(roomInfo.timeRemaining.room);
        }
        if (roomInfo.timeRemaining.turn) {
          setTurnTimeRemaining(roomInfo.timeRemaining.turn);
        }
      }
    };

    
    const handleError = ({ message }) => {
      console.log("Socket error:", message);
      setLoading(false);
      setError(message);
      setSuccess("");
    };

    
    const handleRoomExpired = ({ message }) => {
      console.log("Room expired:", message);
      setError(message);
      setJoined(false);
      setRoomId("");
      setUsers([]);
      setRoomInfo(null);
    };

    
    const handleCodeUpdate = (code) => {
      console.log("Code update received:", code);
      
    };

    
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("roomCreated", handleRoomCreated);
    socket.on("joinedRoom", handleJoinedRoom);
    socket.on("roomUpdate", handleRoomUpdate);
    socket.on("error", handleError);
    socket.on("roomExpired", handleRoomExpired);
    socket.on("codeUpdate", handleCodeUpdate);

    
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("roomCreated", handleRoomCreated);
      socket.off("joinedRoom", handleJoinedRoom);
      socket.off("roomUpdate", handleRoomUpdate);
      socket.off("error", handleError);
      socket.off("roomExpired", handleRoomExpired);
      socket.off("codeUpdate", handleCodeUpdate);
    };
  }, [
    setRoomId, 
    setJoined, 
    setRoomInfo, 
    setUsers, 
    setUserName, 
    setIsConnected, 
    setRoomTimeRemaining,
    setTurnTimeRemaining,
    createUserName, 
    joinUserName, 
    joinRoomId
  ]);

  
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  
  const joinRoom = () => {
    if (!joinRoomId.trim() || !joinUserName.trim()) {
      setError("Please enter both Room ID and your name");
      return;
    }

    console.log("Attempting to join room:", { roomId: joinRoomId.trim(), userName: joinUserName.trim() });
    setLoading(true);
    clearMessages();
    socket.emit("join", { roomId: joinRoomId.trim(), userName: joinUserName.trim() });
  };


  const createRoom = () => {
    if (!createUserName.trim()) {
      setError("Please enter your name to create a room");
      return;
    }

    console.log("Attempting to create room for user:", createUserName.trim());
    setLoading(true);
    clearMessages();
    socket.emit("createRoom", { userName: createUserName.trim() });
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-[#00bf83] mb-8">
        Code Collaboration Room
      </h1>
      
      <div className="w-[40%] border-2 border-gray-500 rounded-2xl p-10 flex flex-col items-center gap-4 join-form">
        
        {/* Error Message */}
        {error && (
          <div className="alert alert-error w-full">
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="alert alert-success w-full">
            <span>{success}</span>
          </div>
        )}

      
        <div className="w-full flex flex-col items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-700">Join Existing Room</h3>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={joinRoomId}
            onChange={(e) => {
              setJoinRoomId(e.target.value);
              clearMessages();
            }}
            className="input input-success bg-white w-full rounded-2xl text-gray-600"
            
          />
          <input
            type="text"
            placeholder="Enter Your Name"
            value={joinUserName}
            onChange={(e) => {
              setJoinUserName(e.target.value);
              clearMessages();
            }}
            className="input input-success bg-white w-full rounded-2xl text-gray-600"
            
          />
          <button
            className={`btn btn-active btn-success rounded-2xl w-full `}
            onClick={joinRoom}
            
          >
            Join Room
          </button>
        </div>

        <div className="text-gray-500 text-center">
          <div className="divider">OR</div>
        </div>

        
        <div className="w-full flex flex-col items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-700">Create New Room</h3>
          <input
            type="text"
            placeholder="Enter Your Name"
            value={createUserName}
            onChange={(e) => {
              setCreateUserName(e.target.value);
              clearMessages();
            }}
            className="input input-primary bg-white w-full rounded-2xl text-gray-600"
            
          />
          <button
            className={`btn btn-primary rounded-2xl w-full `}
            onClick={createRoom}
            
          >
             Create Room
          </button>
          <p className="text-sm text-gray-500 text-center mt-2">
            Room ID will be generated automatically
          </p>
        </div>
      </div>
    </div>
  );
}