import ActivityCard from "@/Components/custom/ActivityCard";
import { usePopularActivities } from "@/Stores/activityStore";

const FamousActivities = () => {
  const { data, isLoading, error, isError } = usePopularActivities();

  if (isLoading) {
    return (
      <div>
        <h2 className="text-3xl font-medium mb-8 text-gray-900">
          Famous Activities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h2 className="text-3xl font-medium mb-8 text-gray-900">
          Famous Activities
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">
            {error?.message ||
              "Failed to load activities. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div>
        <h2 className="text-3xl font-medium mb-8 text-gray-900">
          Famous Activities
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600">
            No activities available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-medium mb-8 text-gray-900">
        Famous Activities
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.data.map((activity) => (
          <ActivityCard
            key={activity._id}
            name={activity.name}
            image={activity.image}
            alt={`${activity.name} activity`}
          />
        ))}
      </div>
    </div>
  );
};

export default FamousActivities;
