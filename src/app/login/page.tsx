import { redirect } from "next/navigation";

/**
 * /login is now an alias for the marketing landing's auth panel.
 *
 * Kept the route so any old links / bookmarks / OAuth redirect URIs that
 * still point at /login don't 404. Once we audit and update all those
 * external references this file can be deleted.
 */
export default function LoginRedirect() {
  redirect("/#auth");
}
