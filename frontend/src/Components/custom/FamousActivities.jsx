import ActivityCard from "./ActivityCard"
import Hiking from "@/Assets/PHImg/Hiking.jpg"
import Surfing from "@/Assets/PHImg/Surfing.jpg"
import Sightseeing from "@/Assets/PHImg/Sightseeing.jpg"
import Cycling from "@/Assets/PHImg/Cycling.jpg"

const FamousActivities = () => {
  const activities = [
    {
      name: "Hiking",
      image: Hiking,
      alt: "Person hiking on mountain at sunset",
    },
    {
      name: "Surfing",
      image: Surfing,
      alt: "Person surfing on ocean wave",
    },
    {
      name: "Sightseeing",
      image: Sightseeing,
      alt: "Classical architecture and monuments",
    },
    {
      name: "Cycling",
      image: Cycling,
      alt: "Person cycling on scenic path",
    },
  ]

  return (
    <div>
      <h2 className="text-3xl font-medium mb-8 text-gray-900">Famous Activities</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activities.map((activity, index) => (
          <ActivityCard key={index} name={activity.name} image={activity.image} alt={activity.alt} />
        ))}
      </div>
    </div>
  )
}

export default FamousActivities
