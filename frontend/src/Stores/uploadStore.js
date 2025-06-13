import { useMutation } from "@tanstack/react-query";
import api from "@/Utils/api";

/**
 * Image types supported by the upload system
 */
export const ImageTypes = {
  PROFILE: "profile",
  TRIP: "trip",
  PLACE: "place",
  REVIEW: "review",
  ACTIVITY: "activity",
  DESTINATION: "destination",
};

/**
 * Maximum number of images allowed per type
 */
export const MaxImagesPerType = {
  [ImageTypes.PROFILE]: 1,
  [ImageTypes.TRIP]: 10,
  [ImageTypes.PLACE]: 5,
  [ImageTypes.REVIEW]: 5,
  [ImageTypes.ACTIVITY]: 5,
  [ImageTypes.DESTINATION]: 10,
};

/**
 * Maximum file size in bytes per type
 */
export const MaxFileSizePerType = {
  [ImageTypes.PROFILE]: 5 * 1024 * 1024, // 5MB
  [ImageTypes.TRIP]: 10 * 1024 * 1024, // 10MB
  [ImageTypes.PLACE]: 10 * 1024 * 1024, // 10MB
  [ImageTypes.REVIEW]: 5 * 1024 * 1024, // 5MB
  [ImageTypes.ACTIVITY]: 10 * 1024 * 1024, // 10MB
  [ImageTypes.DESTINATION]: 10 * 1024 * 1024, // 10MB
};

/**
 * Hook for uploading a single image
 * @param {string} type - The type of image (use ImageTypes enum)
 * @returns {Object} Mutation object for uploading a single image
 */
export const useImageUpload = (type) => {
  return useMutation({
    mutationFn: async (file) => {
      // Validate file size
      if (file.size > MaxFileSizePerType[type]) {
        throw new Error(
          `File size exceeds the ${
            MaxFileSizePerType[type] / (1024 * 1024)
          }MB limit`
        );
      }

      const formData = new FormData();
      formData.append(type, file);

      const { data } = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return data.data.path;
    },
  });
};

/**
 * Hook for uploading multiple images
 * @param {string} type - The type of image (use ImageTypes enum)
 * @returns {Object} Mutation object for uploading multiple images
 */
export const useMultipleImageUpload = (type) => {
  return useMutation({
    mutationFn: async (files) => {
      // Validate number of files
      if (files.length > MaxImagesPerType[type]) {
        throw new Error(
          `Maximum ${MaxImagesPerType[type]} images allowed for ${type}`
        );
      }

      // Validate file sizes
      for (const file of files) {
        if (file.size > MaxFileSizePerType[type]) {
          throw new Error(
            `File "${file.name}" exceeds the ${
              MaxFileSizePerType[type] / (1024 * 1024)
            }MB limit`
          );
        }
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append(type, file);
      });

      const { data } = await api.post("/upload/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return data.data.paths;
    },
  });
};

/**
 * Get the full URL for an image path
 * @param {string} path - The image path from the server


/**
 * Hook for handling image upload state and actions
 * @param {string} type - The type of image (use ImageTypes enum)
 * @param {boolean} multiple - Whether to allow multiple image uploads
 * @returns {Object} Image upload state and handlers
 */
export const useImageHandler = (type, multiple = false) => {
  const singleUpload = useImageUpload(type);
  const multipleUpload = useMultipleImageUpload(type);

  const uploadImage = async (fileOrFiles) => {
    try {
      if (multiple) {
        const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
        return await multipleUpload.mutateAsync(files);
      } else {
        const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles;
        return await singleUpload.mutateAsync(file);
      }
    } catch (error) {
      console.error("Error uploading image(s):", error);
      throw error;
    }
  };

  return {
    uploadImage,
    isUploading: multiple ? multipleUpload.isLoading : singleUpload.isLoading,
    error: multiple ? multipleUpload.error : singleUpload.error,
  };
};
