import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash/debounce";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Autocomplete,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";

import {
  fetchUserSuggestions,
  fetchCourses,
  enrollUser,
  setSelectedUser,
} from "../Features/enrollmentSlice";

import { RootState, AppDispatch } from "../Store/store";
import { z } from "zod";
import { toast } from "react-toastify";
import { fetchAllUsers } from "../Features/adminSlice";

const enrollmentSchema = z.object({
  userId: z.string().min(1, "User is required"),
  courseId: z.string().min(1, "Course is required"),
  enrollmentType: z.enum(["manual"]).default("manual"),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

const ManualEnrollmentPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    courses,
    userSuggestions,
    selectedUser,
    selectedCourse,
    courseLoading,
    suggestionsLoading,
    enrollmentLoading,
  } = useSelector((state: RootState) => state.enrollment);

  const { users } = useSelector((state: RootState) => state.admin);

  const [autocompleteInputValue, setAutocompleteInputValue] = useState("");
  const [allUsersFetched, setAllUsersFetched] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      userId: "",
      courseId: "",
      enrollmentType: "manual",
    },
  });

  const page = 1;
  const limit = 10;

  const fetchUsers = useCallback(
    debounce(async (query: string) => {
      if (query) {
        dispatch(fetchUserSuggestions(query));
        setAllUsersFetched(false);
      } else {
        dispatch(fetchAllUsers({ page, limit }));
        setAllUsersFetched(true);
      }
    }, 300),
    [dispatch]
  );

  useEffect(() => {
    dispatch(fetchAllUsers({ page, limit }));
    setAllUsersFetched(true);
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  useEffect(() => {
    if (selectedUser) {
      setValue("userId", selectedUser._id);
    }
    if (selectedCourse) {
      setValue("courseId", selectedCourse._id);
    }
  }, [selectedUser, selectedCourse, setValue]);

  const handleUserInputChange = (
    _: React.SyntheticEvent,
    newInputValue: string
  ) => {
    setAutocompleteInputValue(newInputValue);
    fetchUsers(newInputValue);
  };

  const onSubmit = async (data: EnrollmentFormValues) => {
    try {
      const result = await dispatch(
        enrollUser({
          userId: data.userId,
          courseId: data.courseId,
          enrollmentType: "manual",
        })
      ).unwrap();

      toast.success(result.message || "User enrolled successfully");

      reset();
      setAutocompleteInputValue("");
      dispatch(fetchAllUsers({ page, limit }));
      setAllUsersFetched(true);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      toast.error("Failed to enroll user");
    }
  };

  const displayedUsers = autocompleteInputValue
    ? userSuggestions
    : allUsersFetched
    ? users
    : [];

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Manual Course Enrollment
      </Typography>

      <Paper sx={{ p: 4, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              name="userId"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  id="user-autocomplete"
                  options={displayedUsers}
                  getOptionLabel={(option) => {
                    if (typeof option === "string") return option;
                    return option && option.username
                      ? `${option.username}  (${option.email})`
                      : "";
                  }}
                  isOptionEqualToValue={(option, value) => {
                    const optionId =
                      typeof option === "string" ? option : option?._id;
                    const valueId =
                      typeof value === "string" ? value : value?._id;
                    return optionId === valueId;
                  }}
                  loading={suggestionsLoading}
                  inputValue={autocompleteInputValue}
                  onInputChange={handleUserInputChange}
                  onChange={(_, newValue) => {
                    dispatch(setSelectedUser(newValue));
                    field.onChange(newValue ? newValue._id : "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select User"
                      error={!!errors.userId}
                      helperText={errors.userId?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {suggestionsLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            />

            <Controller
              name="courseId"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Select Course"
                  {...field}
                  error={!!errors.courseId}
                  helperText={errors.courseId?.message}
                  disabled={courseLoading}
                  InputProps={{
                    endAdornment: courseLoading ? (
                      <CircularProgress size={20} />
                    ) : null,
                  }}
                  fullWidth
                >
                  {courses && courses.length > 0 ? (
                    courses.map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        {course.title}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No courses available</MenuItem>
                  )}
                </TextField>
              )}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={enrollmentLoading}
              sx={{ mt: 2 }}
            >
              {enrollmentLoading ? (
                <CircularProgress size={24} />
              ) : (
                "Enroll User"
              )}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ManualEnrollmentPage;
