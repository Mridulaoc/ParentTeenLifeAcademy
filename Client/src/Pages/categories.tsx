import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  Paper,
  Button,
} from "@mui/material";
import moment from "moment";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../Types/storeTypes";
import { deleteCategory, fetchCategories } from "../Features/categorySlice";
import { Link, useNavigate } from "react-router-dom";

const CategoryManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.category);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  const handleEditCategory = (id: string) => {
    navigate(`/admin/dashboard/categories/edit/${id}`);
  };

  const handleDeleteCategory = (id: string, isDeleted: boolean) => {
    dispatch(deleteCategory({ id: id, isDeleted: isDeleted }));
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Box p={3} sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" gutterBottom>
          Category Management
        </Typography>
        <Link to="/admin/dashboard/categories/add">
          <Button variant="outlined">Add Category</Button>
        </Link>
      </Box>
      {categories.length > 0 ? (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Registration Date</TableCell>
                <TableCell colSpan={2} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category._id} hover>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    {moment(category.createdAt).format("LL")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleEditCategory(category._id.toString())
                      }
                    >
                      EDIT
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleDeleteCategory(
                          category._id.toString(),
                          category.isDeleted || false
                        )
                      }
                    >
                      {category.isDeleted ? "UNDO" : "DELETE"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="h6" sx={{ textAlign: "center", margin: "5rem" }}>
          No Categories Found
        </Typography>
      )}
    </Paper>
  );
};

export default CategoryManagement;
