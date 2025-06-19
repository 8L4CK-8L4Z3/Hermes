"use client";

import { useNavigate } from "react-router-dom";
import Logo from "@/Assets/Logo.svg";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export const Footer = () => {
  const navigate = useNavigate();

  const footerSections = [
    {
      title: "Destinations",
      links: [
        {
          name: "Europe",
          action: () => navigate("search", { region: "europe" }),
        },
        { name: "Asia", action: () => navigate("search", { region: "asia" }) },
        {
          name: "Americas",
          action: () => navigate("search", { region: "americas" }),
        },
        {
          name: "Africa",
          action: () => navigate("search", { region: "africa" }),
        },
        {
          name: "Oceania",
          action: () => navigate("search", { region: "oceania" }),
        },
      ],
    },
    {
      title: "Activities",
      links: [
        {
          name: "Adventure",
          action: () => navigate("search", { activity: "adventure" }),
        },
        {
          name: "Cultural",
          action: () => navigate("search", { activity: "cultural" }),
        },
        {
          name: "Relaxation",
          action: () => navigate("search", { activity: "relaxation" }),
        },
        {
          name: "Food & Drink",
          action: () => navigate("search", { activity: "food" }),
        },
        {
          name: "Wildlife",
          action: () => navigate("search", { activity: "wildlife" }),
        },
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
  ];

  const socialLinks = [
    {
      name: "Facebook",
      action: () => {},
      icon: <Facebook className="w-5 h-5" />,
    },
    {
      name: "Instagram",
      action: () => {},
      icon: <Instagram className="w-5 h-5" />,
    },
    {
      name: "Twitter",
      action: () => {},
      icon: <Twitter className="w-5 h-5" />,
    },
    {
      name: "YouTube",
      action: () => {},
      icon: <Youtube className="w-5 h-5" />,
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-5 py-12 lg:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <button
              onClick={() => navigate("home")}
              className="flex items-center space-x-3 mb-4"
            >
              <img
                src={Logo}
                alt="Hermes Logo"
                className="w-8 h-8 filter invert"
              />
              <span className="text-xl font-medium">Hermes</span>
            </button>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Discover amazing destinations, plan unforgettable trips, and
              create memories that last a lifetime.
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

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2024 Hermes. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <button className="text-gray-400 hover:text-white transition-colors duration-200">
              Privacy Policy
            </button>
            <button className="text-gray-400 hover:text-white transition-colors duration-200">
              Terms of Service
            </button>
            <button className="text-gray-400 hover:text-white transition-colors duration-200">
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
