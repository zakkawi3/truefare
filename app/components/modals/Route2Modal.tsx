'use client';

import { useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import useRoute2Modal from '@/app/hooks/useRoute2Modal';

const Route2Modal = () => {
  const { isOpen, onClose, pickupLocation, dropoffLocation } = useRoute2Modal(); // Use the custom hook

  // Parse locations into coordinates
  const parseLocation = (location: string) => {
    const [lat, lng] = location.split(',').map(Number); // Assumes location is "lat,lng"
    return { lat, lng };
  };

  if (!pickupLocation || !dropoffLocation) {
    console.error('Pickup or dropoff location is missing.');
    return null;
  }

  const pickupCoords = parseLocation(pickupLocation);
  const dropoffCoords = parseLocation(dropoffLocation);

  const handleCompleteTrip = () => {
    onClose(); // Close the modal when the trip is complete
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Route to Dropoff</h1>
      <div style={{ height: '400px', width: '100%', marginBottom: '20px' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }} // Replace with your API Key
          defaultCenter={pickupCoords}
          defaultZoom={14}
        >
          <Marker lat={pickupCoords.lat} lng={pickupCoords.lng} text="Pickup" />
          <Marker lat={dropoffCoords.lat} lng={dropoffCoords.lng} text="Dropoff" />
        </GoogleMapReact>
      </div>
      <button
        className="bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600"
        onClick={handleCompleteTrip}
      >
        Complete Trip
      </button>
    </div>
  );
};

// Marker Component
const Marker = ({ text }: { text: string }) => (
  <div
    style={{
      color: 'white',
      background: 'red',
      padding: '5px 10px',
      borderRadius: '50%',
      textAlign: 'center',
    }}
  >
    {text}
  </div>
);

export default Route2Modal;
