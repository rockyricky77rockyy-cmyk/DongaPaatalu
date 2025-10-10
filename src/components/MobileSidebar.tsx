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
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-card border-r border-border p-6 space-y-2 relative">
        {/* Temporarily simplified content for debugging */}
        <div className="text-white text-xl font-bold">Sidebar Content Here</div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;