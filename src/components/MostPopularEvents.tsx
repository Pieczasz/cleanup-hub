"use client";
// Components
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Button } from "./ui/button";

// Functions
import { useRouter } from "next/navigation";

const MostPopularEvents = () => {
  const router = useRouter();

  return (
    <div className="flex w-full flex-col items-center justify-center">
      <h2 className="mb-16 text-center text-4xl font-bold">
        Most Popular <br />
        Clean-Up Events
      </h2>
      <div className="flex flex-col items-center justify-center gap-x-5 gap-y-4 lg:flex-row lg:gap-y-0">
        <Card className="mb-7 w-[300px] shadow-md lg:w-[340px]">
          <CardHeader className="flex items-center justify-center text-center">
            <h4 className="text-center text-2xl font-semibold">
              Tree Planting
            </h4>
          </CardHeader>
          <CardContent className="flex flex-col gap-y-4">
            <div className="flex flex-row items-center">
              <div className="mr-3 h-12 w-12 rounded-full border-2"></div>
              <div className="flex flex-col">
                <p className="text-base font-semibold">Organizer</p>
                <p className="text-base">Bartłomiej Piekarz</p>
              </div>
            </div>
            <div className="flex flex-row gap-x-2">
              <p>Participants</p>
              <p className="font-semibold">127/200</p>
            </div>
            <div className="flex flex-row gap-x-2">
              <p>Location</p>
              <a className="font-semibold text-blue-500">Zabrze, Poland</a>
            </div>
            <div className="flex flex-row gap-x-2">
              <p>Date</p>
              <p className="font-semibold">Nov 27 9:00</p>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-center">
            <Button
              className="max-w-[12rem] rounded-3xl py-6 text-lg text-white"
              onClick={() => {
                router.push("/events");
              }}
            >
              Join a Clean-Up
            </Button>
          </CardFooter>
        </Card>
        <Card className="mb-7 w-[300px] shadow-md lg:w-[340px]">
          <CardHeader className="flex items-center justify-center text-center">
            <h4 className="text-center text-2xl font-semibold">
              Tree Planting
            </h4>
          </CardHeader>
          <CardContent className="flex flex-col gap-y-4">
            <div className="flex flex-row items-center">
              <div className="mr-3 h-12 w-12 rounded-full border-2"></div>
              <div className="flex flex-col">
                <p className="text-base font-semibold">Organizer</p>
                <p className="text-base">Bartłomiej Piekarz</p>
              </div>
            </div>
            <div className="flex flex-row gap-x-2">
              <p>Participants</p>
              <p className="font-semibold">127/200</p>
            </div>
            <div className="flex flex-row gap-x-2">
              <p>Location</p>
              <a className="font-semibold text-blue-500">Zabrze, Poland</a>
            </div>
            <div className="flex flex-row gap-x-2">
              <p>Date</p>
              <p className="font-semibold">Nov 27 9:00</p>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-center">
            <Button
              className="max-w-[12rem] rounded-3xl py-6 text-lg text-white"
              onClick={() => {
                router.push("/events");
              }}
            >
              Join a Clean-Up
            </Button>
          </CardFooter>
        </Card>
        <Card className="mb-7 w-[300px] shadow-md lg:w-[340px]">
          <CardHeader className="flex items-center justify-center text-center">
            <h4 className="text-center text-2xl font-semibold">
              Tree Planting
            </h4>
          </CardHeader>
          <CardContent className="flex flex-col gap-y-4">
            <div className="flex flex-row items-center">
              <div className="mr-3 h-12 w-12 rounded-full border-2"></div>
              <div className="flex flex-col">
                <p className="text-base font-semibold">Organizer</p>
                <p className="text-base">Bartłomiej Piekarz</p>
              </div>
            </div>
            <div className="flex flex-row gap-x-2">
              <p>Participants</p>
              <p className="font-semibold">127/200</p>
            </div>
            <div className="flex flex-row gap-x-2">
              <p>Location</p>
              <a className="font-semibold text-blue-500">Zabrze, Poland</a>
            </div>
            <div className="flex flex-row gap-x-2">
              <p>Date</p>
              <p className="font-semibold">Nov 27 9:00</p>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-center">
            <Button
              className="max-w-[12rem] rounded-3xl py-6 text-lg text-white"
              onClick={() => {
                router.push("/events");
              }}
            >
              Join a Clean-Up
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default MostPopularEvents;
