'use client';

import { useState } from "react";
import Container from "../components/Container";
import Image from "next/image"; // Assuming you're using Next.js for image optimization

export default function Ride() {
  const [pickupNow, setPickupNow] = useState(false);

  const togglePickupNow = () => setPickupNow(!pickupNow);

  return (
    <Container>
      <div className="flex flex-row justify-between w-full h-full p-8"> 
        {/* Left Side */}
        <div className="flex flex-col w-1/2 space-y-4">
          <h1 className="text-2xl font-bold">Ride Registration</h1>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Pickup Location</label>
            <input
              type="text"
              className="border border-gray-300 rounded-lg p-2"
              placeholder="Enter pickup location"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Drop-off Location</label>
            <input
              type="text"
              className="border border-gray-300 rounded-lg p-2"
              placeholder="Enter drop-off location"
            />
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

          {/* Show date and time selector if toggle is off */}
          {!pickupNow && (
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Select Pickup Date and Time</label>
              <input
                type="datetime-local"
                className="border border-gray-300 rounded-lg p-2"
              />
            </div>
          )}

          <button className="bg-blue-500 text-white rounded-lg py-2 px-4 mt-4 hover:bg-blue-600">
            Search for Rides
          </button>
        </div>

        {/* Right Side */}
        <div className="flex w-1/2 justify-center">
          <Image
            src="/images/map.png"
            alt="Map"
            width={500} // Adjust width/height as needed
            height={500}
            className="rounded-lg"
          />
        </div>
      </div>
    </Container>
  );
}
