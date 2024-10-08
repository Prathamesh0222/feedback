"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User } from "next-auth";
import { Button } from "./ui/button";

export default function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user as User;
  return (
    <nav>
      <div>
        <a href="#">True Feedback</a>
        {session ? (
          <>
            <span>Welcome, {user.username || user.email}</span>
            <Button onClick={() => signOut()}>Logout</Button>
          </>
        ) : (
          <Link href={"/sign-in"}>
            <Button>Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
