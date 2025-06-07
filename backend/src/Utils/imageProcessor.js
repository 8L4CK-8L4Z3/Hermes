import sharp from "sharp";
import path from "path";
import fs from "fs";

export const optimizeImage = async (file, options = {}) => {
  const { width = 800, height = 800, quality = 80, format = "jpeg" } = options;

  try {
    const optimizedFilename =
      file.path.replace(/\.[^/.]+$/, "") + "_optimized." + format;

    await sharp(file.path)
      .resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      })
      [format]({
        quality: quality,
      })
      .toFile(optimizedFilename);

    // Delete the original file
    fs.unlinkSync(file.path);

    // Return the path to the optimized file
    return {
      success: true,
      path: optimizedFilename,
      filename: path.basename(optimizedFilename),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getImageDimensions = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error) {
    throw new Error(`Failed to get image dimensions: ${error.message}`);
  }
};

// Different optimization presets for different use cases
export const optimizationPresets = {
  profile: {
    width: 400,
    height: 400,
    quality: 80,
    format: "jpeg",
  },
  trip: {
    width: 1200,
    height: 800,
    quality: 85,
    format: "jpeg",
  },
  place: {
    width: 1000,
    height: 1000,
    quality: 85,
    format: "jpeg",
  },
  review: {
    width: 800,
    height: 800,
    quality: 80,
    format: "jpeg",
  },
};
