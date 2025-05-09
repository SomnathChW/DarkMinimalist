import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const OutputModal: React.FC = () => {
  const { 
    currentView,
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
          <DialogTitle className="text-lg font-semibold">Download Processed Images</DialogTitle>
        </DialogHeader>
        
        <div className="my-4 text-center">
          <p className="text-muted-foreground mb-4">
            Your images will be processed according to your specifications and downloaded as a ZIP file.
          </p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Processing summary:</p>
          <div className="bg-background rounded-md p-3 text-sm">
            <p className="mb-2">{selectedImages.length} images will be processed</p>
            <p className="mb-2">Target size: {resizeSettings.width}×{resizeSettings.height} px</p>
            <p>Renamed files: {shouldRename ? `Yes (${baseName || 'image'}_N)` : 'No'}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleProcess} className="gap-2">
            <Download size={16} />
            Process and Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OutputModal;
