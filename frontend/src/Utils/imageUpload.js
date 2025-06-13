import api from "./api";

/**
 * Upload an image to the server
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The path of the uploaded image
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("profile", file);

  const { data } = await api.post("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.data.path;
};

/**
 * Get the full URL for an image
 * @param {Array|string} images - The image data from the server
 * @returns {string} - The full URL to the image
 */
export const getImageUrl = (images) => {
  if (!images) return null;

  // If it's an array of images, find the primary image or use the first one
  if (Array.isArray(images)) {
    const primaryImage =
      images.find((img) => img.is_primary)?.url || images[0]?.url;
    if (!primaryImage) return null;
    if (primaryImage.startsWith("http")) return primaryImage;
    return `${import.meta.env.VITE_BACKEND_URL}/upload/image/${primaryImage}`;
  }

  // If it's a string (legacy format or single URL)
  if (typeof images === "string") {
    if (images.startsWith("http")) return images;
    return `${import.meta.env.VITE_BACKEND_URL}/upload/image/${images}`;
  }

  return null;
};
