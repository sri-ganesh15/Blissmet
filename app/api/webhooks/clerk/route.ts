// app/api/webhooks/clerk/route.ts

import { headers } from "next/headers";
import { Webhook } from "svix";
import { NextResponse } from "next/server";
import connectDB from "@/lib/config/db";
import User from "@/model/user";

/**
 * ✅ REQUIRED for DB + secrets
 * Prevents build-time execution
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ClerkUserCreatedEvent {
  type: "user.created" | "user.deleted";
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email_addresses: { email_address: string }[];
  };
}

export async function POST(req: Request) {
  const payload = await req.json();
  const headersList = headers();

  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Missing Svix headers", { status: 400 });
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt: ClerkUserCreatedEvent;

  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkUserCreatedEvent;
  } catch {
    return new NextResponse("Webhook verification failed", { status: 400 });
  }

  if (evt.type === "user.created") {
    await connectDB();

    const { id, email_addresses, first_name, last_name } = evt.data;

    const userExists = await User.findOne({ clerkId: id });
    if (!userExists) {
      await User.create({
        clerkId: id,
        name: `${first_name} ${last_name}`,
        email: email_addresses[0].email_address,
      });
    }
  }

  if (evt.type === "user.deleted") {
    await connectDB();
    await User.findOneAndDelete({ clerkId: evt.data.id });
  }

  return NextResponse.json({ message: "Webhook received!" });
}
