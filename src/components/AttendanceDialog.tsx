"use client";

// Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import Image from "next/image";

// Icons
import { StarIcon } from "@heroicons/react/24/solid";

// Functions
import { useState, useEffect } from "react";

// Interfaces
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
  viewOnly?: boolean;
  attendance?: {
    userId: string;
    userName: string | null;
    userImage: string | null;
    attended: boolean;
    rating: number;
  }[];
}

export const AttendanceDialog = ({
  isOpen,
  onClose,
  participants,
  onSubmit,
  isSubmitting = false,
  viewOnly,
  attendance,
}: AttendanceDialogProps) => {
  const [attendanceState, setAttendanceState] = useState<
    Map<string, { attended: boolean; rating: number }>
  >(new Map(participants.map((p) => [p.id, { attended: false, rating: 0 }])));

  const [hoverRatings, setHoverRatings] = useState<Map<string, number>>(
    new Map(),
  );

  // Reset attendance when dialog opens with new participants
  useEffect(() => {
    if (isOpen) {
      setAttendanceState(
        new Map(
          participants.map((p) => [p.id, { attended: false, rating: 0 }]),
        ),
      );
    }
  }, [isOpen, participants]);

  const handleAttendanceChange = (userId: string, attended: boolean) => {
    setAttendanceState(
      new Map(
        attendanceState.set(userId, {
          ...attendanceState.get(userId),
          attended,
          rating: attendanceState.get(userId)?.rating ?? 0,
        }),
      ),
    );
  };

  const handleRatingChange = (userId: string, rating: number) => {
    setAttendanceState(
      new Map(
        attendanceState.set(userId, {
          attended: attendanceState.get(userId)?.attended ?? false,
          rating,
        }),
      ),
    );
  };

  const handleStarHover = (userId: string, rating: number) => {
    setHoverRatings(new Map(hoverRatings.set(userId, rating)));
  };

  const handleStarLeave = (userId: string) => {
    const newHoverRatings = new Map(hoverRatings);
    newHoverRatings.delete(userId);
    setHoverRatings(newHoverRatings);
  };

  const handleSubmit = () => {
    const attendanceData = Array.from(attendanceState.entries()).map(
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
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-[500px] overflow-hidden sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {viewOnly ? "Event Attendance" : "Submit Event Attendance"}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto px-1 sm:px-2">
          {viewOnly ? (
            <div className="space-y-3 sm:space-y-4">
              {attendance?.map((record) => (
                <div
                  key={record.userId}
                  className="flex items-center gap-2 sm:gap-4"
                >
                  <Image
                    src={record.userImage ?? "/defaultAvatar.jpg"}
                    width={32}
                    height={32}
                    alt="User Avatar"
                    className="h-8 w-8 rounded-full sm:h-10 sm:w-10"
                  />
                  <div className="flex-grow">
                    <p className="text-sm font-medium sm:text-base">
                      {record.userName ?? "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-600 sm:text-sm">
                      {record.attended ? "Attended" : "Did not attend"} •
                      Rating: {record.rating}/5
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between border-b pb-3 sm:pb-4"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Checkbox
                      checked={
                        attendanceState.get(participant.id)?.attended ?? false
                      }
                      onCheckedChange={(checked) =>
                        handleAttendanceChange(
                          participant.id,
                          checked as boolean,
                        )
                      }
                      disabled={isSubmitting}
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <Image
                      src={participant.image ?? "/defaultAvatar.jpg"}
                      width={32}
                      height={32}
                      alt={participant.name ?? "Participant"}
                      className="h-8 w-8 rounded-full sm:h-10 sm:w-10"
                    />
                    <span className="text-sm sm:text-base">
                      {participant.name ?? "Unknown Participant"}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-5 w-5 cursor-pointer transition-colors sm:h-6 sm:w-6 ${
                          (hoverRatings.get(participant.id) ??
                            attendanceState.get(participant.id)?.rating ??
                            0) >= star
                            ? "text-yellow-400"
                            : "text-gray-300"
                        } ${isSubmitting ? "opacity-50" : "hover:text-yellow-400"}`}
                        onClick={() =>
                          !isSubmitting &&
                          handleRatingChange(participant.id, star)
                        }
                        onMouseEnter={() =>
                          !isSubmitting && handleStarHover(participant.id, star)
                        }
                        onMouseLeave={() =>
                          !isSubmitting && handleStarLeave(participant.id)
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          {!viewOnly && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Submitting..." : "Submit Attendance"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
