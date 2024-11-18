"use client";
import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, isAfter, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";

interface DateTimePicker24hProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
}

export function DateTimePicker24h({ date, setDate }: DateTimePicker24hProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get current date at start of day for date comparison
  const today = startOfDay(new Date());

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // If selected date is today, ensure time is set to current or future time
      if (
        format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
      ) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        selectedDate.setHours(currentHour);
        selectedDate.setMinutes(currentMinute);
      }
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    if (date) {
      const newDate = new Date(date);
      if (type === "hour") {
        newDate.setHours(parseInt(value));
      } else if (type === "minute") {
        newDate.setMinutes(parseInt(value));
      }

      // Only update if the new datetime is in the future
      if (isAfter(newDate, new Date())) {
        setDate(newDate);
      }
    }
  };

  // Function to disable past dates in the calendar
  const disablePastDates = (date: Date) => {
    return !isAfter(startOfDay(date), today);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP HH:mm") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="absolute left-1/2 top-1/2 z-[99999999999999] w-auto max-w-[450px] -translate-x-1/2 -translate-y-1/2 p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={disablePastDates}
            initialFocus
          />
          <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {hours.reverse().map((hour) => {
                  const isDisabled =
                    date &&
                    format(date, "yyyy-MM-dd") ===
                      format(new Date(), "yyyy-MM-dd") &&
                    hour < new Date().getHours();

                  return (
                    <Button
                      key={hour}
                      size="icon"
                      variant={
                        date && date.getHours() === hour ? "default" : "ghost"
                      }
                      className="aspect-square shrink-0 sm:w-full"
                      onClick={() => handleTimeChange("hour", hour.toString())}
                      disabled={isDisabled}
                    >
                      {hour}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => {
                  const isDisabled =
                    date &&
                    format(date, "yyyy-MM-dd") ===
                      format(new Date(), "yyyy-MM-dd") &&
                    date.getHours() === new Date().getHours() &&
                    minute <= new Date().getMinutes();

                  return (
                    <Button
                      key={minute}
                      size="icon"
                      variant={
                        date && date.getMinutes() === minute
                          ? "default"
                          : "ghost"
                      }
                      className="aspect-square shrink-0 sm:w-full"
                      onClick={() =>
                        handleTimeChange("minute", minute.toString())
                      }
                      disabled={isDisabled}
                    >
                      {minute.toString().padStart(2, "0")}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
