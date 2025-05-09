import React, { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Palette, Check } from "lucide-react";

// Array of common colors with their hex values and labels
const commonColors = [
    { hex: "#FFFFFF", label: "White" },
    { hex: "#000000", label: "Black" },
    { hex: "#FF0000", label: "Red" },
    { hex: "#00FF00", label: "Green" },
    { hex: "#0000FF", label: "Blue" },
    { hex: "#FFFF00", label: "Yellow" },
    { hex: "#00FFFF", label: "Cyan" },
    { hex: "#FF00FF", label: "Magenta" },
    { hex: "#808080", label: "Gray" },
    { hex: "transparent", label: "Transparent" },
];

const ResizeModal: React.FC = () => {
    const { currentView, resizeSettings, setResizeSettings, setCurrentView } =
        useAppContext();

    const [customColor, setCustomColor] = useState("#FFFFFF");
    const [paddingType, setPaddingType] = useState<"color" | "transparent">(
        "color"
    );

    const handleClose = () => {
        setCurrentView("crop");
    };

    const handleContinue = () => {
        // Save transparency setting before moving to output
        if (paddingType === "transparent") {
            setResizeSettings({ paddingColor: "transparent" });
        } else {
            setResizeSettings({ paddingColor: customColor });
        }
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

    const handleColorSelect = (color: string) => {
        setCustomColor(color);
        if (color === "transparent") {
            setPaddingType("transparent");
        } else {
            setPaddingType("color");
            setResizeSettings({ paddingColor: color });
        }
    };

    return (
        <Dialog open={currentView === "resize"} onOpenChange={handleClose}>
            <DialogContent className="bg-secondary text-primary max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Resize Settings
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 my-4">
                    <div>
                        <Label
                            htmlFor="width"
                            className="block text-sm font-medium mb-1"
                        >
                            Width (px)
                        </Label>
                        <Input
                            id="width"
                            type="number"
                            className="w-full bg-background border border-border"
                            placeholder="Width"
                            value={resizeSettings.width}
                            onChange={(e) =>
                                handleWidthChange(parseInt(e.target.value) || 0)
                            }
                            min={1}
                        />
                    </div>
                    <div>
                        <Label
                            htmlFor="height"
                            className="block text-sm font-medium mb-1"
                        >
                            Height (px)
                        </Label>
                        <Input
                            id="height"
                            type="number"
                            className="w-full bg-background border border-border"
                            placeholder="Height"
                            value={resizeSettings.height}
                            onChange={(e) =>
                                handleHeightChange(
                                    parseInt(e.target.value) || 0
                                )
                            }
                            min={1}
                        />
                    </div>
                </div>

                <div className="mb-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="aspect-ratio"
                            checked={resizeSettings.maintainAspectRatio}
                            onCheckedChange={(checked) =>
                                setResizeSettings({
                                    maintainAspectRatio: checked === true,
                                })
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
                                setResizeSettings({
                                    addPadding: checked === true,
                                })
                            }
                        />
                        <Label htmlFor="add-padding" className="text-sm">
                            Add padding if needed
                        </Label>
                    </div>

                    {/* Padding options - only show if padding is enabled */}
                    {resizeSettings.addPadding && (
                        <div className="pl-6 mt-2 space-y-3">
                            <div className="space-y-2">
                                <Label className="text-sm">Padding Type</Label>
                                <RadioGroup
                                    value={paddingType}
                                    onValueChange={(value) =>
                                        setPaddingType(
                                            value as "color" | "transparent"
                                        )
                                    }
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="color"
                                            id="color"
                                        />
                                        <Label htmlFor="color">Color</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="transparent"
                                            id="transparent"
                                        />
                                        <Label htmlFor="transparent">
                                            Transparent
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {paddingType === "color" && (
                                <div className="flex flex-col gap-2">
                                    <Label className="text-sm">
                                        Padding Color
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-8 h-8 rounded border border-border"
                                            style={{
                                                backgroundColor: customColor,
                                                backgroundImage:
                                                    customColor ===
                                                    "transparent"
                                                        ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                                                        : undefined,
                                                backgroundSize: "10px 10px",
                                                backgroundPosition:
                                                    "0 0, 0 5px, 5px -5px, -5px 0px",
                                            }}
                                        />
                                        <Input
                                            type="text"
                                            className="w-24 bg-background border border-border"
                                            value={customColor}
                                            onChange={(e) =>
                                                setCustomColor(e.target.value)
                                            }
                                        />
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                >
                                                    <Palette size={16} />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-3">
                                                <div className="grid grid-cols-5 gap-2">
                                                    {commonColors.map(
                                                        (color) => (
                                                            <button
                                                                key={color.hex}
                                                                className="w-10 h-10 rounded relative border border-border hover:scale-110 transition-transform"
                                                                style={{
                                                                    backgroundColor:
                                                                        color.hex,
                                                                    backgroundImage:
                                                                        color.hex ===
                                                                        "transparent"
                                                                            ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                                                                            : undefined,
                                                                    backgroundSize:
                                                                        "10px 10px",
                                                                    backgroundPosition:
                                                                        "0 0, 0 5px, 5px -5px, -5px 0px",
                                                                }}
                                                                title={
                                                                    color.label
                                                                }
                                                                onClick={() =>
                                                                    handleColorSelect(
                                                                        color.hex
                                                                    )
                                                                }
                                                            >
                                                                {customColor ===
                                                                    color.hex && (
                                                                    <span className="absolute inset-0 flex items-center justify-center">
                                                                        <Check
                                                                            size={
                                                                                16
                                                                            }
                                                                            className={`${
                                                                                color.hex ===
                                                                                    "#FFFFFF" ||
                                                                                color.hex ===
                                                                                    "transparent"
                                                                                    ? "text-black"
                                                                                    : "text-white"
                                                                            }`}
                                                                        />
                                                                    </span>
                                                                )}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleContinue}>Apply</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ResizeModal;
