'use client';

import React, { useState, useRef, useEffect } from 'react';
import Container from '../components/Container';
import { FaLocationArrow } from 'react-icons/fa';
import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import useRidePriceModal from '../hooks/useRidePriceModal';
import useDriverAssignmentModal from '../hooks/useDriverAssignmentModal';
import { io } from 'socket.io-client';
import SearchingModal from '../components/modals/SearchingModal';
import PaymentModal from '../components/modals/PaymentModal'; // Import PaymentModal
import RidePriceModal from '../components/modals/RidePriceModal'; // Import RidePriceModal
import { BACKEND_URL } from '../config/config';

const center = { lat: 33.7501, lng: -84.3880 }; // Default map center

export default function Ride() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [cost, setCost] = useState('');
  const ridePriceModal = useRidePriceModal(); // Use the ride modal hook
  const driverAssignmentModal = useDriverAssignmentModal();
  const [originCoords, setOriginCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [pickupLocation, setPickupLocation] = useState(''); // New state for pickup location
  const [dropoffLocation, setDropoffLocation] = useState(''); // New state for dropoff location
  const [pickupLat, setPickupLat] = useState<number | null>(null); // New state for pickup latitude
  const [pickupLng, setPickupLng] = useState<number | null>(null); // New state for pickup longitude
  const [dropoffLat, setDropoffLat] = useState<number | null>(null); // New state for dropoff latitude
  const [dropoffLng, setDropoffLng] = useState<number | null>(null); // New state for dropoff longitude

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const originAutoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationAutoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  });

  useEffect(() => {
    const socket = io(`${BACKEND_URL}`); // Update with your backend URL if different
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('rideAssigned', (data) => {
      console.log('Ride assigned:', data);
      driverAssignmentModal.onOpen(); // Open the modal when a ride is assigned
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
  
    const distanceText = results.routes[0].legs[0].distance?.text || '';
    const durationText = results.routes[0].legs[0].duration?.text || '';
    setDistance(distanceText);
    setDuration(durationText);
  
    // Extract distance value in kilometers or miles
    const distanceValue = parseFloat(distanceText.replace(/[^\d.]/g, ''));
  
    // Coordinates of pickup (origin) and dropoff (destination)
    const pickupLat = results.routes[0].legs[0].start_location.lat();
    const pickupLng = results.routes[0].legs[0].start_location.lng();
    const dropoffLat = results.routes[0].legs[0].end_location.lat();
    const dropoffLng = results.routes[0].legs[0].end_location.lng();
  
    // Call the backend API to get the calculated price
    try {
      const response = await fetch(`${BACKEND_URL}/riders/calculatePrice?pickupLat=${pickupLat}&pickupLng=${pickupLng}&dropoffLat=${dropoffLat}&dropoffLng=${dropoffLng}`);
      const data = await response.json();
  
      if (response.ok) {
        const calculatedCost = `$${data.price}`;
        setCost(calculatedCost);
        ridePriceModal.onOpen(distanceText, durationText, calculatedCost); 
  
        // Extract origin coordinates and set them
        const originPlace = originAutoCompleteRef.current?.getPlace();
        if (originPlace && originPlace.geometry) {
          const lat = originPlace.geometry.location?.lat();
          const lng = originPlace.geometry.location?.lng();
          if (lat !== undefined && lng !== undefined) {
            setOriginCoords({ lat, lng });
          }
        }
  
        // Store pickup and dropoff locations
        setPickupLocation(originRef.current.value);
        setDropoffLocation(destinationRef.current.value);
        setPickupLat(pickupLat); // Set pickup latitude
        setPickupLng(pickupLng); // Set pickup longitude
        setDropoffLat(dropoffLat); // Set dropoff latitude
        setDropoffLng(dropoffLng); // Set dropoff longitude
      } else {
        console.error('Error calculating price:', data);
      }
    } catch (error) {
      console.error('Error fetching price from API:', error);
    }
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
    <div className="flex flex-col lg:flex-row justify-between w-full h-full p-4 lg:p-8 space-y-6 lg:space-y-0">
      {/* Left Side: Form Section */}
      <div className="flex flex-col w-full lg:w-1/2 space-y-4">
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
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500 w-full"
                placeholder="Enter pickup location"
              />
            </Autocomplete>
          )}
        </div>

        <div className="flex flex-col space-y=2">
          <label className="text-sm font-medium">Drop-off Location</label>
          {isLoaded && (
            <Autocomplete
              onLoad={(autocomplete) => (destinationAutoCompleteRef.current = autocomplete)}
              onPlaceChanged={handleDestinationPlaceChanged}
            >
              <input
                type="text"
                ref={destinationRef}
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500 w-full"
                placeholder="Enter drop-off location"
              />
            </Autocomplete>
          )}
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4">
          <button
            className="bg-blue-500 text-white rounded-lg py-2 px-6 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-auto"
            onClick={calculateRoute}
          >
            Search for Rides
          </button>
          
          <button
            className="bg-red-500 text-white rounded-lg py-2 px-6 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 w-full lg:w-auto"
            onClick={clearRoute}
          >
            Clear Route
          </button>
          
          <button
            className="bg-gray-500 text-white rounded-lg py-2 px-6 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center w-full lg:w-auto"
            onClick={recenterMap}
          >
            <FaLocationArrow className="mr-2" />
            Re-center
          </button>
        </div>


        {/* <div className="mt-4 text-sm text-gray-600">
          <p><strong>Distance:</strong> {distance}</p>
          <p><strong>Duration:</strong> {duration}</p>
          <p><strong>Price:</strong> {cost}</p>
        </div> */}
      </div>

      {/* Right Side: Map Section */}
      <div className="flex w-full lg:w-1/2 justify-center">
        <div className="w-full h-[300px] sm:h-[400px] lg:w-[450px] lg:h-[450px] rounded-lg bg-gray-200">
          {!isLoaded ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading map...</p>
            </div>
          ) : (
            <GoogleMap
              center={center}
              zoom={15}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              onLoad={(map) => setMap(map)}
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

    {originCoords && (
      <SearchingModal userCoords={originCoords} pickupLocation={pickupLocation} dropoffLocation={dropoffLocation} />
    )}

    {pickupLat && pickupLng && dropoffLat && dropoffLng && (
      <PaymentModal pickupLat={pickupLat} pickupLng={pickupLng} dropoffLat={dropoffLat} dropoffLng={dropoffLng} />
    )}

    <RidePriceModal />
  </Container>
  );
}