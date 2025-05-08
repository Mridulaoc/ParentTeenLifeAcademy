import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Box,
  Paper,
  Checkbox,
  Divider,
  Grid,
  Container,
  FormControlLabel,
  FormLabel,
  FormGroup,
} from "@mui/material";

import { AppDispatch, RootState } from "../Store/store";
import {
  createNotification,
  fetchBundles,
  fetchCourses,
  fetchUsers,
} from "../Features/notificationSlice";
import { useNavigate } from "react-router-dom";

const notificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  targetType: z.enum(["all", "specific", "bundle", "course", "liveClass"]),
  targetEntity: z.string().optional(),
  targetUsers: z.array(z.string()).optional(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

interface IEntityOption {
  _id: string;
  title: string;
}

const CreateNotification: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { users, courses, bundles, loading } = useSelector(
    (state: RootState) => state.notification
  );

  const [targetEntityOptions, setTargetEntityOptions] = useState<
    IEntityOption[]
  >([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      message: "",
      targetType: "all",
      targetUsers: [],
      targetEntity: "",
    },
  });

  const targetType = watch("targetType");

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCourses());
    dispatch(fetchBundles());
  }, [dispatch]);

  useEffect(() => {
    if (targetType === "course") {
      setTargetEntityOptions(courses ? courses : []);
    } else if (targetType === "bundle") {
      setTargetEntityOptions(bundles ? bundles : []);
    } else {
      setTargetEntityOptions([]);
    }

    setValue("targetEntity", "");
    setValue("targetUsers", []);
  }, [targetType, courses, bundles, setValue]);

  const onSubmit = async (data: NotificationFormData) => {
    try {
      const notificationData = { ...data };

      if (targetType === "all") {
        notificationData.targetEntity = undefined;
      }

      if (targetType !== "specific") {
        notificationData.targetUsers = undefined;
      }

      await dispatch(createNotification(notificationData)).unwrap();
      navigate("/admin/dashboard/notifications");
      reset();
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Notification
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notification Title"
                variant="outlined"
                {...register("title")}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notification Message"
                variant="outlined"
                multiline
                rows={4}
                {...register("message")}
                error={!!errors.message}
                helperText={errors.message?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.targetType}>
                <InputLabel id="target-type-label">Target Audience</InputLabel>
                <Select
                  labelId="target-type-label"
                  label="Target Audience"
                  {...register("targetType")}
                  defaultValue="all"
                >
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="specific">Specific Users</MenuItem>
                  <MenuItem value="course">Course Enrollees</MenuItem>
                  {/* <MenuItem value="bundle">Bundle Purchasers</MenuItem> */}
                </Select>
                {errors.targetType && (
                  <FormHelperText>{errors.targetType.message}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {(targetType === "course" || targetType === "bundle") && (
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.targetEntity}>
                  <InputLabel id="target-entity-label">
                    {targetType === "course"
                      ? "Select Course"
                      : "Select Bundle"}
                  </InputLabel>
                  <Select
                    labelId="target-entity-label"
                    label={
                      targetType === "course"
                        ? "Select Course"
                        : "Select Bundle"
                    }
                    {...register("targetEntity")}
                    defaultValue=""
                  >
                    <MenuItem value="">
                      <em>
                        Select{" "}
                        {targetType === "course" ? "a course" : "a bundle"}
                      </em>
                    </MenuItem>
                    {targetEntityOptions.map((entity) => (
                      <MenuItem key={entity._id} value={entity._id}>
                        {entity.title}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.targetEntity && (
                    <FormHelperText>
                      {errors.targetEntity.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            {targetType === "specific" && (
              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  error={!!errors.targetUsers}
                  component="fieldset"
                  variant="outlined"
                >
                  <FormLabel component="legend">Select Users</FormLabel>
                  <Paper
                    variant="outlined"
                    sx={{
                      maxHeight: 300,
                      overflow: "auto",
                      p: 2,
                      mt: 1,
                      mb: 1,
                    }}
                  >
                    <FormGroup>
                      {users.map((user) => (
                        <FormControlLabel
                          key={user._id}
                          control={
                            <Checkbox
                              {...register("targetUsers")}
                              value={user._id}
                            />
                          }
                          label={`${user.firstName} ${user.lastName} (${user.email})`}
                        />
                      ))}
                    </FormGroup>
                  </Paper>
                  {errors.targetUsers && (
                    <FormHelperText>
                      {errors.targetUsers.message}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Notification"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateNotification;
