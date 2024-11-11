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
  const userID = 29; //getDriverID
  const driverID = 29; //getDriverID

  useEffect(() => {
    if (isDriving) {
      const newSocket = io('https://octopus-app-agn55.ondigitalocean.app/');
      setSocket(newSocket);

      newSocket.emit('startDrive', { driverID });
      
      newSocket.on('rideAcceptedNotification', (data) => {
        console.log('Ride accepted by rider, received data:', data);
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
    const driverEmail = localStorage.getItem('userEmail'); // Retrieve email from local storage
    if (!driverEmail) {
      console.error("User email not found in local storage");
      alert("Please log in again.");
      return;
    }  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
  
          setLocation({ lat: userLat, lng: userLng });
          console.log('Driver location:', { userLat, userLng });
  
          try {
            // Step 1: Get the driver ID by email
            const idResponse = await axios.get(
              `https://octopus-app-agn55.ondigitalocean.app/users/${driverEmail}/id`
            );
            const driverID = idResponse.data.userID; // Extract the userID from the response
  
            // Step 2: Activate the driver using the fetched driverID
            const activateResponse = await axios.put(
              `https://octopus-app-agn55.ondigitalocean.app/users/${driverID}/activate`,
              { headers: { 'Content-Type': 'application/json' } }
            );
  
            console.log('User activated successfully:', activateResponse.data);
  
            // Step 3: Update the driver's location using the fetched driverID
            const updateResponse = await axios.put(
              `https://octopus-app-agn55.ondigitalocean.app/drivers/${driverID}/location`,
              {
                userLat,
                userLng,
              },
              { headers: { 'Content-Type': 'application/json' } }
            );
  
            console.log('Driver location updated successfully:', updateResponse.data);
          } catch (error) {
            console.error('Error activating or updating driver location:', error);
            alert('Failed to activate or update driver location on the server.');
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
            <p className="mt-2">Rider ID: {riderData.riderID}</p>
            <p>Distance: {riderData.distance}</p>
            <p>Pickup Location: {riderData.pickupLocation}</p>
            <p>Dropoff Location: {riderData.dropoffLocation}</p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Drive;
