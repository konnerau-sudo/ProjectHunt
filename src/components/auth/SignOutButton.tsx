"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const LS_KEYS = { profile: "ph.profile", project: "ph.project" };

export default function SignOutButton() {
  const router = useRouter();
  
  const handle = async (): Promise<void> => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      }
      
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem(LS_KEYS.profile);
        localStorage.removeItem(LS_KEYS.project);
      }
      
      // Redirect to sign-in
      router.push("/auth/sign-in");
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
      // Force redirect even if sign out fails
      router.push("/auth/sign-in");
      router.refresh();
    }
  };
  
  return <button onClick={handle}>Sign out</button>;
}
