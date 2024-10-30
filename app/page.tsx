'use client';

import React from 'react';
import useRegisterModal from './hooks/useRegisterModal';
import Button from './components/Button';

export default function Home() {
  const registerModal = useRegisterModal();

  return (
    <div className="flex flex-col md:flex-row items-center justify-center h-screen bg-gray-100">
      {/* Left Side: Text Section */}
      <div className="p-4 md:p-8 text-center md:text-left">
        <h1 className="text-4xl font-bold text-gray-800">Transparency in Fare</h1>
        <p className="mt-2 text-lg text-gray-600">
          At TrueFare, we are committed to our drivers and give them the fare they rightfully deserve.
        </p>
        <div className="mt-4">
          <Button label="Get Started" onClick={registerModal.onOpen} />
        </div>
      </div>

      {/* Right Side: Image Section */}
      <div className="w-full md:w-1/2 p-4 flex justify-center">
        <img
          src="/images/landing_page.png"
          alt="TrueFare Illustration"
          className="rounded-lg shadow-lg"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}
