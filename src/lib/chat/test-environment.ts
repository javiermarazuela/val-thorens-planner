import { loadKnowledge } from "@/lib/chat/knowledge";
import { testStandings, testTeamFor } from "@/lib/social/test-teams-source";
import { teamById } from "@/lib/social/teams-content";
import { useTestPersona, type TestLeg, type TestCoach, type TestPerson } from "@/lib/test-persona";

import type { ChatEnvironment, ChatIdentity } from "./environment";
import type { ChatProfile, LegInfo } from "./types";

// Test site only (this file does not exist on the real site's branch). The
// "signed in" person is whoever was picked on /testdata, and their details come
// from the invented data instead of Supabase.

function leg(l: TestLeg, coach: TestCoach, day: string, pickup: string): LegInfo {
  return {
    how: l.mode,
    date: l.date,
    time: l.time || null,
    flight: l.flight || null,
    route: l.route || null,
    note: l.note ?? null,
    coachName: coach.vehicle ? `Coach ${coach.vehicle}` : null,
    coachWhen: coach.slot ? `${day}, ${coach.slot}` : null,
    pickup: coach.slot ? pickup : null,
    coachWhy: coach.slot ? null : coach.why || null,
    wantsCoach: l.shuttle,
  };
}

function toProfile(p: TestPerson): ChatProfile {
  return {
    name: p.name,
    email: p.email,
    room: {
      residence: p.room.residence,
      room: p.room.room,
      type: p.room.type,
      roommates: p.room.roommates,
    },
    arrival: leg(p.arrival, p.coach.arrival, "Sat 9 Jan", "Geneva airport arrivals (test data)"),
    departure: leg(p.departure, p.coach.departure, "Sat 16 Jan", "your residence (test data)"),
    team: (() => {
      const id = testTeamFor(p.email);
      return id === null ? null : { name: teamById(id).name, emoji: teamById(id).emoji };
    })(),
    standings: testStandings().map((s) => ({ name: teamById(s.team).name, points: s.points })),
  };
}

function useTestIdentity(): ChatIdentity {
  const { person } = useTestPersona();
  if (person === undefined) {
    return {
      status: "loading",
      profile: null,
      profileLoaded: false,
      signIn: null,
      accessToken: "",
      testEmail: "",
    };
  }
  if (!person) {
    // Nobody picked yet: "sign in" means going to the picker.
    return {
      status: "signed-out",
      profile: null,
      profileLoaded: true,
      signIn: () => window.location.assign("/testdata"),
      accessToken: "",
      testEmail: "",
    };
  }
  return {
    status: "signed-in",
    profile: toProfile(person),
    profileLoaded: true,
    signIn: null,
    accessToken: "",
    testEmail: person.email,
  };
}

export const testEnvironment: ChatEnvironment = {
  env: "test",
  useIdentity: useTestIdentity,
  // Test people count as members, so they also get the members-only starter rows.
  loadKnowledge: (identity) =>
    loadKnowledge({
      isMember: identity.status === "signed-in",
      includeMembersFallback: identity.status === "signed-in",
    }),
};
