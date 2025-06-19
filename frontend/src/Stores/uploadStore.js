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
  [ImageTypes.PROFILE]: 2 * 1024 * 1024, // 2MB
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
      try {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error("Invalid file type. Please upload an image file.");
        }

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

        console.log(`Uploading ${type} image:`, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });

        const { data } = await api.post("/upload/image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: { type }, // Add type as query parameter
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        });

        console.log("Upload response:", data);

        if (!data.success) {
          throw new Error(data.message || "Upload failed");
        }

        return data.data.path;
      } catch (error) {
        console.error("Image upload error:", {
          type,
          error: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        throw error;
      }
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
      try {
        // Validate number of files
        if (files.length > MaxImagesPerType[type]) {
          throw new Error(
            `Maximum ${MaxImagesPerType[type]} images allowed for ${type}`
          );
        }

        // Validate file sizes and types
        for (const file of files) {
          if (!file.type.startsWith("image/")) {
            throw new Error(`File "${file.name}" is not an image`);
          }
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

        console.log(`Uploading multiple ${type} images:`, {
          fileCount: files.length,
          files: files.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        });

        const { data } = await api.post("/upload/images", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          params: { type }, // Add type as query parameter
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        });

        console.log("Upload response:", data);

        if (!data.success) {
          throw new Error(data.message || "Upload failed");
        }

        return data.data.paths;
      } catch (error) {
        console.error("Multiple image upload error:", {
          type,
          error: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        throw error;
      }
    },
  });
};

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
      console.error("Error in useImageHandler:", {
        type,
        multiple,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  };

  return {
    uploadImage,
    isUploading: multiple ? multipleUpload.isLoading : singleUpload.isLoading,
    error: multiple ? multipleUpload.error : singleUpload.error,
  };
};
