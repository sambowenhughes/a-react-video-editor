import Banner from "@/components/banner";
import ReactVideoEditor from "@/components/react-video-editor";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900">
      <Banner />
      <ReactVideoEditor />
    </main>
  );
}
