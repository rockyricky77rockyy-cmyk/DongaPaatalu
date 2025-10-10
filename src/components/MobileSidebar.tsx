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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden"> {/* Only show on small screens */}
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-card border-r border-border p-6 space-y-2 relative overflow-y-auto"> {/* Added relative and overflow-y-auto */}
        <SheetHeader className="mb-8 flex justify-center">
          <SheetTitle className="sr-only">Navigation</SheetTitle> {/* Accessibility */}
          <NeonLogo size="small" />
        </SheetHeader>
        <nav className="space-y-1">
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
        {/* Neon light effect at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary/50 to-transparent pointer-events-none" />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;