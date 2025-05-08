// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   Card,
//   IconButton,
//   TextField,
//   Typography,
//   RadioGroup,
//   Radio,
//   FormControlLabel,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Paper,
// } from "@mui/material";
// import {
//   Add as AddIcon,
//   Delete as DeleteIcon,
//   ExpandMore as ExpandMoreIcon,
// } from "@mui/icons-material";

// // Simplified types
// interface Lesson {
//   id: string;
//   title: string;
//   description: string;
//   videoType: "upload" | "url";
//   videoUrl?: string;
//   videoFile?: File;
// }

// interface Topic {
//   id: string;
//   title: string;
//   description: string;
//   lessons: Lesson[];
// }

// interface CurriculumProps {
//   initialData?: { topics: Topic[] } | null;
//   onChange?: (data: { topics: Topic[] }) => void;
// }

// const SimplifiedCurriculum: React.FC<CurriculumProps> = ({
//   initialData,
//   onChange,
// }) => {
//   // State for managing curriculum data
//   const [topics, setTopics] = useState<Topic[]>(initialData?.topics || []);
//   const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
//   const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

//   // Handle data changes and notify parent component
//   const handleDataChange = (newTopics: Topic[]) => {
//     setTopics(newTopics);
//     if (onChange) {
//       onChange({ topics: newTopics });
//     }
//   };

//   // Topic management functions
//   const addTopic = () => {
//     const newTopic: Topic = {
//       id: `topic-${Date.now()}`,
//       title: "",
//       description: "",
//       lessons: [],
//     };
//     handleDataChange([...topics, newTopic]);
//   };

//   const removeTopic = (topicIndex: number) => {
//     const newTopics = [...topics];
//     newTopics.splice(topicIndex, 1);
//     handleDataChange(newTopics);
//   };

//   const updateTopic = (topicIndex: number, field: string, value: string) => {
//     const newTopics = [...topics];
//     newTopics[topicIndex] = {
//       ...newTopics[topicIndex],
//       [field]: value,
//     };
//     handleDataChange(newTopics);
//   };

//   // Lesson management functions
//   const addLesson = (topicIndex: number) => {
//     const newLesson: Lesson = {
//       id: `lesson-${Date.now()}`,
//       title: "",
//       description: "",
//       videoType: "upload",
//     };

//     const newTopics = [...topics];
//     newTopics[topicIndex].lessons.push(newLesson);
//     handleDataChange(newTopics);
//   };

//   const removeLesson = (topicIndex: number, lessonIndex: number) => {
//     const newTopics = [...topics];
//     newTopics[topicIndex].lessons.splice(lessonIndex, 1);
//     handleDataChange(newTopics);
//   };

//   const updateLesson = <K extends keyof Lesson>(
//     topicIndex: number,
//     lessonIndex: number,
//     field: K,
//     value: Lesson[K]
//   ) => {
//     const newTopics = [...topics];
//     newTopics[topicIndex].lessons[lessonIndex] = {
//       ...newTopics[topicIndex].lessons[lessonIndex],
//       [field]: value,
//     };
//     handleDataChange(newTopics);
//   };

//   // File handling function
//   const handleFileChange = (
//     event: React.ChangeEvent<HTMLInputElement>,
//     topicIndex: number,
//     lessonIndex: number
//   ) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       updateLesson(topicIndex, lessonIndex, "videoFile", file);
//     }
//   };

//   return (
//     <Box sx={{ maxWidth: 800 }}>
//       <Typography variant="h5" gutterBottom>
//         Course Curriculum
//       </Typography>

//       {topics.map((topic, topicIndex) => (
//         <Card key={topic.id} sx={{ mb: 2 }}>
//           <Accordion
//             expanded={expandedTopic === topic.id}
//             onChange={() =>
//               setExpandedTopic(expandedTopic === topic.id ? null : topic.id)
//             }
//           >
//             <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//               <Box
//                 sx={{ display: "flex", alignItems: "center", width: "100%" }}
//               >
//                 <Typography variant="h6">
//                   Topic {topicIndex + 1}: {topic.title || "Untitled Topic"}
//                 </Typography>
//                 <IconButton
//                   size="small"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     removeTopic(topicIndex);
//                   }}
//                   sx={{ ml: "auto" }}
//                 >
//                   <DeleteIcon />
//                 </IconButton>
//               </Box>
//             </AccordionSummary>

//             <AccordionDetails>
//               <Box sx={{ p: 2 }}>
//                 <TextField
//                   fullWidth
//                   label="Topic Title"
//                   value={topic.title}
//                   onChange={(e) =>
//                     updateTopic(topicIndex, "title", e.target.value)
//                   }
//                   sx={{ mb: 2 }}
//                 />

//                 <TextField
//                   fullWidth
//                   label="Topic Description"
//                   multiline
//                   rows={2}
//                   value={topic.description}
//                   onChange={(e) =>
//                     updateTopic(topicIndex, "description", e.target.value)
//                   }
//                   sx={{ mb: 2 }}
//                 />

//                 {/* Lessons */}
//                 <Box sx={{ ml: 4 }}>
//                   {topic.lessons.map((lesson, lessonIndex) => (
//                     <Paper key={lesson.id} sx={{ p: 2, mb: 2 }}>
//                       <Accordion
//                         expanded={expandedLesson === lesson.id}
//                         onChange={() =>
//                           setExpandedLesson(
//                             expandedLesson === lesson.id ? null : lesson.id
//                           )
//                         }
//                       >
//                         <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                           <Box
//                             sx={{
//                               display: "flex",
//                               alignItems: "center",
//                               width: "100%",
//                             }}
//                           >
//                             <Typography>
//                               Lesson {lessonIndex + 1}:{" "}
//                               {lesson.title || "Untitled Lesson"}
//                             </Typography>
//                             <IconButton
//                               size="small"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 removeLesson(topicIndex, lessonIndex);
//                               }}
//                               sx={{ ml: "auto" }}
//                             >
//                               <DeleteIcon />
//                             </IconButton>
//                           </Box>
//                         </AccordionSummary>

//                         <AccordionDetails>
//                           <TextField
//                             fullWidth
//                             label="Lesson Title"
//                             value={lesson.title}
//                             onChange={(e) =>
//                               updateLesson(
//                                 topicIndex,
//                                 lessonIndex,
//                                 "title",
//                                 e.target.value
//                               )
//                             }
//                             sx={{ mb: 2 }}
//                           />

//                           <TextField
//                             fullWidth
//                             label="Lesson Description"
//                             multiline
//                             rows={2}
//                             value={lesson.description}
//                             onChange={(e) =>
//                               updateLesson(
//                                 topicIndex,
//                                 lessonIndex,
//                                 "description",
//                                 e.target.value
//                               )
//                             }
//                             sx={{ mb: 2 }}
//                           />

//                           <RadioGroup
//                             value={lesson.videoType}
//                             onChange={(e) =>
//                               updateLesson(
//                                 topicIndex,
//                                 lessonIndex,
//                                 "videoType",
//                                 e.target.value as "upload" | "url"
//                               )
//                             }
//                           >
//                             <FormControlLabel
//                               value="upload"
//                               control={<Radio />}
//                               label="Upload Video"
//                             />
//                             <FormControlLabel
//                               value="url"
//                               control={<Radio />}
//                               label="Video URL"
//                             />
//                           </RadioGroup>

//                           {lesson.videoType === "upload" ? (
//                             <input
//                               type="file"
//                               accept="video/mp4,video/quicktime"
//                               onChange={(e) =>
//                                 handleFileChange(e, topicIndex, lessonIndex)
//                               }
//                             />
//                           ) : (
//                             <TextField
//                               fullWidth
//                               label="Video URL"
//                               value={lesson.videoUrl || ""}
//                               onChange={(e) =>
//                                 updateLesson(
//                                   topicIndex,
//                                   lessonIndex,
//                                   "videoUrl",
//                                   e.target.value
//                                 )
//                               }
//                             />
//                           )}
//                         </AccordionDetails>
//                       </Accordion>
//                     </Paper>
//                   ))}

//                   <Button
//                     startIcon={<AddIcon />}
//                     onClick={() => addLesson(topicIndex)}
//                     variant="outlined"
//                     size="small"
//                     sx={{ mt: 1 }}
//                   >
//                     Add Lesson
//                   </Button>
//                 </Box>
//               </Box>
//             </AccordionDetails>
//           </Accordion>
//         </Card>
//       ))}

//       <Button
//         startIcon={<AddIcon />}
//         onClick={addTopic}
//         variant="contained"
//         sx={{ mt: 2 }}
//       >
//         Add Topic
//       </Button>
//     </Box>
//   );
// };

// export default SimplifiedCurriculum;
