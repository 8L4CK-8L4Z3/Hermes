"use client";

import { useState } from "react";
import HeroImage from "@/Assets/PHImg/Hero.png";

const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="mb-20">
      <div className="flex items-center gap-15 min-h-[500px] flex-col lg:flex-row">
        <div className="flex-1 max-w-lg text-center lg:text-left">
          <h1 className="text-5xl lg:text-7xl font-light leading-tight mb-6 text-gray-900 tracking-tight">
            Explore
            <br />
            the world
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Discover new destinations, plan your next trip, and share your
            travel experiences.
          </p>
          <button
            className={`bg-white border border-gray-200 px-8 py-4 rounded-xl text-base font-medium cursor-pointer transition-all duration-200 shadow-soft hover:bg-gray-50 hover:shadow-medium ${
              isHovered ? "transform -translate-y-0.5" : ""
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Get Started
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src={HeroImage}
            alt="Mountain landscape with river"
            className="w-full max-w-md h-[450px] object-cover rounded-3xl shadow-large"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
