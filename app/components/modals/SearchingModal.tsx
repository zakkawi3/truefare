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
          userLat: userCoords.lat,
          userLng: userCoords.lng,
        },
      });
  
      console.log('Received response from /riders/closestDriver:', response.data);
      setDriverData(response.data); 
      toast.success('Searching for closest driver...', { id: 'searching-toast' });
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
  }, [searchingModal.isOpen, intervalId]);

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
    <div className="flex flex-col gap-4">
      <div id="distance" className="text-lg">
        <label className="font-medium">Searching for a driver...</label>
        {driverData ? (
          <div>
            <p>Driver found: {driverData.driverID}, Distance: {driverData.distance}</p>
            <div className="mt-4 flex gap-4">
              <button
                className="bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600"
                onClick={handleAcceptRide}
              >
                Accept
              </button>
              <button
                className="bg-red-500 text-white rounded-lg py-2 px-4 hover:bg-red-600"
                onClick={handleDeclineRide}
              >
                Reject
              </button>
            </div>
          </div>
        ) : (
          <p>Searching...</p>
        )}
      </div>
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
      actionClassName="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
    />
  );
};

export default SearchingModal;
