import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { events, type DBEvent, type Event } from "@/server/db/schema";

export const postRouter = createTRPCRouter({
  getUserByEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
      });
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    }),

  getUserById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, input.id),
      });
      return user;
    }),

  createEvent: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        date: z.date(),
        location: z.object({
          address: z.string(),
          name: z.string().optional(),
          coordinates: z.object({ lat: z.number(), lng: z.number() }),
        }),
        type: z.enum(["cleaning", "treePlanting", "volunteering", "other"]),
        maxParticipants: z
          .number()
          .min(1, "Minimum 1 participant")
          .max(10000, "Maximum 10,000 participants"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (!userId) {
        throw new Error("User ID is not available");
      }

      const [event] = await ctx.db
        .insert(events)
        .values({
          creatorId: userId,
          title: input.title,
          date: input.date,
          description: input.description,
          location: input.location,
          type: input.type,
          maxParticipants: input.maxParticipants,
          participantIds: [userId], // Add the creator as the first participant
        })
        .returning();

      if (!event) {
        throw new Error("Failed to create the event");
      }

      return event;
    }),

  getEventsFromMostPopular: publicProcedure.query(async ({ ctx }) => {
    const eventsData = await ctx.db.select().from(events);

    return eventsData
      .map((dbEvent: DBEvent): Event => {
        return {
          id: dbEvent.id,
          name: dbEvent.title,
          creatorId: dbEvent.creatorId,
          type: dbEvent.type,
          description: dbEvent.description,
          date: dbEvent.date
            ? dbEvent.date.toISOString().split("T")[0] +
              " " +
              dbEvent.date
                .toISOString()
                .split("T")[1]
                ?.split(":")
                .slice(0, 2)
                .join(":")
            : "",
          location: dbEvent.location as {
            address: string;
            coordinates: { lat: number; lng: number };
          },
          maxParticipants: dbEvent.maxParticipants ?? 10,
          participantsCount: (dbEvent.participantIds as string[]).length,
          participantIds: dbEvent.participantIds as string[],
        };
      })
      .sort((a, b) => b.participantsCount - a.participantsCount);
  }),

  getEventById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const dbEvent = await ctx.db.query.events.findFirst({
        where: (events, { eq }) => eq(events.id, input.id),
      });

      if (!dbEvent) {
        throw new Error("Event not found");
      }

      const event: Event = {
        description: dbEvent.description,
        id: dbEvent.id,
        name: dbEvent.title,
        creatorId: dbEvent.creatorId,
        type: dbEvent.type,
        date: dbEvent.date
          ? dbEvent.date.toISOString().split("T")[0] +
            " " +
            dbEvent.date
              .toISOString()
              .split("T")[1]
              ?.split(":")
              .slice(0, 2)
              .join(":")
          : "",
        location: dbEvent.location as {
          address: string;
          coordinates: { lat: number; lng: number };
        },
        maxParticipants: dbEvent.maxParticipants ?? 10,
        participantsCount: (dbEvent.participantIds as string[]).length,
        participantIds: dbEvent.participantIds as string[],
      };

      return event;
    }),
});
