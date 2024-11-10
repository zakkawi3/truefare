'use client';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';

import useSearchingModal from '@/app/hooks/useSearchingModal';
import Modal from './Modal';
import toast from 'react-hot-toast';

const SearchingModal = ({ userCoords }) => {
  const searchingModal = useSearchingModal();
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [driverData, setDriverData] = useState(null); // Store driver data here
  const [intervalId, setIntervalId] = useState(null);

  const { register, formState: { errors } } = useForm<FieldValues>({
    defaultValues: {
      distance: '',
      pay: '',
      userLat: userCoords?.lat || '', // Use actual coordinates
      userLng: userCoords?.lng || '' // Use actual coordinates
    }
  });

  // Callback for polling, ensuring it's the same function instance
  const pollClosestDriver = useCallback(async () => {
    if (!userCoords?.lat || !userCoords?.lng) {
      console.error("User coordinates are missing");
      return;
    }

    console.log('Polling http://localhost:3000/api/closestDriver...');
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/closestDriver', { // Using full backend URL
        params: {
          userLat: userCoords.lat,
          userLng: userCoords.lng,
        },
      });

      console.log('Received response from /api/closestDriver:', response.data);
      setDriverData(response.data); // Update with received data
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
      console.log("Opening WebSocket connection...");
      const newSocket = io('http://localhost:3000'); // Connect to backend WebSocket on port 3000
      setSocket(newSocket);

      // Listen for "rideAssigned" events from the server
      newSocket.on('rideAssigned', (data) => {
        console.log('Driver assigned:', data);
        setDriverData(data); // Store driver data in state
        toast.success('Driver found! Ride assigned.', { id: 'assigned-toast' });
        searchingModal.onClose(); // Close modal after assigning driver

        // Clear the polling interval once a driver is assigned
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
      });

      return () => {
        console.log("Closing WebSocket connection...");
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [searchingModal.isOpen, intervalId]);

  // Set up polling when modal is open and start the interval
  useEffect(() => {
    if (searchingModal.isOpen && !intervalId) {
      console.log("Starting polling interval...");
      const id = setInterval(pollClosestDriver, 5000); // Call every 5 seconds
      setIntervalId(id);
    }

    // Clear interval when modal closes
    return () => {
      if (intervalId) {
        console.log("Clearing polling interval...");
        clearInterval(intervalId);
        setIntervalId(null);
      }
    };
  }, [searchingModal.isOpen, intervalId, pollClosestDriver]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div id="distance" className="text-lg">
        <label className="font-medium">Searching for a driver...</label>
        {driverData ? (
          <p>Driver found: {driverData.driverID}, Distance: {driverData.distance}</p>
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
      onClose={() => {
        console.log('Modal closed by user');
        searchingModal.onClose();
      }}
      body={bodyContent}
      actionClassName="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
    />
  );
};

export default SearchingModal;
