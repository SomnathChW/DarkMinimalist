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

const OutputModal: React.FC = () => {
  const { 
    currentView,
    outputFolder,
    setOutputFolder,
    folderPath,
    selectedImages,
    shouldRename,
    baseName,
    resizeSettings,
    setCurrentView,
    processImages
  } = useAppContext();

  const handleClose = () => {
    setCurrentView("resize");
  };

  const handleProcess = () => {
    processImages();
  };

  return (
    <Dialog open={currentView === "output"} onOpenChange={handleClose}>
      <DialogContent className="bg-secondary text-primary">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Output Settings</DialogTitle>
        </DialogHeader>
        
        <div className="my-4">
          <Label htmlFor="output-folder" className="block text-sm font-medium mb-1">
            Output folder name
          </Label>
          <Input 
            id="output-folder"
            type="text" 
            className="w-full bg-background border border-border"
            placeholder="Enter folder name"
            value={outputFolder}
            onChange={(e) => setOutputFolder(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Output path:</p>
          <div className="bg-background rounded-md p-2 text-xs overflow-x-auto">
            <p>{folderPath ? `${folderPath}/${outputFolder || 'output'}/` : '/output/'}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Processing summary:</p>
          <div className="bg-background rounded-md p-2 text-xs text-muted-foreground">
            <p>{selectedImages.length} images will be processed</p>
            <p>Target size: {resizeSettings.width}×{resizeSettings.height} px</p>
            <p>Renamed files: {shouldRename ? `Yes (${baseName || 'image'}_N)` : 'No'}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleProcess}>
            Process Images
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OutputModal;
