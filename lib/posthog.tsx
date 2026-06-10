"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import type { ReactNode } from "react";
import { useEffect } from "react";

const POSTHOG_KEY = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_POSTHOG_KEY : undefined;
const POSTHOG_HOST = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com" : "https://app.posthog.com";

export function PHProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY) return;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false,
      disable_session_recording: true,
      disable_surveys: true,
      person_profiles: "identified_only",
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.opt_out_capturing();
        }
      },
    });
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
