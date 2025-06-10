import "./Lander.css";

function Lander() {
  return (
    <div className="lander-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Explore
            <br />
            the world
          </h1>
          <p>
            Discover new destinations, plan your next trip, and share your
            travel experiences.
          </p>
          <button className="get-started-btn">Get Started</button>
        </div>
        <div className="hero-image">
          <img
            src="/images/hero-landscape.jpg"
            alt="Scenic mountain landscape"
          />
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="destinations-section">
        <h2>Popular Destinations</h2>
        <div className="destinations-grid">
          <div className="destination-card">
            <img src="/images/rome.jpg" alt="Rome" />
            <span>Rome</span>
          </div>
          <div className="destination-card">
            <img src="/images/newyork.jpg" alt="New York" />
            <span>New York</span>
          </div>
          <div className="destination-card">
            <img src="/images/norway.jpg" alt="Norway" />
            <span>Norway</span>
          </div>
          <div className="destination-card">
            <img src="/images/japan.jpg" alt="Japan" />
            <span>Japan</span>
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <div className="bottom-grid">
        {/* Plan Your Trip */}
        <section className="plan-section">
          <h2>Plan Your Trip</h2>
          <div className="plan-card">
            <p>Start-to-finish trip planning</p>
            <p>Learn more</p>
            <span className="arrow">→</span>
          </div>
          <div className="testimonial">
            <blockquote>
              "Hermes made trip planning so easy and enjoyable! I discovered
              amazing places and connected with fellow travelers."
              <footer>Emily R.</footer>
            </blockquote>
          </div>
        </section>

        {/* Famous Activities */}
        <section className="activities-section">
          <h2>Famous Activities</h2>
          <div className="activities-grid">
            <div className="activity-card">
              <img src="/images/hiking.jpg" alt="Hiking" />
              <span>Hiking</span>
            </div>
            <div className="activity-card">
              <img src="/images/surfing.jpg" alt="Surfing" />
              <span>Surfing</span>
            </div>
            <div className="activity-card">
              <img src="/images/sightseeing.jpg" alt="Sightseeing" />
              <span>Sightseeing</span>
            </div>
            <div className="activity-card">
              <img src="/images/cycling.jpg" alt="Cycling" />
              <span>Cycling</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Lander;
