"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/Utils/imageUpload";

const DestinationCard = ({ image, name, alt }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shadow-medium transition-transform duration-200 cursor-pointer ${
        isHovered ? "transform -translate-y-1" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate("/register")}
    >
      <img
        src={getImageUrl(image)}
        alt={alt}
        className="w-full h-48 object-cover"
      />
      <div className="absolute bottom-4 left-4">
        <span className="text-white text-xl font-semibold drop-shadow-lg">
          {name}
        </span>
      </div>
    </div>
  );
};

export default DestinationCard;
