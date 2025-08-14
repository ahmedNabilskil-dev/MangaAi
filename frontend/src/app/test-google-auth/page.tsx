"use client";

import { useState } from "react";

export default function TestGoogleAuth() {
  const [status, setStatus] = useState("");

  const testGoogleAuth = () => {
    setStatus("Redirecting to Google...");
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    window.location.href = `${backendUrl}/auth/google`;
  };

  const testBackendConnection = async () => {
    try {
      setStatus("Testing backend connection...");
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${backendUrl}/auth/google`, {
        method: "HEAD",
        mode: "no-cors",
      });
      setStatus("Backend is reachable");
    } catch (error) {
      setStatus(
        `Backend connection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-8">Google Auth Debug</h1>

      <div className="space-y-4 w-full max-w-md">
        <div className="text-sm text-gray-600">
          <p>
            <strong>Backend URL:</strong>{" "}
            {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}
          </p>
          <p>
            <strong>Frontend URL:</strong>{" "}
            {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002"}
          </p>
        </div>

        <button
          onClick={testBackendConnection}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Test Backend Connection
        </button>

        <button
          onClick={testGoogleAuth}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Test Google Auth Redirect
        </button>

        <div className="text-center">
          <a
            href="http://localhost:3001/auth/google"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Direct Link to Google Auth
          </a>
        </div>

        {status && (
          <div className="p-4 bg-gray-100 rounded">
            <p>{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
