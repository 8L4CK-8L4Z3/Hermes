import Testimonial from "@/Components/custom/Testimonial";

const PlanYourTrip = () => {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-3xl font-medium text-gray-900">Plan Your Trip</h2>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-soft">
        <div className="mb-2">
          <div className="text-lg font-medium text-gray-900 mb-2">
            Start-to-finish trip planning
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            Learn more
            <span className="text-lg text-gray-400">→</span>
          </div>
        </div>
      </div>

      <Testimonial />
    </div>
  );
};

export default PlanYourTrip;
