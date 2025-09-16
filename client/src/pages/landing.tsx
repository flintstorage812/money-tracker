import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleReplitAuth = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="flex flex-col justify-center min-h-screen p-6">
      {/* App Logo and Title */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-primary rounded-3xl mx-auto mb-6 flex items-center justify-center">
          <i className="fas fa-wallet text-3xl text-primary-foreground"></i>
        </div>
        <h1 className="text-3xl font-bold mb-2">MoneyTracker</h1>
        <p className="text-muted-foreground text-lg">Take control of your finances</p>
      </div>

      {/* Login Form */}
      <div className="space-y-6">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 text-base rounded-xl border-border bg-card"
            data-testid="input-email"
          />
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 text-base rounded-xl border-border bg-card"
            data-testid="input-password"
          />
        </div>
        <Button
          className="w-full h-14 text-base font-semibold rounded-xl"
          onClick={() => {
            // For demo purposes, direct to Replit Auth
            handleReplitAuth();
          }}
          data-testid="button-signin"
        >
          Sign In
        </Button>
        
        {/* Social Login */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full h-14 text-base font-semibold rounded-xl border-border"
          onClick={handleReplitAuth}
          data-testid="button-replit-auth"
        >
          <i className="fas fa-code mr-3"></i>
          Continue with Replit
        </Button>

        <div className="text-center space-y-4 mt-8">
          <a href="#" className="text-primary font-medium block" data-testid="link-create-account">
            Create Account
          </a>
          <a href="#" className="text-muted-foreground block" data-testid="link-forgot-password">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
}
