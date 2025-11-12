import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { users } = useAdmin();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!users || users.length === 0) {
      toast({
        title: "Login Error",
        description: "User data is not available. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (user && user.password === password) {
       if (user.status !== 'active') {
        toast({
          title: "Login Failed",
          description: "Your account is currently suspended.",
          variant: "destructive",
        });
        return;
      }
      onLogin(user);
    } else {
        toast({
            title: "Login Failed",
            description: "Invalid username or password.",
            variant: "destructive",
        });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md rounded-2xl border bg-card p-8 shadow-2xl shadow-black/10"
      >
        <Link to="/" className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground">
          <Button variant="ghost" size="icon">
            <X className="h-5 w-5" />
          </Button>
        </Link>
        <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h1>
            <p className="mt-2 text-muted-foreground">Sign in to continue to your dashboard.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., admin, gildedspoon, alicej"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <Button type="submit" className="w-full !mt-8">
            Sign In
          </Button>
        </form>
         <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-2">Hint: The password for most demo accounts is: <span className="font-mono font-semibold text-foreground">password</span></p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;