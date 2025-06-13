import mongoose from "mongoose";

const placesSeedData = [
  {
    destination_id: new mongoose.Types.ObjectId(), // This will need to be updated with actual destination IDs
    type: "Historical Site",
    name: "Colosseum",
    description:
      "The iconic symbol of Imperial Rome and one of the most impressive monuments of the Roman Empire. This massive stone amphitheater was commissioned around A.D. 70-72 by Emperor Vespasian and was a center of entertainment in ancient Rome.",
    images: [
      {
        url: "places/Rome.jpg",
        caption: "The majestic Colosseum at sunset",
        uploaded_at: new Date(),
        is_primary: true,
      },
    ],
    average_rating: 4.8,
    price_range: "$$",
    opening_hours: "8:30 AM - 7:00 PM",
    address: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
  },
  {
    destination_id: new mongoose.Types.ObjectId(),
    type: "Landmark",
    name: "Eiffel Tower",
    description:
      "The most famous landmark in Paris, this wrought-iron lattice tower was originally built as the entrance arch for the 1889 World's Fair. Today, it's one of the most recognizable structures in the world.",
    images: [
      {
        url: "places/Paris.jpg",
        caption: "The Eiffel Tower illuminated at night",
        uploaded_at: new Date(),
        is_primary: true,
      },
    ],
    average_rating: 4.7,
    price_range: "$$$",
    opening_hours: "9:00 AM - 12:45 AM",
    address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
  },
  {
    destination_id: new mongoose.Types.ObjectId(),
    type: "Urban Attraction",
    name: "Times Square",
    description:
      "The bustling heart of Manhattan, known for its bright lights, Broadway theaters, and constant energy. This major commercial intersection is often referred to as 'The Crossroads of the World'.",
    images: [
      {
        url: "places/NewYork.jpg",
        caption: "Times Square's vibrant billboards and crowds",
        uploaded_at: new Date(),
        is_primary: true,
      },
    ],
    average_rating: 4.5,
    price_range: "$$$$",
    opening_hours: "24/7",
    address: "Manhattan, NY 10036, United States",
  },
  {
    destination_id: new mongoose.Types.ObjectId(),
    type: "Natural Wonder",
    name: "Geirangerfjord",
    description:
      "One of Norway's most spectacular fjords, featuring snow-covered mountain peaks, wild waterfalls, and lush vegetation. A UNESCO World Heritage site known for its exceptional natural beauty.",
    images: [
      {
        url: "places/Norway.jpg",
        caption: "The stunning Geirangerfjord landscape",
        uploaded_at: new Date(),
        is_primary: true,
      },
    ],
    average_rating: 4.9,
    price_range: "$$$",
    opening_hours: "24/7",
    address: "Geiranger, 6216, Norway",
  },
  {
    destination_id: new mongoose.Types.ObjectId(),
    type: "Cultural Site",
    name: "Senso-ji Temple",
    description:
      "Tokyo's oldest Buddhist temple, founded in 645 AD. The temple is dedicated to Kannon Bosatsu (Avalokiteshvara Bodhisattva) and is a major attraction in Asakusa.",
    images: [
      {
        url: "places/Japan.jpg",
        caption: "The iconic Senso-ji Temple gates",
        uploaded_at: new Date(),
        is_primary: true,
      },
    ],
    average_rating: 4.6,
    price_range: "$",
    opening_hours: "6:00 AM - 5:00 PM",
    address: "2-3-1 Asakusa, Taito City, Tokyo 111-0032, Japan",
  },
  {
    destination_id: new mongoose.Types.ObjectId(),
    type: "Architecture",
    name: "Sagrada Familia",
    description:
      "Antoni Gaudí's unfinished masterpiece, this stunning basilica is Barcelona's most visited landmark. Its unique architectural style combines Gothic and Art Nouveau forms in a way that's never been seen before or since.",
    images: [
      {
        url: "places/Barcelona.jpg",
        caption: "The magnificent spires of Sagrada Familia",
        uploaded_at: new Date(),
        is_primary: true,
      },
    ],
    average_rating: 4.8,
    price_range: "$$",
    opening_hours: "9:00 AM - 6:00 PM",
    address: "C/ de Mallorca, 401, 08013 Barcelona, Spain",
  },
];

export default placesSeedData;
