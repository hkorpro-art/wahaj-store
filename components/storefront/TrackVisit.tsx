"use client";
import { useEffect } from "react";

export function TrackCollectionVisit({ collectionId, collectionName }: { collectionId: string; collectionName: string }) {
  useEffect(() => {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "collection_visit", collectionId, collectionName })
    }).catch(() => {});
  }, [collectionId, collectionName]);
  return null;
}
