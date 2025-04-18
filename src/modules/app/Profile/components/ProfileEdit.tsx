import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseError } from "firebase/app";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { Camera, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { auth } from "@/firebase/firebaseConfig";
import { useAuthStore } from "@/store/authStore";
import { useUploadStore } from "@/store/uploadStore";
import { useUserStore } from "@/store/userStore";
import { UserData } from "@/types/user.types";

const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
});

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Confirm password don't match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function ProfileEdit({ user }: { user: UserData }) {
  const { updateUser } = useUserStore();
  const { uploadImage, deleteImage } = useUploadStore();
  const { setUser } = useAuthStore();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [originalUsername] = useState<string>(user.username || "");
  const [originalAvatarUrl] = useState<string>(user.avatar || "");
  const [avatarUrl, setAvatarUrl] = useState<string>(originalAvatarUrl);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: originalUsername,
    },
  });

  const [hasProfileChanges, setHasProfileChanges] = useState(false);

  const currentUsername = profileForm.watch("username");

  useEffect(() => {
    const usernameChanged = currentUsername !== originalUsername;
    const avatarChanged = avatarUrl !== originalAvatarUrl;
    setHasProfileChanges(usernameChanged || avatarChanged);
  }, [currentUsername, avatarUrl, originalUsername, originalAvatarUrl]);

  console.log(originalAvatarUrl);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const hasPasswordValues = Boolean(
    passwordForm.watch("currentPassword") ||
      passwordForm.watch("newPassword") ||
      passwordForm.watch("confirmPassword")
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    setIsUploading(true);

    try {
      const uploadPath = `avatars/${user.uid}`;
      const uploadId = `avatar-${user.uid}`;

      const imageUrl = await uploadImage(file, uploadPath, uploadId);

      if (imageUrl) {
        const defaultAvatars = [
          "https://firebasestorage.googleapis.com/v0/b/fashion-store-f3b8b.firebasestorage.app/o/default-avatar.png?alt=media&token=d5cae13a-4bb2-4eb5-8bcf-7a3960faf6ba",
        ];

        if (
          user.avatar &&
          user.avatar !== imageUrl &&
          !defaultAvatars.includes(user.avatar)
        ) {
          try {
            await deleteImage(user.avatar);
          } catch (error) {
            console.error("Error deleting old avatar:", error);
          }
        }

        setAvatarUrl(imageUrl);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  async function onSubmitProfile(data: ProfileFormValues) {
    if (!hasProfileChanges) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user.uid) {
        toast.error("User ID not found");
        return;
      }

      const success = await updateUser(
        user.uid,
        {
          username: data.username,
          avatar: avatarUrl,
        },
        user.username ?? undefined
      );

      if (success) {
        setUser({
          ...user,
          username: data.username,
          avatar: avatarUrl,
          updatedAt: new Date().toISOString(),
        });

        router.push("/profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmitPassword(data: PasswordFormValues) {
    setIsChangingPassword(true);

    try {
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        data.currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);

      await updatePassword(currentUser, data.newPassword);

      toast.success("Password changed successfully!");

      passwordForm.reset();
    } catch (error) {
      console.error("Error changing password:", error);
      if (error instanceof FirebaseError) {
        if (error.code === "auth/invalid-credential") {
          toast.error("Current password is incorrect");
        } else {
          toast.error("Failed to change password. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile picture and username
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onSubmitProfile)}
              className="space-y-6"
            >
              <div className="flex flex-col items-center mb-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />

                <div className="relative group">
                  <Avatar
                    className="h-24 w-24 mb-4 cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {profileForm
                        .watch("username")
                        ?.substring(0, 2)
                        .toUpperCase() ||
                        user.username?.substring(0, 2).toUpperCase() ||
                        "U"}
                    </AvatarFallback>

                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploading ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </Avatar>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  className="mb-2"
                >
                  {isUploading ? "Uploading..." : "Change Profile Picture"}
                </Button>
              </div>

              <FormField
                control={profileForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your unique username for identification
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={user.email ?? ""}
                  disabled
                  className="bg-muted"
                />
                <FormDescription>Email cannot be changed</FormDescription>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isUploading || !hasProfileChanges}
              >
                {isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
              className="space-y-6"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword.current ? "text" : "password"}
                          placeholder="Enter current password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              current: !prev.current,
                            }))
                          }
                        >
                          {showPassword.current ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword.new ? "text" : "password"}
                          placeholder="Enter new password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              new: !prev.new,
                            }))
                          }
                        >
                          {showPassword.new ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword.confirm ? "text" : "password"}
                          placeholder="Confirm new password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              confirm: !prev.confirm,
                            }))
                          }
                        >
                          {showPassword.confirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isChangingPassword || !hasPasswordValues}
                variant="outline"
              >
                {isChangingPassword
                  ? "Changing Password..."
                  : "Change Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
