"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const LS_KEYS = { profile: "ph.profile", project: "ph.project" };

export default function SignOutButton() {
  const router = useRouter();
  
  const handle = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem(LS_KEYS.profile);
      localStorage.removeItem(LS_KEYS.project);
    }
    router.push("/auth/sign-in");
    router.refresh();
  };
  
  return <button onClick={handle}>Sign out</button>;
}
