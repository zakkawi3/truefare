'use client';

import React, { useState, useEffect, useRef } from 'react';
import Container from './Container';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const Drive = () => {
  const [isDriving, setIsDriving] = useState(false);
  const [showRideRequest, setShowRideRequest] = useState(false);
  const [riderData, setRiderData] = useState<{ riderID?: string; distance?: string; pickupLocation?: string; dropoffLocation?: string }>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const setupSocket = async () => {
      if (isDriving) {
        const newSocket = io('https://octopus-app-agn55.ondigitalocean.app/');
        socketRef.current = newSocket;

        const driverEmail = localStorage.getItem('userEmail'); // Retrieve email from local storage
        if (!driverEmail) {
          console.error("User email not found in local storage");
          alert("Please log in again.");
          return;
        }

        try {
          const idResponse = await axios.get(
            `https://octopus-app-agn55.ondigitalocean.app/users/${driverEmail}/id`
          );
          const driverID = idResponse.data.userID; // Extract the userID from the response

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
        } catch (error) {
          console.error('Error fetching driver ID:', error);
          alert('Failed to start drive due to an error fetching the driver ID.');
        }
      }
    };

    setupSocket();

    // Cleanup function to disconnect socket when component unmounts or `isDriving` changes
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isDriving]);

  const handleStartDrive = () => {
    setIsDriving(true);
    console.log('Driver started looking for a ride...');
    const driverEmail = localStorage.getItem('userEmail');
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
          console.log('Driver location:', { userLat, userLng });

          try {
            const idResponse = await axios.get(
              `https://octopus-app-agn55.ondigitalocean.app/users/${driverEmail}/id`
            );
            const driverID = idResponse.data.userID;

            await axios.put(
              `https://octopus-app-agn55.ondigitalocean.app/users/${driverID}/activate`,
              { headers: { 'Content-Type': 'application/json' } }
            );

            console.log('User activated successfully');

            await axios.put(
              `https://octopus-app-agn55.ondigitalocean.app/drivers/${driverID}/location`,
              { userLat, userLng },
              { headers: { 'Content-Type': 'application/json' } }
            );

            console.log('Driver location updated successfully');
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

  const handleStopDrive = async () => {
    setIsDriving(false);
    console.log('Driver stopped looking for a ride');
    const driverEmail = localStorage.getItem('userEmail');
    if (driverEmail) {
      const idResponse = await axios.get(
        `https://octopus-app-agn55.ondigitalocean.app/users/${driverEmail}/id`
      );
      const driverID = idResponse.data.userID;
      await axios.put(
        `https://octopus-app-agn55.ondigitalocean.app/users/${driverID}/deactivate`,
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setShowRideRequest(false);
    setRiderData({});
  };

  const handleAcceptRide = () => {
    if (socketRef.current) {
      console.log('Driver accepted the ride request:', riderData);
      socketRef.current.emit('driverAcceptRide', { riderID: riderData.riderID });
      alert('You have accepted the ride.');
      setShowRideRequest(false);
    }
  };

  const handleRejectRide = () => {
    if (socketRef.current) {
      console.log('Driver rejected the ride request:', riderData);
      socketRef.current.emit('driverRejectRide', { riderID: riderData.riderID });
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
            <div className="mt-4">
              <button
                className="bg-green-500 text-white rounded-lg py-2 px-4 mr-2 hover:bg-green-600"
                onClick={handleAcceptRide}
              >
                Accept Ride
              </button>
              <button
                className="bg-red-500 text-white rounded-lg py-2 px-4 hover:bg-red-600"
                onClick={handleRejectRide}
              >
                Reject Ride
              </button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Drive;
