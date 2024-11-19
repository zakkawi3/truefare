'use client';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { FieldValues, useForm } from 'react-hook-form';

import useSearchingModal from '@/app/hooks/useSearchingModal';
import Modal from './Modal';
import toast from 'react-hot-toast';
import useDriverAssignmentModal from '@/app/hooks/useDriverAssignmentModal';
import { BACKEND_URL } from '../../config/config';

const SearchingModal = ({ userCoords, pickupLocation, dropoffLocation }) => {
  const searchingModal = useSearchingModal();
  const driverAssignmentModal = useDriverAssignmentModal();
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  const [riderEmail, setRiderEmail] = useState(null);

  // Fetch rider email from localStorage
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setRiderEmail(email);
      console.log('Rider email loaded:', email);
    } else {
      console.error('Rider email is missing.');
    }
  }, []);

  const pollClosestDriver = useCallback(async () => {
    console.log("Polling closest driver");
    if (!userCoords?.lat || !userCoords?.lng) {
      console.error("User coordinates are missing:", userCoords);
      return;
    }
    if (!riderEmail) {
      console.error("Rider email is missing.");
      return;
    }

    console.log(`Polling ${BACKEND_URL}/riders/closestDriver`, {
      userLat: userCoords.lat,
      userLng: userCoords.lng,
      email: riderEmail,
    });

    setIsLoading(true);
    const loadingToastId = toast.loading('Looking for closest driver...', { id: 'searching-toast' });

    try {
      const response = await axios.get(`${BACKEND_URL}/riders/closestDriver`, {
        params: {
          userLat: userCoords.lat,
          userLng: userCoords.lng,
          email: riderEmail,
        },
      });

      console.log('Received response from /riders/closestDriver:', response.data);
      setDriverData(response.data);

      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      toast.dismiss(loadingToastId);
    } catch (error) {
      console.error('Error finding driver:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userCoords, intervalId, riderEmail]);

  useEffect(() => {
    if (searchingModal.isOpen) {
      console.log("Opening WebSocket connection...");
      const newSocket = io(`${BACKEND_URL}`);
      setSocket(newSocket);

      newSocket.on('rideAssigned', (data) => {
        console.log('Driver assigned:', data);
        setDriverData(data);
        toast.success('Driver found! Ride assigned.', { id: 'assigned-toast' });
      });

      return () => {
        console.log("Closing WebSocket connection...");
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [searchingModal.isOpen]);

  useEffect(() => {
    if (searchingModal.isOpen && !intervalId) {
      console.log("Starting polling interval...");
      const id = setInterval(pollClosestDriver, 5000);
      setIntervalId(id);
    }

    return () => {
      if (intervalId) {
        console.log("Clearing polling interval...");
        clearInterval(intervalId);
        setIntervalId(null);
      }
    };
  }, [searchingModal.isOpen, intervalId, pollClosestDriver]);

  useEffect(() => {
    const fetchDriverDetails = async () => {
      if (driverData?.driverID) {
        try {
          const response = await axios.get(`${BACKEND_URL}/users/${driverData.driverID}`);
          console.log('Fetched driver details:', response.data);
          setDriverDetails(response.data); // Save the driver details in state
        } catch (error) {
          console.error('Error fetching driver details:', error);
          setDriverDetails(null);
        }
      }
    };

    fetchDriverDetails();
  }, [driverData]);

  useEffect(() => {
    if (driverData) {
      handleAcceptRide();
    }
  }, [driverData]);

  const handleAcceptRide = () => {
    if (socket && driverData) {
      console.log('Driver Data is:', driverData);
  
      const ridePrice = localStorage.getItem('ridePrice'); // Fetch the price from localStorage
  
      if (!ridePrice) {
        console.error('Price not found in localStorage.');
        toast.error('Failed to retrieve the ride price.');
        return;
      }
  
      socket.emit('acceptRide', {
        driverID: driverData.driverID,
        riderName: driverData.riderName || 'Unknown Rider',
        riderID: driverData.riderID || 'N/A',
        distance: driverData.distance || 'Unknown distance',
        pickupLocation,
        dropoffLocation,
        price: ridePrice, // Include the ride price in the payload
      });
  
      toast.success('Ride accepted!');
      searchingModal.onClose();
    } else {
      console.error('Driver or Socket information is missing.');
    }
  };
  

  const handleDeclineRide = () => {
    toast.error("Ride declined!");
    setDriverData(null);
  };

  const bodyContent = (
    <div className="flex flex-col gap-6 p-4 text-center">
      <h2 className="text-xl font-semibold text-gray-800">Searching for a driver...</h2>
      {driverData ? (
        <div className="space-y-4">
          <p className="text-lg font-medium text-green-700">Driver found!</p>
          <p className="text-gray-600">
            <span className="font-semibold">Driver Name:</span> {driverDetails?.name || 'Unknown Driver'}
          </p>
          {/*
          <p className="text-gray-600">
            <span className="font-semibold">Driver ID:</span> {driverDetails?.userID || 'N/A'}
          </p>
          */}
          <p className="text-gray-600">
            <span className="font-semibold">Distance:</span> {driverData.distance}
          </p>
        </div>
      ) : (
        <p className="text-gray-500">We’re currently looking for available drivers...</p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <Modal
        disabled={isLoading}
        isOpen={searchingModal.isOpen}
        title="Finding Your Driver"
        actionLabel="Cancel Ride"
        onClose={() => searchingModal.onClose()}
        onSubmit={() => searchingModal.onClose()}
        body={bodyContent}
        actionClassName="bg-red-500 text-white hover:bg-red-600 border-red-500 font-semibold py-2 px-4 rounded-lg transition-colors"
      />
      {driverDetails && (
        <div className="mt-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Driver Information</h2>
          <p>
            <strong>Driver Name:</strong> {driverDetails.name}
          </p>
          {/* 
          <p>
            <strong>Driver ID:</strong> {driverDetails.userID}
          </p>
          */}
          <p>
            <strong>Distance:</strong> {driverData.distance}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchingModal;
