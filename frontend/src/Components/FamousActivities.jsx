import ActivityCard from "@/Components/ActivityCard"
import hiking from "@/Assets/PHImg/Hiking.jpg"
import surfing from "@/Assets/PHImg/Surfing.jpg"
import sightseeing from "@/Assets/PHImg/Sightseeing.jpg"
import cycling from "@/Assets/PHImg/Cycling.jpg"

const FamousActivities = () => {
  const activities = [
    {
      name: "Hiking",
      image: hiking,
      alt: "Hiker silhouette on mountain ridge at sunrise",
    },
    {
      name: "Surfing",
      image: surfing,
      alt: "Surfer riding a large turquoise wave",
    },
    {
      name: "Sightseeing",
      image: sightseeing,
      alt: "Beautiful Mughal architecture with red sandstone and marble",
    },
    {
      name: "Cycling",
      image: cycling,
      alt: "Mountain biker silhouetted against sunset with mountains",
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
