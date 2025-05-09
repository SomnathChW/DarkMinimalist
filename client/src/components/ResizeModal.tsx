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
import { Checkbox } from "@/components/ui/checkbox";

const ResizeModal: React.FC = () => {
  const { 
    currentView,
    resizeSettings,
    setResizeSettings,
    setCurrentView
  } = useAppContext();

  const handleClose = () => {
    setCurrentView("crop");
  };

  const handleContinue = () => {
    setCurrentView("output");
  };

  // Handle aspect ratio locking
  const handleWidthChange = (width: number) => {
    setResizeSettings({ width });
    
    if (resizeSettings.maintainAspectRatio && width > 0) {
      // Maintain the aspect ratio based on current height
      const aspectRatio = resizeSettings.height / resizeSettings.width;
      const newHeight = Math.round(width * aspectRatio);
      setResizeSettings({ height: newHeight });
    }
  };

  const handleHeightChange = (height: number) => {
    setResizeSettings({ height });
    
    if (resizeSettings.maintainAspectRatio && height > 0) {
      // Maintain the aspect ratio based on current width
      const aspectRatio = resizeSettings.width / resizeSettings.height;
      const newWidth = Math.round(height * aspectRatio);
      setResizeSettings({ width: newWidth });
    }
  };

  return (
    <Dialog open={currentView === "resize"} onOpenChange={handleClose}>
      <DialogContent className="bg-secondary text-primary">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Resize Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 my-4">
          <div>
            <Label htmlFor="width" className="block text-sm font-medium mb-1">
              Width (px)
            </Label>
            <Input 
              id="width"
              type="number" 
              className="w-full bg-background border border-border"
              placeholder="Width"
              value={resizeSettings.width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
              min={1}
            />
          </div>
          <div>
            <Label htmlFor="height" className="block text-sm font-medium mb-1">
              Height (px)
            </Label>
            <Input 
              id="height"
              type="number" 
              className="w-full bg-background border border-border"
              placeholder="Height"
              value={resizeSettings.height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
              min={1}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Checkbox 
              id="aspect-ratio"
              checked={resizeSettings.maintainAspectRatio}
              onCheckedChange={(checked) => 
                setResizeSettings({ maintainAspectRatio: checked === true })
              }
            />
            <Label htmlFor="aspect-ratio" className="text-sm">
              Maintain aspect ratio
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox 
              id="add-padding"
              checked={resizeSettings.addPadding}
              onCheckedChange={(checked) => 
                setResizeSettings({ addPadding: checked === true })
              }
            />
            <Label htmlFor="add-padding" className="text-sm">
              Add padding if needed
            </Label>
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

export default ResizeModal;
