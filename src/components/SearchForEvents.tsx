"use client";

// Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateEventForm } from "./CreateEventForm";

// Functions
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useSession } from "next-auth/react";

// Hooks
import { toast } from "@/hooks/use-toast";

// Zod
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  title: z.string().optional(),
  groupBy: z.enum(["closest", "newest", "upcoming", "mostPopular"]).optional(),
});

export interface SearchForEventsRef {
  openHostEventDialog: () => void;
}

const SearchForEvents = forwardRef<SearchForEventsRef>((_, ref) => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const router = useRouter();

  useImperativeHandle(ref, () => ({
    openHostEventDialog: () => {
      setDialogOpen(true);
    },
  }));

  const session = useSession();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      groupBy: "closest",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "Search Criteria:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  useEffect(() => {
    if (isDialogOpen && session?.status !== "authenticated") {
      router.push("/signIn");
    }
  }, [isDialogOpen, session, router]);

  return (
    <div className="flex w-full flex-col gap-y-4">
      <div className="flex flex-col items-center gap-y-4 lg:flex-row lg:justify-between lg:gap-x-8">
        <h3 className="text-2xl font-bold">Search For Events</h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4 lg:flex-row lg:gap-x-8"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Event Title"
                      {...field}
                      className="rounded-3xl py-6 lg:min-w-[450px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groupBy"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="rounded-3xl py-6 lg:w-[180px]">
                        <SelectValue placeholder="Group By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Group By</SelectLabel>
                          <SelectItem value="closest">
                            Closest Events
                          </SelectItem>
                          <SelectItem value="newest">Newest Events</SelectItem>
                          <SelectItem value="upcoming">
                            Upcoming Events
                          </SelectItem>
                          <SelectItem value="mostPopular">
                            Most Popular Events
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="rounded-3xl py-6">
              Search
            </Button>
          </form>
        </Form>
      </div>
      <hr />
      <div className="flex w-full flex-row">
        <div className="flex flex-col gap-y-4 lg:w-1/4">
          <>
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="max-w-[12rem] rounded-3xl py-6 text-lg text-white">
                  Host an Event
                </Button>
              </DialogTrigger>
              <DialogContent
                className="max-h-[90vh] max-w-[800px] overflow-hidden p-0"
                aria-describedby="create-event-dialog-description"
              >
                <DialogHeader className="ml-4 mt-4">
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <div id="create-event-dialog-description">
                  <CreateEventForm onClose={() => setDialogOpen(false)} />
                </div>
              </DialogContent>
            </Dialog>
            <hr />
          </>

          <h4 className="text-xl font-semibold">Filters</h4>
        </div>
        <div className="flex flex-col lg:w-3/4"></div>
      </div>
    </div>
  );
});

SearchForEvents.displayName = "SearchForEvents";

export default SearchForEvents;
