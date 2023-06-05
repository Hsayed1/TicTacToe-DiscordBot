'use client';
import React from 'react';


export default function LoginPage() {
  return (
    <div className="flex h-screen justify-center items-center">
      <button onClick={() => window.open("http://localhost:4000/auth/discord", "_self")}>Login</button>
    </div>
  );
}
