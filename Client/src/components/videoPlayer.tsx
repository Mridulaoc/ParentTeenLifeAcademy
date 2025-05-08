import React, { useEffect, useRef, useState } from "react";
import { Box, Alert } from "@mui/material";
import Player from "@vimeo/player";

interface IVideoPlayerProps {
  videoUrl: string;
  onVideoComplete?: () => void;
}

const VideoPlayer: React.FC<IVideoPlayerProps> = ({
  videoUrl,
  onVideoComplete,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasEnded, setHasEnded] = useState(false);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (videoUrl.includes("vimeo.com")) {
      const videoId = getVimeoId(videoUrl);

      if (videoId && iframeRef.current) {
        const player = new Player(iframeRef.current);
        playerRef.current = player;

        player.on("loaded", () => {
          setIsLoading(false);
        });

        player.on("error", () => {
          setError("Failed to load video");
          setIsLoading(false);
        });

        player.on("ended", () => {
          setHasEnded(true);

          // Make sure this callback is executed
          if (onVideoComplete) {
            onVideoComplete();
          }
        });
      }
    } else {
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      if (playerRef.current) {
        playerRef.current.off("loaded");
        playerRef.current.off("play");
        playerRef.current.off("pause");
        playerRef.current.off("error");
        playerRef.current.off("ended");
        playerRef.current = null;
      }
      setHasEnded(false);
    };
  }, [videoUrl, onVideoComplete, hasEnded]);

  const getVimeoId = (url: string): string => {
    const patterns = [
      /vimeo\.com\/([0-9]+)/,
      /vimeo\.com\/.*\/([0-9]+)/,
      /vimeo\.com\/([0-9]+)\/([a-zA-Z0-9]+)/,
      /player\.vimeo\.com\/video\/([0-9]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return "";
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  return (
    <Box sx={{ width: "100%", paddingTop: "54%", position: "relative" }}>
      {videoUrl.includes("vimeo.com") ? (
        <iframe
          ref={iframeRef}
          src={`https://player.vimeo.com/video/${getVimeoId(videoUrl)}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: "none",
            objectFit: "contain",
          }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo Video Player"
        />
      ) : (
        <video
          src={videoUrl}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          controls
          preload="metadata"
          controlsList="nodownload"
          title="Video Player"
          onEnded={onVideoComplete}
        />
      )}
    </Box>
  );
};

export default VideoPlayer;
