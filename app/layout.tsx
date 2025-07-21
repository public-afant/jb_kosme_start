import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/header";
import Splash from "@/components/splash";

// font-family addition
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "JBKNEW",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${pretendard.variable} flex justify-center w-screen min-h-screen bg-gray-200`}
      >
        <div className="bg-white w-[600px] min-w-[300px] py-3">
          <Splash />
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
