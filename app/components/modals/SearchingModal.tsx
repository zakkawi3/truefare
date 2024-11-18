'use client';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { FieldValues, useForm } from 'react-hook-form';

import useSearchingModal from '@/app/hooks/useSearchingModal';
import Modal from './Modal';
import toast from 'react-hot-toast';

const SearchingModal = ({ userCoords, pickupLocation, dropoffLocation }) => {
  const searchingModal = useSearchingModal();
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [driverData, setDriverData] = useState(null);
  const [intervalId, setIntervalId] = useState(null);

  const hardcodedLat = 33.7490; // Atlanta latitude
  const hardcodedLng = -84.3880; // Atlanta longitude
  
  const { register, formState: { errors } } = useForm<FieldValues>({
    defaultValues: {
      distance: '',
      pay: '',
      userLat: userCoords?.lat || '',
      userLng: userCoords?.lng || ''
    }
  });

  const pollClosestDriver = useCallback(async () => {
    if (!userCoords?.lat || !userCoords?.lng) {
      console.error("User coordinates are missing at pollClosestDriver.");
      return;
    }
  
    console.log('Polling https://octopus-app-agn55.ondigitalocean.app/riders/closestDriver', userCoords);
    setIsLoading(true);
    try {
      const response = await axios.get('https://octopus-app-agn55.ondigitalocean.app/riders/closestDriver', { 
        params: {
          userLat: hardcodedLat,
          userLng: hardcodedLng,
        },
      });
  
      console.log('Received response from /riders/closestDriver:', response.data);
      setDriverData(response.data); 
      toast.success('Searching for closest driver...', { id: 'searching-toast' });
      // Stop polling after finding a driver
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    } catch (error) {
      console.error('Error finding driver:', error);
      toast.error('Something went wrong', { id: 'error-toast' });
    } finally {
      setIsLoading(false);
    }
  }, [userCoords]);
  

  useEffect(() => {
    if (searchingModal.isOpen) {
      console.log("Opening WebSocket connection...");
      const newSocket = io('https://octopus-app-agn55.ondigitalocean.app');
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

  // New useEffect to trigger handleAcceptRide only when driverData is set
  useEffect(() => {
    if (driverData) {
      handleAcceptRide();
    }
  }, [driverData]);

  const handleAcceptRide = () => {
    if (socket && driverData) {
      const {
        driverID,
        riderID = "sampleRiderID", 
        distance = driverData.distance || "Unknown distance"
      } = driverData;

      console.log("Sending ride acceptance with details:", {
        driverID,
        riderID,
        distance,
        pickupLocation,
        dropoffLocation,
      });

      socket.emit('acceptRide', {
        driverID,
        riderID,
        distance,
        pickupLocation,
        dropoffLocation,
      });

      toast.success("Ride accepted!");
      searchingModal.onClose();
    } else {
      console.error("Driver or Socket information is missing.");
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
            <span className="font-semibold">Driver ID:</span> {driverData.driverID}
          </p>
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
  );
};

export default SearchingModal;