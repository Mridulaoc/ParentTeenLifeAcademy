import { zodResolver } from "@hookform/resolvers/zod";
import { Button, CircularProgress, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { AppDispatch, RootState } from "../Store/store";
import {
  addCategory,
  resetAddCategorySuccess,
} from "../Features/categorySlice";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const categoriesSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters" })
    .max(50, { message: "Category name must be less than 20 characters" }),
  description: z
    .string()
    .min(10, {
      message: "Category description must be at least 10 characters",
    })
    .max(100, {
      message: "Category description must be less than 100 characters",
    }),
});

export type CategoryFormData = z.infer<typeof categoriesSchema>;
const AddCategory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, addCategorySuccess } = useSelector(
    (state: RootState) => state.category
  );
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoriesSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (addCategorySuccess) {
      reset();
    }
    const timer = setTimeout(() => {
      dispatch(resetAddCategorySuccess());
    }, 3000);
    return () => clearTimeout(timer);
  }, [addCategorySuccess, dispatch, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const submissionData: CategoryFormData = {
        name: data.name,
        description: data.description,
      };
      const result = await dispatch(addCategory(submissionData));
      if (addCategory.fulfilled.match(result)) {
        const successMessage =
          result.payload?.message || "Category added successfully";
        toast.success(successMessage);
        navigate("/admin/dashboard/categories");
      } else if (addCategory.rejected.match(result)) {
        const errorMessage =
          result.payload?.message || "Adding category failed";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("An error occurred while adding category.");
    }
  };
  return (
    <div className="container  p-6 w-full">
      <Typography
        variant="h6"
        className="text-center my-6 font-bold text-gray-800"
      >
        Add Category
      </Typography>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 flex flex-col justify-center items-center mx-auto"
      >
        <div className="space-y-4">
          <TextField
            sx={{ width: "80%" }}
            label="Category Name"
            variant="outlined"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            sx={{ width: "80%" }}
            label="Description"
            variant="outlined"
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ width: "80%" }}
            disabled={loading}
            className="mt-4"
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Add Category"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddCategory;
