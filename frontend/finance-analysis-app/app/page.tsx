import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold text-black">Welcome to the Finance Analysis App</h1>
      <Link href="/data" className="mt-4 text-blue-500 hover:underline">
        Go to Data Page
      </Link>
    </div>
  );
}
