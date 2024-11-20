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
  const [rideConfirmed, setRideConfirmed] = useState(false); // New state for ride confirmation
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
  
      const fetchRiderID = async () => {
        try {
          const riderEmail = localStorage.getItem('userEmail'); // Ensure this is stored during login/registration
          const idResponse = await axios.get(`${BACKEND_URL}/users/${riderEmail}/id`);
          const riderID = idResponse.data.userID;
  
          newSocket.emit('riderJoin', { riderID });
  
          // Listen for ride confirmation
          newSocket.on('rideConfirmed', (data) => {
            console.log('Ride confirmed by driver:', data);
            if (data) {
              setDriverData(data); // Update driverData with confirmed details
              setRideConfirmed(true); // Mark the ride as confirmed
              toast.success('Your ride has been confirmed!');
            }
          });
        } catch (error) {
          console.error('Error fetching rider ID or emitting riderJoin:', error);
        }
      };
  
      fetchRiderID();
  
      return () => {
        console.log("Closing WebSocket connection...");
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [searchingModal.isOpen]);
  

  
  
  
// Stop polling after ride is confirmed
useEffect(() => {
  if (rideConfirmed && intervalId) {
    console.log("Stopping polling because ride is confirmed.");
    clearInterval(intervalId);
    setIntervalId(null);
    searchingModal.onClose(); // Close the modal once confirmed
  }
}, [rideConfirmed, intervalId]);
  
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
      if (driverData?.driverID && rideConfirmed) {
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
      console.log('Notifying driver about the ride:', driverData);
  
      const ridePrice = localStorage.getItem('ridePrice'); // Fetch the price from localStorage
  
      if (!ridePrice) {
        console.error('Price not found in localStorage.');
        toast.error('Failed to retrieve the ride price.');
        return;
      }
  
      socket.emit('acceptRide', {
        driverID: driverData.driverID,
        riderID: driverData.riderID || 'N/A',
        distance: driverData.distance || 'Unknown distance',
        pickupLocation,
        dropoffLocation,
        price: ridePrice, // Include the ride price in the payload
      });
    } else {
      console.error('Socket or driverData missing.');
    }
  };
  
  

  const handleDeclineRide = () => {
    toast.error("Ride declined!");
    setDriverData(null);
  };

  const bodyContent = (
    <div className="flex flex-col gap-6 p-4 text-center">
      <h2 className="text-xl font-semibold text-gray-800">Searching for a driver...</h2>
      {rideConfirmed && driverData ? (
        <div className="space-y-4">
          <p className="text-lg font-medium text-green-700">Driver confirmed your ride!</p>
          <p className="text-gray-600">
            <span className="font-semibold">Driver Name:</span> {driverDetails?.name || 'Unknown Driver'}
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
      <div className="w-full max-w-4xl">
        {/* Driver Details Section */}
    {/* Driver Information Section */}
    {driverDetails && (
      <div className="w-full lg:w-1/2 bg-gray-100 p-4 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Driver Information</h2>
        <div className="flex flex-col space-y-2">
          <p>
            <span className="font-medium">Driver Name:</span> {driverDetails.name}
          </p>
          <p>
            <span className="font-medium">Distance:</span> {driverData.distance}
          </p>
          <p>
            <span className="font-medium">Pickup Location:</span> {driverData.pickupLocation || 'Not available'}
          </p>
          <p>
            <span className="font-medium">Dropoff Location:</span> {driverData.dropoffLocation || 'Not available'}
          </p>
        </div>
      </div>
    )}

      </div>
    </div>
  );
  
  
};

export default SearchingModal;
