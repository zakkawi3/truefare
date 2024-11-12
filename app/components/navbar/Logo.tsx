'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
  const router = useRouter();

  const handleLogoClick = () => {
      router.push('/');
  };

  return (
      <div
          onClick={handleLogoClick}
          className="cursor-pointer"
      >
          <Image
              alt="Logo"
              className="cursor-pointer"
              height="100"
              width="100"
              src="/images/logo.png"
          />
      </div>
  );
}

export default Logo;

