import Image from "next/image";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="p-4">
        <h1 className="text-2xl font-bold">Welcome to Newsroom</h1>
      </main>

    </>
  );
}
