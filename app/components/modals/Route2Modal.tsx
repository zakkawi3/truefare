'use client';

import { useRouter } from 'next/navigation';
import GoogleMapReact from 'google-map-react';

const Route2Modal = () => {
  const router = useRouter();
  const { pickupLocation, dropoffLocation } = router.query; // Retrieve query parameters

  // Parse locations into coordinates
  const parseLocation = (location: string) => {
    const [lat, lng] = location.split(',').map(Number); // Assumes location is "lat,lng"
    return { lat, lng };
  };

  const pickupCoords = parseLocation(pickupLocation as string);
  const dropoffCoords = parseLocation(dropoffLocation as string);

  const handleCompleteTrip = () => {
    router.push('/LoginModal'); // Navigate back to LoginModal
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Route to Dropoff</h1>
      <div style={{ height: '400px', width: '100%', marginBottom: '20px' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }} // Replace with your API Key
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
