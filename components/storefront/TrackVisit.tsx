"use client";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

export function TrackCollectionVisit({ collectionId, collectionName }: { collectionId: string; collectionName: string }) {
  const posthog = usePostHog();
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "collection_visit", collectionId, collectionName })
    }).catch(() => {});

    posthog?.capture("collection_view", { collection_id: collectionId, collection_name: collectionName, $current_url: window.location.href });
  }, [collectionId, collectionName, posthog]);
  return null;
}
