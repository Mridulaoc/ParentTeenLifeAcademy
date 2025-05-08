import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CardActions,
  Chip,
  Box,
} from "@mui/material";
import { IBundleCardProps } from "../Types/courseBundleTypes";

const BundleCard: React.FC<IBundleCardProps> = ({ bundle }) => {
  const courseCount = bundle?.courses?.length || 0;
  const calculateDiscount = (
    totalPrice: number,
    discountedPrice: number
  ): number => {
    if (totalPrice <= 0) return 0;
    const discountPercentage =
      ((totalPrice - discountedPrice) / totalPrice) * 100;
    return Math.round(discountPercentage);
  };
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardMedia
        component="img"
        height="75"
        image={
          bundle?.featuredImage ||
          "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
        }
        alt={bundle.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {bundle.title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Courses in bundle:
          </Typography>
          <Chip label={courseCount} color="primary" size="small" />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {bundle.discountedPrice !== bundle.totalPrice && (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                ₹{bundle.totalPrice?.toFixed(2)}
              </Typography>
              <Chip
                label={`${calculateDiscount(
                  bundle?.totalPrice || 0,
                  bundle?.discountedPrice || 0
                )}% OFF`}
                size="small"
                color="error"
                sx={{ fontSize: "0.7rem", height: 20, mt: 0.5 }}
              />
            </Box>
          )}
          <Typography variant="h6" color="primary">
            ₹{bundle.discountedPrice?.toFixed(2) || "N/A"}
          </Typography>
        </Box>
      </CardContent>
      <CardActions>
        <Button size="small" variant="contained" color="primary" fullWidth>
          View Bundle
        </Button>
      </CardActions>
    </Card>
  );
};

export default BundleCard;
