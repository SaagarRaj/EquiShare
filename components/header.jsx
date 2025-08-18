"use client";
import useStoreUser from "@/hooks/use-store-user";
import Link from "next/link";

import {
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
} from "@clerk/nextjs";
import React from "react";
import { BarLoader } from "react-spinners";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "./ui/button";
import { Ghost, LayoutDashboard } from "lucide-react";

const Header = () => {
  const { isLoading } = useStoreUser();
  const path = usePathname();
  return (
    <>
      <header className="fixed top-0 w-full border-b bg-white/95 backdrop-blur z-50 supports-[backdrop-filter]:bg-white/60">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between ">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={"/images/label-EquiShare.png"}
              alt="EquiShare Logo"
              width={200}
              height={60}
              className="h-25 w-auto object-contain"
            />
          </Link>

          {path === "/" && (
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="text-sm font-medium hover:text-blue-600 transition"
              >
                Features
              </Link>
              <Link
                href="#features"
                className="text-sm font-medium hover:text-blue-600 transition"
              >
                How it works
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Authenticated>
              <Link href="/dashboard" className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="hidden md:inline-flex items-center gap-2 hover:text-blue-600 hover:border-orange-600 transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="md:hidden hover:text-blue-600 hover:border-blue-600 transition"
                >
                  <LayoutDashboard className="h-10 w-10" />
                </Button>

                <UserButton />
              </Link>
            </Authenticated>
            <Unauthenticated>
              <SignInButton>
                <Button variant={Ghost}>Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button className="bg-blue-600 hover:bg-blue-950 border-none">
                  Sign Up
                </Button>
              </SignUpButton>
            </Unauthenticated>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
