import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

export const createTable = pgTableCreator((name) => `${name}`);

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  attendedEvents: many(eventAttendance),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("sessionUserIdIdx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const events = createTable(
  "event",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 10000 }).notNull(),
    location: jsonb("location").notNull(),
    date: timestamp("date", {
      mode: "date",
      withTimezone: true,
    }).default(sql`CURRENT_TIMESTAMP`),
    type: varchar("type", { length: 255 }).notNull(),
    maxParticipants: integer("max_participants"),
    participantIds: jsonb("participant_ids").default([]),
    creatorId: varchar("creator_id", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (event) => ({
    creatorIdIdx: index("event_creator_id_idx").on(event.creatorId),
    dateIdx: index("event_date_idx").on(event.date),
  }),
);

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
  }),
  attendance: many(eventAttendance),
}));

export const eventAttendance = createTable(
  "event_attendance",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    eventId: varchar("event_id", { length: 255 })
      .notNull()
      .references(() => events.id),
    attended: boolean("attended").notNull(),
    rating: integer("rating").notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (attendance) => ({
    userIdIdx: index("attendance_user_id_idx").on(attendance.userId),
    eventIdIdx: index("attendance_event_id_idx").on(attendance.eventId),
    pk: primaryKey({ columns: [attendance.userId, attendance.eventId] }), // Use compound key as the only primary key
  }),
);

export const eventAttendanceRelations = relations(
  eventAttendance,
  ({ one }) => ({
    user: one(users, {
      fields: [eventAttendance.userId],
      references: [users.id],
    }),
    event: one(events, {
      fields: [eventAttendance.eventId],
      references: [events.id],
    }),
  }),
);

export type DBEvent = typeof events.$inferSelect;

export type Event = {
  description: string;
  id: string;
  name: string;
  creatorId: string;
  type: string;
  date: string;
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  maxParticipants: number;
  participantsCount: number;
  participantIds: string[];
  distance?: number;
  attendance?: {
    attended: boolean;
    rating: number;
  }[];
};

export type UserEventHistory = {
  id: string;
  eventName: string;
  date: string;
  attended: boolean;
  rating: number;
};
