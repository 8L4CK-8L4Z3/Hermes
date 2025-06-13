"use client"

import { useContext } from "react"
import { NavigationContext } from "@/Context/Navigate"
import Logo from "@/Assets/Logo.svg"
const Footer = () => {
  const { navigate } = useContext(NavigationContext)

  const footerSections = [
    {
      title: "Destinations",
      links: [
        { name: "Europe", action: () => navigate("search", { region: "europe" }) },
        { name: "Asia", action: () => navigate("search", { region: "asia" }) },
        { name: "Americas", action: () => navigate("search", { region: "americas" }) },
        { name: "Africa", action: () => navigate("search", { region: "africa" }) },
        { name: "Oceania", action: () => navigate("search", { region: "oceania" }) },
      ],
    },
    {
      title: "Activities",
      links: [
        { name: "Adventure", action: () => navigate("search", { activity: "adventure" }) },
        { name: "Cultural", action: () => navigate("search", { activity: "cultural" }) },
        { name: "Relaxation", action: () => navigate("search", { activity: "relaxation" }) },
        { name: "Food & Drink", action: () => navigate("search", { activity: "food" }) },
        { name: "Wildlife", action: () => navigate("search", { activity: "wildlife" }) },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", action: () => {} },
        { name: "Safety", action: () => {} },
        { name: "Contact Us", action: () => {} },
        { name: "Travel Insurance", action: () => {} },
        { name: "Cancellation", action: () => {} },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", action: () => {} },
        { name: "Careers", action: () => {} },
        { name: "Press", action: () => {} },
        { name: "Blog", action: () => {} },
        { name: "Partnerships", action: () => {} },
      ],
    },
  ]

  const socialLinks = [
    {
      name: "Facebook",
      action: () => {},
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      action: () => {},
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323C6.001 8.198 7.152 7.708 8.449 7.708s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323c-.875.807-2.026 1.218-3.323 1.218zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.875-.875-1.365-2.026-1.365-3.323s.49-2.448 1.365-3.323c.875-.926 2.026-1.416 3.323-1.416s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      action: () => {},
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      action: () => {},
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-5 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <button onClick={() => navigate("home")} className="flex items-center space-x-3 mb-4">
              <img src={Logo} alt="Hermes Logo" className="w-8 h-8 filter invert" />
              <span className="text-xl font-medium">Hermes</span>
            </button>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Discover amazing destinations, plan unforgettable trips, and create memories that last a lifetime.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <button
                  key={social.name}
                  onClick={social.action}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-200 group"
                  aria-label={social.name}
                >
                  <span className="text-gray-400 group-hover:text-white transition-colors duration-200">
                    {social.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={link.action}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm text-left"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Stay updated with travel tips</h3>
              <p className="text-gray-400 text-sm">
                Get the latest travel guides, destination insights, and exclusive deals delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-64 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
              />
              <button className="bg-gray-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-600 transition-all duration-200 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">© 2024 Hermes. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-sm">
            <button className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</button>
            <button className="text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</button>
            <button className="text-gray-400 hover:text-white transition-colors duration-200">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
