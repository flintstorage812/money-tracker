import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Home", testId: "nav-home" },
    { path: "/calendar", icon: "fas fa-calendar", label: "Calendar", testId: "nav-calendar" },
    { path: "/savings", icon: "fas fa-piggy-bank", label: "Savings", testId: "nav-savings" },
    { path: "/bills", icon: "fas fa-file-invoice-dollar", label: "Bills", testId: "nav-bills" },
    { path: "/profile", icon: "fas fa-user", label: "Profile", testId: "nav-profile" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-card border-t border-border">
      <div className="grid grid-cols-5 py-2">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={`flex flex-col items-center py-2 h-auto ${
              location === item.path 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setLocation(item.path)}
            data-testid={item.testId}
          >
            <i className={`${item.icon} text-lg mb-1`}></i>
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
