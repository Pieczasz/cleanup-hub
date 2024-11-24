"use client";
import { useState } from "react";
import Image from "next/image";
import type { Session } from "next-auth";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface EditProfileFormProps {
  session: Session | null;
  onCancel: () => void;
}

export default function EditProfileForm({
  session,
  onCancel,
}: EditProfileFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState(
    session?.user?.name ?? session?.user?.email ?? "",
  );
  const router = useRouter();
  const user = session?.user;
  const { toast } = useToast();

  const updateUser = api.post.updateUser.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      router.refresh();
      onCancel();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser.mutateAsync({ name });
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file || !user) return;

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { url }: { url: string } = (await response.json()) as {
        url: string;
      };
      await updateUser.mutateAsync({ image: url });
      toast({
        title: "Success",
        description: "Profile picture updated!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Error uploading file: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="relative h-24 w-24 overflow-hidden rounded-full">
          {user?.image ? (
            <Image
              src={user.image}
              alt="Profile Image"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
              No image
            </div>
          )}
        </div>
        <input
          type="file"
          onChange={uploadFile}
          accept="image/*"
          disabled={isUploading}
          className="block w-full cursor-pointer rounded-lg border border-gray-200 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white p-2 text-gray-900"
          placeholder="Enter your name"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
