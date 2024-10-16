'use client';

import React from 'react';
import useRegisterModal from './hooks/useRegisterModal';
import Button from './components/Button';

export default function Home() {
  const registerModal = useRegisterModal();
  return (
    <div className="flex flex-row items-center justify-center h-screen bg-gray-100">
      {/* Left Side: Text Section */}
      <div> {/* Reduced padding from 8 to 4 */}

        <div className="mt-4 text-left"> {/* Reduced margin-top from 10 to 4 */}
          <h1 className="text-4xl font-bold text-gray-800">
            Transparency in Fare
          </h1>
          <p className="mt-2 text-lg text-gray-600"> {/* Reduced margin-top from 4 to 2 */}
            At TrueFare, we are committed to our drivers and give them the fare they rightfully deserve.
          </p>
        </div>

        <div className="mt-4"> {/* Reduced margin-top from 8 to 4 */}
        <Button 
            label="Get Started"
            onClick={registerModal.onOpen}
        />
        </div>
      </div>

      {/* Right Side: Image Section */}
      <div className="w-1/2 p-4 flex justify-center"> {/* Reduced padding from 8 to 4 */}
        <img
          src="/images/landing_page.png" // Replace with your desired image source
          alt="TrueFare Illustration"
          className="rounded-lg shadow-lg"
          style={{ maxWidth: '100%', height: 'auto' }} // Ensures the image is responsive
        />
      </div>
    </div>
  );
}
