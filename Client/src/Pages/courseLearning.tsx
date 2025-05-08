import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Typography,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Button,
} from "@mui/material";
import { AppDispatch, RootState } from "../Store/store";
import {
  fetchCourseDetails,
  fetchLessonProgress,
  updateLessonProgress,
} from "../Features/courseSlice";
import LessonSidebar from "../components/lessonSidebar";
import VideoPlayer from "../components/videoPlayer";
import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import CourseCompletion from "../components/courseCompletion";

const CourseLearning: React.FC = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { currentCourse, loading, error, lessonsProgress } = useSelector(
    (state: RootState) => state.course
  );

  const { user } = useSelector((state: RootState) => state.user);

  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [videoCompleted, setVideoCompleted] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<boolean>(true);
  const [updatingProgress, setUpdatingProgress] = useState<boolean>(false);

  useEffect(() => {
    if (courseId) {
      setLoadingProgress(true);

      dispatch(fetchCourseDetails({ courseId }))
        .then(() => {
          return dispatch(fetchLessonProgress(courseId));
        })
        .then(() => {
          setLoadingProgress(false);
        })
        .catch((error) => {
          console.error("Error loading course data:", error);
          setLoadingProgress(false);
        });
    }
  }, [courseId, dispatch]);

  useEffect(() => {
    if (lessonsProgress) {
      const completedCount = Object.values(lessonsProgress).filter(
        (progress) => progress.isCompleted
      ).length;
    }
  }, [lessonsProgress]);

  useEffect(() => {
    if (lessonsProgress && currentCourse?.lessons[currentLessonIndex]) {
      const lessonId = currentCourse.lessons[currentLessonIndex]._id;
      if (lessonsProgress[lessonId]) {
        //
        setVideoCompleted(lessonsProgress[lessonId].isCompleted || false);
      } else {
        //
        setVideoCompleted(false);
      }
    }
  }, [currentLessonIndex, lessonsProgress, currentCourse]);

  const handleLessonSelect = (index: number) => {
    setCurrentLessonIndex(index);
    setVideoCompleted(false);
  };
  const handleVideoComplete = useCallback(() => {
    setVideoCompleted(true);
    if (updatingProgress) {
      return;
    }

    if (courseId && currentCourse?.lessons[currentLessonIndex]) {
      const lessonId = currentCourse.lessons[currentLessonIndex]._id;

      setUpdatingProgress(true);

      const progressData = {
        courseId,
        lessonId,
        isCompleted: true,
        playbackPosition: 0,
      };

      dispatch(updateLessonProgress(progressData))
        .then((result) => {
          setUpdatingProgress(false);
        })
        .catch((error) => {
          console.error("Error updating lesson progress:", error);
          setUpdatingProgress(false);
        });
    }
  }, [courseId, currentCourse, currentLessonIndex, dispatch, updatingProgress]);

  const handleNextLesson = () => {
    if (
      currentCourse &&
      currentLessonIndex < currentCourse.lessons.length - 1
    ) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setVideoCompleted(false);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setVideoCompleted(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!currentCourse) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Course not found</Alert>
      </Box>
    );
  }

  const currentLesson = currentCourse.lessons[currentLessonIndex];

  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === currentCourse.lessons.length - 1;

  const isAllLessonsCompleted = () => {
    if (!currentCourse || !lessonsProgress) return false;

    return currentCourse.lessons.every(
      (lesson) => lessonsProgress[lesson._id]?.isCompleted
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {currentCourse.title}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {loadingProgress ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={24} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading progress data...
          </Typography>
        </Box>
      ) : null}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4} lg={3}>
          <Paper elevation={3} sx={{ height: "100%" }}>
            <LessonSidebar
              lessons={currentCourse.lessons.map((lesson) => ({
                ...lesson,
                isCompleted: lessonsProgress
                  ? lessonsProgress[lesson._id]?.isCompleted || false
                  : false,
              }))}
              currentLessonIndex={currentLessonIndex}
              onLessonSelect={handleLessonSelect}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={8} lg={9}>
          <Paper elevation={3} sx={{ p: 2 }}>
            {currentLesson ? (
              <>
                <Typography variant="h5" gutterBottom>
                  {currentLesson.title}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <VideoPlayer
                    videoUrl={currentLesson.videoUrl}
                    onVideoComplete={handleVideoComplete}
                  />
                </Box>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ mt: 2, mb: 2, justifyContent: "space-between" }}
                >
                  <Button
                    variant="contained"
                    startIcon={<NavigateBefore />}
                    onClick={handlePreviousLesson}
                    disabled={isFirstLesson}
                  >
                    Previous Lesson
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<NavigateNext />}
                    onClick={handleNextLesson}
                    disabled={isLastLesson}
                  >
                    Next Lesson
                  </Button>
                </Stack>
                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Lesson Description
                </Typography>
                <Typography variant="body1">
                  {currentLesson.description}
                </Typography>

                {videoCompleted && !isLastLesson && (
                  <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNextLesson}
                      endIcon={<NavigateNext />}
                    >
                      Continue to Next Lesson
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <Typography>Select a lesson to start learning</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      {currentCourse && (
        <Box sx={{ mt: 4 }}>
          <CourseCompletion
            courseId={courseId || ""}
            userName={user?.firstName + user?.lastName || "Student"}
            isCompleted={isAllLessonsCompleted()}
          />
        </Box>
      )}
    </Box>
  );
};

export default CourseLearning;
