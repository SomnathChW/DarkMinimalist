export const appConfig = {
  // App dimensions
  maxHeight: "70vh",
  aspectRatio: "16/9",
  
  // Image processing
  defaultResizeWidth: 1024,
  defaultResizeHeight: 1024,
  defaultMaintainAspectRatio: true,
  defaultAddPadding: true,
  
  // File naming
  defaultBaseName: "image",
  defaultOutputFolder: "output",
  
  // Thumbnail gallery
  thumbnailHeight: "24",
  thumbnailColumns: 3,
  
  // Carousel
  carouselItemHeight: "14",
  carouselItemWidth: "14",
  
  // Image types
  supportedImageTypes: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"],
  
  // Animation
  transitionTime: "0.3s",
  
  // Crop overlay
  cropOverlayOpacity: 0.7,
  cropBoxBorderWidth: 2,
  
  // Resize handles
  resizeHandleSize: 10
};
