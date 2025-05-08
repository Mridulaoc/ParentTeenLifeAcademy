import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import moment from "moment";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import { AppDispatch, RootState } from "../Store/store";
import { useDispatch } from "react-redux";
import { deleteBundle, fetchAllBundles } from "../Features/courseBundleSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const BundleManagement = () => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [bundleToDelete, setBundleToDelete] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { bundles, total } = useSelector((state: RootState) => state.bundle);
  const { admin } = useSelector((state: RootState) => state.admin);
  const page = 1;
  const limit = 5;
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllBundles({ page, limit, admin }));
  }, [dispatch, page, limit]);

  const handleDeleteClick = (bundleId: string) => {
    setBundleToDelete(bundleId);
    setOpenDeleteDialog(true);
  };

  const handleAddBundle = () => {
    navigate("/admin/dashboard/bundles/add");
  };

  const handleEditBundle = (bundleId: string) => {
    navigate(`/admin/dashboard/bundles/${bundleId}`);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!bundleToDelete) {
        throw new Error("No bundle to delete");
      }
      await dispatch(deleteBundle(bundleToDelete));
      toast.success("Bundle deleted successfully");
      setOpenDeleteDialog(false);
      setBundleToDelete(null);
    } catch (error) {
      console.error("Failed to delete bundle:", error);
      setOpenDeleteDialog(false);
      setBundleToDelete(null);
      toast.error("Failed to delete bundle");
    }
  };
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Box
        p={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h5">Course Bundle Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddBundle}
        >
          Add New Course Bundle
        </Button>
      </Box>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Total Price</TableCell>
              <TableCell>Discounted Price</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bundles.map((bundle) => (
              <TableRow key={bundle._id} hover>
                <TableCell>{bundle.title}</TableCell>
                <TableCell>₹{bundle.totalPrice}</TableCell>
                <TableCell>₹{bundle.discountedPrice}</TableCell>
                <TableCell>{moment(bundle.createdAt).format("LL")}</TableCell>
                <TableCell>
                  <Box display="flex" justifyContent="center" gap={1}>
                    <Tooltip title="Edit Course">
                      <IconButton
                        size="small"
                        onClick={() => handleEditBundle(bundle._id)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Course">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(bundle._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" p={3}>
        <Pagination
          count={Math.ceil(total / limit)}
          page={page}
          color="primary"
        />
      </Box>
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this lesson?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BundleManagement;
