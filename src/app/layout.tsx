import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "J1 Motors | Car Repairs & Diagnostics Belmont",
    template: "%s | J1 Motors",
  },
  description: "Trusted automotive servicing, diagnostics and repairs for all makes and models in Belmont, Western Australia.",
  metadataBase: new URL("https://j1motors.netlify.app"),
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  openGraph: {
    title: "J1 Motors | Driven by Passion. Built on Trust.",
    description: "Automotive servicing, diagnostics and repairs in Belmont, WA.",
    type: "website",
    locale: "en_AU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
