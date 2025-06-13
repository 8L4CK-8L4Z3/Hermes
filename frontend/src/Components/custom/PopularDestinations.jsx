import DestinationCard from "@/Components/custom/DestinationCard";
import { usePopularDestinations } from "@/Stores/destinationStore";

const PopularDestinations = () => {
  const { data: destinations, isLoading, error } = usePopularDestinations(1, 4);

  if (isLoading) {
    return (
      <section className="mb-20">
        <h2 className="text-3xl font-medium mb-8 text-gray-900">
          Popular Destinations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden shadow-medium bg-gray-200 animate-pulse h-48"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    console.error("Error loading popular destinations:", error);
    return null;
  }

  return (
    <section className="mb-20">
      <h2 className="text-3xl font-medium mb-8 text-gray-900">
        Popular Destinations
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {destinations?.data.map((item) => {
          const destination = item.destination_id;
          const primaryImage =
            destination.images.find((img) => img.is_primary)?.url ||
            destination.images[0]?.url;

          return (
            <DestinationCard
              key={destination._id}
              name={destination.name}
              image={primaryImage}
              alt={`${destination.name} - ${destination.description}`}
            />
          );
        })}
      </div>
    </section>
  );
};

export default PopularDestinations;
