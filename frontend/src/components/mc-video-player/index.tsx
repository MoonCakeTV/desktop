import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { WindowFullscreen, WindowUnfullscreen } from "../../../wailsjs/runtime/runtime";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setError("");

    // Check if HLS is supported
    if (Hls.isSupported()) {
      // Initialize HLS.js
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });

      hlsRef.current = hls;

      // Bind video element
      hls.attachMedia(video);

      // Load source
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("Loading HLS source:", src);
        hls.loadSource(src);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest loaded successfully");
          video.play().catch((e) => console.log("Autoplay prevented:", e));
        });
      });

      // Handle errors
      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error("HLS error:", {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          url: data.url,
          response: data.response,
        });
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("Network error, attempting to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("Media error, attempting to recover...");
              hls.recoverMediaError();
              break;
            default:
              console.error("Fatal error, cannot recover");
              setError("Failed to load video");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      console.log("Using native HLS support");
      video.src = src;
    } else {
      console.error("HLS is not supported in this browser");
      setError("HLS is not supported in this browser");
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Listen for fullscreen changes (both standard and webkit)
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Check both standard and webkit fullscreen
      const isInFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );
      setIsFullscreen(isInFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      // Check if already in fullscreen
      const isInFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );

      if (!isInFullscreen) {
        // Try standard API first
        if (video.requestFullscreen) {
          await video.requestFullscreen();
        }
        // Try webkit API
        else if ((video as any).webkitRequestFullscreen) {
          await (video as any).webkitRequestFullscreen();
        }
        // Fallback to Wails window fullscreen
        else {
          WindowFullscreen();
          setIsFullscreen(true);
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else {
          WindowUnfullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
      // Fallback to window fullscreen on error
      if (!isFullscreen) {
        WindowFullscreen();
        setIsFullscreen(true);
      } else {
        WindowUnfullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {error ? (
        <div className="w-full h-full rounded-lg bg-black flex flex-col items-center justify-center text-red-500 gap-4">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            controls
            poster={poster}
            className="w-full h-full rounded-lg bg-black"
            playsInline
          >
            Your browser does not support the video tag.
          </video>

          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 z-50 opacity-70 hover:opacity-100 transition-opacity"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
        </>
      )}
    </div>
  );
}
