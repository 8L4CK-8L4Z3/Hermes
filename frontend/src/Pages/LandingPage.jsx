import HeroSection from "@/Components/custom/HeroSection";
import PopularDestinations from "@/Components/custom/PopularDestinations";
import PlanYourTrip from "@/Components/custom/PlanYourTrip";
import FamousActivities from "@/Components/custom/FamousActivities";

const LandingPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-5 py-8 lg:py-10">
      <HeroSection />

      <div id="destinations">
        <PopularDestinations />
      </div>

      {/* Bottom Section */}
      <section className="mt-16 lg:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div id="plan">
            <PlanYourTrip />
          </div>
          <div id="activities">
            <FamousActivities />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
