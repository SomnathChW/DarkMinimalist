import React, { useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import ImageCropper from "./ImageCropper";
import ImageCarousel from "./ImageCarousel";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  ArrowRight, 
  HelpCircle,
  Download
} from "lucide-react";

const RightPanel: React.FC = () => {
  const { 
    currentView,
    selectedImages,
    currentImageIndex,
    setCurrentView,
    nextImage,
    prevImage,
    processImages,
    images
  } = useAppContext();

  // Automatically show first selected image when images are selected
  useEffect(() => {
    if (currentView === "folder" && selectedImages.length > 0) {
      setCurrentView("crop");
    }
  }, [selectedImages.length, currentView, setCurrentView]);

  // Determine button actions based on current view
  const handleBack = () => {
    if (currentView === "crop") {
      setCurrentView("folder");
    } else if (currentView === "resize") {
      setCurrentView("crop");
    } else if (currentView === "output") {
      setCurrentView("resize");
    }
  };

  const handleNext = () => {
    if (currentView === "folder") {
      if (selectedImages.length > 0) {
        setCurrentView("crop");
      }
    } else if (currentView === "crop") {
      setCurrentView("resize");
    } else if (currentView === "resize") {
      processImages();
    }
  };

  const handleSkipCrop = () => {
    if (currentView === "crop") {
      setCurrentView("resize");
    }
  };

  return (
    <div className="w-3/5 h-full flex flex-col bg-background p-4 overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {currentView === "crop" && "Image Cropper"}
            {currentView === "resize" && "Resize Settings"}
            {currentView === "output" && "Download Processed Images"}
            {currentView === "folder" && "Image Processor"}
          </h2>
          <div className="flex items-center gap-2">
            {currentView === "crop" && selectedImages.length > 0 && (
              <span className="text-sm text-muted-foreground">
                Image {currentImageIndex + 1} of {selectedImages.length}
              </span>
            )}
            <Button variant="secondary" size="icon" className="text-muted-foreground">
              <HelpCircle size={18} />
            </Button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 relative mb-4 bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
          {currentView === "crop" ? (
            <ImageCropper />
          ) : currentView === "folder" ? (
            images.length > 0 ? (
              <div className="text-center p-8">
                <h3 className="text-lg font-medium mb-2">Select Images to Process</h3>
                <p className="text-muted-foreground mb-4">
                  Click on images in the left panel to select them for processing
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedImages.length === 0 
                    ? "No images selected yet" 
                    : `${selectedImages.length} images selected`}
                </p>
              </div>
            ) : (
              <div className="text-center p-8">
                <h3 className="text-lg font-medium mb-2">Welcome to Image Folder Manager & Cropper</h3>
                <p className="text-muted-foreground mb-4">Select a folder with images on the left panel to begin</p>
                <p className="text-sm text-muted-foreground">
                  You can crop, resize, and rename your images before downloading them as a zip file
                </p>
              </div>
            )
          ) : currentView === "complete" ? (
            <div className="text-center p-8">
              <h3 className="text-lg font-medium mb-2">Processing Complete!</h3>
              <p className="text-muted-foreground mb-4">Your images have been processed successfully</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                <Download className="mr-2" size={16} />
                Download Processed Images
              </Button>
            </div>
          ) : (
            // Other views are rendered via modals
            <div className="text-center p-8">
              <h3 className="text-lg font-medium mb-2">
                {currentView === "resize" ? "Configure Resize Settings" : "Processing Images"}
              </h3>
              <p className="text-muted-foreground">
                {currentView === "resize" 
                  ? "Set the target dimensions for your images" 
                  : "Your images are being processed and prepared for download"}
              </p>
            </div>
          )}
        </div>
        
        {/* Image Carousel - Only show in crop view with selected images */}
        {currentView === "crop" && selectedImages.length > 0 && (
          <ImageCarousel />
        )}
      </div>
      
      {/* Bottom Controls */}
      <div className="pt-3 border-t border-border mt-3">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentView === "folder" || currentView === "complete"}
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {currentView === "crop" && (
              <Button variant="outline" onClick={handleSkipCrop}>
                Skip Crop
              </Button>
            )}
            <Button 
              onClick={handleNext}
              disabled={(currentView === "folder" && selectedImages.length === 0) || currentView === "complete"}
            >
              {currentView === "resize" ? "Process Images" : "Continue"}
              <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
