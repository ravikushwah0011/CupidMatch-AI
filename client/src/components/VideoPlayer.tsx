import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  url: string;
  isPlaying?: boolean;
  muted?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  className?: string;
}

export default function VideoPlayer({
  url,
  isPlaying = false,
  muted = true,
  autoPlay = false,
  loop = true,
  className = ""
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.play().catch(error => {
        console.error("Error playing video:", error);
      });
    } else {
      videoElement.pause();
    }
  }, [isPlaying]);

  return (
    <video
      ref={videoRef}
      src={url}
      muted={muted}
      autoPlay={autoPlay}
      loop={loop}
      playsInline
      className={className}
    />
  );
}
