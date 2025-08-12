// src/components/ClientWrapper.jsx
"use client";

import { AppProvider } from "@/context/context";
import { io } from "socket.io-client";
import { useEffect } from "react";

const socket = io("http://localhost:8080");

export default function ClientWrapper({ children }) {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });
  }, []);

  return <AppProvider>{children}</AppProvider>;
}
