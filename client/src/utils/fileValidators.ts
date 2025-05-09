export const isImageFile = (fileName: string): boolean => {
  const imageRegex = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
  return imageRegex.test(fileName);
};

export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  if (parts.length <= 1) return '';
  return `.${parts[parts.length - 1].toLowerCase()}`;
};

export const validateFolder = (files: File[]): {
  isValid: boolean;
  imageCount: number;
  nonImageCount: number;
  message: string;
} => {
  if (files.length === 0) {
    return {
      isValid: false,
      imageCount: 0,
      nonImageCount: 0,
      message: "No files found in the selected folder."
    };
  }

  const imageFiles = files.filter(file => isImageFile(file.name));
  const nonImageCount = files.length - imageFiles.length;

  if (imageFiles.length === 0) {
    return {
      isValid: false,
      imageCount: 0,
      nonImageCount,
      message: "No image files found in the selected folder."
    };
  }

  return {
    isValid: true,
    imageCount: imageFiles.length,
    nonImageCount,
    message: `Valid folder with ${imageFiles.length} images found.`
  };
};

export const getNonImageExtensions = (files: File[]): Set<string> => {
  const extensions = new Set<string>();
  
  files.forEach(file => {
    if (!isImageFile(file.name)) {
      const extension = getFileExtension(file.name);
      if (extension) {
        extensions.add(extension);
      }
    }
  });
  
  return extensions;
};
