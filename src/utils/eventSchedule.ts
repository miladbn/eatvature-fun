import { EVENTS } from "../data/meta";

/** Approximate weekly rotation — Eatventure schedules vary; labeled as estimate. */
const EPOCH = Date.UTC(2024, 0, 1);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type EventInfo = (typeof EVENTS)[number];

export interface EventRotation {
  current: EventInfo;
  next: EventInfo;
  weekIndex: number;
  endsAt: number;
  msLeft: number;
  farmTip: string;
}

export function getEventRotation(now = Date.now()): EventRotation {
  const weekIndex = Math.floor(Math.max(0, now - EPOCH) / WEEK_MS);
  const idx = weekIndex % EVENTS.length;
  const nextIdx = (idx + 1) % EVENTS.length;
  const weekStart = EPOCH + weekIndex * WEEK_MS;
  const endsAt = weekStart + WEEK_MS;
  const current = EVENTS[idx];
  const next = EVENTS[nextIdx];
  return {
    current,
    next,
    weekIndex,
    endsAt,
    msLeft: Math.max(0, endsAt - now),
    farmTip: current.tip,
  };
}

export function formatCountdown(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
