'use client';

import { useState, useRef } from 'react';
import Container from '../components/Container';
import { FaLocationArrow, FaTimes } from 'react-icons/fa';
import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';

const center = { lat: 33.7501, lng: -84.3880 }; // Default map center

export default function Ride() {
  const [pickupNow, setPickupNow] = useState(true);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const originAutoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationAutoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  });

  const togglePickupNow = () => setPickupNow(!pickupNow);

  async function calculateRoute() {
    if (!originRef.current?.value || !destinationRef.current?.value) {
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);
  }

  function clearRoute() {
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
    if (originRef.current) originRef.current.value = '';
    if (destinationRef.current) destinationRef.current.value = '';
  }

  function recenterMap() {
    if (map) {
      map.panTo(center);
      map.setZoom(15);
    }
  }

  function handleOriginPlaceChanged() {
    const place = originAutoCompleteRef.current?.getPlace();
    if (place && place.geometry) {
      originRef.current!.value = place.formatted_address!;
    }
  }

  function handleDestinationPlaceChanged() {
    const place = destinationAutoCompleteRef.current?.getPlace();
    if (place && place.geometry) {
      destinationRef.current!.value = place.formatted_address!;
    }
  }

  return (
    <Container>
      <div className="flex flex-row justify-between w-full h-full p-8">
        {/* Left Side */}
        <div className="flex flex-col w-1/2 space-y-4">
          <h1 className="text-2xl font-bold">Ride Registration</h1>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Pickup Location</label>
            {isLoaded && (
              <Autocomplete
                onLoad={(autocomplete) => (originAutoCompleteRef.current = autocomplete)}
                onPlaceChanged={handleOriginPlaceChanged}
              >
                <input
                  type="text"
                  ref={originRef}
                  className="border border-gray-300 rounded-lg p-2"
                  placeholder="Enter pickup location"
                />
              </Autocomplete>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Drop-off Location</label>
            {isLoaded && (
              <Autocomplete
                onLoad={(autocomplete) => (destinationAutoCompleteRef.current = autocomplete)}
                onPlaceChanged={handleDestinationPlaceChanged}
              >
                <input
                  type="text"
                  ref={destinationRef}
                  className="border border-gray-300 rounded-lg p-2"
                  placeholder="Enter drop-off location"
                />
              </Autocomplete>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Pickup Now</label>
            <input
              type="checkbox"
              className="toggle-checkbox"
              checked={pickupNow}
              onChange={togglePickupNow}
            />
          </div>

          {!pickupNow && (
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Select Pickup Date and Time</label>
              <input
                type="datetime-local"
                className="border border-gray-300 rounded-lg p-2"
              />
            </div>
          )}

          <div className="flex space-x-4 mt-4">
            <button
              className="bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600"
              onClick={calculateRoute}
            >
              Search for Rides
            </button>
            <button
              className="bg-red-500 text-white rounded-lg py-2 px-4 hover:bg-red-600"
              onClick={clearRoute}
            >
              Clear Route
            </button>
            <button
              className="bg-gray-500 text-white rounded-lg py-2 px-4 hover:bg-gray-600 flex items-center"
              onClick={recenterMap}
            >
              <FaLocationArrow className="mr-2" />
              Re-center
            </button>
          </div>

          <div className="mt-4">
            <p className="text-sm">Distance: {distance}</p>
            <p className="text-sm">Duration: {duration}</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex w-1/2 justify-center">
          <div style={{ width: '500px', height: '500px' }} className="rounded-lg bg-gray-200">
            {!isLoaded ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading map...</p>
              </div>
            ) : (
              <GoogleMap
                center={center}
                zoom={15}
                mapContainerStyle={{ width: '100%', height: '100%' }}
                onLoad={map => setMap(map)}
                options={{
                  zoomControl: false,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                <Marker position={center} />
                {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
              </GoogleMap>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
