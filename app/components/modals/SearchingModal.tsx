'use client';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { FieldValues, useForm } from 'react-hook-form';

import useSearchingModal from '@/app/hooks/useSearchingModal';
import Modal from './Modal';
import toast from 'react-hot-toast';

const SearchingModal = ({ userCoords }) => {
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

  // Polling function to find the closest driver
  const pollClosestDriver = useCallback(async () => {
    if (!userCoords?.lat || !userCoords?.lng) {
      console.error("User coordinates are missing");
      return;
    }

    console.log('Polling http://localhost:3000/api/closestDriver...');
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/closestDriver', { 
        params: {
          userLat: userCoords.lat,
          userLng: userCoords.lng,
        },
      });

      console.log('Received response from /api/closestDriver:', response.data);
      setDriverData(response.data); 
      toast.success('Searching for closest driver...', { id: 'searching-toast' });
    } catch (error) {
      console.error('Error finding driver:', error);
      toast.error('Something went wrong', { id: 'error-toast' });
    } finally {
      setIsLoading(false);
    }
  }, [userCoords]);

  // Initialize WebSocket connection when the modal opens
  useEffect(() => {
    if (searchingModal.isOpen) {
      const newSocket = io('http://localhost:3000');
      setSocket(newSocket);

      newSocket.on('rideAssigned', (data) => {
        console.log('Driver assigned:', data);
        setDriverData(data);
        toast.success('Driver found! Ride assigned.', { id: 'assigned-toast' });
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [searchingModal.isOpen, intervalId]);

  // Set up polling when modal is open and start the interval
  useEffect(() => {
    if (searchingModal.isOpen && !intervalId) {
      const id = setInterval(pollClosestDriver, 5000); 
      setIntervalId(id);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    };
  }, [searchingModal.isOpen, intervalId, pollClosestDriver]);

  // Accept the ride
  const handleAcceptRide = () => {
    if (socket && driverData) {
      const {
        driverID,
        riderID = "sampleRiderID", // Replace with actual rider ID if available
        distance = driverData.distance || "Unknown distance",
        pickupLocation = "Pickup Address", // Replace with actual pickup location
        dropoffLocation = "Dropoff Address" // Replace with actual dropoff location
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
  
  // Decline the ride
  const handleDeclineRide = () => {
    toast.error("Ride declined!");
    setDriverData(null);
  };

  // Content to be displayed inside the modal
  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div id="distance" className="text-lg">
        <label className="font-medium">Ride Request</label>
        {driverData ? (
          <div>
            <p>Rider ID: {driverData.riderID || "N/A"}</p>
            <p>Distance: {driverData.distance || "N/A"}</p>
            <p>Pickup Location: {driverData.pickupLocation || "N/A"}</p>
            <p>Dropoff Location: {driverData.dropoffLocation || "N/A"}</p>
            <div className="mt-4 flex gap-4 justify-center">
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
      body={bodyContent}
      actionClassName="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
    />
  );
};

export default SearchingModal;
