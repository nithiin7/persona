interface FooterProps {
  variant?: "fixed" | "static";
}

export function Footer({ variant = "fixed" }: FooterProps) {
  return (
    <footer
      className={`h-10 w-full border-t border-gray-200 bg-white z-40 ${
        variant === "fixed" ? "fixed bottom-0 left-0 right-0" : "static"
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <p className="text-xs text-gray-400">Persona © 2026</p>
      </div>
    </footer>
  );
}
