import { toast } from "react-hot-toast";

const toastBaseStyle = {
  style: {
    background: "white",
    color: "#1f2937", // gray-800
    padding: "16px",
    borderRadius: "12px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    fontSize: "14px",
    maxWidth: "380px",
    border: "1px solid rgba(0, 0, 0, 0.05)",
  },
  duration: 3000,
};

const toastIconStyle = {
  fontSize: "18px",
  marginRight: "8px",
};

export const showSuccessToast = (message) => {
  toast.success(message, {
    ...toastBaseStyle,
    icon: "✓",
    style: {
      ...toastBaseStyle.style,
      border: "1px solid #dcfce7", // green-50
      background: "#f0fdf4", // green-50
    },
    iconTheme: {
      ...toastIconStyle,
      primary: "#16a34a", // green-600
      secondary: "#ffffff",
    },
  });
};

export const showErrorToast = (error) => {
  const message = error?.response?.data?.message || error?.message || error;
  toast.error(message, {
    ...toastBaseStyle,
    icon: "×",
    style: {
      ...toastBaseStyle.style,
      border: "1px solid #fee2e2", // red-50
      background: "#fef2f2", // red-50
    },
    iconTheme: {
      ...toastIconStyle,
      primary: "#dc2626", // red-600
      secondary: "#ffffff",
    },
  });
};

export const showWarningToast = (message) => {
  toast(message, {
    ...toastBaseStyle,
    icon: "!",
    style: {
      ...toastBaseStyle.style,
      border: "1px solid #fef3c7", // yellow-50
      background: "#fffbeb", // yellow-50
    },
    iconTheme: {
      ...toastIconStyle,
      primary: "#d97706", // yellow-600
      secondary: "#ffffff",
    },
  });
};

export const showInfoToast = (message) => {
  toast(message, {
    ...toastBaseStyle,
    icon: "i",
    style: {
      ...toastBaseStyle.style,
      border: "1px solid #dbeafe", // blue-50
      background: "#eff6ff", // blue-50
    },
    iconTheme: {
      ...toastIconStyle,
      primary: "#2563eb", // blue-600
      secondary: "#ffffff",
    },
  });
};
