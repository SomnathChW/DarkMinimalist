// Type definitions
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResizeOptions {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  addPadding: boolean;
}

/**
 * Creates a cropped version of the image based on the crop area
 */
export const cropImage = (
  image: HTMLImageElement,
  cropArea: CropArea
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Starting crop operation with:", cropArea);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Calculate actual crop dimensions
      const sourceX = Math.floor(image.naturalWidth * cropArea.x);
      const sourceY = Math.floor(image.naturalHeight * cropArea.y);
      const sourceWidth = Math.ceil(image.naturalWidth * cropArea.width);
      const sourceHeight = Math.ceil(image.naturalHeight * cropArea.height);
      
      console.log("Image natural dimensions:", image.naturalWidth, "x", image.naturalHeight);
      console.log("Calculated crop area:", sourceX, sourceY, sourceWidth, sourceHeight);
      
      // Ensure valid dimensions
      if (sourceWidth <= 0 || sourceHeight <= 0) {
        console.error("Invalid crop dimensions:", sourceWidth, sourceHeight);
        // Return the original image if crop dimensions are invalid
        image.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Could not create image blob'));
        }, 'image/jpeg', 0.95);
        return;
      }
      
      // Set canvas dimensions to the cropped size
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      
      // Draw the cropped portion
      ctx.drawImage(
        image,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, canvas.width, canvas.height
      );
      
      // Convert to blob
      canvas.toBlob(blob => {
        if (blob) {
          console.log("Crop completed successfully, blob size:", blob.size);
          resolve(blob);
        } else {
          console.error("Failed to create blob from canvas");
          reject(new Error('Could not create image blob'));
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error("Error in crop operation:", error);
      reject(error);
    }
  });
};

/**
 * Resizes the image according to the provided options
 */
export const resizeImage = (
  imageBlob: Blob,
  options: ResizeOptions
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      const url = URL.createObjectURL(imageBlob);
      
      img.onload = () => {
        // Clean up object URL
        URL.revokeObjectURL(url);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        let targetWidth = options.width;
        let targetHeight = options.height;
        
        // Calculate dimensions while maintaining aspect ratio if required
        if (options.maintainAspectRatio) {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          
          if (targetWidth / targetHeight > aspectRatio) {
            targetWidth = targetHeight * aspectRatio;
          } else {
            targetHeight = targetWidth / aspectRatio;
          }
        }
        
        // Set canvas size to the target dimensions
        canvas.width = options.width;
        canvas.height = options.height;
        
        // Fill with white if padding is needed
        if (options.addPadding) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Calculate positioning for centering the image
        const x = (canvas.width - targetWidth) / 2;
        const y = (canvas.height - targetHeight) / 2;
        
        // Draw the resized image
        ctx.drawImage(img, x, y, targetWidth, targetHeight);
        
        // Convert to blob
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not create resized image blob'));
          }
        }, 'image/jpeg', 0.95);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for resizing'));
      };
      
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generates a file name for the processed image
 */
export const generateFileName = (
  originalName: string,
  baseName: string,
  index: number,
  shouldRename: boolean
): string => {
  if (!shouldRename) {
    return `resized_${originalName}`;
  }
  
  const extension = originalName.split('.').pop() || 'jpg';
  return `${baseName}_${index + 1}.${extension}`;
};

/**
 * Process a batch of images (crop, resize, rename)
 */
export const processBatchImages = async (
  images: { file: File, cropped?: CropArea, selected: boolean }[],
  resizeOptions: ResizeOptions,
  baseName: string,
  shouldRename: boolean
): Promise<File[]> => {
  const selectedImages = images.filter(img => img.selected);
  const processedFiles: File[] = [];
  
  for (let i = 0; i < selectedImages.length; i++) {
    const image = selectedImages[i];
    
    try {
      // Load the image
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = URL.createObjectURL(image.file);
      });
      
      // Apply crop if available
      let processedBlob: Blob;
      if (image.cropped) {
        console.log("Applying crop to image:", image.file.name, image.cropped);
        processedBlob = await cropImage(img, image.cropped);
        console.log("Crop applied successfully");
      } else {
        console.log("No crop data for image:", image.file.name);
        processedBlob = image.file.slice();
      }
      
      // Resize the image
      const resizedBlob = await resizeImage(processedBlob, resizeOptions);
      
      // Generate filename
      const fileName = generateFileName(
        image.file.name,
        baseName,
        i,
        shouldRename
      );
      
      // Create a new File
      const processedFile = new File([resizedBlob], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      processedFiles.push(processedFile);
    } catch (error) {
      console.error(`Error processing image ${image.file.name}:`, error);
      // Continue with the next image on error
    }
  }
  
  return processedFiles;
};
