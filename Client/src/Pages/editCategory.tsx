import { zodResolver } from "@hookform/resolvers/zod";
import { Typography, TextField, Button, CircularProgress } from "@mui/material";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";
import { AppDispatch, RootState } from "../Store/store";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCategoryById, updateCategory } from "../Features/categorySlice";
import { toast } from "react-toastify";

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

const EditCategory = () => {
  const { loading, category } = useSelector(
    (state: RootState) => state.category
  );
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoriesSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchCategoryById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (category) {
      setValue("name", category.name || "");
      setValue("description", category.description || "");
    }
  }, [category, setValue]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (id) {
        const result = await dispatch(updateCategory({ id, ...data }));
        if (updateCategory.fulfilled.match(result)) {
          const successMessage =
            result.payload?.message || "Category updated successfully";
          toast.success(successMessage);
          navigate("/admin/dashboard/categories");
        } else if (updateCategory.rejected.match(result)) {
          const errorMessage =
            result.payload?.message || "Updating category failed";
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      toast.error("An error occurred while updating category.");
    }
  };

  return (
    <div className="container  p-6 w-full">
      <Typography
        variant="h6"
        className="text-center my-6 font-bold text-gray-800"
      >
        Edit Category
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
              "Update Category"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditCategory;
