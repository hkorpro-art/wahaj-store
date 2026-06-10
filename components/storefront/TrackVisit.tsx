"use client";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

export function TrackProductView({ productId, productName }: { productId: string; productName: string }) {
  const posthog = usePostHog();
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "product_view", productId, productName })
    }).catch(() => {});

    posthog?.capture("product_view", { product_id: productId, product_name: productName, $current_url: window.location.href });
  }, [productId, productName, posthog]);
  return null;
}

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
