"use client";
import { useState } from "react";
import Image from "next/image";
import type { Session } from "next-auth";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import EditProfileForm from "./EditProfileForm";

interface ProfileProps {
  session: Session | null;
}

export default function Profile({ session }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const user = session?.user;

  const updateUser = api.post.updateUser.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file || !user) return;

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      // Upload using server action
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { url }: { url: string } = (await response.json()) as {
        url: string;
      };
      await updateUser.mutateAsync({ image: url });
      router.refresh();
    } catch (error) {
      alert("Error uploading file: " + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
        Please sign in to access your profile settings
      </div>
    );
  }

  if (isEditing) {
    return <EditProfileForm session={session} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-6">
        <div className="relative h-24 w-24">
          {user.image ? (
            <Image
              src={user.image}
              alt="Profile"
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="mb-2 text-xl font-semibold">{user.name ?? user.email}</h2>
          <p className="text-gray-600">{user.email}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
