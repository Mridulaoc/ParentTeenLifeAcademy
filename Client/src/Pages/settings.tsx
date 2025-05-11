import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { AppDispatch, RootState } from "../Store/store";
import { useSelector } from "react-redux";
import { updateUserProfile, uploadProfileImage } from "../Features/userSlice";
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { toast } from "react-toastify";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const settingsSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" })
    .max(50, { message: "First name must be less than 50 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(50, { message: "Last name must be less than 50 characters" }),
  email: z
    .string()
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format"
    )
    .min(5, "Email must be at least 5 characters long")
    .email("Invalid email address")
    .nonempty("Email is required"),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username must be less than 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  phone: z
    .string()
    .regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, { message: "Invalid phone number" })
    .optional()
    .or(z.literal("")),
  occupation: z
    .string()
    .max(100, { message: "Occupation must be less than 100 characters" })
    .optional(),
  bio: z
    .string()
    .max(500, { message: "Biography must be less than 500 characters" })
    .optional(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
const Settings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector(
    (state: RootState) => state.user
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      username: "",
      occupation: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (user) {
      setValue("firstName", user.firstName || "");
      setValue("lastName", user.lastName || "");
      setValue("email", user.email || "");
      setValue("phone", user.phone || "");
      setValue("username", user.username || "");
      setValue("occupation", user.occupation || "");
      setValue("bio", user.bio || "");
    }
  }, [user, setValue]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await dispatch(updateUserProfile({ userData: data }));
      toast.success("Profile updated successfully");
      navigate("/dashboard/profile");
    } catch (err) {
      toast.error("Failed to update profile");
      console.error("Update failed", err);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024;
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload a JPEG,PNG,or GIF.");
        return;
      }
      if (file.size > maxSize) {
        toast.error("File size is too large. Maximum size is 5MB");
        return;
      }

      try {
        await dispatch(uploadProfileImage(file));
        toast.success("Profile image uploaded successfully");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
        toast.error("Could not upload profile image");
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }
  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardContent>
          <Typography
            variant="h6"
            className="text-center mb-6 font-bold text-gray-800"
          >
            Account Settings
          </Typography>
          <div className="flex flex-col justify-center items-center mb-5">
            {user.profileImg ? (
              <Avatar
                src={user.profileImg}
                alt={`${user.firstName} ${user.lastName}`}
                sx={{ width: 75, height: 75, mb: 3, mx: 3 }}
              />
            ) : (
              <User className="w-10 h-10 text-gray-500 mr-3" />
            )}
            <div className="flex justify-center mt-0">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                ref={fileInputRef}
                id="fileUpload"
              />
              <label htmlFor="fileUpload">
                <Button
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  className="px-10 py-3 mb-5"
                  onClick={triggerFileInput}
                >
                  {loading ? "Updating..." : "Update Profile Image"}
                </Button>
              </label>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                fullWidth
                label="First Name"
                variant="outlined"
                {...register("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />

              <TextField
                fullWidth
                label="Last Name"
                variant="outlined"
                {...register("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />

              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled
              />

              <TextField
                fullWidth
                label="Phone"
                variant="outlined"
                {...register("phone")}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />

              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                {...register("username")}
                error={!!errors.username}
                helperText={errors.username?.message}
              />

              <TextField
                fullWidth
                label="Occupation"
                variant="outlined"
                {...register("occupation")}
                error={!!errors.occupation}
                helperText={errors.occupation?.message}
              />
            </div>

            <TextField
              fullWidth
              label="Biography"
              variant="outlined"
              multiline
              rows={4}
              {...register("bio")}
              error={!!errors.bio}
              helperText={errors.bio?.message}
            />

            {error && (
              <Typography color="error" className="text-center mt-4">
                {error}
              </Typography>
            )}

            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                className="px-10 py-3"
              >
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
