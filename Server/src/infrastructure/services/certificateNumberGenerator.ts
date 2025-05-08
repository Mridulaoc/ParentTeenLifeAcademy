export function generateCertificateNumber(courseId: string): string {
  const coursePrefix =
    courseId.length > 4 ? courseId.substring(0, 4) : courseId;

  const timestamp = Date.now().toString().slice(-8);

  const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * randomChars.length);
    randomStr += randomChars[randomIndex];
  }

  return `CERT-${coursePrefix}-${timestamp}-${randomStr}`;
}
