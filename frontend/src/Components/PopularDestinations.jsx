import DestinationCard from "@/Components/DestinationCard"
import rome from "@/Assets/PHImg/Rome.jpg"
import newyork from "@/Assets/PHImg/NewYork.jpg"
import norway from "@/Assets/PHImg/Norway.jpg"
import japan from "@/Assets/PHImg/Japan.jpg"

const PopularDestinations = () => {
  const destinations = [
    {
      name: "Rome",
      image: rome,
      alt: "Rome skyline with classical architecture and domes",
    },
    {
      name: "New York",
      image: newyork,
      alt: "New York city skyline at sunset with dramatic clouds",
    },
    {
      name: "Norway",
      image: norway,
      alt: "Norwegian fjords with snow-capped mountains and reflections",
    },
    {
      name: "Japan",
      image: japan,
      alt: "Mount Fuji with lake and cherry blossoms at sunset",
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
