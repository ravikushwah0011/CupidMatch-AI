import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  profileName: string;
  age: number;
  gender: string;
  location: string;
  bio?: string;
  occupation?: string;
  education?: string;
  lookingFor: string;
  interests: string[];
  profileVideoUrl?: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData extends User {
  password: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    onError: () => {
      // User is not authenticated, setting to null
      queryClient.setQueryData(['/api/auth/me'], null);
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      return apiRequest('POST', '/api/auth/login', data);
    },
    onSuccess: async () => {
      await refetch();
      navigate('/');
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      return apiRequest('POST', '/api/auth/register', data);
    },
    onSuccess: async () => {
      await refetch();
      navigate('/');
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('GET', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      navigate('/');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      if (!user) throw new Error("Not authenticated");
      return apiRequest('PATCH', `/api/users/${user.id}`, data);
    },
    onSuccess: async () => {
      await refetch();
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const login = async (data: LoginData) => {
    await loginMutation.mutateAsync(data);
  };

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const updateProfile = async (data: Partial<User>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const isAuthenticated = !!user;

  const contextValue: UserContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
