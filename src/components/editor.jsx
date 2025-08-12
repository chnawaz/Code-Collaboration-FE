"use client";
import React, { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import Sidetab from "./sidetab";

import socket from "@/utils/socket";
import { useAppContext } from "@/context/context";

export default function EditorComponent() {
  const {
    setUsers,
    users,
    setCode,
    code,
    roomId,
    userName,
    roomInfo,
    setRoomInfo,
    setError,
    setIsConnected,
    setRoomTimeRemaining,
    setTurnTimeRemaining,
    
  } = useAppContext();

  const roomTimerRef = useRef(null);
  const turnTimerRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Connection status
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    // Legacy user joined event (keeping for compatibility)
    socket.on("userJoined", (usersArray) => {
      setUsers(usersArray);
      console.log("Current users in context:", users);
    });

    // New room update event with timer and turn info
    socket.on("roomUpdate", (roomData) => {
      console.log("Room update received:", roomData);
      setRoomInfo(roomData);
      setUsers(roomData.users || []);

      // Only update code if it's different (avoid cursor jumping)
      if (roomData.code !== code) {
        setCode(roomData.code || "");
      }

      // Update room time remaining
      if (roomData.timeRemaining && roomData.timeRemaining.room) {
        setRoomTimeRemaining(roomData.timeRemaining.room);
        startRoomTimer(roomData.timeRemaining.room);
      }

      // Reset turn timer (5 minutes)
      setTurnTimeRemaining(5 * 60 * 1000);
      startTurnTimer();
    });

    // Code update from other users
    socket.on("codeUpdate", (newCode) => {
      console.log("--new code received:", newCode);
      setCode(newCode);
    });

    // Error handling
    socket.on("error", (errorData) => {
      console.log("Error received:", errorData.message);
      setError(errorData.message);
      setTimeout(() => setError(""), 5000);
    });

    // Room expired
    socket.on("roomExpired", (data) => {
      alert(data.message);
      // Handle room expiration - could redirect or reset state
      setRoomInfo(null);
      setCode("");
      clearTimers();
    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("roomUpdate");
      socket.off("error");
      socket.off("roomExpired");
      socket.off("connect");
      socket.off("disconnect");
      clearTimers();
    };
  }, []);

  // Timer management functions
  const startRoomTimer = (initialTime) => {
    clearInterval(roomTimerRef.current);
    let timeLeft = initialTime;

    roomTimerRef.current = setInterval(() => {
      timeLeft -= 1000;
      setRoomTimeRemaining(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(roomTimerRef.current);
        setRoomTimeRemaining(0);
      }
    }, 1000);
  };

  const startTurnTimer = () => {
    clearInterval(turnTimerRef.current);
    let timeLeft = 5 * 60 * 1000; // 5 minutes

    turnTimerRef.current = setInterval(() => {
      timeLeft -= 1000;
      setTurnTimeRemaining(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(turnTimerRef.current);
        setTurnTimeRemaining(0);
      }
    }, 1000);
  };

  const clearTimers = () => {
    if (roomTimerRef.current) clearInterval(roomTimerRef.current);
    if (turnTimerRef.current) clearInterval(turnTimerRef.current);
  };

  // Check if it's user's turn
  const isMyTurn = roomInfo && roomInfo.currentPlayer === userName;

  const handleCodeChange = (newCode) => {
    // Check if it's user's turn before allowing edit
    if (roomInfo && !isMyTurn) {
      setError("It's not your turn to edit!");
      return;
    }

    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
  };

  // Define custom theme once Monaco is loaded
  function handleEditorWillMount(monaco) {
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1e1e2f",
        "editorLineNumber.foreground": "#5eacd3",
        "editorLineNumber.activeForeground": "#ffffff",
      },
    });
  }

  return (
    <>
      {/* Main Editor Interface */}
      <div className="p-10 flex items-center justify-center gap-4">
        <div className="w-[60%] rounded-2xl overflow-hidden shadow-lg ring-1 ring-cyan-500 relative">
          {/* Turn Indicator Overlay */}
          {/* {roomInfo && !isMyTurn && (
            <div className="absolute top-0 right-0 z-10 bg-orange-500 text-white px-3 py-1 rounded-full text-sm shadow-lg">
              Read Only - Not Your Turn
            </div>
          )}

          {roomInfo && isMyTurn && (
            <div className="absolute top-0 right-0 z-10 bg-green-500 text-white px-3 py-0 rounded-full text-sm shadow-lg">
              Your Turn - You Can Edit
            </div>
          )} */}

          <Editor
            height="90vh"
            defaultLanguage="javascript"
            defaultValue="// Start JavaScript code here..."
            theme="custom-dark"
            beforeMount={handleEditorWillMount}
            value={code}
            onChange={handleCodeChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              readOnly: roomInfo && !isMyTurn, // Make editor read-only when not user's turn
              domReadOnly: roomInfo && !isMyTurn,
              contextmenu: isMyTurn, // Disable context menu when not user's turn
            }}
          />
        </div>

        <div className="w-[40%]">
          <Sidetab />
        </div>
      </div>
    </>
  );
}
