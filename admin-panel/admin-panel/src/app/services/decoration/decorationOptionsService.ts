// PATH: src/app/services/decoration/decorationOptionsService.ts
// Booking setup (venue types, time slots, colour themes, rules) — super admin / admin only on the server.
import { authApi, getAuthToken } from "../apiClient";

export type DecorationOptionKind = "venue-types" | "time-slots" | "color-themes";

const unwrap = (res: any) => res?.data?.data;
const fail = (err: any, fallback: string): never => {
  throw new Error(err?.response?.data?.message || err?.message || fallback);
};

/** Everything the admin can edit, including inactive items */
export const getDecorationSetup = async () => {
  try {
    return unwrap(await authApi(getAuthToken()).get("/decoration/options/admin/overview"));
  } catch (err) {
    return fail(err, "Could not load the booking setup");
  }
};

export const createDecorationOption = async (kind: DecorationOptionKind, payload: any) => {
  try {
    return unwrap(await authApi(getAuthToken()).post(`/decoration/options/${kind}`, payload));
  } catch (err) {
    return fail(err, "Could not save");
  }
};

export const updateDecorationOption = async (kind: DecorationOptionKind, id: string, payload: any) => {
  try {
    return unwrap(await authApi(getAuthToken()).put(`/decoration/options/${kind}/${id}`, payload));
  } catch (err) {
    return fail(err, "Could not update");
  }
};

export const deleteDecorationOption = async (kind: DecorationOptionKind, id: string) => {
  try {
    return unwrap(await authApi(getAuthToken()).delete(`/decoration/options/${kind}/${id}`));
  } catch (err) {
    return fail(err, "Could not delete");
  }
};

export const reorderDecorationOptions = async (kind: DecorationOptionKind, ids: string[]) => {
  try {
    return unwrap(await authApi(getAuthToken()).post(`/decoration/options/${kind}/reorder`, { ids }));
  } catch (err) {
    return fail(err, "Could not reorder");
  }
};

export const saveDecorationSettings = async (payload: any) => {
  try {
    return unwrap(await authApi(getAuthToken()).put("/decoration/options/settings", payload));
  } catch (err) {
    return fail(err, "Could not save the rules");
  }
};
