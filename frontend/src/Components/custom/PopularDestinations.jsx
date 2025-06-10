import DestinationCard from "./DestinationCard"
import Japan from "@/Assets/PHImg/Japan.jpg"
import NewYork from "@/Assets/PHImg/NewYork.jpg"
import Norway from "@/Assets/PHImg/Norway.jpg"
import Rome from "@/Assets/PHImg/Rome.jpg"

const PopularDestinations = () => {
  const destinations = [
    {
      name: "Rome",
      image: Rome,
      alt: "Rome architecture with classical buildings",
    },
    {
      name: "New York",
      image: NewYork,
      alt: "New York city skyline at sunset",
    },
    {
      name: "Norway",
      image: Norway,
      alt: "Norwegian fjords and mountains",
    },
    {
      name: "Japan",
      image: Japan,
      alt: "Japanese mountain landscape",
    },
  ]

  return (
    <section className="mb-20">
      <h2 className="text-3xl font-medium mb-8 text-gray-900">Popular Destinations</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {destinations.map((destination, index) => (
          <DestinationCard key={index} name={destination.name} image={destination.image} alt={destination.alt} />
        ))}
      </div>
    </section>
  )
}

export default PopularDestinations
