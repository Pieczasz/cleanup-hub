import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  events,
  type DBEvent,
  type Event,
  users,
  eventAttendance,
} from "@/server/db/schema";
import { sql, eq, desc } from "drizzle-orm";

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

  updateUserProfile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
        image: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, image } = input;
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          name,
          image,
        })
        .where(sql`id = ${id}`)
        .returning();

      if (!updatedUser) {
        throw new Error("Failed to update the user profile");
      }

      return updatedUser;
    }),

  updateUser: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          name: input.name,
          image: input.image,
        })
        .where(sql`id = ${userId}`)
        .returning();

      if (!updatedUser) {
        throw new Error("Failed to update user");
      }

      return updatedUser;
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
            name: string;
            address: string;
            coordinates: { lat: number; lng: number };
          },
          maxParticipants: dbEvent.maxParticipants ?? 10,
          participantsCount: (dbEvent.participantIds as string[]).length,
          participantIds: dbEvent.participantIds as string[],
        };
      })
      .sort((a, b) => a.participantsCount - b.participantsCount);
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
          name: string;
          address: string;
          coordinates: { lat: number; lng: number };
        },
        maxParticipants: dbEvent.maxParticipants ?? 10,
        participantsCount: (dbEvent.participantIds as string[]).length,
        participantIds: dbEvent.participantIds as string[],
      };

      return event;
    }),
  getClosestEvents: publicProcedure
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const eventsData = await ctx.db.select().from(events);
      const calculateDistance = (
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number,
      ) => {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371; // Radius of the Earth in km
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };
      const sortedEvents = eventsData
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
              name: string;
              address: string;
              coordinates: { lat: number; lng: number };
            },
            maxParticipants: dbEvent.maxParticipants ?? 10,
            participantsCount: (dbEvent.participantIds as string[]).length,
            participantIds: dbEvent.participantIds as string[],
            distance: calculateDistance(
              input.lat,
              input.lng,
              (
                dbEvent.location as {
                  coordinates: { lat: number; lng: number };
                }
              ).coordinates.lat,
              (
                dbEvent.location as {
                  coordinates: { lat: number; lng: number };
                }
              ).coordinates.lng,
            ),
          };
        })
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
      return sortedEvents.slice(input.offset, input.offset + input.limit);
    }),
  getNewestEvents: publicProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
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
              name: string;
              address: string;
              coordinates: { lat: number; lng: number };
            },
            maxParticipants: dbEvent.maxParticipants ?? 10,
            participantsCount: (dbEvent.participantIds as string[]).length,
            participantIds: dbEvent.participantIds as string[],
          };
        })
        .sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        })
        .slice(input.offset, input.offset + input.limit);
    }),
  getUpcomingEvents: publicProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
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
              name: string;
              address: string;
              coordinates: { lat: number; lng: number };
            },
            maxParticipants: dbEvent.maxParticipants ?? 10,
            participantsCount: (dbEvent.participantIds as string[]).length,
            participantIds: dbEvent.participantIds as string[],
          };
        })
        .sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        })
        .slice(input.offset, input.offset + input.limit);
    }),
  getMostPopularEvents: publicProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
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
              name: string;
              address: string;
              coordinates: { lat: number; lng: number };
            },
            maxParticipants: dbEvent.maxParticipants ?? 10,
            participantsCount: (dbEvent.participantIds as string[]).length,
            participantIds: dbEvent.participantIds as string[],
          };
        })
        .sort((a, b) => b.participantsCount - a.participantsCount)
        .slice(input.offset, input.offset + input.limit);
    }),
  searchEvents: publicProcedure
    .input(
      z.object({
        searchTerm: z.string().min(3),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const eventsData = await ctx.db
        .select()
        .from(events)
        .where(
          sql`LOWER(${events.title}) LIKE LOWER(${"%" + input.searchTerm + "%"})`,
        );

      return eventsData
        .map(
          (dbEvent: DBEvent): Event => ({
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
              name: string;
              address: string;
              coordinates: { lat: number; lng: number };
            },
            maxParticipants: dbEvent.maxParticipants ?? 10,
            participantsCount: (dbEvent.participantIds as string[]).length,
            participantIds: dbEvent.participantIds as string[],
          }),
        )
        .slice(input.offset, input.offset + input.limit);
    }),

  joinEvent: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const event = await ctx.db.query.events.findFirst({
        where: (events, { eq }) => eq(events.id, input.eventId),
      });

      if (!event) throw new Error("Event not found");

      const participantIds = event.participantIds as string[];
      if (participantIds.includes(userId)) {
        throw new Error("Already joined this event");
      }

      const [updatedEvent] = await ctx.db
        .update(events)
        .set({
          participantIds: [...participantIds, userId],
        })
        .where(sql`id = ${input.eventId}`)
        .returning();

      return updatedEvent;
    }),

  leaveEvent: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const event = await ctx.db.query.events.findFirst({
        where: (events, { eq }) => eq(events.id, input.eventId),
      });

      if (!event) throw new Error("Event not found");

      const participantIds = event.participantIds as string[];
      if (!participantIds.includes(userId)) {
        throw new Error("Not joined this event");
      }

      const [updatedEvent] = await ctx.db
        .update(events)
        .set({
          participantIds: participantIds.filter((id) => id !== userId),
        })
        .where(sql`id = ${input.eventId}`)
        .returning();

      return updatedEvent;
    }),

  deleteEvent: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const event = await ctx.db.query.events.findFirst({
        where: (events, { eq }) => eq(events.id, input.eventId),
      });

      if (!event) throw new Error("Event not found");
      if (event.creatorId !== userId) {
        throw new Error("Only the event creator can delete this event");
      }

      await ctx.db.delete(events).where(sql`id = ${input.eventId}`);

      return { success: true };
    }),

  getUserEvents: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const eventsData = await ctx.db
        .select()
        .from(events)
        .where(sql`${events.creatorId} = ${input.userId}`);

      return eventsData.map(
        (dbEvent: DBEvent): Event => ({
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
            name: string;
            address: string;
            coordinates: { lat: number; lng: number };
          },
          maxParticipants: dbEvent.maxParticipants ?? 10,
          participantsCount: (dbEvent.participantIds as string[]).length,
          participantIds: dbEvent.participantIds as string[],
        }),
      );
    }),

  getUserEventHistory: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userHistory = await ctx.db
        .select({
          id: events.id,
          eventName: events.title,
          date: events.date,
          attended: eventAttendance.attended,
          rating: eventAttendance.rating,
        })
        .from(eventAttendance)
        .innerJoin(events, eq(eventAttendance.eventId, events.id))
        .where(eq(eventAttendance.userId, input.userId))
        .orderBy(desc(events.date));

      return userHistory;
    }),

  getEventParticipants: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.query.events.findFirst({
        where: eq(events.id, input.eventId),
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      const participantIds = event.participantIds as string[];

      const participants = await Promise.all(
        participantIds.map(async (id) => {
          const user = await ctx.db.query.users.findFirst({
            where: eq(users.id, id),
          });
          return {
            id: user?.id ?? id,
            name: user?.name,
            image: user?.image,
          };
        }),
      );

      return participants;
    }),

  submitAttendance: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        attendance: z.array(
          z.object({
            userId: z.string(),
            attended: z.boolean(),
            rating: z.number().min(0).max(5),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.query.events.findFirst({
        where: eq(events.id, input.eventId),
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      if (event.creatorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only event creator can submit attendance",
        });
      }

      // Delete any existing attendance records for this event
      await ctx.db
        .delete(eventAttendance)
        .where(eq(eventAttendance.eventId, input.eventId));

      // Insert new attendance records
      await ctx.db.insert(eventAttendance).values(
        input.attendance.map((record) => ({
          userId: record.userId,
          eventId: input.eventId,
          attended: record.attended,
          rating: record.rating,
        })),
      );

      return { success: true };
    }),
});
