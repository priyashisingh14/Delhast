import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export const BrandLogo = ({ size = 'md', linkTo = '/' }) => {
  const isLarge = size === 'lg';

  const content = (
    <div className="inline-flex items-center gap-2.5 group select-none cursor-pointer">
      {/* Delhast Warm Orange Round Icon */}
      <div
        className={`${
          isLarge ? 'w-10 h-10' : 'w-8 h-8'
        } rounded-full bg-gradient-to-tr from-[#FF5733] to-[#FF7A59] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0`}
      >
        <UtensilsCrossed className={isLarge ? 'w-5 h-5' : 'w-4 h-4'} />
      </div>

      <div>
        <span
          className={`font-extrabold tracking-tight text-[#FF5733] block leading-tight ${
            isLarge ? 'text-2xl' : 'text-xl'
          }`}
        >
          Delhast
        </span>
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
};
