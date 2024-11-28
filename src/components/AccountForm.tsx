"use client";

// Components
import { Button } from "./ui/button";
import EditProfileForm from "./EditProfileForm";

// Functions
import { useSession } from "next-auth/react";
import { useState } from "react";
import type { Session } from "next-auth";

// Interfaces
interface ProfileProps {
  session: Session | null;
}

export default function Profile({ session: initialSession }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { data: session, update: updateSession } = useSession();
  const user = session?.user ?? initialSession?.user;

  if (!user) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
        Please sign in to access your profile settings
      </div>
    );
  }

  if (isEditing) {
    return (
      <EditProfileForm
        session={session}
        onCancel={() => setIsEditing(false)}
        onSuccess={() => {
          void updateSession();
          setIsEditing(false);
        }}
      />
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-6">
        <div className="flex-1">
          <h2 className="mb-2 text-xl font-semibold">
            {user.name ?? user.email}
          </h2>
          <p className="text-gray-600">{user.email}</p>
          <Button
            onClick={() => setIsEditing(true)}
            className="mt-4 rounded-lg px-4 py-2"
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
