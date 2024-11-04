'use client';

import React, { useState } from 'react';
import Container from './Container'; // Adjust the path if needed
import useRideModal from '@/app/hooks/useRideModal'; // Import the useRideModal hook

const Drive = () => {
  const [isDriving, setIsDriving] = useState(false); // State to track if driving has started
  const rideModal = useRideModal(); // Use the ride modal hook


  const handleStartDrive = () => {
    setIsDriving(true); // Switch to "driving" mode
  };

  const handleStopDrive = () => {
    setIsDriving(false); // Switch back to "stopped" mode
  };

  const handleTestModal = () => {
    rideModal.onOpen(); // Open the RideModal
  };

  return (
    <Container>
      <div className="text-center p-5" style={{ paddingTop: '100px', paddingBottom: 'px' }}>
        <h1 className="text-3xl font-bold mb-56">Driver Page</h1>
        <div className="inline-block">
          {!isDriving ? (
            <button
              className="bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600"
              onClick={handleStartDrive} // Start Drive button logic
            >
              Start Drive
            </button>
          ) : (
            <button
              className="bg-red-500 text-white rounded-lg py-2 px-4 hover:bg-red-600"
              onClick={handleStopDrive} // Stop Drive button logic
            >
              Stop Drive
            </button>
          )}
        </div>
        {isDriving && (
          <div className="mt-5">
            <p className="text-xl text-gray-700">Searching for Drive...</p>
          </div>
        )}
        {/* Test button to open the RideModal */}
        <div className="mt-5">
          <button
            className="bg-green-500 text-white rounded-lg py-2 px-4 hover:bg-green-600"
            onClick={handleTestModal} // Test button logic
          >
            Test Ride Modal
          </button>
        </div>
      </div>
    </Container>
  );
};

export default Drive;
