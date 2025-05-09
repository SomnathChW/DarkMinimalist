import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const RenameModal: React.FC = () => {
  const { 
    currentView,
    baseName,
    handleBaseNameChange,
    setCurrentView,
    selectedImages
  } = useAppContext();

  const handleClose = () => {
    setCurrentView("crop");
  };

  const handleContinue = () => {
    setCurrentView("resize");
  };

  return (
    <Dialog open={currentView === "rename"} onOpenChange={handleClose}>
      <DialogContent className="bg-secondary text-primary">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Rename Files</DialogTitle>
        </DialogHeader>
        
        <div className="my-4">
          <Label htmlFor="base-name" className="block text-sm font-medium mb-1">
            Base file name
          </Label>
          <Input 
            id="base-name"
            type="text" 
            className="w-full bg-background border border-border"
            placeholder="Enter base name"
            value={baseName}
            onChange={(e) => handleBaseNameChange(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
          <div className="bg-background rounded-md p-2 text-xs text-muted-foreground">
            {[1, 2, 3].map(index => (
              <p key={index}>{`${baseName || 'image'}_${index}.jpg`}</p>
            ))}
            {selectedImages.length > 3 && (
              <p>... and {selectedImages.length - 3} more</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleContinue}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameModal;
