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
 * @param {string} path - The image path from the server
 * @returns {string} - The full URL to the image
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  return `${import.meta.env.VITE_API_URL}/${path}`;
};
