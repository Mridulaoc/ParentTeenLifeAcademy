import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Download, EmojiEvents, VerifiedUser } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../Store/store";
import { generateCertificate } from "../Features/courseSlice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface CourseCompletionProps {
  courseId: string;
  userName: string;
}

const CourseCompletion: React.FC<CourseCompletionProps> = ({
  courseId,
  userName,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentCourse,
    lessonsProgress,
    certificate,
    certificateLoading,
    certificateError,
  } = useSelector((state: RootState) => state.course);

  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const [completionStatus, setCompletionStatus] = useState({
    totalLessons: 0,
    completedLessons: 0,
    isCompleted: false,
  });

  useEffect(() => {
    if (currentCourse && lessonsProgress) {
      const totalLessons = currentCourse.lessons.length;
      const completedLessons = currentCourse.lessons.filter(
        (lesson) => lessonsProgress[lesson._id]?.isCompleted
      ).length;

      setCompletionStatus({
        totalLessons,
        completedLessons,
        isCompleted: completedLessons === totalLessons && totalLessons > 0,
      });
    }
  }, [currentCourse, lessonsProgress]);

  const handleGenerateCertificate = () => {
    if (!courseId) return;
    dispatch(generateCertificate(courseId));
  };

  const generateCertificateDate = (): string => {
    if (certificate && certificate.issueDate) {
      const date = new Date(certificate.issueDate);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    const date = new Date();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const downloadCertificate = async () => {
    if (!currentCourse) return;

    setGeneratingPdf(true);
    setLocalError(null);

    try {
      setShowCertificatePreview(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const certificateElement = document.getElementById("certificate");
      if (!certificateElement) {
        throw new Error("Certificate element not found");
      }

      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(`${currentCourse.title.replace(/\s+/g, "_")}_Certificate.pdf`);

      if (showCertificatePreview === false) {
        setTimeout(() => setShowCertificatePreview(false), 100);
      }
    } catch (err) {
      console.error("Error generating certificate PDF:", err);
      setLocalError("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (!currentCourse) {
    return <Alert severity="info">Course details not available</Alert>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          <EmojiEvents
            color="primary"
            sx={{ mr: 1, verticalAlign: "middle" }}
          />
          Course Completion Status
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            {completionStatus.completedLessons} of{" "}
            {completionStatus.totalLessons} lessons completed (
            {Math.round(
              (completionStatus.completedLessons /
                completionStatus.totalLessons) *
                100
            )}
            %)
          </Typography>
        </Box>

        {completionStatus.isCompleted ? (
          <>
            <Alert severity="success" sx={{ mb: 3 }}>
              Congratulations! You have completed all lessons in this course.
            </Alert>

            {!certificate ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<VerifiedUser />}
                onClick={handleGenerateCertificate}
                disabled={certificateLoading}
                sx={{ mb: 3, mr: 2 }}
              >
                {certificateLoading ? "Generating..." : "Generate Certificate"}
                {certificateLoading && (
                  <CircularProgress size={24} sx={{ ml: 1, color: "white" }} />
                )}
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowCertificatePreview(true)}
                  sx={{ mb: 3, mr: 2 }}
                >
                  View Certificate
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Download />}
                  onClick={downloadCertificate}
                  disabled={generatingPdf}
                  sx={{ mb: 3 }}
                >
                  {generatingPdf
                    ? "Generating PDF..."
                    : "Download PDF Certificate"}
                  {generatingPdf && (
                    <CircularProgress
                      size={24}
                      sx={{ ml: 1, color: "primary" }}
                    />
                  )}
                </Button>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  Certificate ID: {certificate._id}
                </Typography>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  Issue Date: {generateCertificateDate()}
                </Typography>
              </>
            )}

            {(certificateError || localError) && (
              <Alert severity="error">{certificateError || localError}</Alert>
            )}

            {/* Certificate Dialog Preview */}
            <Dialog
              open={showCertificatePreview}
              onClose={() => setShowCertificatePreview(false)}
              maxWidth="lg"
              fullWidth
            >
              <DialogTitle>Your Course Completion Certificate</DialogTitle>
              <DialogContent>
                <Box
                  id="certificate"
                  sx={{
                    width: "100%",
                    // height: "60vh",
                    position: "relative",
                    backgroundColor: "#fff",
                    border: "2px solid",
                    padding: "20px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        color: "secondary.main",
                        mb: 2,
                      }}
                    >
                      Parent Teen Life Academy
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                      Certificate of Completion
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 2 }}>
                      This certifies that
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{ fontWeight: "bold", fontStyle: "italic", mb: 2 }}
                    >
                      {userName}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 2 }}>
                      has successfully completed the course
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{ fontWeight: "bold", color: "#333", mb: 3 }}
                    >
                      {currentCourse.title}
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 4 }}>
                      {certificate && certificate.certificateNumber ? (
                        <>Certificate Number: {certificate.certificateNumber}</>
                      ) : (
                        <>
                          Duration: {currentCourse.durationHours} hours{" "}
                          {currentCourse.durationMinutes} minutes
                        </>
                      )}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 4 }}>
                      {generateCertificateDate()}
                    </Typography>

                    <Divider sx={{ width: "50%", mb: 2 }} />

                    <Typography variant="body1">
                      Course Instructor Signature
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowCertificatePreview(false)}>
                  Close
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={downloadCertificate}
                  disabled={generatingPdf}
                >
                  Download PDF
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : (
          <Alert severity="info">
            Complete all lessons to unlock your course completion certificate.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default CourseCompletion;
