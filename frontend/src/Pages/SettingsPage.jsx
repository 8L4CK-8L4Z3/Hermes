import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUpdateProfile,
  useUpdateProfilePhoto,
  useUpdatePreferences,
  useDeleteAccount,
} from "@/Stores/userStore";
import { useUpdatePassword } from "@/Stores/authStore";
import { checkAuth } from "@/Stores/authStore";
import { useAuth } from "@/hooks/useAuth";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "@/Utils/toast";
import userUpdateSchema from "@/Schemas/userUpdateSchema";
import { useImageHandler } from "@/Stores/uploadStore";
import { ImageTypes } from "@/Stores/uploadStore";
import { getImageUrl } from "@/Utils/imageUpload";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [authState, setAuthState] = useState({ isLoading: true, user: null });
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    language: "en",
    notifications: {
      email: true,
      push: true,
    },
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState(null);

  const updateProfile = useUpdateProfile();
  const updatePhoto = useUpdateProfilePhoto();
  const updatePreferences = useUpdatePreferences();
  const updatePassword = useUpdatePassword();
  const deleteAccount = useDeleteAccount();
  const { user, isAuthenticated } = useAuth();
  const { uploadImage, isUploading: isImageUploading } = useImageHandler(
    ImageTypes.PROFILE
  );

  // Check auth and get user data on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { isAuthenticated, user } = await checkAuth();
        setAuthState({ isLoading: false, user });

        if (!isAuthenticated) {
          navigate("/login");
          return;
        }

        // Initialize form data with user data
        setFormData({
          username: user.data.username || "",
          email: user.data.email || "",
          bio: user.data.bio || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          language: user.data.preferences?.language || "en",
          notifications: {
            email: user.data.preferences?.notifications?.email ?? true,
            push: user.data.preferences?.notifications?.push ?? true,
          },
        });

        if (user.data.image && user.data.image !== "default.jpg") {
          const imageUrl = getImageUrl(user.data.image);
          setPhotoPreview(imageUrl);
          setPhotoUrl(user.data.image);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthState({ isLoading: false, user: null });
        navigate("/login");
      }
    };

    initAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("notifications.")) {
      const notificationType = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationType]: checked,
        },
      }));
    } else if (name === "language") {
      setFormData((prev) => ({
        ...prev,
        language: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_FILE_SIZE) {
      showErrorToast("Image size should be less than 2MB");
      return;
    }

    // Validate image dimensions
    try {
      const dimensions = await getImageDimensions(file);
      if (dimensions.width > 2048 || dimensions.height > 2048) {
        showErrorToast("Image dimensions should not exceed 2048x2048 pixels");
        return;
      }
    } catch (error) {
      showErrorToast("Failed to validate image. Please try another file.");
      console.error("Image validation error:", error);
      return;
    }

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        setIsUploading(true);
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));

        // Upload the photo using the hook's uploadImage function
        const uploadedPath = await uploadImage(file);

        // Store the uploaded path but don't update profile yet
        setUploadedImagePath(uploadedPath);
        setPhotoUrl(uploadedPath);
        showSuccessToast(
          "Photo uploaded successfully. Click Save Changes to update your profile."
        );
        break;
      } catch (error) {
        retryCount++;
        console.error(`Upload attempt ${retryCount} failed:`, error);
        console.log("Error response:", error.response?.data);
        console.log("Error status:", error.response?.status);

        // If we've exhausted all retries, show error and reset
        if (retryCount === maxRetries) {
          let errorMessage = "Failed to upload photo. ";
          if (error.response?.status === 413) {
            errorMessage += "File size too large.";
          } else if (error.response?.status === 415) {
            errorMessage += "Invalid file type.";
          } else if (error.response?.status === 500) {
            errorMessage += "Server error. Please try again later.";
          } else {
            errorMessage +=
              error.response?.data?.message || "Please try again.";
          }

          showErrorToast(errorMessage);
          // Reset preview on error
          const fallbackImage = user?.data?.image || null;
          setPhotoPreview(fallbackImage ? getImageUrl(fallbackImage) : null);
          setPhotoUrl(fallbackImage);
          setUploadedImagePath(null);
        } else {
          // If we still have retries left, wait before trying again
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
          showWarningToast(
            `Upload failed, retrying... (Attempt ${
              retryCount + 1
            }/${maxRetries})`
          );
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Helper function to get image dimensions
  const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (activeTab === "profile") {
      if (formData.username && formData.username.length < 3) {
        newErrors.username = "Username must be at least 3 characters";
      }
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
      if (formData.bio && formData.bio.length > 500) {
        newErrors.bio = "Bio must be less than 500 characters";
      }
    }

    if (activeTab === "security") {
      if (formData.newPassword && formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate the form data
      const validationResult = userUpdateSchema.safeParse({
        username: formData.username,
        bio: formData.bio,
        image: uploadedImagePath || user?.data?.image, // Use uploaded image path if available
      });

      if (!validationResult.success) {
        validationResult.error.issues.forEach((issue) => {
          showErrorToast(`${issue.path.join(".")}: ${issue.message}`);
        });
        return;
      }

      await updateProfile.mutateAsync({
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        image: uploadedImagePath || user?.data?.image, // Use uploaded image path if available
      });

      // Clear the temporary uploaded image path after successful update
      setUploadedImagePath(null);
      showSuccessToast("Profile updated successfully");
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.newPassword !== formData.confirmPassword) {
        showErrorToast("New passwords do not match");
        return;
      }

      // Validate the new password
      const validationResult = userUpdateSchema.safeParse({
        password: formData.newPassword,
      });

      if (!validationResult.success) {
        // Show validation errors
        validationResult.error.issues.forEach((issue) => {
          showErrorToast(`Password requirements: ${issue.message}`);
        });
        return;
      }

      await updatePassword.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      showSuccessToast("Password updated successfully");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      showErrorToast(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (activeTab === "profile") {
        await handleProfileSubmit(e);
      } else if (activeTab === "preferences") {
        await updatePreferences.mutateAsync({
          language: formData.language,
          notifications: formData.notifications,
        });
        showSuccessToast("Preferences updated successfully");
      } else if (activeTab === "security") {
        await handlePasswordSubmit(e);
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      showErrorToast(error);
      setErrors({
        submit: error.response?.data?.message || "Failed to update settings",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        await deleteAccount.mutateAsync();
        showSuccessToast("Account deleted successfully");
        navigate("/login");
      } catch (error) {
        console.error("Failed to delete account:", error);
        showErrorToast(error);
        setErrors({
          submit: error.response?.data?.message || "Failed to delete account",
        });
      }
    }
  };

  if (authState.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!authState.user) {
    return null;
  }

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "preferences", label: "Preferences" },
    { id: "security", label: "Security" },
  ];

  return (
    <div className="bg-gray-50 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 lg:px-5 py-8">
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-24 h-24">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-2xl text-gray-500">
                            {formData.username?.[0]?.toUpperCase() || "U"}
                          </span>
                        </div>
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="photo-upload"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="photo-upload"
                        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          isUploading
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {isUploading ? "Uploading..." : "Change Photo"}
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="notifications.email"
                        checked={formData.notifications.email}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Email notifications
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="notifications.push"
                        checked={formData.notifications.push}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Push notifications
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Danger Zone
                  </h3>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
