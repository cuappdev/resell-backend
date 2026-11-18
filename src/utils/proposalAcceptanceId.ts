import { createHash } from "crypto";

/**
 * UUIDv5 under the standard URL namespace. The existing API has no proposal ID:
 * the same chat, participants, listing and meeting interval identify one acceptance.
 * Exclude the accepting sender so another participant cannot create a second sale.
 */
export function proposalAcceptanceId(
  chatId: string,
  buyerId: string,
  sellerId: string,
  postId: string,
  startDate: Date,
  endDate: Date,
): string {
  const namespace = Buffer.from("6ba7b8119dad11d180b400c04fd430c8", "hex");
  const name = JSON.stringify([
    "resell/proposal-acceptance/v1", chatId, buyerId, sellerId, postId,
    startDate.toISOString(), endDate.toISOString(),
  ]);
  const bytes = createHash("sha1").update(namespace).update(name).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
