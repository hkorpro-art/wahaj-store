export type StoredImage = {
  url: string;
  fileId: string;
};

export const MENU_ICON_IDS = ["new", "offers", "trend", "sets"] as const;
export type MenuIconId = (typeof MENU_ICON_IDS)[number];
export type MenuIconsRecord = Partial<Record<MenuIconId, StoredImage>>;

export type ImageKitFolder = "/products" | "/categories";

export function storeImage(url: string, fileId = ""): StoredImage {
  return { url: url.trim(), fileId: fileId.trim() };
}

export function isStoredImage(value: unknown): value is StoredImage {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as StoredImage).url === "string" &&
    (value as StoredImage).url.trim().length > 0
  );
}

export function parseStoredImage(value: unknown): StoredImage | null {
  if (isStoredImage(value)) {
    return storeImage(value.url, value.fileId);
  }

  if (typeof value === "string" && value.trim().startsWith("http")) {
    return storeImage(value);
  }

  return null;
}

export function parseStoredImages(value: unknown): StoredImage[] {
  if (Array.isArray(value)) {
    return value.map(parseStoredImage).filter((item): item is StoredImage => Boolean(item));
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parseStoredImages(parsed);
      }
    } catch {
      return value
        .split(/[\n,،]+/)
        .map((item) => parseStoredImage(item.trim()))
        .filter((item): item is StoredImage => Boolean(item));
    }
  }

  return [];
}

export function imageUrl(image: StoredImage | string | undefined | null, options?: OptimizeOptions): string {
  if (!image) {
    return "";
  }

  const url = typeof image === "string" ? image : image.url;
  return optimizeImageKitUrl(url, options);
}

export type OptimizeOptions = {
  width?: number;
  height?: number;
  quality?: number;
};

export function optimizeImageKitUrl(url: string, options: OptimizeOptions = {}): string {
  if (!url || !url.includes("ik.imagekit.io")) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);

    if (segments.length === 0 || segments[0]?.startsWith("tr:")) {
      return url;
    }

    const transforms = [
      options.width ? `w-${options.width}` : "",
      options.height ? `h-${options.height}` : "",
      "f-auto",
      `q-${options.quality ?? 80}`,
      "pr-true"
    ]
      .filter(Boolean)
      .join(",");

    const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.replace(/\/$/, "");

    if (endpoint && url.startsWith(endpoint)) {
      const assetPath = url.slice(endpoint.length).replace(/^\//, "");
      return `${endpoint}/tr:${transforms}/${assetPath}`;
    }

    const [accountId, ...rest] = segments;
    return `${parsed.origin}/${accountId}/tr:${transforms}/${rest.join("/")}`;
  } catch {
    return url;
  }
}
