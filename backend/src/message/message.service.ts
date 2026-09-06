import { AppError } from "../common/AppError.js";
import { db } from "../prisma/db.js";
import { ADMIN_ROLE } from "../auth/auth.types.js";
import type { UserRole } from "../auth/auth.types.js";

// ─── helpers ────────────────────────────────────────────────────────────────

async function getUserOrThrow(userId: number) {
  const user = await db.orm.public.User.where({ id: userId }).first();
  if (!user) throw new AppError("User not found", 404);
  return user;
}

function formatMessage(msg: {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}) {
  return {
    id: msg.id,
    fromUserId: msg.fromUserId,
    toUserId: msg.toUserId,
    content: msg.content,
    isRead: msg.isRead,
    createdAt: msg.createdAt,
  };
}

// ─── service functions ───────────────────────────────────────────────────────

/**
 * Send a message from one user to another.
 * Rule: farmers (USER role) can only message officers (ADMIN role).
 * Officers can message anyone.
 */
export async function sendMessage(
  fromUserId: number,
  fromRole: UserRole,
  toUserId: number,
  content: string
) {
  if (fromUserId === toUserId) {
    throw new AppError("Cannot send a message to yourself", 400);
  }

  const recipient = await getUserOrThrow(toUserId);

  // Farmers can only message officers
  if (fromRole !== ADMIN_ROLE && recipient.role !== ADMIN_ROLE) {
    throw new AppError("Farmers can only message agriculture officers", 403);
  }

  const message = await db.orm.public.Message.create({
    fromUserId,
    toUserId,
    content,
  });

  return formatMessage(message);
}

/**
 * Get all messages between two users (full conversation thread).
 * Both users can call this endpoint.
 */
export async function getConversation(
  requestingUserId: number,
  otherUserId: number
) {
  await getUserOrThrow(otherUserId);

  const sent = await db.orm.public.Message
    .where({ fromUserId: requestingUserId, toUserId: otherUserId })
    .all();

  const received = await db.orm.public.Message
    .where({ fromUserId: otherUserId, toUserId: requestingUserId })
    .all();

  const all = [...sent, ...received].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return all.map(formatMessage);
}

/**
 * List all unique users that the requesting user has exchanged messages with.
 * Returns user info + the latest message + unread count for each conversation.
 */
export async function getConversationList(userId: number) {
  const sent = await db.orm.public.Message
    .where({ fromUserId: userId })
    .all();

  const received = await db.orm.public.Message
    .where({ toUserId: userId })
    .all();

  // Collect unique partner user IDs
  const partnerIds = new Set<number>();
  for (const m of sent)     partnerIds.add(m.toUserId);
  for (const m of received) partnerIds.add(m.fromUserId);

  // BUG FIX: explicit type to avoid `never[]` inference
  const conversations: {
    user: { id: number; name: string | null; email: string; role: string };
    latestMessage: ReturnType<typeof formatMessage> | null;
    unreadCount: number;
  }[] = [];

  for (const partnerId of partnerIds) {
    const partner = await db.orm.public.User.where({ id: partnerId }).first();
    if (!partner) continue;

    const allMessages = [
      ...sent.filter((m) => m.toUserId === partnerId),
      ...received.filter((m) => m.fromUserId === partnerId),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latest = allMessages[0];
    const unreadCount = received.filter(
      (m) => m.fromUserId === partnerId && !m.isRead
    ).length;

    conversations.push({
      user: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        role: partner.role,
      },
      latestMessage: latest ? formatMessage(latest) : null,
      unreadCount,
    });
  }

  // Sort by latest message time (most recent first)
  return conversations.sort((a, b) => {
    if (!a.latestMessage) return 1;
    if (!b.latestMessage) return -1;
    return new Date(b.latestMessage.createdAt).getTime() -
           new Date(a.latestMessage.createdAt).getTime();
  });
}

/**
 * Mark all messages FROM a specific user TO the requesting user as read.
 */
export async function markAsRead(readerId: number, senderId: number) {
  await db.orm.public.Message
    .where({ fromUserId: senderId, toUserId: readerId, isRead: false })
    .update({ isRead: true });
}

/**
 * List all officers (ADMIN role) — used by farmers to start a conversation.
 */
export async function getOfficers() {
  const officers = await db.orm.public.User
    .where({ role: ADMIN_ROLE })
    .all();

  return officers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  }));
}
