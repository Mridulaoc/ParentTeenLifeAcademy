export const calculateLessonProgress = (
  lessons: { isCompleted: boolean }[]
) => {
  const completedLessons = lessons.filter((l) => l.isCompleted).length;
  const total = lessons.length;
  const progress = total > 0 ? (completedLessons / total) * 100 : 0;

  return {
    completedLessons,
    total,
    progress: parseFloat(progress.toFixed(0)),
  };
};
