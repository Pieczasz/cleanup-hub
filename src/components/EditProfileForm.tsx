"use client";

// Components
import Image from "next/image";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

// Functions
import { useState } from "react";
import type { Session } from "next-auth";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

// Hooks
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
        description:
          "Profile updated successfully! To see changes, sign out and sign in again.",
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
        description:
          "Profile picture updated! To see changes, sign out and sign in again.",
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
        <div className="relative h-24 w-24 rounded-full">
          {user?.image ? (
            <Image
              src={user.image}
              alt="Profile Image"
              className="rounded-full object-cover"
              width={96}
              height={96}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
              No image
            </div>
          )}
        </div>
        <Input
          type="file"
          onChange={uploadFile}
          accept="image/*"
          disabled={isUploading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Name
        </Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg"
          placeholder="Enter your name"
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="rounded-lg px-4 py-2">
          Save Changes
        </Button>
        <Button
          type="button"
          variant={`outline`}
          onClick={onCancel}
          className="rounded-lg px-4 py-2"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
