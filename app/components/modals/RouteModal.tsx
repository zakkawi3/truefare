'use client';

import { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import useRouteModal from '@/app/hooks/useRouteModal';
import useRoute2Modal from '@/app/hooks/useRoute2Modal';
import axios from 'axios';
import { BACKEND_URL } from '@/app/config/config';

const RouteModal = () => {
  const routeModal = useRouteModal();
  const route2Modal = useRoute2Modal();
  const { isOpen, onClose, pickupLocation, dropoffLocation, driverID } = routeModal;

  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const fetchDriverLocation = async () => {
      try {
        console.log('Fetching driver location from backend...');
        const response = await axios.get(`${BACKEND_URL}/drivers/location`, {
          params: { driverID }, // Passing driverID as a query parameter
        });
        const { coordinates } = response.data.location; // Assuming response contains { "type": "Point", "coordinates": [lng, lat] }
        setDriverLocation({ lat: coordinates[1], lng: coordinates[0] }); // Update state with lat and lng
      } catch (error) {
        console.error('Error fetching driver location:', error);
      }
    };

    if (driverID) {
      fetchDriverLocation();
    }
  }, [driverID]);

  const handlePickedUp = () => {
    onClose(); // Close RouteModal
    route2Modal.onOpen(pickupLocation, dropoffLocation); // Open Route2Modal
  };

  if (!isOpen) return null; // Do not render if RouteModal is closed

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Route to Driver</h1>
      <p>
        <strong>Pickup Location:</strong> {pickupLocation}
      </p>
      <p>
        <strong>Dropoff Location:</strong> {dropoffLocation}
      </p>
      <div className="flex justify-between mb-4">
        <button
          className="bg-red-500 text-white rounded-lg py-2 px-4 hover:bg-red-600"
          onClick={onClose}
        >
          Cancel Trip
        </button>
        <button
          className="bg-green-500 text-white rounded-lg py-2 px-4 hover:bg-green-600"
          onClick={handlePickedUp}
        >
          Picked Up
        </button>
      </div>
      {driverLocation ? (
        <div style={{ height: '400px', width: '100%' }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }} // Replace with your API Key
            center={driverLocation}
            defaultZoom={14}
          >
            <Marker lat={driverLocation.lat} lng={driverLocation.lng} text="Driver" />
          </GoogleMapReact>
        </div>
      ) : (
        <p className="text-gray-500">Loading driver location...</p>
      )}
    </div>
  );
};

// Marker Component
const Marker = ({ text }: { text: string }) => (
  <div
    style={{
      color: 'white',
      background: 'blue',
      padding: '5px 10px',
      borderRadius: '50%',
      textAlign: 'center',
    }}
  >
    {text}
  </div>
);

export default RouteModal;
