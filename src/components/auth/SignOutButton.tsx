"use client";
import { useRouter } from "next/navigation";

const LS_KEYS = { profile: "ph.profile", project: "ph.project" };

export default function SignOutButton() {
  const router = useRouter();
  
  const handle = async () => {
    // Clear localStorage (onboarding data)
    if (typeof window !== "undefined") {
      localStorage.removeItem(LS_KEYS.profile);
      localStorage.removeItem(LS_KEYS.project);
    }
    
    // Redirect to sign-in page
    router.push("/auth/sign-in");
    router.refresh();
  };
  
  return <button onClick={handle}>Sign out</button>;
}
