'use-client';
import { useState, useCallback } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { useRouter } from 'next/navigation'; // Import useRouter hook
import MenuItem from './MenuItem';
import useRegisterModal from '@/app/hooks/useRegisterModal';

const UserMenu = () => {
    const registerModal = useRegisterModal();
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value);
    }, []);

    const handleNavigate = (path: string) => {
        router.push(path); // Navigate to the path
    };

    return (
        <div className="relative">
            <div className="flex flex-row items-center gap-3">
                <div
                    onClick={() => {}}
                    className="
                    hidden 
                    md:block
                    text-blue-900
                    text-sm
                    font-semibold
                    py-3
                    px-4
                    rounded-full
                    hover:bg-neutral-100
                    transition 
                    cursor-pointer
                    "
                >
                    Ride
                </div>
                <div
                    onClick={() => {}}
                    className="
                    hidden 
                    md:block
                    text-sm
                    font-semibold
                    py-3
                    px-4
                    rounded-full
                    hover:bg-neutral-100
                    transition 
                    cursor-pointer
                    "
                >
                    Drive
                </div>
                <div
                    onClick={() => handleNavigate('/about')}
                    className="
                    hidden 
                    md:block
                    text-sm
                    font-semibold
                    py-3
                    px-4
                    rounded-full
                    hover:bg-neutral-100
                    transition 
                    cursor-pointer
                    "
                >
                    About
                </div>
                <div
                    onClick={() => handleNavigate('/contact')}
                    className="
                    hidden 
                    md:block
                    text-sm
                    font-semibold
                    py-3
                    px-4
                    rounded-full
                    hover:bg-neutral-100
                    transition 
                    cursor-pointer
                    "
                >
                    Contact Us
                </div>
                <div
                    onClick={toggleOpen}
                    className="
                    md:block
                    text-sm
                    font-semibold
                    py-3
                    px-4
                    rounded-full
                    hover:bg-neutral-100
                    transition 
                    cursor-pointer
                    "
                >
                    <AiOutlineMenu />
                </div>
            </div>
            {isOpen && (
                <div
                    className="
                    absolute
                    rounded-xl
                    shadow-md
                    w-[40vw]
                    md:w-3/4
                    bg-white
                    overflow-hidden
                    right-0
                    top-12
                    text-sm
                    "
                >
                    <div className="flex flex-col cursor-pointer">
                        <MenuItem
                            onClick={registerModal.onOpen}
                            label="Login"
                        />
                        <MenuItem
                            onClick={registerModal.onOpen}
                            label="Sign Up"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserMenu;
