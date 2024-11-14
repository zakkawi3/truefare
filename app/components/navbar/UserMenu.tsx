'use client';

import { useState, useCallback, useEffect } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
import MenuItem from './MenuItem';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import { useSession, signOut } from 'next-auth/react';

const UserMenu = () => {
    const registerModal = useRegisterModal();
    const loginModal = useLoginModal();
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const router = useRouter();

    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value);
    }, []);

    const handleNavigate = (path: string) => {
        router.push(path);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative">
            <div className="flex flex-row items-center gap-3">
                {/* Conditionally render "Ride", "Drive", and "Account" if the user is logged in */}
                {!isMobileView && (
                    <>
                        {session?.user && (
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
                                    onClick={() => handleNavigate('/account')}
                                    className="text-sm font-semibold py-3 px-4 rounded-full hover:bg-neutral-100 transition cursor-pointer"
                                >
                                    Account
                                </div>
                            </>
                        )}
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
                                {session?.user && (
                                    <>
                                        <MenuItem onClick={() => handleNavigate('/ride')} label="Ride" />
                                        <MenuItem onClick={() => handleNavigate('/drive')} label="Drive" />
                                        <MenuItem onClick={() => handleNavigate('/account')} label="Account" />
                                    </>
                                )}
                                <MenuItem onClick={() => handleNavigate('/about')} label="About" />
                                <MenuItem onClick={() => handleNavigate('/contact')} label="Contact Us" />
                            </>
                        )}
                        {/* Login, Sign Up, and Logout options based on session */}
                        {session?.user ? (
                            <>
                                <MenuItem onClick={() => handleNavigate('/profile')} label={`Welcome, ${session.user.name || session.user.email}`} />
                                <MenuItem onClick={() => signOut()} label="Logout" />
                            </>
                        ) : (
                            <>
                                <MenuItem onClick={loginModal.onOpen} label="Login" />
                                <MenuItem onClick={registerModal.onOpen} label="Sign Up" />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
