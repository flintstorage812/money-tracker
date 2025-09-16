import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Profile() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const profileMenuItems = [
    {
      icon: "fas fa-user-circle",
      label: "Personal Information",
      action: "editPersonalInfo",
      testId: "button-personal-info"
    },
    {
      icon: "fas fa-lock",
      label: "Change Password",
      action: "changePassword",
      testId: "button-change-password"
    },
    {
      icon: "fas fa-chart-pie",
      label: "Budget Settings",
      action: "budgetSettings",
      testId: "button-budget-settings"
    },
    {
      icon: "fas fa-bell",
      label: "Notifications",
      action: "notifications",
      testId: "button-notifications"
    },
    {
      icon: "fas fa-download",
      label: "Export Data",
      action: "exportData",
      testId: "button-export-data"
    }
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Profile</h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl bg-accent"
            data-testid="button-edit-profile"
          >
            <i className="fas fa-edit text-accent-foreground"></i>
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                data-testid="img-profile-avatar"
              />
            ) : (
              <i className="fas fa-user text-3xl text-primary-foreground" data-testid="icon-default-avatar"></i>
            )}
          </div>
          <h3 className="text-xl font-semibold mb-1" data-testid="text-full-name">
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.firstName || "User"
            }
          </h3>
          <p className="text-muted-foreground" data-testid="text-user-email">
            {user?.email || "No email provided"}
          </p>
        </div>

        {/* Profile Settings */}
        <div className="space-y-4 mb-8">
          {profileMenuItems.map((item) => (
            <Card key={item.action}>
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full p-4 text-left justify-start h-auto rounded-xl"
                  data-testid={item.testId}
                >
                  <i className={`${item.icon} text-muted-foreground mr-3`}></i>
                  <span className="font-medium flex-1">{item.label}</span>
                  <i className="fas fa-chevron-right text-muted-foreground"></i>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* App Info */}
        <Card className="mb-20">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4">About</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between" data-testid="app-version">
                <span>Version</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between" data-testid="app-last-updated">
                <span>Last Updated</span>
                <span>Dec 15, 2024</span>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium h-auto p-2"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
