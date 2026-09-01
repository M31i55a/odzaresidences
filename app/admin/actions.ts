"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  adminConfigured,
  checkCredentials,
  requireAdmin,
  signIn,
  signOut,
} from "@/lib/admin-auth";
import {
  deleteListing,
  getListing,
  nextPosition,
  saveListing,
} from "@/lib/listings";
import {
  addRoomImage,
  createRoom,
  createStandardRooms,
  deleteRoom,
  deleteRoomImage,
  updateRoom,
  type RoomInput,
  type RoomSpec,
} from "@/lib/rooms";

/* Every action re-checks the session. The layout guard only decides what gets
   rendered; these are POST endpoints and can be called without ever loading
   the page they belong to. */

export type AdminState = { error?: string } | null;

/* ---------------- session ---------------- */

export async function signInAction(
  _previous: AdminState,
  form: FormData
): Promise<AdminState> {
  if (!adminConfigured()) {
    return {
      error:
        "The admin isn't configured. Set ADMIN_EMAIL and ADMIN_PASSWORD, " +
        "then redeploy.",
    };
  }

  const enteredEmail = form.get("email");
  const enteredPassword = form.get("password");

  if (
    typeof enteredEmail !== "string" ||
    typeof enteredPassword !== "string" ||
    !checkCredentials(enteredEmail, enteredPassword)
  ) {
    // One message for both halves — never say which one was wrong.
    return { error: "That email and password don't match." };
  }

  await signIn();
  redirect("/admin");
}

export async function signOutAction() {
  await signOut();
  redirect("/admin/login");
}

/* ---------------- listings ---------------- */

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

const number = (form: FormData, field: string) => {
  const raw = form.get(field);
  const value = typeof raw === "string" ? Number(raw.trim()) : NaN;
  return Number.isFinite(value) ? Math.round(value) : NaN;
};

const text = (form: FormData, field: string) => {
  const raw = form.get(field);
  return typeof raw === "string" ? raw.trim() : "";
};

export async function saveListingAction(
  _previous: AdminState,
  form: FormData
): Promise<AdminState> {
  await requireAdmin();

  const nameEn = text(form, "name_en");
  const nameFr = text(form, "name_fr");
  // The slug is the identity and never changes on edit; a new listing gets
  // one derived from its English name so the URL stays readable.
  const slug = text(form, "slug") || slugify(nameEn || nameFr);

  const price = number(form, "price");
  const rooms = number(form, "rooms");
  const area = text(form, "area");
  const src = text(form, "src");

  if (!slug) return { error: "A name is needed — the slug comes from it." };
  if (!nameEn || !nameFr) return { error: "Both names are needed." };
  if (!Number.isFinite(price) || price <= 0) {
    return { error: "The price has to be a whole number above zero." };
  }
  if (!Number.isFinite(rooms) || rooms <= 0) {
    return { error: "Rooms has to be a whole number above zero." };
  }
  if (!src) return { error: "A main photograph is needed." };

  /* Checked before the upsert, because after it the row exists either way
     and there is no telling a new listing from an edited one. */
  const isNew = (await getListing(slug)) === null;

  /* A new listing goes to the end of the running order unless the admin
     typed one. It used to be a hidden 999, which put every new residence
     past the home page's featured strip with nothing on screen saying so. */
  const typed = number(form, "position");
  const position = Number.isFinite(typed) && typed >= 0
    ? typed
    : isNew
      ? await nextPosition()
      : 0;

  await saveListing({
    slug,
    price,
    perDay: form.get("per_day") === "on",
    rooms,
    seats: form.get("seats") === "on",
    area,
    src,
    name: { en: nameEn, fr: nameFr },
    kind: { en: text(form, "kind_en"), fr: text(form, "kind_fr") },
    description: {
      en: text(form, "description_en"),
      fr: text(form, "description_fr"),
    },
    position,
    published: form.get("published") === "on",
  });

  /* A brand new listing has no rooms, so its detail view would open empty
     next to ten residences that each show four. Offered rather than forced —
     not every property has a kitchen and a parlour. */
  if (isNew && form.get("standard_rooms") === "on") {
    await createStandardRooms(slug);
  }

  /* Both the admin list and the public site read listings, so both have to
     forget what they cached. */
  revalidatePath("/admin");
  revalidatePath("/");

  /* Straight on to the new listing rather than back to the index: rooms and
     photographs are the next thing it needs, and they live on that page. */
  redirect(isNew ? `/admin/listings/${slug}` : "/admin");
}

export async function deleteListingAction(form: FormData) {
  await requireAdmin();

  const slug = text(form, "slug");
  if (slug) {
    await deleteListing(slug);
    revalidatePath("/admin");
    revalidatePath("/");
  }
  redirect("/admin");
}

/* ---------------- rooms ----------------
   A room's price is descriptive. It is stored and displayed, and no booking
   is ever priced from it — quote() in components/reservation.ts reads the
   listing's rate and nothing else. */

/** Detail rows arrive as parallel label/value arrays, one pair per row. */
function specs(form: FormData, locale: "en" | "fr"): RoomSpec[] {
  const labels = form.getAll(`spec_${locale}_label`);
  const values = form.getAll(`spec_${locale}_value`);

  return labels
    .map((label, i) => ({
      label: typeof label === "string" ? label.trim() : "",
      value: typeof values[i] === "string" ? (values[i] as string).trim() : "",
    }))
    // Blank rows are how you delete one, so they're dropped rather than saved.
    .filter((spec) => spec.label || spec.value);
}

function roomFrom(form: FormData): RoomInput | { error: string } {
  const slug = text(form, "slug");
  const nameEn = text(form, "name_en");
  const nameFr = text(form, "name_fr");

  if (!slug) return { error: "Which listing is this room in?" };
  if (!nameEn || !nameFr) return { error: "The room needs a name in both languages." };

  /* Optional. Empty means the room quotes no price at all, which is not the
     same as quoting zero — hence null rather than 0. */
  const rawPrice = text(form, "price");
  let price: number | null = null;
  if (rawPrice) {
    const parsed = Number(rawPrice);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return { error: "A room price has to be a whole number above zero, or empty." };
    }
    price = Math.round(parsed);
  }

  return {
    slug,
    name: { en: nameEn, fr: nameFr },
    price,
    specs: { en: specs(form, "en"), fr: specs(form, "fr") },
  };
}

export async function saveRoomAction(
  _previous: AdminState,
  form: FormData
): Promise<AdminState> {
  await requireAdmin();

  const room = roomFrom(form);
  if ("error" in room) return room;

  const id = number(form, "id");
  if (Number.isFinite(id) && id > 0) {
    await updateRoom(id, room);
  } else {
    await createRoom(room);
  }

  revalidatePath(`/admin/listings/${room.slug}`);
  revalidatePath("/");
  return null;
}

export async function deleteRoomAction(form: FormData) {
  await requireAdmin();

  const id = number(form, "id");
  const slug = text(form, "slug");
  if (Number.isFinite(id) && id > 0) {
    // Its photographs cascade with it.
    await deleteRoom(id);
    revalidatePath(`/admin/listings/${slug}`);
    revalidatePath("/");
  }
  redirect(`/admin/listings/${slug}`);
}

export async function addRoomImageAction(
  _previous: AdminState,
  form: FormData
): Promise<AdminState> {
  await requireAdmin();

  const roomId = number(form, "room_id");
  const slug = text(form, "slug");
  const url = text(form, "url");

  if (!Number.isFinite(roomId) || roomId <= 0) return { error: "Unknown room." };
  if (!url) return { error: "Nothing was uploaded." };

  await addRoomImage(roomId, url);
  revalidatePath(`/admin/listings/${slug}`);
  revalidatePath("/");
  return null;
}

export async function deleteRoomImageAction(form: FormData) {
  await requireAdmin();

  const roomId = number(form, "room_id");
  const imageId = number(form, "image_id");
  const slug = text(form, "slug");

  if (Number.isFinite(roomId) && Number.isFinite(imageId)) {
    // Scoped to the room, so a stray id can't reach another listing's gallery.
    await deleteRoomImage(roomId, imageId);
    revalidatePath(`/admin/listings/${slug}`);
    revalidatePath("/");
  }
  redirect(`/admin/listings/${slug}`);
}
