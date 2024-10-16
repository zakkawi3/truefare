'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
    const router = useRouter();

    const handleLogoClick = () => {
        router.push('/'); // Navigate to home page
    };

    return (
        <div
            onClick={handleLogoClick} // Attach the onClick event
            className="cursor-pointer"
        >
            <Image
                alt="Logo"
                className="hidden md:block cursor-pointer"
                height="100"
                width="100"
                src="/images/logo.png"
            />
        </div>
    );
}

export default Logo;
