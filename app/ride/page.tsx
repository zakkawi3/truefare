'use client';

import { useState, useRef, useEffect } from 'react';
import Container from '../components/Container';
import { FaLocationArrow } from 'react-icons/fa';
import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import useRidePriceModal from '../hooks/useRidePriceModal';
import useDriverAssignmentModal from '../hooks/useDriverAssignmentModal';
import { io } from 'socket.io-client';

const center = { lat: 33.7501, lng: -84.3880 };

export default function Ride() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const ridePriceModal = useRidePriceModal();
  const driverAssignmentModal = useDriverAssignmentModal();
  const [originCoords, setOriginCoords] = useState<{ lat: number, lng: number } | null>(null);

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const originAutoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationAutoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ['places'],
  });

  useEffect(() => {
    const socket = io('https://octopus-app-agn55.ondigitalocean.app');
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('rideAssigned', (data) => {
      console.log('Ride assigned:', data);
      driverAssignmentModal.onOpen();
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

    try {
      const response = await fetch(`https://octopus-app-agn55.ondigitalocean.app/riders/calculatePrice?pickupLat=${results.routes[0].legs[0].start_location.lat()}&pickupLng=${results.routes[0].legs[0].start_location.lng()}&dropoffLat=${results.routes[0].legs[0].end_location.lat()}&dropoffLng=${results.routes[0].legs[0].end_location.lng()}`);
      const data = await response.json();

      if (response.ok) {
        const calculatedCost = `$${data.price}`;
        ridePriceModal.onOpen(distanceText, durationText, calculatedCost);

        const originPlace = originAutoCompleteRef.current?.getPlace();
        if (originPlace && originPlace.geometry) {
          const lat = originPlace.geometry.location.lat();
          const lng = originPlace.geometry.location.lng();
          setOriginCoords({ lat, lng });
        }
      } else {
        console.error('Error calculating price:', data);
      }
    } catch (error) {
      console.error('Error fetching price from API:', error);
    }
  }

  function clearRoute() {
    setDirectionsResponse(null);
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
                  className="border border-gray-300 rounded-lg p-2 w-full"
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
                  className="border border-gray-300 rounded-lg p-2 w-full"
                  placeholder="Enter drop-off location"
                />
              </Autocomplete>
            )}
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4">
            <button onClick={calculateRoute} className="bg-blue-500 text-white rounded-lg py-2 px-6">Search for Rides</button>
            <button onClick={clearRoute} className="bg-red-500 text-white rounded-lg py-2 px-6">Clear Route</button>
            <button onClick={recenterMap} className="bg-gray-500 text-white rounded-lg py-2 px-6 flex items-center gap-2">
              <FaLocationArrow />
              Recenter
            </button>
          </div>
        </div>

        <div className="w-full lg:w-1/2 h-full">
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={center}
              zoom={15}
              onLoad={setMap}
            >
              {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
              {originCoords && <Marker position={originCoords} />}
            </GoogleMap>
          )}
        </div>
      </div>
    </Container>
  );
}
