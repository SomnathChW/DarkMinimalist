import React, { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ImageCropper: React.FC = () => {
  const { 
    images,
    currentImageIndex,
    setImageCrop,
    nextImage
  } = useAppContext();
  
  const { toast } = useToast();

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);
  
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    startX: 0,
    startY: 0,
    isDrawing: false,
    isDragging: false,
    isResizing: false,
    resizeHandle: "",
    offsetX: 0,
    offsetY: 0
  });

  const currentImage = images[currentImageIndex];

  useEffect(() => {
    // Reset crop when the current image changes
    setCrop({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      startX: 0,
      startY: 0,
      isDrawing: false,
      isDragging: false,
      isResizing: false,
      resizeHandle: "",
      offsetX: 0,
      offsetY: 0
    });
    
    // If image has previous crop settings, restore them
    if (currentImage?.cropped) {
      const { x, y, width, height } = currentImage.cropped;
      setCrop(prev => ({
        ...prev,
        x,
        y,
        width,
        height
      }));
    }
  }, [currentImageIndex, currentImage]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !imageRef.current) return;
    
    const target = e.target as HTMLElement;
    const cropBox = cropBoxRef.current;
    
    // Check if we're clicking on a resize handle
    if (target.classList.contains('resize-handle')) {
      e.preventDefault();
      e.stopPropagation();
      
      setCrop(prev => ({
        ...prev,
        isResizing: true,
        resizeHandle: target.classList[1], // nw, ne, sw, se
      }));
      return;
    }
    
    // Check if we're clicking on the crop box for dragging
    if (cropBox && cropBox.contains(target)) {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = cropBox.getBoundingClientRect();
      setCrop(prev => ({
        ...prev,
        isDragging: true,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top
      }));
      return;
    }
    
    // Otherwise, start drawing a new crop box
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCrop({
      x,
      y,
      width: 0,
      height: 0,
      startX: x,
      startY: y,
      isDrawing: true,
      isDragging: false,
      isResizing: false,
      resizeHandle: "",
      offsetX: 0,
      offsetY: 0
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Constrain to container bounds
    const boundedX = Math.max(0, Math.min(mouseX, rect.width));
    const boundedY = Math.max(0, Math.min(mouseY, rect.height));
    
    if (crop.isDrawing) {
      // Drawing a new crop box
      const width = boundedX - crop.startX;
      const height = boundedY - crop.startY;
      
      setCrop(prev => ({
        ...prev,
        width: Math.abs(width),
        height: Math.abs(height),
        x: width < 0 ? boundedX : crop.x,
        y: height < 0 ? boundedY : crop.y
      }));
    } else if (crop.isDragging) {
      // Dragging the existing crop box
      const newX = boundedX - crop.offsetX;
      const newY = boundedY - crop.offsetY;
      
      // Ensure crop box stays within bounds
      const constrainedX = Math.max(0, Math.min(newX, rect.width - crop.width));
      const constrainedY = Math.max(0, Math.min(newY, rect.height - crop.height));
      
      setCrop(prev => ({
        ...prev,
        x: constrainedX,
        y: constrainedY
      }));
    } else if (crop.isResizing) {
      // Resizing the crop box
      let newX = crop.x;
      let newY = crop.y;
      let newWidth = crop.width;
      let newHeight = crop.height;
      
      switch (crop.resizeHandle) {
        case 'nw':
          newWidth = crop.x + crop.width - boundedX;
          newHeight = crop.y + crop.height - boundedY;
          newX = boundedX;
          newY = boundedY;
          break;
        case 'ne':
          newWidth = boundedX - crop.x;
          newHeight = crop.y + crop.height - boundedY;
          newY = boundedY;
          break;
        case 'sw':
          newWidth = crop.x + crop.width - boundedX;
          newHeight = boundedY - crop.y;
          newX = boundedX;
          break;
        case 'se':
          newWidth = boundedX - crop.x;
          newHeight = boundedY - crop.y;
          break;
      }
      
      // Ensure minimum size
      if (newWidth < 20) {
        newWidth = 20;
        if (['nw', 'sw'].includes(crop.resizeHandle)) {
          newX = crop.x + crop.width - newWidth;
        }
      }
      
      if (newHeight < 20) {
        newHeight = 20;
        if (['nw', 'ne'].includes(crop.resizeHandle)) {
          newY = crop.y + crop.height - newHeight;
        }
      }
      
      // Ensure within bounds
      if (newX < 0) {
        newWidth += newX;
        newX = 0;
      }
      
      if (newY < 0) {
        newHeight += newY;
        newY = 0;
      }
      
      if (newX + newWidth > rect.width) {
        newWidth = rect.width - newX;
      }
      
      if (newY + newHeight > rect.height) {
        newHeight = rect.height - newY;
      }
      
      setCrop(prev => ({
        ...prev,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      }));
    }
  };

  const handleMouseUp = () => {
    setCrop(prev => ({
      ...prev,
      isDrawing: false,
      isDragging: false,
      isResizing: false
    }));
  };

  const confirmCrop = () => {
    // Don't do anything if crop is too small
    if (crop.width < 10 || crop.height < 10) {
      return;
    }
    
    // Normalize crop values relative to the image
    if (imageRef.current && containerRef.current) {
      const imageRect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate the image's position within the container
      const imageLeft = (containerRect.width - imageRect.width) / 2;
      const imageTop = (containerRect.height - imageRect.height) / 2;
      
      // Calculate actual crop coordinates relative to the image
      let x = (crop.x - imageLeft) / imageRect.width;
      let y = (crop.y - imageTop) / imageRect.height;
      let width = crop.width / imageRect.width;
      let height = crop.height / imageRect.height;
      
      // Apply bounds checking to ensure crop is within image
      x = Math.max(0, Math.min(1 - width, x));
      y = Math.max(0, Math.min(1 - height, y));
      width = Math.max(0.05, Math.min(1 - x, width));
      height = Math.max(0.05, Math.min(1 - y, height));
      
      // Create the crop data
      const cropData = {
        x, y, width, height
      };
      
      // Save the normalized crop (as percentages of the image dimensions)
      setImageCrop(cropData);
      
      // Show confirmation toast
      toast({
        title: "Crop Applied",
        description: "Image crop has been saved",
        variant: "default",
      });
      
      // Move to next image - add a small delay to ensure the crop is saved
      setTimeout(() => {
        nextImage();
      }, 100);
    }
  };

  const cancelCrop = () => {
    // Clear crop for current image
    setImageCrop(undefined);
    
    // Move to next image
    nextImage();
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {currentImage ? (
        <>
          <img 
            ref={imageRef}
            src={currentImage.url} 
            alt="Selected for cropping"
            className="max-h-full max-w-full object-contain"
          />
          
          {/* Custom crop overlay implementation */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Dark overlay for the entire container */}
            <div className="absolute inset-0 bg-black opacity-70"></div>
            
            {/* Opening in the overlay for the crop area */}
            {(crop.width > 0 && crop.height > 0) && (
              <div 
                className="absolute bg-transparent pointer-events-auto"
                style={{
                  top: `${crop.y}px`,
                  left: `${crop.x}px`,
                  width: `${crop.width}px`,
                  height: `${crop.height}px`,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)'
                }}
              >
                {/* Crop box with border */}
                <div 
                  ref={cropBoxRef}
                  className="absolute inset-0 border-2 border-dashed border-white cursor-move"
                >
                  <div className="resize-handle nw"></div>
                  <div className="resize-handle ne"></div>
                  <div className="resize-handle sw"></div>
                  <div className="resize-handle se"></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Crop Controls */}
          <div className="absolute bottom-4 right-4 flex gap-2 z-10">
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={cancelCrop}
              className="rounded-md bg-red-500 hover:bg-red-600"
            >
              <X size={20} />
            </Button>
            <Button 
              variant="default" 
              size="icon" 
              onClick={confirmCrop}
              className="bg-green-500 text-white hover:bg-green-600 rounded-md"
              disabled={crop.width < 10 || crop.height < 10}
            >
              <Check size={20} />
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center p-8">
          <p className="text-muted-foreground">No image selected</p>
        </div>
      )}
    </div>
  );
};

export default ImageCropper;
