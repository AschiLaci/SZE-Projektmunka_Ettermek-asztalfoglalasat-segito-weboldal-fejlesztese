import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    contactNumber: "",
  });
  const { registerUser } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newUser = await registerUser({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        contactNumber: formData.contactNumber,
      });

      toast({
        title: "Registration Successful!",
        description: "Your account has been created. Logging you in...",
      });

      setTimeout(() => {
        onRegister(newUser);
        navigate('/');
      }, 1500);

    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create an Account</h1>
          <p className="mt-2 text-muted-foreground">Join our platform today!</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" type="text" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" value={formData.username} onChange={handleChange} placeholder="johndoe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input id="contactNumber" type="tel" value={formData.contactNumber} onChange={handleChange} placeholder="+1234567890" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value="password" disabled />
            <p className="text-xs text-muted-foreground">The password is set to 'password' by default.</p>
          </div>
          <Button type="submit" className="w-full !mt-6">
            Create Account
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;