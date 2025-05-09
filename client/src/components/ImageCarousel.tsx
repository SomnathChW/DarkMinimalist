import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

const ImageCarousel: React.FC = () => {
  const { 
    selectedImages,
    currentImageIndex,
    nextImage,
    prevImage,
    goToImage
  } = useAppContext();

  // Convert flat index to selected image index
  const getSelectedImageIndexFromCurrentIndex = () => {
    let count = -1;
    for (let i = 0; i < selectedImages.length; i++) {
      if (selectedImages[i].selected) {
        count++;
        if (count === currentImageIndex) return i;
      }
    }
    return 0;
  };

  return (
    <div className="h-20 bg-secondary rounded-lg p-2">
      <div className="flex items-center h-full gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={prevImage}
          disabled={selectedImages.length <= 1}
          className="p-2 rounded-full hover:bg-background"
        >
          <ArrowLeftIcon size={16} />
        </Button>
        
        <div className="flex-1 overflow-x-auto custom-scrollbar">
          <div className="flex gap-3">
            {selectedImages.map((image, index) => (
              <div 
                key={index}
                className={`carousel-item flex-shrink-0 cursor-pointer ${
                  index === getSelectedImageIndexFromCurrentIndex() ? "active" : ""
                }`}
                onClick={() => goToImage(index)}
              >
                <div className="aspect-square h-14 w-14 relative overflow-hidden rounded-md">
                  <img 
                    src={image.url} 
                    alt={`Carousel ${index + 1}`} 
                    className="absolute inset-0 h-full w-full object-cover rounded-md"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={nextImage}
          disabled={selectedImages.length <= 1}
          className="p-2 rounded-full hover:bg-background"
        >
          <ArrowRightIcon size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ImageCarousel;
