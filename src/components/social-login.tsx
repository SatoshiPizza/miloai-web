"use client";

/**
 * Google + Meta "Sign in" buttons used on /login.
 *
 * Google: Google Identity Services renders its own pill button. When the
 * user picks an account, GIS posts a JWT credential to our callback prop;
 * we forward it to POST /api/auth/google-login.
 *
 * Meta: Facebook JS SDK exposes `FB.login()`. On approval it returns a
 * short-lived access_token which we hand to POST /api/auth/meta-login.
 */

import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/session";
import type { SocialLoginOut } from "@/lib/tg-bridge";

// ─── Public env we expose on the client for these widgets ───
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID || "";

/** Minimal Google Identity Services types — we just need the bits we touch. */
type GISCredentialResponse = { credential: string };
type GISAccountsId = {
  initialize: (cfg: { client_id: string; callback: (r: GISCredentialResponse) => void }) => void;
  renderButton: (parent: HTMLElement, opts: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id: GISAccountsId } };
    FB?: {
      init: (cfg: { appId: string; version: string; xfbml?: boolean; cookie?: boolean }) => void;
      login: (
        cb: (resp: { authResponse?: { accessToken: string; userID: string } | null; status: string }) => void,
        opts?: { scope?: string }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

async function finishLogin(
  res: SocialLoginOut,
  next: string,
  onDone: () => void
): Promise<void> {
  saveSession({
    token: res.token,
    user_id: res.user_id,
    telegram_id: 0,
    first_name: res.first_name,
    username: null,
    email: res.email,
  });
  onDone();
  window.location.assign(next);
}

export function GoogleLoginButton({
  next,
  onError,
  onStart,
  onDone,
}: {
  next: string;
  onError: (msg: string) => void;
  onStart: () => void;
  onDone: () => void;
}) {
  const slot = useRef<HTMLDivElement | null>(null);
  // Stable callback ref — GIS rejects async functions (throws "Expression is
  // of type asyncfunction, not function") so we wrap our async logic in a
  // sync handler that spawns an async IIFE.
  const handlerRef = useRef<(r: { credential: string }) => void>(() => {});
  // Guard against double-init in StrictMode + on prop changes — GIS warns
  // when initialize() is called multiple times and uses only the last
  // instance, which strands earlier renderButton calls.
  const initedRef = useRef(false);

  useEffect(() => {
    handlerRef.current = (r) => {
      onStart();
      (async () => {
        try {
          const out = await api.post<SocialLoginOut>(
            "/api/auth/google-login",
            { credential: r.credential }
          );
          await finishLogin(out, next, onDone);
        } catch (e) {
          console.error(e);
          onError(e instanceof Error ? e.message : "Не удалось войти через Google");
        }
      })();
    };
  }, [next, onStart, onDone, onError]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (!slot.current) return;

    function init() {
      const gis = window.google?.accounts?.id;
      if (!gis || !slot.current) return;
      if (!initedRef.current) {
        gis.initialize({
          client_id: GOOGLE_CLIENT_ID,
          // Plain sync callback — handlerRef forwards to the (always fresh)
          // async impl above.
          callback: (r: { credential: string }) => handlerRef.current(r),
        });
        initedRef.current = true;
      }
      gis.renderButton(slot.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        width: 320,
      });
    }

    if (window.google?.accounts?.id) {
      init();
      return;
    }

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = init;
    document.head.appendChild(s);
    // No cleanup script removal — Google's SDK is global; removing it would
    // break other consumers on the same page.
  }, []);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }
  return <div ref={slot} className="flex justify-center" />;
}

export function MetaLoginButton({
  next,
  onError,
  onStart,
  onDone,
}: {
  next: string;
  onError: (msg: string) => void;
  onStart: () => void;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!META_APP_ID) return;
    if (window.FB) return;

    window.fbAsyncInit = function () {
      window.FB!.init({
        appId: META_APP_ID,
        version: "v21.0",
        xfbml: false,
        cookie: false,
      });
    };

    const s = document.createElement("script");
    s.src = "https://connect.facebook.net/en_US/sdk.js";
    s.async = true;
    s.defer = true;
    s.crossOrigin = "anonymous";
    document.head.appendChild(s);
  }, []);

  if (!META_APP_ID) {
    return null;
  }

  function click() {
    const fb = window.FB;
    if (!fb) {
      onError("Facebook SDK ещё не загрузился — попробуй ещё раз через секунду");
      return;
    }
    onStart();
    // FB.login() expects a plain (non-async) callback — async callbacks can
    // silently swallow the response in some SDK builds. Wrap our async logic
    // in an IIFE inside a sync callback.
    fb.login(
      (resp) => {
        if (!resp.authResponse) {
          onError("Логин отменён");
          return;
        }
        const accessToken = resp.authResponse.accessToken;
        (async () => {
          try {
            const out = await api.post<SocialLoginOut>(
              "/api/auth/meta-login",
              { access_token: accessToken }
            );
            await finishLogin(out, next, onDone);
          } catch (e) {
            console.error(e);
            onError(e instanceof Error ? e.message : "Не удалось войти через Meta");
          }
        })();
      },
      { scope: "email,public_profile" }
    );
  }

  return (
    <button
      onClick={click}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-[14px] font-medium text-white transition-opacity hover:opacity-90"
      style={{ background: "#0866FF" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3V22C18.3 21.1 22 17 22 12z" />
      </svg>
      Войти через Facebook
    </button>
  );
}
