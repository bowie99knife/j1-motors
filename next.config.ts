import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phones and tablets on the same Wi-Fi to load the development
  // client correctly when the site is opened through this computer's LAN IP.
  allowedDevOrigins: ["192.168.1.113"],
};

export default nextConfig;
