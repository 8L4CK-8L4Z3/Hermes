import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import destinationSchema from "@/Schemas/destinationSchema";
import { useImageHandler, ImageTypes } from "@/Stores/uploadStore";

const DestinationForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(initialData?.photo || "");
  const [uploadProgress, setUploadProgress] = useState(0);
  const {
    uploadImage,
    isUploading,
    error: uploadError,
  } = useImageHandler(ImageTypes.DESTINATION);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(destinationSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      location: "",
      photo: "",
    },
  });

  const currentPhoto = watch("photo");

  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      reset();
      setPreviewUrl("");
      setUploadProgress(0);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        setPreviewUrl(previewUrl);
        setUploadProgress(0);

        // Upload the file
        const uploadedPath = await uploadImage(file);

        // Update the form with the uploaded path
        setValue("photo", uploadedPath, { shouldValidate: true });
        setUploadProgress(100);
      } catch (error) {
        console.error("Error uploading image:", error);
        // Clear preview on error
        setPreviewUrl("");
        setUploadProgress(0);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Destination Name
        </label>
        <input
          type="text"
          id="name"
          {...register("name")}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter destination name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="location"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Location
        </label>
        <input
          type="text"
          id="location"
          {...register("location")}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            errors.location ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter location"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter destination description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="photo"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Photo
        </label>
        <div className="mt-1 space-y-2">
          <div className="flex items-center gap-4">
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              disabled={isUploading}
            />
            <label
              htmlFor="photo"
              className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isUploading ? "Uploading..." : "Choose Photo"}
            </label>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg"
              />
            )}
          </div>

          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gray-900 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {uploadError && (
            <p className="text-sm text-red-600">
              Error uploading image. Please try again.
            </p>
          )}

          {currentPhoto && !uploadError && (
            <p className="text-sm text-green-600">
              Image uploaded successfully
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isUploading || isSubmitting}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isUploading || isSubmitting}
          className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Saving..."
            : initialData
            ? "Update Destination"
            : "Create Destination"}
        </button>
      </div>
    </form>
  );
};

export default DestinationForm;
