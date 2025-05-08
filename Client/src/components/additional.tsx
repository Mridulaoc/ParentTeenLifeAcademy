import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";

const additionalInfoSchema = z.object({
  whatYouWillLearn: z
    .string()
    .min(10, "What you will learn must be at least 10 characters"),

  targetAudience: z
    .string()
    .min(10, "Target audience must be at least 10 characters"),

  duration: z
    .object({
      hours: z
        .number()
        .min(0, "Hours cannot be negative")
        .max(999, "Hours cannot exceed 999"),
      minutes: z
        .number()
        .min(0, "Minutes cannot be negative")
        .max(59, "Minutes cannot exceed 59"),
    })
    .refine(
      (data) => {
        return data.hours * 60 + data.minutes > 0;
      },
      {
        message: "Total duration must be at least 1 minute",
        path: ["minutes"],
      }
    ),
});

type AdditionalInfoData = z.infer<typeof additionalInfoSchema>;

interface CourseAdditionalProps {
  initialData?: AdditionalInfoData | null;
  onChange?: (data: AdditionalInfoData) => void;
}

const CourseAdditionalInfo: React.FC<CourseAdditionalProps> = ({
  initialData,
  onChange,
}) => {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm<AdditionalInfoData>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: initialData || {
      whatYouWillLearn: "",
      targetAudience: "",
      duration: {
        hours: 0,
        minutes: 0,
      },
    },
  });

  const formValues = watch();
  useEffect(() => {
    if (onChange) {
      const timer = setTimeout(() => {
        const isValid = Object.keys(errors).length === 0;
        if (isValid) {
          onChange(formValues);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formValues, errors, onChange]);

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h5" gutterBottom>
        Additional Course Information
      </Typography>

      {/* What You'll Learn Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography gutterBottom>What You'll Learn</Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            InputProps={{
              placeholder: "Enter what students will learn in this course...",
              style: { height: "auto" }, // Override the fixed height for multiline
            }}
            {...register("whatYouWillLearn")}
            error={!!errors.whatYouWillLearn}
            helperText={errors.whatYouWillLearn?.message}
          />
        </CardContent>
      </Card>

      {/* Target Audience Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography gutterBottom>Target Audience</Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            InputProps={{
              placeholder: "Describe who this course is for...",
              style: { height: "auto" }, // Override the fixed height for multiline
            }}
            {...register("targetAudience")}
            error={!!errors.targetAudience}
            helperText={errors.targetAudience?.message}
          />
        </CardContent>
      </Card>

      {/* Course Duration Section */}
      <Card>
        <CardContent>
          <Typography gutterBottom>Total Course Duration</Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hours"
                type="number"
                InputProps={{
                  inputProps: { min: 0, max: 999 },
                }}
                {...register("duration.hours", { valueAsNumber: true })}
                error={!!errors.duration?.hours}
                helperText={errors.duration?.hours?.message}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Minutes"
                type="number"
                InputProps={{
                  inputProps: { min: 0, max: 59 },
                }}
                {...register("duration.minutes", { valueAsNumber: true })}
                error={!!errors.duration?.minutes}
                helperText={errors.duration?.minutes?.message}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CourseAdditionalInfo;
