"use client";

import React, { useContext } from "react";
import Join from "@/components/join";
import Editorr from "@/components/editor";
import { useAppContext } from "@/context/context";

export default function Page() {
   const {
    joined,       
    setJoined,
  } = useAppContext();

  return (
    <div className="bg-[#FFFFFF] h-[100%] w-full m-0">
      {joined ? <Editorr /> : <Join />}
    </div>
  );
}
