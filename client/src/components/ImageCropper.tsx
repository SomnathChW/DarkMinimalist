import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { X, Check, Undo, RotateCcw } from "lucide-react";
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
    Crop,
    PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// Helper to create an image preview from the crop
const createImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.src = url;
    });
};

// Improved function for accurate crop preview generation
async function getCroppedImg(
    sourceUrl: string,
    pixelCrop: PixelCrop,
    naturalWidth: number,
    naturalHeight: number
): Promise<string> {
    // Create a new image from the source
    const image = await createImage(sourceUrl);

    // Create a canvas element for the cropped image
    const canvas = document.createElement("canvas");

    // Calculate the scaling factor between displayed and natural image size
    const scaleX = naturalWidth / image.width;
    const scaleY = naturalHeight / image.height;

    // Calculate crop dimensions in the actual image size
    const sourceX = pixelCrop.x * scaleX;
    const sourceY = pixelCrop.y * scaleY;
    const sourceWidth = pixelCrop.width * scaleX;
    const sourceHeight = pixelCrop.height * scaleY;

    // Set canvas to the cropped size
    canvas.width = pixelCrop.width; // Keep displayed size for preview
    canvas.height = pixelCrop.height;

    // Get the canvas context
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Could not get canvas context");
    }

    // Enable high-quality image resampling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw the cropped portion of the image onto the canvas
    ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight, // Source rectangle
        0,
        0,
        canvas.width,
        canvas.height // Destination rectangle
    );

    // Convert canvas to a blob URL
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("Canvas is empty"));
                    return;
                }
                const url = URL.createObjectURL(blob);
                resolve(url);
            },
            "image/jpeg",
            0.95
        );
    });
}

const ImageCropper: React.FC = () => {
    const {
        images,
        currentImageIndex,
        setImageCrop,
        nextImage,
        setCurrentView,
    } = useAppContext();

    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [cropPreviewUrl, setCropPreviewUrl] = useState<string | null>(null);
    const [originalCropData, setOriginalCropData] = useState<{
        crop: PixelCrop | null;
        cropUrl: string | null;
    }>({ crop: null, cropUrl: null });
    const [originalImageDimensions, setOriginalImageDimensions] = useState({
        width: 0,
        height: 0,
    });

    const currentImage = images[currentImageIndex];

    // Reset state when the image changes
    useEffect(() => {
        setCrop(undefined);
        setCompletedCrop(undefined);
        setOriginalCropData({ crop: null, cropUrl: null });
        setOriginalImageDimensions({ width: 0, height: 0 });

        // Cleanup any previous crop preview
        if (cropPreviewUrl) {
            URL.revokeObjectURL(cropPreviewUrl);
            setCropPreviewUrl(null);
        }

        // If the image already has a crop, apply it
        if (currentImage?.cropped) {
            // Convert our app's crop format to react-image-crop format
            const existingCrop = {
                unit: "%",
                x: currentImage.cropped.x * 100,
                y: currentImage.cropped.y * 100,
                width: currentImage.cropped.width * 100,
                height: currentImage.cropped.height * 100,
            };
            setCrop(existingCrop);
        }
    }, [currentImageIndex, currentImage, cropPreviewUrl]);

    // Function to handle image load and setup initial crop if needed
    const onImageLoad = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            const image = e.currentTarget;
            const { width, height } = image;

            console.log("Image loaded:", {
                displayWidth: width,
                displayHeight: height,
                naturalWidth: image.naturalWidth,
                naturalHeight: image.naturalHeight,
            });

            // Store the original image dimensions for accurate crop calculations
            setOriginalImageDimensions({
                width: image.naturalWidth,
                height: image.naturalHeight,
            });

            // If no crop is set yet, set a default centered crop
            if (!crop) {
                const initialCrop = centerCrop(
                    makeAspectCrop(
                        {
                            unit: "%",
                            width: 80,
                        },
                        16 / 9,
                        width,
                        height
                    ),
                    width,
                    height
                );

                setCrop(initialCrop);
            }
        },
        [crop]
    );

    // Generate a preview when crop changes
    useEffect(() => {
        const generateCropPreview = async () => {
            if (
                !completedCrop?.width ||
                !completedCrop?.height ||
                !imgRef.current?.src
            )
                return;

            // Don't generate previews for tiny crop adjustments to avoid lag
            if (completedCrop.width < 10 || completedCrop.height < 10) return;

            try {
                console.log("Generating preview for crop:", completedCrop);

                // Generate the crop preview
                const previewUrl = await getCroppedImg(
                    imgRef.current.src,
                    completedCrop,
                    originalImageDimensions.width,
                    originalImageDimensions.height
                );

                // Store the current preview
                setCropPreviewUrl(previewUrl);

                // If this is the first crop, store it as original
                if (!originalCropData.crop) {
                    setOriginalCropData({
                        crop: { ...completedCrop },
                        cropUrl: previewUrl,
                    });
                }
            } catch (error) {
                console.error("Error generating crop preview:", error);
            }
        };

        // Generate preview whenever the completed crop changes
        if (completedCrop) {
            // Clean up previous preview
            if (cropPreviewUrl) {
                URL.revokeObjectURL(cropPreviewUrl);
            }

            generateCropPreview();
        }
    }, [completedCrop, originalImageDimensions, originalCropData.crop]);

    const handleCropComplete = (crop: PixelCrop) => {
        setCompletedCrop(crop);
    };

    // Apply the crop when clicking the tick button - FIXED VERSION
    const confirmCrop = useCallback(() => {
        if (!completedCrop || !imgRef.current) return;

        // Calculate scaling factors between displayed image and natural image
        const scaleX = originalImageDimensions.width / imgRef.current.width;
        const scaleY = originalImageDimensions.height / imgRef.current.height;

        console.log("Scaling factors:", { scaleX, scaleY });

        // Calculate crop dimensions in the actual image size (pixels)
        const actualX = completedCrop.x * scaleX;
        const actualY = completedCrop.y * scaleY;
        const actualWidth = completedCrop.width * scaleX;
        const actualHeight = completedCrop.height * scaleY;

        // Calculate normalized percentage values relative to original image dimensions
        const normalizedCrop = {
            x: actualX / originalImageDimensions.width,
            y: actualY / originalImageDimensions.height,
            width: actualWidth / originalImageDimensions.width,
            height: actualHeight / originalImageDimensions.height,
        };

        console.log("Original dimensions:", originalImageDimensions);
        console.log(
            "Display dimensions:",
            imgRef.current.width,
            imgRef.current.height
        );
        console.log("Completed crop (display):", completedCrop);
        console.log("Actual crop (pixels):", {
            actualX,
            actualY,
            actualWidth,
            actualHeight,
        });
        console.log("Normalized crop (0-1):", normalizedCrop);

        // Save the crop data in the app context
        setImageCrop(normalizedCrop);

        // Move directly to resize view
        setCurrentView("resize");
    }, [completedCrop, setImageCrop, setCurrentView, originalImageDimensions]);

    // Revert to the original (uncropped) image
    const revertToOriginal = () => {
        // Clear crop for current image
        setImageCrop(undefined);

        // Reset the crop selection
        setCrop(undefined);
        setCompletedCrop(undefined);

        // Cleanup preview
        if (cropPreviewUrl) {
            URL.revokeObjectURL(cropPreviewUrl);
            setCropPreviewUrl(null);
        }

        // Reset original data
        setOriginalCropData({ crop: null, cropUrl: null });
    };

    const cancelCrop = () => {
        // Clear crop and move to next image
        setImageCrop(undefined);

        // Cleanup preview
        if (cropPreviewUrl) {
            URL.revokeObjectURL(cropPreviewUrl);
            setCropPreviewUrl(null);
        }

        // Move to next image
        nextImage();
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {currentImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={handleCropComplete}
                        className="max-h-full max-w-full"
                        ruleOfThirds
                        keepSelection={true}
                    >
                        <img
                            ref={imgRef}
                            src={currentImage.url}
                            alt="Selected for cropping"
                            className="max-h-full max-w-full object-contain"
                            onLoad={onImageLoad}
                            style={{ maxHeight: "90vh" }}
                            crossOrigin="anonymous"
                        />
                    </ReactCrop>

                    {/* Preview of current crop */}
                    {cropPreviewUrl && (
                        <div className="absolute top-4 right-4 p-2 bg-black/40 rounded-md">
                            <img
                                src={cropPreviewUrl}
                                alt="Current crop"
                                className="w-32 h-32 object-contain border border-white/30"
                            />
                        </div>
                    )}

                    {/* Crop Controls */}
                    <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={revertToOriginal}
                            title="Revert to original image"
                            className="rounded-md bg-amber-500 hover:bg-amber-600 text-white"
                        >
                            <RotateCcw size={20} />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={cancelCrop}
                            title="Cancel and skip image"
                            className="rounded-md bg-red-500 hover:bg-red-600"
                        >
                            <X size={20} />
                        </Button>
                        <Button
                            variant="default"
                            size="icon"
                            onClick={confirmCrop}
                            title="Apply crop and continue"
                            className="bg-green-500 text-white hover:bg-green-600 rounded-md"
                            disabled={
                                !completedCrop?.width || !completedCrop?.height
                            }
                        >
                            <Check size={20} />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="text-center p-8">
                    <p className="text-muted-foreground">No image selected</p>
                </div>
            )}
        </div>
    );
};

export default ImageCropper;
