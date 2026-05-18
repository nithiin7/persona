import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddItemButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function AddItemButton({
  onClick,
  children,
  className,
}: AddItemButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={cn(
        "h-9 border-dashed border-gray-200 text-gray-400 text-sm hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150",
        className
      )}
    >
      <Plus className="h-3.5 w-3.5 mr-1.5 shrink-0" />
      {children}
    </Button>
  );
}
