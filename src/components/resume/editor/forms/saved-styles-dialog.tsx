import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentSettings } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { Check, Save, Trash2, Plus } from "lucide-react";

interface SavedStylesDialogProps {
  currentSettings: DocumentSettings;
  onApplyStyle: (settings: DocumentSettings) => void;
}

interface SavedStyle {
  name: string;
  settings: DocumentSettings;
  timestamp: number;
}

const getDefaultStyles = (): SavedStyle[] => {
  const now = Date.now();
  return [
    {
      name: "Basic",
      timestamp: now - 3,
      settings: {
        document_font_size: 10,
        document_line_height: 1.5,
        document_margin_vertical: 36,
        document_margin_horizontal: 36,
        header_name_size: 24,
        header_name_bottom_spacing: 24,
        skills_margin_top: 2,
        skills_margin_bottom: 2,
        skills_margin_horizontal: 0,
        skills_item_spacing: 2,
        experience_margin_top: 2,
        experience_margin_bottom: 2,
        experience_margin_horizontal: 0,
        experience_item_spacing: 4,
        projects_margin_top: 2,
        projects_margin_bottom: 2,
        projects_margin_horizontal: 0,
        projects_item_spacing: 4,
        education_margin_top: 2,
        education_margin_bottom: 2,
        education_margin_horizontal: 0,
        education_item_spacing: 4,
      },
    },
    {
      name: "Modern Design",
      timestamp: now - 2,
      settings: {
        document_font_size: 10,
        document_line_height: 1.6,
        document_margin_vertical: 32,
        document_margin_horizontal: 40,
        header_name_size: 28,
        header_name_bottom_spacing: 28,
        skills_margin_top: 4,
        skills_margin_bottom: 4,
        skills_margin_horizontal: 0,
        skills_item_spacing: 3,
        experience_margin_top: 6,
        experience_margin_bottom: 4,
        experience_margin_horizontal: 0,
        experience_item_spacing: 6,
        projects_margin_top: 6,
        projects_margin_bottom: 4,
        projects_margin_horizontal: 0,
        projects_item_spacing: 6,
        education_margin_top: 6,
        education_margin_bottom: 4,
        education_margin_horizontal: 0,
        education_item_spacing: 6,
      },
    },
    {
      name: "Compact Color",
      timestamp: now - 1,
      settings: {
        document_font_size: 9,
        document_line_height: 1.4,
        document_margin_vertical: 28,
        document_margin_horizontal: 32,
        header_name_size: 26,
        header_name_bottom_spacing: 20,
        skills_margin_top: 3,
        skills_margin_bottom: 3,
        skills_margin_horizontal: 0,
        skills_item_spacing: 2.5,
        experience_margin_top: 4,
        experience_margin_bottom: 3,
        experience_margin_horizontal: 0,
        experience_item_spacing: 5,
        projects_margin_top: 4,
        projects_margin_bottom: 3,
        projects_margin_horizontal: 0,
        projects_item_spacing: 5,
        education_margin_top: 4,
        education_margin_bottom: 3,
        education_margin_horizontal: 0,
        education_item_spacing: 5,
      },
    },
  ];
};

export function SavedStylesDialog({
  currentSettings,
  onApplyStyle,
}: SavedStylesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedStyles, setSavedStyles] = useState<SavedStyle[]>([]);
  const [newStyleName, setNewStyleName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("persona-saved-styles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedStyles(parsed);
        } else {
          const defaults = getDefaultStyles();
          setSavedStyles(defaults);
          localStorage.setItem(
            "persona-saved-styles",
            JSON.stringify(defaults)
          );
        }
      } catch {
        const defaults = getDefaultStyles();
        setSavedStyles(defaults);
        localStorage.setItem("persona-saved-styles", JSON.stringify(defaults));
      }
    } else {
      const defaults = getDefaultStyles();
      setSavedStyles(defaults);
      localStorage.setItem("persona-saved-styles", JSON.stringify(defaults));
    }
  }, []);

  const handleSaveStyle = () => {
    if (!newStyleName.trim()) return;
    const newStyle: SavedStyle = {
      name: newStyleName,
      settings: currentSettings,
      timestamp: Date.now(),
    };
    const updatedStyles = [...savedStyles, newStyle];
    setSavedStyles(updatedStyles);
    localStorage.setItem("persona-saved-styles", JSON.stringify(updatedStyles));
    setNewStyleName("");
    setIsAddingNew(false);
  };

  const handleDeleteStyle = (timestamp: number) => {
    const updatedStyles = savedStyles.filter((s) => s.timestamp !== timestamp);
    setSavedStyles(updatedStyles);
    localStorage.setItem("persona-saved-styles", JSON.stringify(updatedStyles));
  };

  const handleApplyStyle = (settings: DocumentSettings) => {
    onApplyStyle(settings);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs w-full border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
        >
          <Save className="w-3 h-3 mr-1" />
          Saved Styles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 shadow-md pt-12">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Saved Document Styles
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingNew(true)}
              className="text-xs border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150"
            >
              <Plus className="w-3 h-3 mr-1" />
              Save Current
            </Button>
          </div>
          <DialogDescription className="text-sm text-gray-500">
            Save current document settings or apply saved styles to your resume.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isAddingNew && (
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Input
                placeholder="Enter style name..."
                value={newStyleName}
                onChange={(e) => setNewStyleName(e.target.value)}
                className="flex-1 h-8 border-gray-200 bg-white text-sm focus:border-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              <Button
                onClick={handleSaveStyle}
                disabled={!newStyleName.trim()}
                size="sm"
                className="whitespace-nowrap bg-gray-900 text-white hover:bg-gray-700 transition-colors duration-150 h-8 text-xs"
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewStyleName("");
                }}
                className="text-gray-500 hover:text-gray-700 h-8 text-xs"
              >
                Cancel
              </Button>
            </div>
          )}

          <div className={isAddingNew ? "" : "border-t border-gray-100 pt-4"}>
            <Label className="text-xs font-medium text-gray-500 mb-2 block">
              Saved Styles
            </Label>
            <ScrollArea className="h-[280px] rounded-lg border border-gray-200 bg-white">
              <div className="p-3 space-y-2">
                {savedStyles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Save className="w-6 h-6 mb-2 opacity-40" />
                    <p className="text-sm">No saved styles yet</p>
                  </div>
                ) : (
                  savedStyles.map((style) => (
                    <div
                      key={style.timestamp}
                      className="flex items-center justify-between group rounded-lg border border-gray-200 px-3 py-2.5 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {style.name}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApplyStyle(style.settings)}
                          className="h-7 w-7 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                          title="Apply Style"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStyle(style.timestamp)}
                          className="h-7 w-7 p-0 text-gray-300 hover:text-red-500 hover:bg-red-50"
                          title="Delete Style"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-150"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
