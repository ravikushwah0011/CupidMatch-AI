
import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function Signup() {
  const [, navigate] = useLocation();
  const { register } = useUser();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        age: parseInt(formData.age),
        profileName: formData.username,
        gender: "Not specified",
        location: "",
        lookingFor: "",
        interests: []
      });
      navigate("/profile-creation");
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input 
            type="text"
            placeholder="Full Name"
            required
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
        </div>
        <div>
          <Input 
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div>
          <Input 
            type="number"
            placeholder="Age"
            required
            min="18"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
          />
        </div>
        <div>
          <Input 
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>
        <div>
          <Input 
            type="password"
            placeholder="Confirm Password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />
        </div>
        <Button type="submit" className="w-full">Sign Up</Button>
        <p className="text-center">
          Already have an account? <a href="/login" className="text-primary">Login</a>
        </p>
      </form>
    </div>
  );
}
