"use client";
import dynamic from "next/dynamic";

const Home = dynamic(() => import("./ActualComponent"), { ssr: false });

export default function Page() {
  return <Home />;
}
