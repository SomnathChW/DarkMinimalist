import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { processBatchImages } from "../utils/imageOperations";
import JSZip from "jszip";

// Types
export interface ImageFile {
    file: File;
    url: string;
    selected: boolean;
    cropped?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

interface FileExtension {
    extension: string;
    selected: boolean;
}

type AppView = "folder" | "crop" | "rename" | "resize" | "output" | "complete";

interface AppContextType {
    // State
    folderPath: string;
    images: ImageFile[];
    nonImageExtensions: FileExtension[];
    selectedImages: ImageFile[];
    currentImageIndex: number;
    shouldRename: boolean;
    baseName: string;
    resizeSettings: {
        width: number;
        height: number;
        maintainAspectRatio: boolean;
        addPadding: boolean;
        paddingColor: string;
    };
    outputFolder: string;
    currentView: AppView;
    isProcessing: boolean;
    validationMessage: {
        type: "success" | "error" | "none";
        text: string;
    };

    // Methods
    setFolderPath: (path: string) => void;
    handleFolderSelection: () => Promise<void>;
    handleImageSelection: (index: number, selected: boolean) => void;
    handleNonImageExtensionToggle: (
        extension: string,
        selected: boolean
    ) => void;
    handleRenameToggle: (shouldRename: boolean) => void;
    handleBaseNameChange: (name: string) => void;
    setResizeSettings: (
        settings: Partial<AppContextType["resizeSettings"]>
    ) => void;
    setOutputFolder: (name: string) => void;
    setCurrentView: (view: AppView) => void;
    nextImage: () => void;
    prevImage: () => void;
    goToImage: (index: number) => void;
    setImageCrop: (crop: AppContextType["images"][0]["cropped"]) => void;
    selectAllImages: () => void;
    deselectAllImages: () => void;
    resetApp: () => void;
    processImages: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [folderPath, setFolderPath] = useState<string>("");
    const [images, setImages] = useState<ImageFile[]>([]);
    const [nonImageExtensions, setNonImageExtensions] = useState<
        FileExtension[]
    >([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [shouldRename, setShouldRename] = useState(true);
    const [baseName, setBaseName] = useState("image");
    const [resizeSettings, setResizeSettingsState] = useState({
        width: 1024,
        height: 1024,
        maintainAspectRatio: true,
        addPadding: true,
        paddingColor: "#FFFFFF", // Add default padding color
    });
    const [outputFolder, setOutputFolderState] = useState("output");
    const [currentView, setCurrentViewState] = useState<AppView>("folder");
    const [isProcessing, setIsProcessing] = useState(false);
    const [validationMessage, setValidationMessage] = useState<{
        type: "success" | "error" | "none";
        text: string;
    }>({
        type: "none",
        text: "",
    });

    const selectedImages = images.filter((img) => img.selected);

    const handleFolderSelection = async () => {
        try {
            // For browsers that support the File System Access API
            if ("showDirectoryPicker" in window) {
                // @ts-ignore - TypeScript doesn't have the types for the File System Access API yet
                const directoryHandle = await window.showDirectoryPicker();
                const files: File[] = [];

                // @ts-ignore
                setFolderPath(directoryHandle.name);

                // @ts-ignore
                for await (const entry of directoryHandle.values()) {
                    if (entry.kind === "file") {
                        // @ts-ignore
                        const file = await entry.getFile();
                        if (file) {
                            files.push(file);
                        }
                    }
                }

                processSelectedFiles(files);
            } else {
                // Fallback for browsers that don't support the File System Access API
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.webkitdirectory = true;

                input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files.length > 0) {
                        const files = Array.from(target.files);
                        const directoryPath =
                            files[0].webkitRelativePath.split("/")[0];
                        setFolderPath(directoryPath);
                        processSelectedFiles(files);
                    }
                };

                input.click();
            }
        } catch (error) {
            console.error("Error selecting folder:", error);
            setValidationMessage({
                type: "error",
                text: "Failed to access the folder. Please try again.",
            });
        }
    };

    const processSelectedFiles = (files: File[]) => {
        if (files.length === 0) {
            setValidationMessage({
                type: "error",
                text: "No files found in the selected folder.",
            });
            return;
        }

        const imageRegex = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
        const imageFiles: ImageFile[] = [];
        const nonImageExts = new Set<string>();

        files.forEach((file) => {
            if (imageRegex.test(file.name)) {
                imageFiles.push({
                    file,
                    url: URL.createObjectURL(file),
                    selected: false,
                });
            } else {
                // Extract extension
                const extension =
                    file.name.split(".").pop()?.toLowerCase() || "unknown";
                nonImageExts.add(`.${extension}`);
            }
        });

        setImages(imageFiles);
        setNonImageExtensions(
            Array.from(nonImageExts).map((ext) => ({
                extension: ext,
                selected: false,
            }))
        );

        if (imageFiles.length > 0) {
            setValidationMessage({
                type: "success",
                text: `Valid folder with ${imageFiles.length} images found.`,
            });
        } else {
            setValidationMessage({
                type: "error",
                text: "No image files found in the selected folder.",
            });
        }
    };

    const handleImageSelection = (index: number, selected: boolean) => {
        setImages((prevImages) =>
            prevImages.map((img, i) =>
                i === index ? { ...img, selected } : img
            )
        );

        // If image is being selected and it's the first selected image,
        // automatically move to crop view
        if (selected) {
            const currentSelectedCount = images.filter(
                (img) => img.selected
            ).length;
            if (currentSelectedCount === 0) {
                // This is the first image being selected
                setCurrentImageIndex(index);
                setCurrentViewState("crop");
            }
        }
    };

    const handleNonImageExtensionToggle = (
        extension: string,
        selected: boolean
    ) => {
        setNonImageExtensions((prev) =>
            prev.map((item) =>
                item.extension === extension ? { ...item, selected } : item
            )
        );
    };

    const handleRenameToggle = (value: boolean) => {
        setShouldRename(value);
    };

    const handleBaseNameChange = (name: string) => {
        setBaseName(name);
    };

    const setResizeSettings = (settings: Partial<typeof resizeSettings>) => {
        setResizeSettingsState((prev) => ({ ...prev, ...settings }));
    };

    const setOutputFolder = (name: string) => {
        setOutputFolderState(name);
    };

    const setCurrentView = (view: AppView) => {
        setCurrentViewState(view);

        // Reset current image index when entering crop view
        if (view === "crop") {
            const firstSelectedIndex = images.findIndex((img) => img.selected);
            if (firstSelectedIndex !== -1) {
                setCurrentImageIndex(firstSelectedIndex);
            }
        }
    };

    const nextImage = useCallback(() => {
        const selectedIndices = images
            .map((img, index) => (img.selected ? index : -1))
            .filter((index) => index !== -1);

        if (selectedIndices.length === 0) return;

        const currentIndexInSelected =
            selectedIndices.indexOf(currentImageIndex);
        if (currentIndexInSelected < selectedIndices.length - 1) {
            setCurrentImageIndex(selectedIndices[currentIndexInSelected + 1]);
        } else {
            // Loop back to the first selected image
            setCurrentImageIndex(selectedIndices[0]);
        }
    }, [currentImageIndex, images]);

    const prevImage = useCallback(() => {
        const selectedIndices = images
            .map((img, index) => (img.selected ? index : -1))
            .filter((index) => index !== -1);

        if (selectedIndices.length === 0) return;

        const currentIndexInSelected =
            selectedIndices.indexOf(currentImageIndex);
        if (currentIndexInSelected > 0) {
            setCurrentImageIndex(selectedIndices[currentIndexInSelected - 1]);
        } else {
            // Loop to the last selected image
            setCurrentImageIndex(selectedIndices[selectedIndices.length - 1]);
        }
    }, [currentImageIndex, images]);

    const goToImage = (index: number) => {
        if (index >= 0 && index < images.length && images[index].selected) {
            setCurrentImageIndex(index);
        }
    };

    const setImageCrop = (crop: ImageFile["cropped"]) => {
        // First make a copy of the current image
        const currentImg = images[currentImageIndex];

        // Create a new version with the crop data
        const updatedImg = { ...currentImg, cropped: crop };

        // Update the images array with the new version
        const newImages = [...images];
        newImages[currentImageIndex] = updatedImg;

        // Set the updated array to state
        setImages(newImages);

        // Log for debugging
        console.log("Crop applied:", crop);
        console.log("Updated image:", updatedImg);
    };

    const selectAllImages = () => {
        setImages((prevImages) =>
            prevImages.map((img) => ({ ...img, selected: true }))
        );
    };

    const deselectAllImages = () => {
        setImages((prevImages) =>
            prevImages.map((img) => ({ ...img, selected: false }))
        );
    };

    const resetApp = () => {
        // Clean up object URLs to prevent memory leaks
        images.forEach((img) => URL.revokeObjectURL(img.url));

        setFolderPath("");
        setImages([]);
        setNonImageExtensions([]);
        setCurrentImageIndex(0);
        setShouldRename(true);
        setBaseName("image");
        setResizeSettingsState({
            width: 1024,
            height: 1024,
            maintainAspectRatio: true,
            addPadding: true,
            paddingColor: "#FFFFFF", // Add default padding color
        });
        setOutputFolderState("output");
        setCurrentViewState("folder");
        setIsProcessing(false);
        setValidationMessage({
            type: "none",
            text: "",
        });
    };

    const processImages = async () => {
        // This would be where we'd actually process and save the images
        setIsProcessing(true);

        try {
            // Process the images according to the settings
            const processedImages = await processBatchImages(
                selectedImages,
                resizeSettings,
                baseName,
                shouldRename
            );

            // Use directly imported JSZip
            const zip = new JSZip();

            // Add each processed image to the zip
            processedImages.forEach((file: File) => {
                zip.file(file.name, file);
            });

            // Generate the zip file
            const zipBlob = await zip.generateAsync({ type: "blob" });

            // Create download link
            const downloadUrl = URL.createObjectURL(zipBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = downloadUrl;
            downloadLink.download = `processed_images.zip`;

            // Trigger download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Clean up
            URL.revokeObjectURL(downloadUrl);

            setIsProcessing(false);
            setCurrentView("complete");

            return Promise.resolve();
        } catch (error) {
            console.error("Error processing images:", error);
            setIsProcessing(false);
            setValidationMessage({
                type: "error",
                text: "Failed to process images. Please try again.",
            });
            return Promise.reject(error);
        }
    };

    const value = {
        folderPath,
        images,
        nonImageExtensions,
        selectedImages,
        currentImageIndex,
        shouldRename,
        baseName,
        resizeSettings,
        outputFolder,
        currentView,
        isProcessing,
        validationMessage,

        setFolderPath,
        handleFolderSelection,
        handleImageSelection,
        handleNonImageExtensionToggle,
        handleRenameToggle,
        handleBaseNameChange,
        setResizeSettings,
        setOutputFolder,
        setCurrentView,
        nextImage,
        prevImage,
        goToImage,
        setImageCrop,
        selectAllImages,
        deselectAllImages,
        resetApp,
        processImages,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
