"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

interface Participant {
  id: string;
  name: string | null;
  image: string | null;
}

interface AttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  onSubmit: (
    attendance: { userId: string; attended: boolean; rating: number }[],
  ) => void;
  isSubmitting?: boolean;
}

export const AttendanceDialog = ({
  isOpen,
  onClose,
  participants,
  onSubmit,
  isSubmitting = false,
}: AttendanceDialogProps) => {
  const [attendance, setAttendance] = useState<
    Map<string, { attended: boolean; rating: number }>
  >(new Map(participants.map((p) => [p.id, { attended: false, rating: 0 }])));

  // Reset attendance when dialog opens with new participants
  useEffect(() => {
    if (isOpen) {
      setAttendance(
        new Map(
          participants.map((p) => [p.id, { attended: false, rating: 0 }]),
        ),
      );
    }
  }, [isOpen, participants]);

  const handleAttendanceChange = (userId: string, attended: boolean) => {
    setAttendance(
      new Map(
        attendance.set(userId, {
          ...attendance.get(userId),
          attended,
          rating: attendance.get(userId)?.rating ?? 0,
        }),
      ),
    );
  };

  const handleRatingChange = (userId: string, rating: number) => {
    setAttendance(
      new Map(
        attendance.set(userId, {
          attended: attendance.get(userId)?.attended ?? false,
          rating,
        }),
      ),
    );
  };

  const handleSubmit = () => {
    const attendanceData = Array.from(attendance.entries()).map(
      ([userId, data]) => ({
        userId,
        attended: data.attended,
        rating: data.rating || 0,
      }),
    );
    onSubmit(attendanceData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mark Attendance & Rate Participants</DialogTitle>
          <DialogDescription>
            Mark who attended and rate their participation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={attendance.get(participant.id)?.attended ?? false}
                  onCheckedChange={(checked) =>
                    handleAttendanceChange(participant.id, checked as boolean)
                  }
                  disabled={isSubmitting}
                />
                <Image
                  src={participant.image ?? "/defaultAvatar.jpg"}
                  width={32}
                  height={32}
                  alt={participant.name ?? "Participant"}
                  className="rounded-full"
                />
                <span>{participant.name ?? "Unknown Participant"}</span>
              </div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`h-6 w-6 cursor-pointer ${
                      (attendance.get(participant.id)?.rating ?? 0) >= star
                        ? "text-yellow-400"
                        : "text-gray-300"
                    } ${isSubmitting ? "opacity-50" : "hover:text-yellow-400"}`}
                    onClick={() =>
                      !isSubmitting && handleRatingChange(participant.id, star)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit Attendance"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
