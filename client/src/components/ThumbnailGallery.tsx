import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Checkbox } from "@/components/ui/checkbox";
import { FileIcon } from "lucide-react";

const ThumbnailGallery: React.FC = () => {
  const { 
    images,
    handleImageSelection
  } = useAppContext();

  const toggleImageSelection = (index: number, currentValue: boolean) => {
    handleImageSelection(index, !currentValue);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <h3 className="text-lg font-medium mb-2">Image Gallery</h3>
      <div className="bg-background rounded-lg p-3 flex-1 overflow-y-auto custom-scrollbar">
        {images.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>No images to display</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="relative group cursor-pointer"
                onClick={() => toggleImageSelection(index, image.selected)}
              >
                <div className="aspect-square w-full relative overflow-hidden rounded-md">
                  {image.url ? (
                    <img 
                      src={image.url} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-secondary flex items-center justify-center rounded-md border border-border">
                      <FileIcon size={32} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-md"></div>
                </div>
                <div className="absolute bottom-2 right-2 z-10">
                  <Checkbox 
                    checked={image.selected}
                    onCheckedChange={(checked) => 
                      handleImageSelection(index, checked === true)
                    }
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the parent div's onClick from firing
                    }}
                    className="bg-secondary border-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThumbnailGallery;
