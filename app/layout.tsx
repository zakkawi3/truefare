import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {Nunito} from "next/font/google"
import Navbar from "./components/navbar/Navbar";
import Modal from "./components/modals/Modal";
import RegisterModal from "./components/modals/RegisterModal";

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
        <Navbar />
        <div className="pt-16"> {/* Adjust pt-16 based on your navbar height */}
          {children}
        </div>
      </body>

    </html>
  );
}
