"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/Utils/imageUpload";

const ActivityCard = ({ image, name, alt }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const navigate = useNavigate();

  const handleImageError = () => {
    setImageError(true);
    setIsImageLoading(false);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  // Validate required props
  if (!image || !name) {
    console.error("ActivityCard: Missing required props (image or name)");
    return null;
  }

  const imageUrl = getImageUrl(image);

  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-medium transition-transform duration-200 cursor-pointer ${
        isHovered ? "transform -translate-y-0.5" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate("/register")}
    >
      {isImageLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={imageError ? "/placeholder.svg?height=120&width=140" : imageUrl}
        alt={alt || name}
        className={`w-full h-28 lg:h-32 object-cover ${
          isImageLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-200`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        crossOrigin="anonymous"
      />
      <div className="absolute bottom-2 lg:bottom-3 left-2 lg:left-3">
        <span className="text-white text-sm lg:text-base font-semibold drop-shadow-md">
          {name}
        </span>
      </div>
    </div>
  );
};

ActivityCard.propTypes = {
  image: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  alt: PropTypes.string,
};

ActivityCard.defaultProps = {
  alt: "",
};

export default ActivityCard;
