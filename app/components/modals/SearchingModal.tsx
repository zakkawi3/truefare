'use client';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { FieldValues, useForm } from 'react-hook-form';

import useSearchingModal from '@/app/hooks/useSearchingModal';
import Modal from './Modal';
import toast from 'react-hot-toast';

const SearchingModal = () => {  // Removed userCoords prop
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
      userLat: hardcodedLat,
      userLng: hardcodedLng
    }
  });

  // Callback for polling
  const pollClosestDriver = useCallback(async () => {
    if (driverData) return;  // Stop polling if driverData is already set

    console.log('Polling https://octopus-app-agn55.ondigitalocean.app/riders/closestDriver...');
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
  }, [driverData, intervalId]);

  // Initialize WebSocket connection when the modal opens
  useEffect(() => {
    if (searchingModal.isOpen) {
      console.log("Opening WebSocket connection...");
      const newSocket = io('https://octopus-app-agn55.ondigitalocean.app');
      setSocket(newSocket);

      newSocket.on('rideAssigned', (data) => {
        console.log('Driver assigned:', data);
        setDriverData(data);
        toast.success('Driver found! Ride assigned.', { id: 'assigned-toast' });
        searchingModal.onClose();

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
