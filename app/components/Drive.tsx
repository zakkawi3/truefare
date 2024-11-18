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
  const [riderData, setRiderData] = useState<{
    riderID?: string;
    distance?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    googleMapsLink?: string;
    price?: string;
  }>({});
  const [driverID, setDriverID] = useState<number | null>(null);

  useEffect(() => {
    const setupSocket = async () => {
      if (isDriving) {
        const newSocket = io(`${BACKEND_URL}`);
        setSocket(newSocket);

        const driverEmail = localStorage.getItem('userEmail');
        if (!driverEmail) {
          console.error("User email not found in local storage");
          alert("Please log in again.");
          return;
        }

        try {
          const idResponse = await axios.get(
            `${BACKEND_URL}/users/${driverEmail}/id`
          );
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
    };
  }, [isDriving]);

  const handleAcceptRide = () => {
    console.log('Ride accepted by driver:', riderData);
    // Emit event to notify backend that ride is accepted
    if (socket && driverID && riderData.riderID) {
      socket.emit('rideAccepted', {
        driverID,
        riderID: riderData.riderID,
      });

      // Display toast notification
      toast.success('Ride accepted!');

      // Update accepted ride info on the page
      setAcceptedRideInfo({ ...riderData });

      // Hide modal
      setShowRideRequest(false);
    }
  };

  const handleDeclineRide = () => {
    console.log('Ride declined by driver:', riderData);
    setShowRideRequest(false); // Close modal after declining
  };

  const handleStartDrive = () => {
    setIsDriving(true);
    console.log('Driver started looking for a ride...');
  };

  const handleStopDrive = () => {
    setIsDriving(false);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    // Show "Ride complete" toast notification and clear ride info
    toast.success('Ride complete!');
    setAcceptedRideInfo(null);
    console.log('Driver stopped looking for a ride');
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

        {/* Modal for Ride Request */}
        {showRideRequest && (
          <Modal
            isOpen={showRideRequest}
            title="Ride Request"
            onClose={() => setShowRideRequest(false)}
            body={
              <div className="space-y-4">
                <p className="text-gray-600">
                  <span className="font-semibold">Rider ID:</span> {riderData.riderID}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Distance:</span> {riderData.distance}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Pickup Location:</span> {riderData.pickupLocation}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Dropoff Location:</span> {riderData.dropoffLocation}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Price:</span> {riderData.price}
                </p>
                {riderData.googleMapsLink && (
                  <a
                    href={riderData.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Directions in Google Maps
                  </a>
                )}
                <div className="flex justify-around">
                  <button
                    className="bg-green-500 text-white rounded-lg py-2 px-4 hover:bg-green-600"
                    onClick={handleAcceptRide}
                  >
                    Accept
                  </button>
                  <button
                    className="bg-red-500 text-white rounded-lg py-2 px-4 hover:bg-red-600"
                    onClick={handleDeclineRide}
                  >
                    Decline
                  </button>
                </div>
              </div>
            }
          />
        )}

        {/* Accepted Ride Info */}
        {acceptedRideInfo && (
          <div className="mt-10 text-center">
            <h2 className="text-2xl font-semibold mb-4">Accepted Ride Information</h2>
            <p><strong>Rider ID:</strong> {acceptedRideInfo.riderID}</p>
            <p><strong>Pickup Location:</strong> {acceptedRideInfo.pickupLocation}</p>
            <p><strong>Dropoff Location:</strong> {acceptedRideInfo.dropoffLocation}</p>
            <p><strong>Distance:</strong> {acceptedRideInfo.distance}</p>
            <p><strong>Price:</strong> {acceptedRideInfo.price}</p>
            {acceptedRideInfo.googleMapsLink && (
              <a
                href={acceptedRideInfo.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                View Directions in Google Maps
              </a>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

export default Drive;
