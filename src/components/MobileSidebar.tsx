import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
// import NeonLogo from "./NeonLogo"; // Removed NeonLogo import

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
      <SheetContent side="left" className="w-64 bg-gradient-glow border-r border-border p-6 space-y-2 shadow-neon-strong">
        <SheetHeader className="mb-8 flex items-center"> {/* Removed justify-center */}
          <SheetTitle className="sr-only">Navigation</SheetTitle> {/* Accessibility */}
          {/* Replaced NeonLogo with text */}
          <div className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent ml-[-3px]"> {/* Added ml-[-3px] */}
            Donga Paatalu
          </div>
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
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;