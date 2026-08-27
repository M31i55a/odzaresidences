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
  saveListing,
  saveRoomImage,
  ROOM_PARTS,
  type RoomPartId,
} from "@/lib/listings";

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
  if (!area) return { error: "Area is needed — for example 120 m²." };
  if (!src) return { error: "A main photograph is needed." };

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
    position: Number.isFinite(number(form, "position")) ? number(form, "position") : 0,
    published: form.get("published") === "on",
  });

  /* Both the admin list and the public site read listings, so both have to
     forget what they cached. */
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

/** Attach an uploaded photo to one room of one listing. */
export async function setRoomImageAction(
  _previous: AdminState,
  form: FormData
): Promise<AdminState> {
  await requireAdmin();

  const slug = text(form, "slug");
  const part = text(form, "part");
  const url = text(form, "url");

  if (!slug || !url) return { error: "Nothing to save." };
  if (!ROOM_PARTS.includes(part as RoomPartId)) {
    return { error: "That isn't one of the rooms." };
  }

  await saveRoomImage(slug, part as RoomPartId, url);
  revalidatePath(`/admin/listings/${slug}`);
  revalidatePath("/");
  return null;
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
