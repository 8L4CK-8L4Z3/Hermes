"use client"

import { useState } from "react"

const ActivityCard = ({ image, name, alt }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-medium transition-transform duration-200 cursor-pointer ${
        isHovered ? "transform -translate-y-0.5" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={image || "/placeholder.svg?height=120&width=140"}
        alt={alt}
        className="w-full h-28 lg:h-32 object-cover"
      />
      <div className="absolute bottom-2 lg:bottom-3 left-2 lg:left-3">
        <span className="text-white text-sm lg:text-base font-semibold drop-shadow-md">{name}</span>
      </div>
    </div>
  )
}

export default ActivityCard
