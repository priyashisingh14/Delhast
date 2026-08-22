import React from 'react';

// Campus Architectural Vector for Profile Banner
export const CampusArchitectureIllustration = () => (
  <svg
    viewBox="0 0 450 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full object-contain pointer-events-none select-none opacity-85"
  >
    {/* Soft Trees */}
    <ellipse cx="60" cy="130" rx="30" ry="20" fill="#95D5B2" opacity="0.6" />
    <ellipse cx="100" cy="135" rx="25" ry="18" fill="#74C69D" opacity="0.7" />
    <ellipse cx="380" cy="135" rx="35" ry="20" fill="#95D5B2" opacity="0.6" />
    <ellipse cx="420" cy="130" rx="30" ry="18" fill="#74C69D" opacity="0.7" />

    {/* Distant building silhouettes */}
    <rect x="70" y="70" width="300" height="70" fill="#F8D7C2" opacity="0.5" rx="4" />
    <polygon points="220,20 200,60 240,60" fill="#E8A588" opacity="0.6" />

    {/* Main Campus Grand Building */}
    <rect x="120" y="80" width="200" height="60" fill="#F4C2A5" rx="3" />
    <rect x="150" y="65" width="140" height="75" fill="#EFA784" rx="3" />
    <rect x="185" y="45" width="70" height="95" fill="#E8926C" rx="4" />

    {/* Grand Central Dome */}
    <path d="M195 45 C195 25, 245 25, 245 45 Z" fill="#D97750" />
    <rect x="218" y="15" width="4" height="15" fill="#D97750" />
    <circle cx="220" cy="13" r="3" fill="#F6BD60" />

    {/* Side Towers / Domes */}
    <path d="M130 80 C130 65, 150 65, 150 80 Z" fill="#E8926C" />
    <path d="M290 80 C290 65, 310 65, 310 80 Z" fill="#E8926C" />

    {/* Columns and Arches */}
    <g fill="#FFF5EE" opacity="0.8">
      <rect x="195" y="95" width="8" height="40" rx="2" />
      <rect x="210" y="95" width="8" height="40" rx="2" />
      <rect x="225" y="95" width="8" height="40" rx="2" />
      <rect x="240" y="95" width="8" height="40" rx="2" />

      <rect x="160" y="90" width="6" height="30" rx="1.5" />
      <rect x="172" y="90" width="6" height="30" rx="1.5" />
      <rect x="262" y="90" width="6" height="30" rx="1.5" />
      <rect x="274" y="90" width="6" height="30" rx="1.5" />
    </g>

    {/* Windows */}
    <g fill="#B85D36">
      <rect x="200" y="55" width="8" height="12" rx="4" />
      <rect x="215" y="55" width="8" height="12" rx="4" />
      <rect x="230" y="55" width="8" height="12" rx="4" />
    </g>

    {/* Base Path / Lawn */}
    <path d="M0 140 Q225 130 450 140 L450 160 L0 160 Z" fill="#D8F3DC" opacity="0.7" />
  </svg>
);

// Hero Delivery Scooter + Phone + Food Illustration
export const HeroDeliveryIllustration = () => (
  <svg
    viewBox="0 0 380 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-[340px] sm:max-w-[380px] h-auto select-none pointer-events-none"
  >
    {/* Soft Background Cloud / Glow */}
    <ellipse cx="220" cy="180" rx="140" ry="50" fill="#DCFCE7" opacity="0.8" />

    {/* Smartphone Frame */}
    <rect x="190" y="20" width="120" height="210" rx="22" fill="#2C3E50" />
    <rect x="195" y="25" width="110" height="200" rx="18" fill="#FFFFFF" />

    {/* Phone Screen UI Items */}
    <rect x="205" y="40" width="90" height="12" rx="4" fill="#F1F5F9" />
    <circle cx="215" cy="72" r="14" fill="#FFE8D6" />
    <rect x="235" y="65" width="50" height="6" rx="2" fill="#E2E8F0" />
    <rect x="235" y="75" width="30" height="5" rx="2" fill="#CBD5E1" />

    <circle cx="215" cy="112" r="14" fill="#D8F3DC" />
    <rect x="235" y="105" width="50" height="6" rx="2" fill="#E2E8F0" />
    <rect x="235" y="115" width="30" height="5" rx="2" fill="#CBD5E1" />

    <circle cx="215" cy="152" r="14" fill="#FDE2E4" />
    <rect x="235" y="145" width="50" height="6" rx="2" fill="#E2E8F0" />
    <rect x="235" y="155" width="30" height="5" rx="2" fill="#CBD5E1" />

    {/* Cute Plant Behind Scooter */}
    <path d="M315 170 Q325 130 340 145 Q350 160 335 185 Z" fill="#52B788" />
    <path d="M330 180 Q345 140 360 160 Q365 175 350 190 Z" fill="#40916C" />

    {/* Delivery Scooter */}
    {/* Wheels */}
    <circle cx="95" cy="195" r="22" fill="#334155" />
    <circle cx="95" cy="195" r="12" fill="#94A3B8" />
    <circle cx="195" cy="195" r="22" fill="#334155" />
    <circle cx="195" cy="195" r="12" fill="#94A3B8" />

    {/* Scooter Body (Mint Green) */}
    <path d="M90 190 Q120 180 140 190 L170 190 Q185 180 195 190" stroke="#2D6A4F" strokeWidth="8" strokeLinecap="round" />
    <path d="M85 185 Q90 140 120 140 L160 140 Q170 165 160 185 Z" fill="#52B788" rx="8" />
    <rect x="110" y="130" width="45" height="15" rx="6" fill="#2D6A4F" />

    {/* Front Steering */}
    <path d="M160 180 L180 120 L170 110" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
    <rect x="160" y="105" width="25" height="8" rx="4" fill="#334155" />
    <circle cx="185" cy="115" r="7" fill="#F6BD60" />

    {/* Delhast Delivery Box (Warm Orange) */}
    <rect x="75" y="115" width="42" height="42" rx="8" fill="#FF6B4A" />
    <path d="M75 125 L117 125" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3 3" />
    <circle cx="96" cy="136" r="8" fill="#FFFFFF" opacity="0.9" />
    <path d="M93 136 L95 138 L99 133" stroke="#FF6B4A" strokeWidth="1.8" strokeLinecap="round" />

    {/* Food Bowl & Drink on Foreground */}
    {/* Drink Cup */}
    <path d="M255 175 L260 215 L280 215 L285 175 Z" fill="#F8EDEB" stroke="#E2E8F0" strokeWidth="2" />
    <rect x="252" y="170" width="36" height="6" rx="3" fill="#FFB703" />
    <line x1="270" y1="155" x2="268" y2="170" stroke="#FF5733" strokeWidth="3" strokeLinecap="round" />

    {/* Delicious Food Bowl */}
    <ellipse cx="295" cy="210" rx="35" ry="18" fill="#D97750" />
    <ellipse cx="295" cy="205" rx="32" ry="14" fill="#FFE8D6" />
    {/* Food toppings */}
    <circle cx="285" cy="202" r="5" fill="#52B788" />
    <circle cx="295" cy="200" r="6" fill="#F28482" />
    <circle cx="305" cy="203" r="5" fill="#F6BD60" />
    <circle cx="295" cy="207" r="4" fill="#84A59D" />
  </svg>
);

// Modern Unisex Student Avatar
export const StudentAvatarIllustration = () => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full object-cover select-none"
  >
    {/* Background Circle (Soft Cool Mint / Slate) */}
    <circle cx="40" cy="40" r="38" fill="#E8F4F8" />
    <circle cx="40" cy="40" r="33" fill="#D2EBEF" opacity="0.6" />

    {/* Hoodie / Shoulders (Modern College Emerald) */}
    <path d="M16 80 C16 58, 26 53, 40 53 C54 53, 64 58, 64 80 Z" fill="#236B48" />

    {/* Hoodie Collar & Drawstrings */}
    <path d="M32 53 C32 60, 48 60, 48 53 Z" fill="#1B5638" />
    <path d="M36 54 L36 67" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M44 54 L44 67" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="36" cy="68" r="1.3" fill="#CBD5E1" />
    <circle cx="44" cy="68" r="1.3" fill="#CBD5E1" />

    {/* Neck */}
    <rect x="36" y="43" width="8" height="12" rx="3" fill="#FED0BB" />

    {/* Back Hair */}
    <path d="M26 28 C26 16, 54 16, 54 28 C54 36, 52 42, 50 44 C48 37, 48 30, 48 30 C32 30, 32 37, 30 44 C28 42, 26 36, 26 28 Z" fill="#2D3748" />

    {/* Face */}
    <circle cx="40" cy="34" r="14" fill="#FED0BB" />

    {/* Unisex Modern Top Hair Crop */}
    <path d="M26 30 C26 18, 33 14, 40 14 C47 14, 54 18, 54 30 C51 24, 46 22, 40 22 C34 22, 29 24, 26 30 Z" fill="#1A202C" />
    <circle cx="32" cy="18" r="4.2" fill="#1A202C" />
    <circle cx="39" cy="16" r="4.8" fill="#1A202C" />
    <circle cx="46" cy="17" r="4.2" fill="#1A202C" />

    {/* Ears */}
    <circle cx="26" cy="34" r="2.8" fill="#FED0BB" />
    <circle cx="54" cy="34" r="2.8" fill="#FED0BB" />

    {/* Eyebrows */}
    <path d="M31 27 Q34 25.5 37 27" stroke="#1A202C" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M43 27 Q46 25.5 49 27" stroke="#1A202C" strokeWidth="1.2" strokeLinecap="round" />

    {/* Modern Round Glasses */}
    <circle cx="34" cy="33" r="4.8" stroke="#1E293B" strokeWidth="1.5" fill="#FFFFFF" fillOpacity="0.45" />
    <circle cx="46" cy="33" r="4.8" stroke="#1E293B" strokeWidth="1.5" fill="#FFFFFF" fillOpacity="0.45" />
    <path d="M39 33 L41 33" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />

    {/* Eyes */}
    <circle cx="34" cy="33" r="1.7" fill="#1A202C" />
    <circle cx="46" cy="33" r="1.7" fill="#1A202C" />
    <circle cx="34.8" cy="32.3" r="0.55" fill="#FFFFFF" />
    <circle cx="46.8" cy="32.3" r="0.55" fill="#FFFFFF" />

    {/* Friendly Smile & Subtle Rosy Cheeks */}
    <path d="M37 40.5 Q40 43.5 43 40.5" stroke="#2D3748" strokeWidth="1.6" strokeLinecap="round" />
    <ellipse cx="29" cy="37" rx="2" ry="1.2" fill="#FCA5A5" opacity="0.5" />
    <ellipse cx="51" cy="37" rx="2" ry="1.2" fill="#FCA5A5" opacity="0.5" />
  </svg>
);

// Footer Food Bag Illustration
export const FooterFoodBagIllustration = () => (
  <svg
    viewBox="0 0 100 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-20 h-16 select-none pointer-events-none shrink-0"
  >
    {/* Paper Bag */}
    <path d="M25 20 L30 70 L70 70 L75 20 Z" fill="#E9C46A" />
    <path d="M22 20 L78 20 L75 16 L25 16 Z" fill="#D4A373" />
    {/* Bag Cutout / Logo */}
    <path d="M44 35 L44 55 M50 35 L50 55 M56 35 L56 55" stroke="#9A7B56" strokeWidth="2" strokeLinecap="round" />

    {/* Floating Heart */}
    <rect x="65" y="8" width="22" height="22" rx="6" fill="#FFCCD5" />
    <path d="M76 15 C76 13, 73 12, 71 14 C69 12, 66 13, 66 15 C66 18, 71 21, 71 21 C71 21, 76 18, 76 15 Z" fill="#E63946" />

    {/* Small Cup */}
    <path d="M68 50 L70 70 L84 70 L86 50 Z" fill="#F4A261" />
    <line x1="77" y1="42" x2="77" y2="50" stroke="#E76F51" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// Footer Scooter Illustration
export const FooterScooterIllustration = () => (
  <svg
    viewBox="0 0 120 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-24 h-16 select-none pointer-events-none shrink-0"
  >
    {/* Wheels */}
    <circle cx="28" cy="62" r="10" fill="#334155" />
    <circle cx="92" cy="62" r="10" fill="#334155" />

    {/* Scooter Body (Soft Peach/Orange) */}
    <path d="M25 60 Q40 50 60 55 L75 55 Q85 50 90 60" stroke="#E76F51" strokeWidth="4" strokeLinecap="round" />
    <path d="M25 58 Q30 38 50 38 L65 38 Q72 50 68 58 Z" fill="#F4A261" />

    {/* Steering */}
    <path d="M72 56 L84 28 L78 24" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
    <circle cx="88" cy="30" r="4" fill="#F6BD60" />

    {/* Delivery Box */}
    <rect x="20" y="26" width="22" height="22" rx="4" fill="#FF6B4A" />
    <circle cx="31" cy="37" r="4" fill="#FFFFFF" />
  </svg>
);
