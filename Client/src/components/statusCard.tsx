// import { Box, Paper, Typography } from "@mui/material";

// export const StatCard = ({ title, value, icon }) => (
//   <Paper
//     elevation={3}
//     sx={{
//       p: 3,
//       height: "100%",
//       display: "flex",
//       flexDirection: "column",
//       justifyContent: "center",
//       borderRadius: 2,
//       textAlign: "center",
//       transition: "transform 0.3s ease-in-out",
//       "&:hover": {
//         transform: "translateY(-5px)",
//       },
//     }}
//   >
//     <Box sx={{ color: "primary.main", fontSize: 40, mb: 1 }}>{icon}</Box>
//     <Typography variant="h5" gutterBottom fontWeight="bold">
//       {value}
//     </Typography>
//     <Typography color="textSecondary" variant="subtitle1">
//       {title}
//     </Typography>
//   </Paper>
// );

import { Box, Paper, Typography, useTheme } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import InventoryIcon from "@mui/icons-material/Inventory";
import StarIcon from "@mui/icons-material/Star";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { ReactNode } from "react";

type IconType =
  | "users"
  | "students"
  | "courses"
  | "bundles"
  | "reviews"
  | "revenue";

interface StatCardProps {
  title: string;
  value: string | number;
  iconType: IconType;
  variant?: "primary" | "secondary";
}

export const StatCard = ({
  title,
  value,
  iconType,
  variant = "primary",
}: StatCardProps) => {
  const theme = useTheme();

  const iconColor =
    variant === "primary"
      ? theme.palette.primary.main
      : theme.palette.secondary.main;

  const getIcon = (): ReactNode => {
    switch (iconType) {
      case "users":
        return <PersonIcon />;
      case "students":
        return <SchoolIcon />;
      case "courses":
        return <MenuBookIcon />;
      case "bundles":
        return <InventoryIcon />;
      case "reviews":
        return <StarIcon />;
      case "revenue":
        return <MonetizationOnIcon />;
      default:
        return <PersonIcon />;
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
          width: "100%",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: `${iconColor}20`,
            color: iconColor,
          }}
        >
          {getIcon()}
        </Box>
      </Box>
      <Typography variant="h5">{value}</Typography>
    </Paper>
  );
};
