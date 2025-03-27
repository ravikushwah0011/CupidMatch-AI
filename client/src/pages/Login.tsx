import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-red-100 bg-background py-12 px-4 sm:px-6">
      <div className="container animate-scale-in mx-auto max-w-md bg-card border glass-card p-6 rounded-lg shadow-lg text-card-foreground">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <Input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end">
            <a href="/forget-password" className="text-blue-500">
              Forgot password?
            </a>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <Button type="submit" className="w-3/4">Login</Button>
            <p>
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-500">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
