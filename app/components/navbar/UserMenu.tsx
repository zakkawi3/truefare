'use client';
import { useState, useCallback, useEffect } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
import MenuItem from './MenuItem';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import useLoginModal from '@/app/hooks/useLoginModal';

const UserMenu = () => {
    const registerModal = useRegisterModal();
    const loginModal = useLoginModal();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false); // Track screen size
    const router = useRouter();

    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value);
    }, []);

    const handleNavigate = (path: string) => {
        router.push(path);
        setIsOpen(false); // Close menu after navigating
    };

    useEffect(() => {
        // Function to check if the screen is below medium size (768px)
        const handleResize = () => setIsMobileView(window.innerWidth < 768);

        // Initial check
        handleResize();

        // Add resize event listener
        window.addEventListener('resize', handleResize);

        // Clean up the event listener
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative">
            <div className="flex flex-row items-center gap-3">
                {/* Render menu items in navbar only if not in mobile view */}
                {!isMobileView && (
                    <>
                        <div
                            onClick={() => handleNavigate('/ride')}
                            className="text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                        >
                            Ride
                        </div>
                        <div
                            onClick={() => handleNavigate('/drive')}
                            className="text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                        >
                            Drive
                        </div>
                        <div
                            onClick={() => handleNavigate('/about')}
                            className="text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                        >
                            About
                        </div>
                        <div
                            onClick={() => handleNavigate('/contact')}
                            className="text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                        >
                            Contact Us
                        </div>
                    </>
                )}

                {/* Always show the AiOutlineMenu icon */}
                <div
                    onClick={toggleOpen}
                    className="text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                >
                    <AiOutlineMenu />
                </div>
            </div>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute rounded-xl shadow-md w-[40vw] md:w-3/4 bg-white overflow-hidden right-0 top-12 text-sm">
                    <div className="flex flex-col cursor-pointer">
                        {/* Render items in dropdown only if in mobile view */}
                        {isMobileView && (
                            <>
                                <MenuItem onClick={() => handleNavigate('/ride')} label="Ride" />
                                <MenuItem onClick={() => handleNavigate('/drive')} label="Drive" />
                                <MenuItem onClick={() => handleNavigate('/about')} label="About" />
                                <MenuItem onClick={() => handleNavigate('/contact')} label="Contact Us" />
                            </>
                        )}
                        {/* Login and Sign Up (always available in dropdown) */}
                        <MenuItem onClick={loginModal.onOpen} label="Login" />
                        <MenuItem onClick={registerModal.onOpen} label="Sign Up" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
