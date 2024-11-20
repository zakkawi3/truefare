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
  const [hasAcceptedRide, setHasAcceptedRide] = useState(false);
  const [currentRideRequest, setCurrentRideRequest] = useState(null);

  const [riderData, setRiderData] = useState<{
    riderID?: string;
    riderName?: string;
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
          const idResponse = await axios.get(`${BACKEND_URL}/users/${driverEmail}/id`);
          const fetchedDriverID = idResponse.data.userID;
          setDriverID(fetchedDriverID);

          newSocket.emit('startDrive', { driverID: fetchedDriverID });

          newSocket.on('rideAcceptedNotification', (data) => {
            if (!currentRideRequest && !acceptedRideInfo) {
              const rideRequest = {
                riderID: data.riderID,
                riderName: data.riderName,
                distance: data.distance,
                pickupLocation: data.pickupLocation,
                dropoffLocation: data.dropoffLocation,
                price: data.price,
                googleMapsLink: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                  data.pickupLocation
                )}&destination=${encodeURIComponent(data.dropoffLocation)}`
              };
              
              setCurrentRideRequest(rideRequest);
              setRiderData(rideRequest);
              setShowRideRequest(true);
            }
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
      }
    };
  }, [isDriving, currentRideRequest, acceptedRideInfo]);

  const handleAcceptRide = async () => {
    if (!socket || !driverID || !currentRideRequest?.riderID) {
      console.error('Socket or ride data is missing.');
      return;
    }

    setShowRideRequest(false);

    try {
      await axios.put(
        `${BACKEND_URL}/users/${driverID}/deactivate`,
        {},
        { headers: { 'Content-Type': 'application/json' } }
      );

      socket.emit('driverConfirmed', {
        driverID,
        riderID: currentRideRequest.riderID,
        distance: currentRideRequest.distance,
        pickupLocation: currentRideRequest.pickupLocation,
        dropoffLocation: currentRideRequest.dropoffLocation,
        price: currentRideRequest.price,
      });

      toast.success('Ride accepted!');
      setAcceptedRideInfo(currentRideRequest);
    } catch (error) {
      console.error('Error handling ride acceptance:', error);
      setCurrentRideRequest(null);
      alert('Failed to accept the ride. Please try again.');
    }
  };
  
  
  

  const handleDeclineRide = () => {
    console.log('Ride declined by driver:', riderData);
    setShowRideRequest(false);
  };

  const handleStartDrive = async () => {
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

          try {
            const idResponse = await axios.get(
              `${BACKEND_URL}/users/${driverEmail}/id`
            );
            const fetchedDriverID = idResponse.data.userID;
            setDriverID(fetchedDriverID);

            await axios.put(
              `${BACKEND_URL}/users/${fetchedDriverID}/activate`,
              {},
              { headers: { 'Content-Type': 'application/json' } }
            );
            console.log('Driver activated successfully.');

            await axios.put(
              `${BACKEND_URL}/drivers/${fetchedDriverID}/location`,
              { userLat, userLng },
              { headers: { 'Content-Type': 'application/json' } }
            );
            console.log('Driver location updated successfully.');
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
    console.log('Driver stopped looking for a ride.');

    if (driverID !== null) {
      try {
        await axios.put(
          `${BACKEND_URL}/users/${driverID}/deactivate`,
          {},
          { headers: { 'Content-Type': 'application/json' } }
        );
        console.log('Driver deactivated successfully.');
      } catch (error) {
        console.error('Error deactivating driver:', error);
      }
    } else {
      console.error("Driver ID is not defined.");
    }

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    toast.success('Ride complete!');
    setAcceptedRideInfo(null);
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

        {/* Modal for Ride Request */}
        {showRideRequest && (
          <Modal
            isOpen={showRideRequest}
            title="Ride Request"
            onClose={() => setShowRideRequest(false)}
            body={
              <div className="space-y-4">
                <p className="text-gray-600">
                  {/* <span className="font-semibold">Rider ID:</span> {riderData.riderID} */}
                  <span className="font-semibold">Rider Name</span> {riderData.riderName}
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
    <p><strong>Rider Name:</strong> {acceptedRideInfo.riderName}</p>
    <p><strong>Pickup Location:</strong> {acceptedRideInfo.pickupLocation}</p>
    <p><strong>Dropoff Location:</strong> {acceptedRideInfo.dropoffLocation}</p>
    <p><strong>Distance:</strong> {acceptedRideInfo.distance}</p>
    <p><strong>Price:</strong> {acceptedRideInfo.price}</p>
    {acceptedRideInfo.pickupLocation && acceptedRideInfo.dropoffLocation && (
      <div className="mt-4">
        <iframe
          src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${encodeURIComponent(
            acceptedRideInfo.pickupLocation
          )}&destination=${encodeURIComponent(
            acceptedRideInfo.dropoffLocation
          )}`}
          width="100%"
          height="400"
          allowFullScreen
          loading="lazy"
          style={{ border: 0 }}
        />
      </div>
    )}
  </div>
)}


      </div>
    </Container>
  );
};

export default Drive;
