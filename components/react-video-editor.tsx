"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { Player, PlayerRef } from "@remotion/player";
import { Sequence, Video, interpolate, useCurrentFrame } from "remotion";
import { Plus, Text } from "lucide-react";

import { Clip, TextOverlay } from "@/types/types";

const TimelineMarker: React.FC<{
  currentFrame: number;
  totalDuration: number;
}> = React.memo(({ currentFrame, totalDuration }) => {
  const markerPosition = useMemo(() => {
    return `${(currentFrame / totalDuration) * 100}%`;
  }, [currentFrame, totalDuration]);

  return (
    <div
      className="absolute top-0 w-[1.4px] bg-red-500 pointer-events-none z-50"
      style={{
        left: markerPosition,
        transform: "translateX(-50%)",
        height: "100px",
        top: "0px",
      }}
    >
      <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-red-500 absolute top-[0px] left-1/2 transform -translate-x-1/2" />
    </div>
  );
});

TimelineMarker.displayName = "TimelineMarker";

const ReactVideoEditor: React.FC = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const playerRef = useRef<PlayerRef>(null);
  const [totalDuration, setTotalDuration] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);

  const addClip = () => {
    const lastItem = [...clips, ...textOverlays].reduce(
      (latest, item) =>
        item.start + item.duration > latest.start + latest.duration
          ? item
          : latest,
      { start: 0, duration: 0 }
    );

    const newClip: Clip = {
      id: `clip-${clips.length + 1}`,
      start: lastItem.start + lastItem.duration,
      duration: 300,
      src: "https://hgwavsootdmvmjdvfiwc.supabase.co/storage/v1/object/public/clips/reactvideoeditor-quality.mp4?t=2024-09-03T02%3A09%3A02.395Z",
      row: 0,
    };

    setClips([...clips, newClip]);
    updateTotalDuration([...clips, newClip], textOverlays);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const frame = playerRef.current.getCurrentFrame();
        if (frame !== null) {
          setCurrentFrame(frame);
        }
      }
    }, 1000 / 30);

    return () => clearInterval(interval);
  }, []);

  const addTextOverlay = () => {
    const lastItem = [...clips, ...textOverlays].reduce(
      (latest, item) =>
        item.start + item.duration > latest.start + latest.duration
          ? item
          : latest,
      { start: 0, duration: 0 }
    );

    const newOverlay: TextOverlay = {
      id: `text-${textOverlays.length + 1}`,
      start: lastItem.start + lastItem.duration,
      duration: 100,
      text: `Text ${textOverlays.length + 1}`,
      row: 0,
    };

    setTextOverlays([...textOverlays, newOverlay]);
    updateTotalDuration(clips, [...textOverlays, newOverlay]);
  };

  const updateTotalDuration = (
    updatedClips: Clip[],
    updatedTextOverlays: TextOverlay[]
  ) => {
    const lastClipEnd = updatedClips.reduce(
      (max, clip) => Math.max(max, clip.start + clip.duration),
      0
    );
    const lastTextOverlayEnd = updatedTextOverlays.reduce(
      (max, overlay) => Math.max(max, overlay.start + overlay.duration),
      0
    );

    const newTotalDuration = Math.max(lastClipEnd, lastTextOverlayEnd);
    setTotalDuration(newTotalDuration);
  };

  const Composition = useCallback(
    () => (
      <>
        {[...clips, ...textOverlays]
          .sort((a, b) => a.start - b.start)
          .map((item) => (
            <Sequence
              key={item.id}
              from={item.start}
              durationInFrames={item.duration}
            >
              {"src" in item ? (
                <Video src={item.src} />
              ) : (
                <TextOverlayComponent text={item.text} />
              )}
            </Sequence>
          ))}
      </>
    ),
    [clips, textOverlays]
  );

  const TimelineItem: React.FC<{
    item: Clip | TextOverlay;
    type: "clip" | "text";
    index: number;
  }> = ({ item, type, index }) => {
    const bgColor =
      type === "clip"
        ? "bg-indigo-500 to-indigo-400"
        : type === "text"
        ? "bg-purple-500 to-purple-400"
        : "bg-green-500 to-green-400";

    return (
      <div
        key={item.id}
        className={`absolute h-10 ${bgColor} rounded-md`}
        style={{
          left: `${(item.start / totalDuration) * 100}%`,
          width: `calc(${(item.duration / totalDuration) * 100}% - 4px)`, // Subtract 4px to create a gap
          top: `${item.row * 44}px`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold">
          {type.charAt(0).toUpperCase() + type.slice(1)} {index + 1}
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-md cursor-ew-resize mt-1 mb-1 ml-1" />
        <div className="absolute right-0 top-0 bottom-0 w-1.5 rounded-md cursor-ew-resize mt-1 mb-1 mr-1" />
      </div>
    );
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768); 
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Mobile View Not Supported</h2>
          <p className="text-md">This video editor is only available on desktop or laptop devices.</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" flex-col text-white">
      <div className=" flex overflow-hidden ">
        {/* Player section */}
        <div className="border border-gray-700 flex-grow p-6 flex items-center justify-center overflow-hidden bg-gray-800">
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="shadow-lg rounded-lg overflow-hidden bg-slate-900"
              style={{
                width: `700px`,
                height: `400px`,
              }}
            >
              <Player
                ref={playerRef}
                component={Composition}
                durationInFrames={Math.max(1, totalDuration)}
                compositionWidth={1920}
                compositionHeight={1080}
                controls
                fps={30}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                renderLoading={() => <div>Loading...</div>}
                inputProps={{}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline section */}
      <div className="h-32 bg-gray-900 w-full overflow-hidden flex flex-col border border-gray-700 rounded-b-md">
        <div className="flex justify-between items-center border-b border-gray-700 p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={addClip}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Add Clip</span>
            </button>
            <button
              onClick={addTextOverlay}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
            >
              <Text className="h-5 w-5" />
              <span className="text-sm font-medium">Add Text</span>
            </button>
          </div>
        </div>

        <div
          ref={timelineRef}
          className=" bg-gray-800 rounded-lg shadow-inner relative"
        >
          <div className="absolute inset-0">
            <div className=" top-10 left-0 right-0 bottom-0 overflow-x-auto overflow-y-visible p-2 ">
              <div
                className="gap-4"
                style={{
                  width: `100%`,
                  height: "100%",
                  position: "relative",
                }}
              >
                <div className="h-10 inset-0 flex flex-col z-0 ">
                  <div className="flex-grow flex flex-col p-[2px]">
                    <div className="flex-grow bg-gradient-to-b from-gray-700 to-gray-800 rounded-sm"></div>
                  </div>
                </div>
                {clips.map((clip, index) => (
                  <TimelineItem
                    key={clip.id}
                    item={clip}
                    type="clip"
                    index={index}
                  />
                ))}
                {textOverlays.map((overlay, index) => (
                  <TimelineItem
                    key={overlay.id}
                    item={overlay}
                    type="text"
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
          <TimelineMarker
            currentFrame={currentFrame}
            totalDuration={totalDuration}
          />
        </div>
      </div>
    </div>
  );
};

const TextOverlayComponent: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "64px",
        fontWeight: "bold",
        color: "white",
        textShadow: "0 0 5px black",
        opacity,
      }}
    >
      {text}
    </div>
  );
};

export default ReactVideoEditor;
