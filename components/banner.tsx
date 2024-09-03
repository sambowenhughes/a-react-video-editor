import { Sparkles } from "lucide-react";

export default function Banner() {
  return (
    <div
      id="sticky-banner"
      className="fixed top-0 start-0 z-50 flex justify-between w-full p-4 border-b-[0.1px] border-gray-700 bg-gray-800"
    >
      <div className="flex items-center mx-auto">
        <p className="flex items-center text-sm font-normal text-white ">
          <span className="inline-flex me-3 bg-blue-500 rounded-full w-8 h-8 items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-white" />
            <span className="sr-only">Sparkles icon</span>
          </span>
          <span className="font-medium">
            Upgrade to the Pro version of{" "}
            <a
              target="_blank"
              href="https://www.reactvideoeditor.com/"
              className="inline font-bold text-blue-500 underline underline-offset-2 decoration-blue-500 decoration-solid hover:no-underline"
            >
              React Video Editor
            </a>{" "}
            for advanced features and support!
          </span>
        </p>
      </div>
    </div>
  );
}
