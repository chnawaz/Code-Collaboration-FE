"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/context";
import { Clock, Users, Edit3, AlertCircle, Wifi, WifiOff } from "lucide-react";

export default function SideTab() {
  const {
    setUsers,
    users,
    roomId,
    userName,
    roomInfo,
    setRoomInfo,
    isConnected,
    setIsConnected,
    roomTimeRemaining,
    setRoomTimeRemaining,
    turnTimeRemaining,
    setTurnTimeRemaining,
  } = useAppContext();

  const [localRoomTime, setLocalRoomTime] = useState(0);
  const [localTurnTime, setLocalTurnTime] = useState(0);
  const [turnStartTime, setTurnStartTime] = useState(null);

  const isMyTurn = roomInfo && roomInfo.currentPlayer === userName;

  const formatTime = (milliseconds) => {
    if (!milliseconds || milliseconds < 0) return "00:00";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const displayUsers = roomInfo?.users || users || [];

  useEffect(() => {
    if (!roomInfo || !roomInfo.timeRemaining) return;

    setLocalRoomTime(roomInfo.timeRemaining.room);
    setRoomTimeRemaining(roomInfo.timeRemaining.room);

    const roomTimer = setInterval(() => {
      setLocalRoomTime((prevTime) => {
        const newTime = Math.max(0, prevTime - 1000);
        setRoomTimeRemaining(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(roomTimer);
  }, [roomInfo?.timeRemaining?.room, setRoomTimeRemaining]);

  useEffect(() => {
    if (!roomInfo || roomInfo.users?.length < 2) return;

    //
    const turnDuration = 5 * 60 * 1000; // 5 minutes
    setLocalTurnTime(turnDuration);
    setTurnTimeRemaining(turnDuration);
    setTurnStartTime(Date.now());

    const turnTimer = setInterval(() => {
      setLocalTurnTime((prevTime) => {
        const newTime = Math.max(0, prevTime - 1000);
        setTurnTimeRemaining(newTime);

        if (newTime <= 0) {
          console.log("Turn time expired!");
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(turnTimer);
  }, [roomInfo?.currentTurn, roomInfo?.currentPlayer, setTurnTimeRemaining]);

  useEffect(() => {
    if (!roomId) {
      setLocalRoomTime(0);
      setLocalTurnTime(0);
      setRoomTimeRemaining(0);
      setTurnTimeRemaining(0);
    }
  }, [roomId, setRoomTimeRemaining, setTurnTimeRemaining]);

  return (
    <div className="w-full rounded-2xl border-2 border-gray-500 text-black">
      <div className="flex flex-col justify-between md:flex md:flex-row items-center">
        <div className="flex items-center gap-2 p-4">
          {isConnected ? (
            <>
              <Wifi className="text-green-500" size={16} />
              <span className="text-green-500 text-sm">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="text-red-500" size={16} />
              <span className="text-red-500 text-sm">Disconnected</span>
            </>
          )}
        </div>

        {roomInfo && displayUsers.length >= 2 && (
          <div className="flex items-center gap-2 p-4">
            <Edit3
              className={isMyTurn ? "text-[#00bf83]" : "text-orange-400"}
              size={20}
            />
            <span
              className={`text-md font-medium ${
                isMyTurn ? "text-[#00bf83]" : "text-orange-400"
              }`}
            >
              {isMyTurn ? "Your Turn" : `${roomInfo.currentPlayer}'s Turn`}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 p-4">
          <Users className="text-[#5754e8]" size={20} />
          <span className="text-sm">{displayUsers.length}/2 users</span>
        </div>
      </div>

      <div className="h-px bg-gray-300 w-full"></div>

      {displayUsers.length > 0 ? (
        displayUsers.map((user, index) => (
          <React.Fragment key={`${user}-${index}`}>
            <div className="flex justify-between items-center p-4">
              <h1 className="text-2xl font-bold text-[#5754e8]">
                {user}
                {user === userName && (
                  <span className="text-sm text-gray-500 ml-2">(You)</span>
                )}
              </h1>
            </div>
            {index < displayUsers.length - 1 && (
              <div className="h-px bg-gray-300 w-full"></div>
            )}
          </React.Fragment>
        ))
      ) : (
        <div className="flex justify-center items-center p-4">
          <span className="text-gray-500">No users in room</span>
        </div>
      )}

      <div className="h-px bg-gray-300 w-full"></div>

      <div className="flex justify-between">
        <div className="flex items-center gap-2 p-2">
          <Clock className="text-[#00bf83]" size={20} />
          <span className="text-md font-medium">
            Room: {formatTime(localRoomTime)}
          </span>
        </div>

        <div className="bg-gray-300 w-px"></div>

        <div className="flex items-center gap-2 p-2">
          <Clock className="text-orange-400" size={20} />
          <span className="text-md font-medium">
            Turn: {formatTime(turnTimeRemaining)}
          </span>
        </div>
      </div>

      <div className="h-px bg-gray-300 w-full"></div>

      <div className="text-2xl font-bold p-4 text-center">
        <p>
          Room ID:{" "}
          <span className="text-[#00bf83]">{roomId || "Not in room"}</span>
        </p>
      </div>
    </div>
  );
}
