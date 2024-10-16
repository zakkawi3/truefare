import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {Nunito} from "next/font/google"
import Navbar from "./components/navbar/Navbar";
import ClientOnly from "./components/ClientOnly";
import Modal from "./components/modals/Modal";
import RegisterModal from "./components/modals/RegisterModal";
import ToasterProvider from "./providers/ToasterProvider";
import LoginModal from "./components/modals/LoginModal";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const font = Nunito({
  subsets: ["latin"],
})

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
        <ClientOnly>
          <ToasterProvider />
          <RegisterModal />
          <LoginModal />
          <Navbar />
          <div className="pt-16"> {/* Adjust pt-16 based on your navbar height */}
          {children}
        </div>
        </ClientOnly>
      </body>

    </html>
  );
}
