import { Box, Typography, Container } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: "secondary.main",
        color: "#fff",
        py: 2,
        mt: "auto",
      }}
      component="footer"
    >
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          © {new Date().getFullYear()} ParentTeenLifeAcademy. All rights
          reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
