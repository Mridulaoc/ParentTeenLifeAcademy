import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  LinearProgress,
} from "@mui/material";

import { CheckCircle, PlayCircleOutline } from "@mui/icons-material";
import { calculateLessonProgress } from "../Utils/lessonUtils";

interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  isCompleted: boolean;
  isLocked?: boolean;
}

interface LessonSidebarProps {
  lessons: Lesson[];
  currentLessonIndex: number;
  onLessonSelect: (index: number) => void;
}

const LessonSidebar: React.FC<LessonSidebarProps> = ({
  lessons,
  currentLessonIndex,
  onLessonSelect,
}) => {
  const { completedLessons, total, progress } =
    calculateLessonProgress(lessons);

  return (
    <Box sx={{ height: "100%" }}>
      <Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
        <Typography variant="h6">Course Content</Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography variant="body2">
            {completedLessons}/{total} lessons completed
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {progress.toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            mt: 1,
            height: 8,
            borderRadius: 4,
            bgcolor: "rgba(255,255,255,0.3)",
            "& .MuiLinearProgress-bar": {
              bgcolor: "success.main",
              borderRadius: 4,
            },
          }}
        />
      </Box>
      <Divider />
      <List sx={{ p: 0 }}>
        {lessons.map((lesson, index) => (
          <React.Fragment key={lesson._id}>
            <ListItem disablePadding>
              <ListItemButton
                selected={index === currentLessonIndex}
                onClick={() => onLessonSelect(index)}
                sx={{
                  py: 1.5,
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                    borderLeft: 3,
                    borderColor: "primary.main",
                  },
                }}
              >
                <ListItemIcon>
                  {lesson.isCompleted ? (
                    <CheckCircle color="success" />
                  ) : (
                    <PlayCircleOutline color="primary" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight:
                          index === currentLessonIndex ? "bold" : "normal",
                      }}
                    >
                      {lesson.title}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default LessonSidebar;
