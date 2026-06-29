import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface PlayerProps {
  videos: any[];
  startOffset?: number;
  volume?: number;
  isPlaying?: boolean;
  onVideoChange?: (videoId: string) => void;
}

export default function Player({ videos, startOffset = 0, volume = 0, isPlaying = true, onVideoChange }: PlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const videosRef = useRef(videos);
  const [apiReady, setApiReady] = useState(false);

  // Keep track of the currently playing video's ID so if it gets removed from the playlist while playing, we know what to do next
  const currentlyPlayingIdRef = useRef<string | null>(null);

  // Keep ref synced with latest videos so API callbacks use the fresh playlist
  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

  // Safely load YouTube iframe player API and check for both window.YT and window.YT.Player
  useEffect(() => {
    const checkApi = () => {
      if (window.YT && window.YT.Player) {
        setApiReady(true);
        return true;
      }
      return false;
    };

    if (checkApi()) {
      return;
    }

    // Set fallback on global callback
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousReady) {
        try { previousReady(); } catch(e) {}
      }
      setApiReady(true);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const interval = setInterval(() => {
      if (checkApi()) {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Watch for changes in active channel's primary video and load it if it changes
  useEffect(() => {
    if (!playerRef.current || !videos.length) return;
    
    const firstVideoId = videos[0].id;
    if (currentlyPlayingIdRef.current !== firstVideoId) {
      currentlyPlayingIdRef.current = firstVideoId;
      if (onVideoChange) onVideoChange(firstVideoId);
      
      if (typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById({
          videoId: firstVideoId,
          startSeconds: 0
        });
      }
    }
  }, [videos]);

  useEffect(() => {
    if (!apiReady || !videosRef.current.length || !containerRef.current) return;

    if (!playerRef.current) {
      const savedTime = parseFloat(localStorage.getItem('saved_video_time') || '0');
      const savedId = localStorage.getItem('saved_video_id');
      
      let startingVideoId = videosRef.current[0].id;
      let startingTime = startOffset;

      // If we have a saved id that still exists in the playlist, start from there at the saved time
      if (savedId) {
        const found = videosRef.current.find((v: any) => v.id === savedId);
        if (found) {
          startingVideoId = savedId;
          startingTime = savedTime;
        }
      }

      currentlyPlayingIdRef.current = startingVideoId;
      if (onVideoChange) onVideoChange(startingVideoId);
      
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: startingVideoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          start: Math.floor(startingTime),
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            if (volume > 0) {
              try {
                event.target.setVolume(volume);
                event.target.unMute();
              } catch(e) {}
            } else {
              try {
                event.target.mute();
              } catch(e) {}
            }
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              playNextVideo();
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              // Update currently playing ref when a video successfully starts
              const currentUrl = event.target.getVideoUrl();
              if (currentUrl) {
                const match = currentUrl.match(/[?&]v=([^&]+)/);
                if (match && match[1]) {
                  currentlyPlayingIdRef.current = match[1];
                  if (onVideoChange) onVideoChange(match[1]);
                }
              }
            }
          }
        }
      });

      // Save state periodically to handle page refreshes or abrupt closes
      const saveInterval = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const time = playerRef.current.getCurrentTime();
          const pState = playerRef.current.getPlayerState();
          // Only save if it's currently playing or paused (not unstarted or ended)
          if (pState === window.YT.PlayerState.PLAYING || pState === window.YT.PlayerState.PAUSED) {
            localStorage.setItem('saved_video_time', time.toString());
            if (currentlyPlayingIdRef.current) {
              localStorage.setItem('saved_video_id', currentlyPlayingIdRef.current);
            }
          }
        }
      }, 1000);

      // Save it also on player unmount
      return () => {
        clearInterval(saveInterval);
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const time = playerRef.current.getCurrentTime();
            localStorage.setItem('saved_video_time', time.toString());
            if (currentlyPlayingIdRef.current) {
              localStorage.setItem('saved_video_id', currentlyPlayingIdRef.current);
            }
          } catch(e) {}
        }
      };
    }

    function playNextVideo() {
      if (!playerRef.current) return;
      
      const currentVids = videosRef.current;
      if (currentVids.length === 0) return;

      // Try to find what we were just playing in the new updated list
      const lastId = currentlyPlayingIdRef.current;
      const currentIndex = currentVids.findIndex((v: any) => v.id === lastId);
      
      let nextVideo = null;

      // If found and there is another one after it:
      if (currentIndex !== -1 && currentIndex + 1 < currentVids.length) {
        nextVideo = currentVids[currentIndex + 1];
      } 
      // If the current video was deleted from the list, we don't know exactly what the 'next' one should be!
      // But a safe bet is to just play the first video in the list again...
      // Or maybe the first video that is NOT the current one (if there's only 1 video left)
      else if (currentIndex === -1) {
        nextVideo = currentVids[0];
      }

      if (nextVideo) {
        currentlyPlayingIdRef.current = nextVideo.id;
        if (onVideoChange) onVideoChange(nextVideo.id);
        playerRef.current.loadVideoById({
          videoId: nextVideo.id,
          startSeconds: 0
        });
      }
    }
    
    // Cleanup is intentionally omitted so the iframe doesn't reload heavily on re-renders,
    // protecting the viewer from interruptions when the playlist changes in the background.

  }, [apiReady, startOffset]); // Initialize only when API is ready 

  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(volume);
      if (volume > 0) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
    }
  }, [volume]);

  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  if (!videos.length) {
    return (
      <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center p-6 text-center text-white/50 relative overflow-hidden">
        <p>لا يوجد بث متوفر حالياً</p>
      </div>
    );
  }

  // The wrapper has pointer-events-none so the top z-10 div catches clicks,
  // BUT we want the video itself to be clickable. Since z-10 overlays everything,
  // users won't be able to click the video anyway. We rely on the autoplay/mute config.
  return (
    <div className="w-full h-full relative flex items-center justify-center bg-black overflow-hidden select-none pointer-events-auto group">
      <div className="relative w-full h-full overflow-hidden bg-black pointer-events-auto">
        <div id="youtube-player-mount" ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-auto"></div>
      </div>
    </div>
  );
}
