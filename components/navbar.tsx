// components/Navbar.tsx

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
            <Image
                src="/scu_hor_pos_rgb_2c.png"
                alt="SCU Logo"
                width={200}
                height={200}
                className="mr-2"
            />
            </Link>
        <div className="flex items-center space-x-8 text-lg">
          <Link href="/" className="text-gray-700 hover:text-red-600">
            For You
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-red-600">
            Newsroom
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-red-600 flex items-center">
            <Star className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
