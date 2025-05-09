import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import FolderSelector from "./FolderSelector";
import ThumbnailGallery from "./ThumbnailGallery";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const LeftPanel: React.FC = () => {
  const { 
    shouldRename, 
    handleRenameToggle,
    images,
    selectedImages,
    selectAllImages
  } = useAppContext();

  return (
    <div className="w-2/5 border-r border-border h-full flex flex-col bg-secondary p-4 overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">Image Folder Manager</h2>
      
      {/* Folder Selection Section */}
      <FolderSelector />
      
      {/* Rename Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <Checkbox 
          id="rename-toggle"
          checked={shouldRename}
          onCheckedChange={(checked) => handleRenameToggle(checked === true)}
        />
        <Label htmlFor="rename-toggle" className="text-sm font-medium">
          Rename files during export
        </Label>
      </div>
      
      {/* Thumbnail Gallery */}
      <ThumbnailGallery />
      
      {/* Selection Summary & Buttons */}
      <div className="pt-3 border-t border-border mt-3">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            <span>{selectedImages.length}</span> of{" "}
            <span>{images.length}</span> images selected
          </p>
          <button 
            className="bg-background hover:bg-secondary text-primary px-3 py-1.5 rounded-md text-sm font-medium"
            onClick={selectAllImages}
          >
            Select All
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
