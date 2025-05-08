import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { scheduleClass } from "../Features/classSlice";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Container,
  Typography,
  FormControl,
  InputLabel,
} from "@mui/material";
import { AppDispatch, RootState } from "../Store/store";

interface ClassFormData {
  title: string;
  description: string;
  dayOfWeek: string;
  startTime: string;
  duration: number;
}

const ScheduleClass: React.FC = () => {
  const { control, handleSubmit } = useForm<ClassFormData>();
  const dispatch = useDispatch<AppDispatch>();
  const { error } = useSelector((state: RootState) => state.class);

  const onSubmit = (data: ClassFormData) => {
    const classData = {
      ...data,
    };
    dispatch(scheduleClass(classData));
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Schedule a Class
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="title"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Title"
              fullWidth
              margin="normal"
              required
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={4}
              required
            />
          )}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Day of Week</InputLabel>
          <Controller
            name="dayOfWeek"
            control={control}
            defaultValue="Wednesday"
            render={({ field }) => (
              <Select {...field} label="Day of Week" required>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <MenuItem key={day} value={day}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
        <Controller
          name="startTime"
          control={control}
          defaultValue="20:00"
          render={({ field }) => (
            <TextField
              {...field}
              label="Start Time"
              type="time"
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
          )}
        />
        <Controller
          name="duration"
          control={control}
          defaultValue={60}
          render={({ field }) => (
            <TextField
              {...field}
              label="Duration (minutes)"
              type="number"
              fullWidth
              margin="normal"
              required
            />
          )}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Schedule Class
        </Button>
        {error && <Typography color="error">{error}</Typography>}
      </form>
    </Container>
  );
};

export default ScheduleClass;
