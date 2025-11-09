interface FooterProps {
  variant?: 'fixed' | 'static';
}

export function Footer({ variant = 'fixed' }: FooterProps) {
  return (
    <footer className={`h-auto md:h-14 w-full border-t border-black/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 ${variant === 'fixed' ? 'fixed bottom-0 left-0 right-0' : 'static'}`}>
      <div className="container py-4 md:py-0 flex flex-col md:flex-row h-auto md:h-14 items-center justify-between gap-4 md:gap-0">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            Persona © 2025
          </p>
        </div>  
      </div>
    </footer>
  );
} 