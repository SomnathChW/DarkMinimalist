import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FolderOpen, CheckCircle, XCircle } from "lucide-react";

const FolderSelector: React.FC = () => {
  const { 
    folderPath,
    setFolderPath,
    handleFolderSelection,
    images,
    nonImageExtensions,
    handleNonImageExtensionToggle,
    validationMessage
  } = useAppContext();

  return (
    <div className="bg-background rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium mb-2">Select Input Folder</h3>
      <div className="flex gap-2 mb-3">
        <Input
          type="text"
          className="flex-1 bg-secondary border border-border"
          placeholder="Enter folder path"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
        />
        <Button 
          variant="outline" 
          onClick={handleFolderSelection}
          className="flex items-center gap-1"
        >
          <FolderOpen size={16} />
          Browse
        </Button>
      </div>
      
      {/* Validation Messages */}
      {validationMessage.type !== "none" && (
        <div 
          className={`text-sm mb-3 ${
            validationMessage.type === "success" ? "text-green-500" : "text-destructive"
          }`}
        >
          {validationMessage.type === "success" ? (
            <CheckCircle size={16} className="inline mr-1 text-green-500" />
          ) : (
            <XCircle size={16} className="inline mr-1" />
          )}
          {validationMessage.text}
        </div>
      )}
      
      {/* File Counts */}
      {images.length > 0 && (
        <div className="flex flex-col gap-1 text-sm mb-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total images:</span>
            <span>{images.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Non-image files:</span>
            <span>{nonImageExtensions.length}</span>
          </div>
        </div>
      )}
      
      {/* Non-image File Types */}
      {nonImageExtensions.length > 0 && (
        <div className="text-sm mb-3">
          <p className="text-muted-foreground mb-2">Non-image files found:</p>
          <div className="flex flex-wrap gap-2">
            {nonImageExtensions.map((ext, index) => (
              <label key={index} className="flex items-center gap-1 bg-background rounded px-2 py-1">
                <Checkbox 
                  checked={ext.selected}
                  onCheckedChange={(checked) => 
                    handleNonImageExtensionToggle(ext.extension, checked === true)
                  }
                />
                <span>{ext.extension}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderSelector;
