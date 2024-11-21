import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { events } from "@/server/db/schema";

export const postRouter = createTRPCRouter({
  getUserByEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userEmail = ctx.session.user.email;
      if (!userEmail) {
        throw new Error("User email is not available");
      }

      const user = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, userEmail),
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Insert the event and fetch the created record
      const [event] = await ctx.db
        .insert(events)
        .values({
          userId: user.id,
          title: input.title,
          date: input.date,
          description: input.description,
          location: JSON.stringify({
            address: input.location.address,
            name: input.location.name ?? "",
            coordinates: input.location.coordinates,
          }),
          type: input.type,
        })
        .returning({ id: events.id }); // Use `.returning()` to get the `id`

      if (!event) {
        throw new Error("Failed to create the event");
      }

      return event; // Return the event object
    }),
});
