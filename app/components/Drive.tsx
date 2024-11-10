'use client';

import React, { useState, useEffect } from 'react';
import Container from './Container';
import axios from 'axios';
import { io } from 'socket.io-client';

const Drive = () => {
  const [isDriving, setIsDriving] = useState(false);
  const [location, setLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [socket, setSocket] = useState(null);
  const driverID = 12345;

  useEffect(() => {
    if (isDriving) {
      const newSocket = io('http://localhost:3000');
      setSocket(newSocket);

      newSocket.emit('startDrive', { driverID });

      newSocket.on('rideAcceptedNotification', (data) => {
        console.log('Ride accepted by rider:', data);
        alert('Ride accepted by the rider!');
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [isDriving]);

  const handleStartDrive = () => {
    setIsDriving(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          setLocation({
            lat: latitude,
            lng: longitude,
          });

          try {
            await axios.post('http://localhost:3000/api/createDriver', {
              driverID,
              latitude,
              longitude,
            });
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
    setIsDriving(false);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  return (
    <Container>
      <div className="text-center p-5" style={{ paddingTop: '100px' }}>
        <h1 className="text-3xl font-bold mb-56">Driver Page</h1>
        <div className="inline-block">
          {!isDriving ? (
            <button
              className="bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600"
              onClick={handleStartDrive}
            >
              Start Drive
            </button>
          ) : (
            <button
              className="bg-red-500 text-white rounded-lg py-2 px-4 hover:bg-red-600"
              onClick={handleStopDrive}
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
      </div>
    </Container>
  );
};

export default Drive;
