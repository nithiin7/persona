import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ResumeTemplate } from "@/lib/types";
import { Layout, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  currentTemplate?: ResumeTemplate;
  onTemplateChange: (template: ResumeTemplate) => void;
}

interface TemplateOption {
  id: ResumeTemplate;
  name: string;
  description: string;
  preview: string;
  features: string[];
  gradient: string;
}

const templates: TemplateOption[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional professional layout with clean lines",
    preview: "📄",
    features: ["Professional", "ATS-friendly", "Traditional"],
    gradient: "from-slate-600 to-gray-600",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with accent colors",
    preview: "✨",
    features: ["Stylish", "Eye-catching", "Modern spacing"],
    gradient: "from-indigo-600 to-purple-600",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-clean minimalist design",
    preview: "⚪",
    features: ["Simple", "Centered layout", "Lots of whitespace"],
    gradient: "from-zinc-600 to-neutral-600",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Polished corporate style",
    preview: "💼",
    features: ["Corporate", "Structured", "Business-focused"],
    gradient: "from-blue-600 to-cyan-600",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Bold design for creative roles",
    preview: "🎨",
    features: ["Bold", "Colorful", "Stand out"],
    gradient: "from-pink-600 to-rose-600",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Elegant and sophisticated for leadership roles",
    preview: "👔",
    features: ["Elegant", "Sophisticated", "Leadership-focused"],
    gradient: "from-amber-600 to-orange-600",
  },
  {
    id: "tech",
    name: "Tech",
    description: "Modern tech industry design with clean aesthetics",
    preview: "💻",
    features: ["Tech-focused", "Clean", "Innovative"],
    gradient: "from-emerald-600 to-teal-600",
  },
  {
    id: "academic",
    name: "Academic",
    description: "Scholarly design perfect for research and education",
    preview: "🎓",
    features: ["Scholarly", "Formal", "Research-oriented"],
    gradient: "from-violet-600 to-purple-600",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Strong, impactful design that commands attention",
    preview: "🔥",
    features: ["Bold", "Impactful", "Attention-grabbing"],
    gradient: "from-red-600 to-orange-600",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Refined and graceful design with premium feel",
    preview: "✨",
    features: ["Refined", "Graceful", "Premium"],
    gradient: "from-rose-600 to-pink-600",
  },
];

export function TemplateSelector({
  currentTemplate = "classic",
  onTemplateChange,
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate);

  const handleTemplateSelect = (templateId: ResumeTemplate) => {
    setSelectedTemplate(templateId);
    onTemplateChange(templateId);
    setIsOpen(false); // Close modal after selection
  };

  const currentTemplateName =
    templates.find((t) => t.id === currentTemplate)?.name || "Classic";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs bg-white/80 hover:bg-gradient-to-r from-purple-500/10 to-pink-500/10 
          border-purple-600 hover:border-purple-800 text-purple-700 hover:text-purple-800 
          backdrop-blur-sm transition-all duration-500 hover:-translate-y-[1px] w-full 
          shadow-sm hover:shadow-md"
        >
          <Layout className="w-3 h-3 mr-1" />
          Template: {currentTemplateName}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent font-semibold">
            Choose Resume Template
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Select a template that best fits your style and industry
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id;
            return (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-300",
                  "hover:shadow-lg hover:-translate-y-1",
                  "text-left group",
                  isSelected
                    ? "border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md"
                    : "border-gray-200 hover:border-purple-300 bg-white"
                )}
              >
                {/* Check mark for selected */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Template preview mockup */}
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {/* Mini resume preview */}
                  <div className="space-y-2">
                    {/* Header preview based on template */}
                    {template.id === "classic" && (
                      <div className="border-b-2 border-gray-800 pb-1">
                        <div className="h-2 w-16 bg-gray-800 rounded mb-1"></div>
                        <div className="h-1 w-20 bg-gray-500 rounded"></div>
                      </div>
                    )}
                    {template.id === "modern" && (
                      <div className="bg-indigo-50 border-l-4 border-indigo-600 p-2 rounded">
                        <div className="h-2 w-16 bg-indigo-900 rounded mb-1"></div>
                        <div className="h-1 w-20 bg-indigo-600 rounded"></div>
                      </div>
                    )}
                    {template.id === "minimal" && (
                      <div className="text-center pb-2">
                        <div className="h-2 w-16 bg-gray-900 rounded mb-1 mx-auto"></div>
                        <div className="h-1 w-24 bg-gray-500 rounded mx-auto"></div>
                      </div>
                    )}
                    {template.id === "professional" && (
                      <div className="bg-blue-50 border-b-2 border-blue-600 p-2 rounded">
                        <div className="h-2 w-16 bg-blue-800 rounded mb-1"></div>
                        <div className="h-1 w-20 bg-blue-600 rounded"></div>
                      </div>
                    )}
                    {template.id === "creative" && (
                      <div className="bg-pink-50 border-t-2 border-b-2 border-pink-600 p-2 rounded">
                        <div className="h-2 w-16 bg-pink-800 rounded mb-1"></div>
                        <div className="h-1 w-20 bg-pink-600 rounded"></div>
                      </div>
                    )}
                    {template.id === "executive" && (
                      <div className="bg-amber-50 border-l-4 border-amber-700 p-2 rounded-r">
                        <div className="h-2.5 w-20 bg-amber-900 rounded mb-1"></div>
                        <div className="h-1 w-24 bg-amber-700 rounded"></div>
                      </div>
                    )}
                    {template.id === "tech" && (
                      <div className="bg-emerald-50 border-2 border-emerald-500 p-2 rounded-lg shadow-sm">
                        <div className="h-2 w-16 bg-emerald-800 rounded mb-1"></div>
                        <div className="h-1 w-20 bg-emerald-600 rounded"></div>
                      </div>
                    )}
                    {template.id === "academic" && (
                      <div className="bg-violet-50 border-b-4 border-violet-700 p-2 rounded-t">
                        <div className="h-2 w-16 bg-violet-900 rounded mb-1"></div>
                        <div className="h-1 w-20 bg-violet-700 rounded"></div>
                      </div>
                    )}
                    {template.id === "bold" && (
                      <div className="bg-red-50 border-2 border-red-600 p-2 rounded-lg">
                        <div className="h-3 w-20 bg-red-800 rounded mb-1"></div>
                        <div className="h-1.5 w-24 bg-red-600 rounded"></div>
                      </div>
                    )}
                    {template.id === "elegant" && (
                      <div className="bg-rose-50 border border-rose-300 p-3 rounded-lg shadow-inner">
                        <div className="h-2 w-16 bg-rose-800 rounded mb-1.5"></div>
                        <div className="h-1 w-20 bg-rose-600 rounded"></div>
                      </div>
                    )}
                    
                    {/* Section titles preview */}
                    <div className="space-y-1.5">
                      <div className={cn(
                        "h-1.5 w-12 rounded",
                        template.id === "modern" ? "bg-indigo-600" :
                        template.id === "professional" ? "bg-blue-600" :
                        template.id === "creative" ? "bg-pink-600" :
                        template.id === "executive" ? "bg-amber-600" :
                        template.id === "tech" ? "bg-emerald-600" :
                        template.id === "academic" ? "bg-violet-600" :
                        template.id === "bold" ? "bg-red-600" :
                        template.id === "elegant" ? "bg-rose-600" :
                        "bg-gray-700"
                      )}></div>
                      <div className="space-y-0.5">
                        <div className="h-1 w-full bg-gray-300 rounded"></div>
                        <div className="h-1 w-4/5 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template info */}
                <h3
                  className={cn(
                    "text-lg font-semibold mb-1",
                    isSelected ? "text-purple-900" : "text-gray-900"
                  )}
                >
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5">
                  {template.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        isSelected
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      )}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

