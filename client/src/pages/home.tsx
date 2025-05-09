import React from "react";
import { useAppContext } from "@/contexts/AppContext";
import LeftPanel from "@/components/LeftPanel";
import RightPanel from "@/components/RightPanel";
import RenameModal from "@/components/RenameModal";
import ResizeModal from "@/components/ResizeModal";
import OutputModal from "@/components/OutputModal";
import { Toast, ToastProvider } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

const Home: React.FC = () => {
  const { 
    currentView,
    resetApp
  } = useAppContext();
  
  const { toast } = useToast();

  // Show success toast when processing is complete
  React.useEffect(() => {
    if (currentView === "complete") {
      toast({
        title: "Success!",
        description: "Images processed and saved successfully.",
        variant: "success",
      });
      
      // Reset app after showing success message
      const timer = setTimeout(() => {
        resetApp();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentView, toast, resetApp]);

  return (
    <div className="flex h-screen bg-background text-primary">
      <LeftPanel />
      <RightPanel />
      
      {/* Modals that appear based on the current view */}
      {currentView === "rename" && <RenameModal />}
      {currentView === "resize" && <ResizeModal />}
      {currentView === "output" && <OutputModal />}
    </div>
  );
};

export default Home;
