// components/Navbar.tsx

'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Star, Settings } from "lucide-react";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user is logged in.");
        return;
      }

      console.log("Authenticated user:", user);

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          console.log("User document:", userDoc.data());
          if (userDoc.data().role === "admin") {
            setIsAdmin(true); // User is an admin
          } else {
            console.log("User is not an admin.");
          }
        } else {
          console.log("User document does not exist.");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <nav className="bg-white">
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
          {isAdmin && (
            <Link href="/Post" className="text-gray-700 hover:text-red-600 text-xl">
              Post
            </Link>
          )}
          <Link href="/" className="text-gray-700 hover:text-red-600 text-xl">
            Newsroom
          </Link>
          <Link href="/ForYou" className="text-gray-700 hover:text-red-600 text-xl">
            For You
          </Link>
          <Link href="/Favorites" className="text-gray-700 hover:text-red-600 flex items-center">
            <Star className="w-6 h-6" />
          </Link>
          <Link href="/Settings" className="text-gray-700 hover:text-red-600 flex items-center">
            <Settings className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
