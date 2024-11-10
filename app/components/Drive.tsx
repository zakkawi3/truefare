'use client';

import React, { useState, useEffect } from 'react';
import Container from './Container';
import axios from 'axios';
import { io } from 'socket.io-client';

const Drive = () => {
  const [isDriving, setIsDriving] = useState(false);
  const [location, setLocation] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });
  const [socket, setSocket] = useState(null);
  const [showRideRequest, setShowRideRequest] = useState(false);
  const [riderData, setRiderData] = useState<{ riderID?: string; distance?: string; pickupLocation?: string; dropoffLocation?: string }>({});
  const driverID = 12345;

  useEffect(() => {
    if (isDriving) {
      const newSocket = io('http://localhost:3000');
      setSocket(newSocket);

      newSocket.emit('startDrive', { driverID });

      newSocket.on('rideAcceptedNotification', (data) => {
        console.log('Ride accepted by rider, received data:', data); // Debug statement
        setRiderData({
          riderID: data.riderID || 'N/A',
          distance: data.distance || 'N/A',
          pickupLocation: data.pickupLocation || 'N/A',
          dropoffLocation: data.dropoffLocation || 'N/A',
        });
        setShowRideRequest(true);
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [isDriving]);

  const handleStartDrive = () => {
    setIsDriving(true);
    console.log('Driver started looking for a ride...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          setLocation({ lat: latitude, lng: longitude });
          console.log('Driver location:', { latitude, longitude });

          try {
            await axios.post('http://localhost:3000/api/createDriver', {
              driverID,
              latitude,
              longitude,
            });
            console.log('Driver registered successfully on the server');
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
    console.log('Driver stopped looking for a ride');
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setShowRideRequest(false);
    setRiderData({});
  };

  const handleAcceptRide = () => {
    if (socket) {
      console.log('Driver accepted the ride request:', riderData);
      socket.emit('driverAcceptRide', { riderID: riderData.riderID });
      alert('You have accepted the ride.');
      setShowRideRequest(false);
    }
  };

  const handleRejectRide = () => {
    if (socket) {
      console.log('Driver rejected the ride request:', riderData);
      socket.emit('driverRejectRide', { riderID: riderData.riderID });
      alert('You have rejected the ride.');
      setShowRideRequest(false);
      setRiderData({});
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
        
        {showRideRequest && riderData && (
          <div className="mt-10 text-center">
            <h2 className="text-xl font-semibold">Ride Request</h2>
            <p className="mt-2">Rider ID: {riderData.riderID || 'N/A'}</p>
            <p>Distance: {riderData.distance ? `${riderData.distance} km` : 'N/A'}</p>
            <p>Pickup Location: {riderData.pickupLocation || 'N/A'}</p>
            <p>Dropoff Location: {riderData.dropoffLocation || 'N/A'}</p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                className="bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600"
                onClick={handleAcceptRide}
              >
                Accept
              </button>
              <button
                className="bg-red-500 text-white rounded-lg py-2 px-4 hover:bg-red-600"
                onClick={handleRejectRide}
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Drive;
