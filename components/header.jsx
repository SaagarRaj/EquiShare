import {
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
} from "@clerk/nextjs";
import React from "react";

const Header = () => {
  return (
    <>
      <div>
        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>{" "}
      </div>
    </>
  );
};

export default Header;
