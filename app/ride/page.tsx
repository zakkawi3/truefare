'use client';

import { useState, useRef, useEffect } from 'react';
import Container from '../components/Container';
import { FaLocationArrow } from 'react-icons/fa';
import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import useRidePriceModal from '../hooks/useRidePriceModal';
import useDriverAssignmentModal from '../hooks/useDriverAssignmentModal';
import axios from 'axios';
import { io } from 'socket.io-client';
import SearchingModal from '../components/modals/SearchingModal';

const center = { lat: 33.7501, lng: -84.3880 }; // Default map center

export default function Ride() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [cost, setCost] = useState('');
  const [rideAccepted, setRideAccepted] = useState(false); // New state to track ride acceptance
  const ridePriceModal = useRidePriceModal();
  const driverAssignmentModal = useDriverAssignmentModal();
  const [originCoords, setOriginCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [assignedDriverData, setAssignedDriverData] = useState(null); // Store driver data upon assignment

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const originAutoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationAutoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  });

  useEffect(() => {
    const socket = io('http://localhost:3000'); // Update with your backend URL if different

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('rideAssigned', (data) => {
      console.log('Ride assigned:', data);
      setAssignedDriverData(data); // Save assigned driver data
      driverAssignmentModal.onOpen();
    });

    socket.on('rideAcceptedByDriver', (data) => {
      console.log('Ride accepted by driver:', data);
      setRideAccepted(true);
      // Optionally update the UI to show ETA, etc.
      driverAssignmentModal.onClose();
    });

    socket.on('rideRejectedByDriver', () => {
      console.log('Ride rejected by driver');
      setAssignedDriverData(null);
      driverAssignmentModal.onClose();
      // Re-open modal to search for a new driver or inform the user
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      socket.disconnect();
    };
  }, [driverAssignmentModal]);

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
    const distanceText = results.routes[0].legs[0].distance.text;
    const durationText = results.routes[0].legs[0].duration.text;
    setDistance(distanceText);
    setDuration(durationText);

    // Calculate price based on distance
    const distanceValue = parseFloat(distanceText.replace(/[^\d.]/g, ''));
    const ratePerMile = 1.5;
    const calculatedCost = `$${(distanceValue * ratePerMile).toFixed(2)}`;
    setCost(calculatedCost);

    ridePriceModal.onOpen(distanceText, durationText, calculatedCost);

    // Extract origin coordinates and set them
    const originPlace = originAutoCompleteRef.current?.getPlace();
    if (originPlace && originPlace.geometry) {
      const lat = originPlace.geometry.location.lat();
      const lng = originPlace.geometry.location.lng();
      setOriginCoords({ lat, lng });
    }

    // Store pickup and dropoff locations
    setPickupLocation(originRef.current.value);
    setDropoffLocation(destinationRef.current.value);
  }

  function clearRoute() {
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
    setCost('');
    setRideAccepted(false);
    setAssignedDriverData(null);
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
            <p className="text-sm">Price: {cost}</p>
            {rideAccepted && <p className="text-sm text-green-500">Ride accepted by driver!</p>}
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
      {/* Render SearchingModal only when originCoords is set */}
      {originCoords && !rideAccepted && (
        <SearchingModal 
          userCoords={originCoords} 
          pickupLocation={pickupLocation} 
          dropoffLocation={dropoffLocation} 
        />
      )}
    </Container>
  );
}
