'use client';

import React, { useState, useEffect } from 'react';
import Container from './Container';
import axios from 'axios';
import { io } from 'socket.io-client';
import { BACKEND_URL } from '../config/config';
import Modal from './modals/Modal';
import toast from 'react-hot-toast';

const Drive = () => {
  const [isDriving, setIsDriving] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showRideRequest, setShowRideRequest] = useState(false);
  const [acceptedRideInfo, setAcceptedRideInfo] = useState(null);
  const [riderData, setRiderData] = useState({});
  const [driverID, setDriverID] = useState<number | null>(null);
  const [updateInterval, setUpdateInterval] = useState<number | null>(null);

  useEffect(() => {
    const setupSocket = async () => {
      if (isDriving) {
        const newSocket = io(`${BACKEND_URL}`);
        setSocket(newSocket);

        const driverEmail = localStorage.getItem('userEmail');
        if (!driverEmail) {
          console.error('User email not found in local storage');
          alert('Please log in again.');
          return;
        }

        try {
          const idResponse = await axios.get(`${BACKEND_URL}/users/${driverEmail}/id`);
          const fetchedDriverID = idResponse.data.userID;
          setDriverID(fetchedDriverID);

          newSocket.emit('startDrive', { driverID: fetchedDriverID });

          newSocket.on('rideAcceptedNotification', (data) => {
            console.log('Ride request received:', data);

            const googleMapsLink = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
              data.pickupLocation
            )}&destination=${encodeURIComponent(data.dropoffLocation)}`;

            setRiderData({
              riderID: data.riderID || 'N/A',
              distance: data.distance || 'N/A',
              pickupLocation: data.pickupLocation || 'N/A',
              dropoffLocation: data.dropoffLocation || 'N/A',
              price: data.price || '$7.62',
              googleMapsLink,
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

    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      stopLocationUpdates();
    };
  }, [isDriving]);

  const startLocationUpdates = (driverID: number) => {
    const interval = setInterval(async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            try {
              await axios.put(
                `${BACKEND_URL}/drivers/${driverID}/location`,
                { userLat, userLng },
                { headers: { 'Content-Type': 'application/json' } }
              );
              console.log('Driver location updated:', { userLat, userLng });
            } catch (error) {
              console.error('Error updating driver location:', error);
            }
          },
          (error) => {
            console.error('Error fetching location:', error);
          }
        );
      }
    }, 5000); // Update every 5 seconds

    setUpdateInterval(interval);
  };

  const stopLocationUpdates = () => {
    if (updateInterval) {
      clearInterval(updateInterval);
      setUpdateInterval(null);
      console.log('Stopped periodic location updates.');
    }
  };

  const handleStartDrive = async () => {
    setIsDriving(true);
    console.log('Driver started looking for a ride...');

    const driverEmail = localStorage.getItem('userEmail');
    if (!driverEmail) {
      console.error('User email not found in local storage');
      alert('Please log in again.');
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          try {
            const idResponse = await axios.get(`${BACKEND_URL}/users/${driverEmail}/id`);
            const fetchedDriverID = idResponse.data.userID;
            setDriverID(fetchedDriverID);

            await axios.put(
              `${BACKEND_URL}/users/${fetchedDriverID}/activate`,
              { headers: { 'Content-Type': 'application/json' } }
            );

            console.log('Driver activated successfully.');

            await axios.put(
              `${BACKEND_URL}/drivers/${fetchedDriverID}/location`,
              { userLat, userLng },
              { headers: { 'Content-Type': 'application/json' } }
            );

            console.log('Driver location updated successfully.');

            startLocationUpdates(fetchedDriverID); // Start periodic updates
          } catch (error) {
            console.error('Error activating driver or updating location:', error);
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
    stopLocationUpdates();

    if (driverID !== null) {
      try {
        await axios.put(`${BACKEND_URL}/users/${driverID}/deactivate`, {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Driver deactivated successfully.');
      } catch (error) {
        console.error('Error deactivating driver:', error);
      }
    } else {
      console.error('driverID is not defined.');
    }

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.success('Ride complete!');
    setAcceptedRideInfo(null);
    console.log('Driver stopped looking for a ride.');
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
        {isDriving && !acceptedRideInfo && (
          <div className="mt-5">
            <p className="text-xl text-gray-700">Searching for Drive...</p>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Drive;
