import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CardActions,
  Button,
  Rating,
} from "@mui/material";
import { ICourseCardProps } from "../Types/courseTypes";

const CourseCard: React.FC<ICourseCardProps> = ({ course }) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: 3,
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={
          course.featuredImage ||
          "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
        }
        alt={course.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {course.title}
        </Typography>
        <Rating
          value={course.reviewStats?.averageRating || 0}
          precision={0.1}
          readOnly
          size="medium"
          sx={{ color: "secondary.main" }}
        />
        <Typography variant="body1" color="text.secondary">
          ({course.reviewStats?.totalReviews || 0} )
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography gutterBottom variant="h6" component="h2" noWrap>
            ₹{course.price}
          </Typography>
          {(course.durationHours || course.durationMinutes) && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Duration: {course.durationHours || 0}hr{" "}
              {course.durationMinutes || 0}mins
            </Typography>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ padding: 2, pt: 0 }}>
        <Button variant="outlined" size="small" fullWidth sx={{ mr: 1 }}>
          Add to Cart
        </Button>
        <Button variant="contained" size="small" fullWidth color="primary">
          Buy Now
        </Button>
      </CardActions>
    </Card>
  );
};

export default CourseCard;
