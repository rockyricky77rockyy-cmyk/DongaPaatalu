import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import NeonLogo from "./NeonLogo";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

interface MobileSidebarProps {
  navItems: NavItem[];
  activeNav: string;
  onNavigate: (item: NavItem) => void;
}

const MobileSidebar = ({ navItems, activeNav, onNavigate }: MobileSidebarProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleItemClick = (item: NavItem) => {
    onNavigate(item);
    setIsOpen(false); // Close the sheet after navigation
  };

  // Debugging: Log when the sheet's open state changes
  const handleOpenChange = (newOpenState: boolean) => {
    console.log("Sheet open state changed:", newOpenState);
    setIsOpen(newOpenState);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden"> {/* Re-added lg:hidden */}
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-card border-r border-border p-6 space-y-2 relative">
        {/* Transparent neon glow overlay */}
        <div className="absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none" />

        <SheetHeader className="mb-8 flex justify-center relative z-10">
          <SheetTitle className="sr-only">Navigation</SheetTitle> {/* Accessibility */}
          <NeonLogo size="small" />
        </SheetHeader>
        <nav className="space-y-1 relative z-10">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeNav === item.id ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                activeNav === item.id
                  ? "bg-primary text-primary-foreground shadow-neon"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              onClick={() => handleItemClick(item)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;