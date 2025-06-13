"use client";

import { useState } from "react";
import {
  useGlobalSearch,
  useDestinationSearch,
  usePlaceSearch,
} from "../Stores/searchStore";
import { getImageUrl } from "../Utils/imageUpload";

const SearchResultsPage = () => {
  const [searchQuery, setSearchQuery] = useState("Rome");
  const [filters, setFilters] = useState({
    type: "all",
    priceRange: "all",
    rating: "all",
  });
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Use the appropriate search hook based on the type filter
  const { data: globalSearchData, isLoading: isGlobalSearchLoading } =
    useGlobalSearch(searchQuery, page, limit);
  const { data: destinationSearchData, isLoading: isDestinationSearchLoading } =
    useDestinationSearch(
      filters.type === "destination" ? searchQuery : "",
      page,
      limit
    );
  const { data: placeSearchData, isLoading: isPlaceSearchLoading } =
    usePlaceSearch(filters.type === "place" ? searchQuery : "", page, limit);

  // Determine which data to use based on the type filter
  const getSearchResults = () => {
    try {
      if (filters.type === "destination") {
        const destinations = destinationSearchData?.data?.destinations || [];
        return destinations.map((dest) => ({
          ...dest,
          entityType: "destination", // Add entity type for filtering
        }));
      }
      if (filters.type === "place") {
        const places = placeSearchData?.data?.places || [];
        return places.map((place) => ({
          ...place,
          entityType: "place", // Add entity type for filtering
        }));
      }
      // For global search, combine destinations and places
      if (globalSearchData?.data) {
        const destinations = (globalSearchData.data.destinations || []).map(
          (dest) => ({ ...dest, entityType: "destination" })
        );
        const places = (globalSearchData.data.places || []).map((place) => ({
          ...place,
          entityType: "place",
        }));
        return [...destinations, ...places];
      }
      return [];
    } catch (error) {
      console.error("Error getting search results:", error);
      return [];
    }
  };

  const isLoading =
    isGlobalSearchLoading || isDestinationSearchLoading || isPlaceSearchLoading;

  // Apply client-side filters for price range and rating
  const searchResults = getSearchResults();
  const filteredResults = Array.isArray(searchResults)
    ? searchResults.filter((result) => {
        if (!result) return false;

        // Type filter
        if (filters.type !== "all" && result.entityType !== filters.type)
          return false;

        // Price range filter (if implemented in the backend)
        if (
          filters.priceRange !== "all" &&
          result.price_range !== filters.priceRange
        )
          return false;

        // Rating filter
        if (filters.rating !== "all") {
          const minRating = Number.parseFloat(filters.rating);
          // Only apply rating filter to places
          if (result.entityType === "place") {
            if (!result.average_rating || result.average_rating < minRating)
              return false;
          }
        }
        return true;
      })
    : [];

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    // Reset to page 1 when filters change
    setPage(1);
  };

  const ResultCard = ({ result }) => {
    // Debug log to see all available fields
    console.log("Full result object:", result);

    // Get the appropriate image URL based on entity type and available fields
    const getResultImage = () => {
      // For destinations
      if (result.entityType === "destination") {
        if (result.thumbnail) return getImageUrl(result.thumbnail);
        if (result.image_url) return getImageUrl(result.image_url);
      }
      // For places
      if (result.entityType === "place") {
        if (result.thumbnail) return getImageUrl(result.thumbnail);
        if (result.image_url) return getImageUrl(result.image_url);
      }
      // Return appropriate placeholder based on entity type
      return result.entityType === "destination"
        ? "/images/placeholder-destination.jpg"
        : "/images/placeholder-place.jpg";
    };

    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-medium transition-shadow duration-200">
        <div className="relative h-48">
          <img
            src={getResultImage()}
            alt={result.name}
            className="w-full h-full object-cover"
          />
          {result.entityType === "place" && result.type && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {result.type}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {result.name}
              </h3>
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                {result.entityType === "destination"
                  ? "Destination"
                  : result.type}
              </span>
            </div>
            {result.price_range && (
              <span className="text-sm font-medium text-gray-900">
                {result.price_range}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3">
            {result.average_rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">⭐</span>
                <span className="text-sm font-medium">
                  {result.average_rating.toFixed(1)}
                </span>
              </div>
            )}
            {result.location && (
              <span className="text-sm text-gray-600">
                📍 {result.location}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">{result.description}</p>

          <div className="flex gap-2">
            <button className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200">
              View Details
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200">
              Add to Trip
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-4 lg:px-5 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-2xl p-6 shadow-soft mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations, places, activities..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200">
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Filters
              </h2>

              {/* Type Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Type</h3>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "destination", label: "Destinations" },
                    { value: "place", label: "Places" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value={option.value}
                        checked={filters.type === option.value}
                        onChange={(e) =>
                          handleFilterChange("type", e.target.value)
                        }
                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "$", label: "$ - Budget" },
                    { value: "$$", label: "$$ - Moderate" },
                    { value: "$$$", label: "$$$ - Expensive" },
                    { value: "$$$$", label: "$$$$ - Luxury" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        value={option.value}
                        checked={filters.priceRange === option.value}
                        onChange={(e) =>
                          handleFilterChange("priceRange", e.target.value)
                        }
                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  Minimum Rating
                </h3>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "4.0", label: "4.0+ ⭐" },
                    { value: "4.5", label: "4.5+ ⭐" },
                    { value: "4.8", label: "4.8+ ⭐" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        value={option.value}
                        checked={filters.rating === option.value}
                        onChange={(e) =>
                          handleFilterChange("rating", e.target.value)
                        }
                        className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() =>
                  setFilters({ type: "all", priceRange: "all", rating: "all" })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Search Results
                </h1>
                <p className="text-gray-600">
                  {isLoading
                    ? "Loading..."
                    : `${filteredResults.length} results for "${searchQuery}"`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === "grid"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === "list"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">Loading...</div>
              </div>
            ) : filteredResults.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredResults.map((result) => (
                  <ResultCard
                    key={`${result.entityType}-${result._id}`}
                    result={result}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4 text-4xl">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
