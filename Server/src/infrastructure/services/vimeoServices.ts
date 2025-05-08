import { Vimeo } from "vimeo";

const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID!,
  process.env.VIMEO_CLIENT_SECRET!,
  process.env.VIMEO_ACCESS_TOKEN
);

const getVimeoId = (url: string): string => {
  const regExp =
    /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
  const match = url.match(regExp);
  return match && match[5] ? match[5] : "";
};
export const getVimeoDuration = async (videoUrl: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    try {
      const videoId = getVimeoId(videoUrl);

      if (!videoId) {
        throw new Error("Invalid Vimeo URL");
      }

      client.request(
        {
          method: "GET",
          path: `/videos/${videoId}`,
        },
        (error, response) => {
          if (error) {
            console.error("Error fetching Vimeo video duration:", error);
            reject(error);
          } else {
            resolve(response.duration);
          }
        }
      );
    } catch (error) {
      console.error("Error processing Vimeo request:", error);
      reject(error);
    }
  });
};
