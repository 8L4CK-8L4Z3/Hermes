"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import hero from "@/Assets/Hero.png";

const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="mb-16 lg:mb-20 pt-8 lg:pt-12">
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 min-h-[400px] lg:min-h-[500px]">
        <div className="flex-1 max-w-lg text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light leading-tight mb-6 text-gray-900 tracking-tight">
            Explore
            <br />
            the world
          </h1>
          <p className="text-base lg:text-lg text-gray-600 mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
            Discover new destinations, plan your next trip, and share your
            travel experiences.
          </p>
          <button
            className={`bg-white border border-gray-200 text-gray-900 px-6 lg:px-8 py-3 lg:py-4 rounded-xl text-sm lg:text-base font-medium cursor-pointer transition-all duration-200 shadow-soft hover:bg-gray-50 hover:shadow-medium ${
              isHovered ? "transform -translate-y-0.5" : ""
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </div>
        <div className="flex-1 flex justify-center w-full">
          <img
            src={hero}
            alt="Two travelers with backpacks exploring scenic mountains with airplane in sky"
            className="w-full max-w-sm lg:max-w-md h-80 lg:h-[450px] object-cover rounded-2xl lg:rounded-3xl shadow-large"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
