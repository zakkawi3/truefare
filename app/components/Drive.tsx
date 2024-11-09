'use client';

import React, { useState } from 'react';
import Container from './Container'; // Adjust the path if needed
import useRideModal from '@/app/hooks/useRideModal'; // Import the useRideModal hook
import axios from 'axios';

const Drive = () => {
  const [isDriving, setIsDriving] = useState(false); // State to track if driving has started
  const [location, setLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const rideModal = useRideModal(); // Use the ride modal hook

  const handleStartDrive = () => {
    setIsDriving(true); // Switch to "driving" mode

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          setLocation({
            lat: latitude,
            lng: longitude,
          });
          
          console.log('Driver location:', { latitude, longitude });

          try {
            // Replace 'driverID' with the actual ID of the driver
            const driverID = 12345;
            
            // Send location to backend
            const response = await axios.post('http://localhost:3000/api/createDriver', {
              driverID,
              latitude,
              longitude,
            });
            
            console.log('Driver created:', response.data);
          } catch (error) {
            console.error('Error creating driver:', error);
            alert('Failed to register driver on the server.');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Location access denied or unavailable.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
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
