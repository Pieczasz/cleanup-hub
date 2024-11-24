"use client";
import { useState } from "react";
import Image from "next/image";
import type { Session } from "next-auth";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import EditProfileForm from "./EditProfileForm";
import { Button } from "./ui/button";

interface ProfileProps {
  session: Session | null;
}

export default function Profile({ session }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const user = session?.user;

  const updateUser = api.post.updateUser.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  if (!user) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
        Please sign in to access your profile settings
      </div>
    );
  }

  if (isEditing) {
    return (
      <EditProfileForm session={session} onCancel={() => setIsEditing(false)} />
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-6">
        <div className="relative h-24 w-24 rounded-full">
          {user.image ? (
            <Image
              src={user.image}
              alt="Profile"
              className="rounded-full object-cover"
              width={96}
              height={96}
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              No image
            </div>
          )}
        </div>
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
