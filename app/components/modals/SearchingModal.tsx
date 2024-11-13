'use-client';

import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';

import useSearchingModal from '@/app/hooks/useSearchingModal';
import Modal from './Modal';
import toast from 'react-hot-toast';

type UserCoords = {
  lat: number;
  lng: number;
};

interface SearchingModalProps {
  userCoords: UserCoords;
  pickupLocation: string;
  dropoffLocation: string;
}

const SearchingModal = ({ userCoords, pickupLocation, dropoffLocation }: SearchingModalProps) => {
  const searchingModal = useSearchingModal();
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [driverData, setDriverData] = useState(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | number | null>(null); // Fix the type here

  const hardcodedLat = 33.7490;
  const hardcodedLng = -84.3880;

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
  }, [userCoords, intervalId, hardcodedLng]);

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
              Decline
            </button>
          </div>
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
