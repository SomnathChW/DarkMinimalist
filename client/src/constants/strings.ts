export const appStrings = {
  appTitle: "Image Folder Manager & Cropper",
  
  // Left Panel
  leftPanelTitle: "Image Folder Manager",
  folderSelectorTitle: "Select Input Folder",
  folderInputPlaceholder: "Enter folder path",
  browseButtonText: "Browse",
  renameToggleLabel: "Rename files during export",
  galleryTitle: "Image Gallery",
  noImagesMessage: "No images to display",
  selectionSummary: (selected: number, total: number) => `${selected} of ${total} images selected`,
  selectAllButtonText: "Select All",
  
  // Validation Messages
  validFolderFound: (count: number) => `Valid folder with ${count} images found.`,
  noFilesFound: "No files found in the selected folder.",
  noImagesFound: "No image files found in the selected folder.",
  folderAccessError: "Failed to access the folder. Please try again.",
  
  // File Stats
  totalImagesLabel: "Total images:",
  nonImageFilesLabel: "Non-image files:",
  nonImageFilesFound: "Non-image files found:",
  
  // Right Panel
  cropperTitle: "Image Cropper",
  resizeTitle: "Resize Settings",
  outputTitle: "Output Settings",
  processorTitle: "Image Processor",
  imageCounter: (current: number, total: number) => `Image ${current} of ${total}`,
  welcomeTitle: "Welcome to Image Folder Manager & Cropper",
  welcomeMessage: "Select a folder with images on the left panel to begin",
  welcomeDescription: "You can crop, resize, and rename your images before saving them to a new folder",
  resizeSettingsPrompt: "Set the target dimensions for your images",
  outputSettingsPrompt: "Set the output folder name and review your settings",
  
  // Buttons
  backButtonText: "Back",
  skipCropButtonText: "Skip Crop",
  continueButtonText: "Continue",
  processImagesButtonText: "Process Images",
  
  // Modals
  renameModalTitle: "Rename Files",
  baseNameLabel: "Base file name",
  baseNamePlaceholder: "Enter base name",
  previewLabel: "Preview:",
  andMoreText: (count: number) => `... and ${count} more`,
  cancelButtonText: "Cancel",
  applyButtonText: "Apply",
  
  resizeModalTitle: "Resize Settings",
  widthLabel: "Width (px)",
  heightLabel: "Height (px)",
  maintainAspectRatioLabel: "Maintain aspect ratio",
  addPaddingLabel: "Add padding if needed",
  
  outputModalTitle: "Output Settings",
  outputFolderLabel: "Output folder name",
  outputFolderPlaceholder: "Enter folder name",
  outputPathLabel: "Output path:",
  processingSummaryLabel: "Processing summary:",
  targetSizeText: (width: number, height: number) => `Target size: ${width}×${height} px`,
  renamedFilesText: (rename: boolean, basename: string) => 
    `Renamed files: ${rename ? `Yes (${basename || 'image'}_N)` : 'No'}`,
  
  // Success Notification
  successTitle: "Success!",
  successMessage: "Images processed and saved successfully."
};
