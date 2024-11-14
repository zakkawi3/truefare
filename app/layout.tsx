import type { Metadata } from "next";
import "./globals.css";
import { Nunito } from "next/font/google";
import Navbar from "./components/navbar/Navbar";
import ClientOnly from "./components/ClientOnly";
import RegisterModal from "./components/modals/RegisterModal";
import ToasterProvider from "./providers/ToasterProvider";
import LoginModal from "./components/modals/LoginModal";
import RideModal from "./components/modals/RideModal";
import RidePriceModal from "./components/modals/RidePriceModal";
import SearchingModal from "./components/modals/SearchingModal";
import DriverAssignmentModal from "./components/modals/DriverAssignmentModal";
import PaymentModal from "./components/modals/PaymentModal";
import SessionProviderWrapper from "./components/SessionProviderWrapper";

const font = Nunito({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Truefare",
  description: "Truefare app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <SessionProviderWrapper> {/* Wrap the necessary parts in SessionProvider */}
          <ClientOnly>
            <ToasterProvider />
            <RegisterModal />
            <LoginModal />
            <RideModal />
            <RidePriceModal />
            <SearchingModal userCoords={undefined} pickupLocation={undefined} dropoffLocation={undefined} />
            <PaymentModal />
            <DriverAssignmentModal />
            <Navbar />
            <div className="pt-16"> {/* Adjust pt-16 based on your navbar height */}
              {children}
            </div>
          </ClientOnly>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
