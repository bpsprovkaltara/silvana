import { prisma, TicketStatus, VisitorCategory, TicketSource } from "@/lib/prisma";
import { 
  format, 
  parse, 
  addDays, 
  isWithinInterval, 
  subMinutes, 
  addMinutes, 
  differenceInMinutes 
} from "date-fns";
import { toZonedTime } from "date-fns-tz"; // I should have checked if this is available, if not I will just use date-fns and offset

/**
 * Standardize WITA (Asia/Makassar) date string
 */
export function getTodayStrWITA() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Makassar" });
}

export function getCurrentTimeWITA() {
  return new Date().toLocaleTimeString("id-ID", { 
    timeZone: "Asia/Makassar", 
    hour: "2-digit", 
    minute: "2-digit", 
    hour12: false 
  }).replace(/\./g, ":"); // Standardize to HH:mm
}

export async function markExpiredReservations() {
  const todayStr = getTodayStrWITA();
  const currentTimeStr = getCurrentTimeWITA();
  
  // Create current time object for comparison
  const [currentH, currentM] = currentTimeStr.split(":").map(Number);
  const nowWITA = new Date();
  // We want to find tickets where scheduledTime + 60 minutes < now
  // Since scheduledTime is just a string, we compare with the threshold time
  
  const thresholdTime = format(subMinutes(parse(currentTimeStr, "HH:mm", new Date()), 60), "HH:mm");

  const today = new Date(todayStr + "T00:00:00.000Z");
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.ticket.updateMany({
    where: {
      source: TicketSource.RESERVATION,
      scheduledDate: {
        gte: today,
        lt: tomorrow,
      },
      scheduledTime: { lt: thresholdTime }, // Expired if more than 60 mins ago
      status: {
        in: [TicketStatus.BOOKED, TicketStatus.CHECKED_IN, TicketStatus.WAITING],
      },
    },
    data: {
      status: TicketStatus.NO_SHOW,
    },
  });
}

function getTicketPriorityScore(ticket: {
  category: VisitorCategory;
  source: TicketSource;
  scheduledTime: string;
}) {
  const currentTimeStr = getCurrentTimeWITA();
  const now = parse(currentTimeStr, "HH:mm", new Date());
  
  // Normalize time string
  const normalizedTime = ticket.scheduledTime.replace(/\./g, ":");
  const ticketTime = parse(normalizedTime, "HH:mm", new Date());

  // Window: scheduledTime - 15 <= now <= scheduledTime + 60
  const windowStart = subMinutes(ticketTime, 15);
  const windowEnd = addMinutes(ticketTime, 60);
  
  const isWithinWindow = now >= windowStart && now <= windowEnd;
    
  // Prioritize Priority
  const isPriority = ticket.category === VisitorCategory.PRIORITY;
  const isReservation = ticket.source === TicketSource.RESERVATION;
  const isWalkIn = ticket.source === TicketSource.WALK_IN;
  
  if (isPriority) {
     if (isReservation && isWithinWindow) return 1;
     if (isWalkIn) return 2;
     return 5;
  }
  
  // Regular
  if (isReservation && isWithinWindow) return 3;
  if (isWalkIn) return 4;
  
  return 6; // Outside window
}

export async function getSortedQueue() {
  const todayStr = getTodayStrWITA();
  const today = new Date(todayStr + "T00:00:00.000Z");
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Mark expired
  await markExpiredReservations();

  // 2. Fetch all pending tickets
  const tickets = await prisma.ticket.findMany({
    where: {
      status: { in: [TicketStatus.CHECKED_IN, TicketStatus.WAITING, TicketStatus.BOOKED] },
      scheduledDate: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // 3. Sort using Scoring Logic
  return tickets.sort((a: any, b: any) => {
    const scoreA = getTicketPriorityScore(a);
    const scoreB = getTicketPriorityScore(b);

    if (scoreA !== scoreB) {
      return scoreA - scoreB; // Lower score = higher priority
    }

    // Tie-breaker: Scheduled Time
    if (a.scheduledTime !== b.scheduledTime) {
      return a.scheduledTime.replace(/\./g, ":").localeCompare(b.scheduledTime.replace(/\./g, ":"));
    }

    // Tie-breaker: Queue Number
    return a.queueNumber - b.queueNumber;
  });
}

export async function getNextTicket(counter: "LOKET_1" | "LOKET_2") {
  const sortedQueue = await getSortedQueue();

  if (counter === "LOKET_1") {
    // LOKET_1 (REGULAR): Only serve REGULAR tickets
    return sortedQueue.find((t) => t.category === VisitorCategory.REGULAR) || null;
  } else {
    // LOKET_2 (PRIORITY): Serves Priority first, then Regular
    return sortedQueue[0] || null;
  }
}
