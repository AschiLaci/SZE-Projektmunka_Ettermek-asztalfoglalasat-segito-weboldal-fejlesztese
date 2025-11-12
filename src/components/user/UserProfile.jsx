import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import UserActivityLog from "./UserActivityLog";
import { useAdmin } from "@/context/AdminContext";

const UserProfile = ({ onLogout }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile, logs, updateProfile: contextUpdateProfile, loading } = useUser();
  const { user } = useAdmin();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    contactNumber: '',
    address: '',
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        email: profile.email || '',
        contactNumber: profile.contactNumber || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    if (user) {
      contextUpdateProfile(formData);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully saved.",
      });
    }
  };
  
  const handlePasswordChange = () => {
    if (!currentPassword) {
        toast({
            title: "Current Password Required",
            description: "Please enter your current password.",
            variant: "destructive",
        });
        return;
    }

    if (user?.password !== currentPassword) {
      toast({
          title: "Incorrect Password",
          description: "The current password you entered is incorrect.",
          variant: "destructive",
      });
      return;
    }

    if (newPassword && newPassword === confirmPassword) {
      contextUpdateProfile({ password: newPassword });
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast({
        title: "Password Mismatch",
        description: "Please ensure the new password fields match and are not empty.",
        variant: "destructive",
      });
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl"
      >
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
                <Button onClick={() => navigate('/')} variant="ghost" className="mb-2">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Profile</h1>
                <p className="text-muted-foreground">Manage your personal information and account settings.</p>
            </div>
            <Button onClick={onLogout} variant="outline">
              Logout
            </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={formData.name} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={formData.username} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input id="contactNumber" type="tel" value={formData.contactNumber} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={formData.address} onChange={handleInputChange} />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password here. Make sure it's a strong one.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handlePasswordChange}>Update Password</Button>
              </CardFooter>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <UserActivityLog logs={logs} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;