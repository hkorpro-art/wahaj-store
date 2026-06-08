export type StoredImage = {
  url: string;
  fileId: string;
};

export const MENU_ICON_IDS = ["new", "offers", "trend", "sets"] as const;
export type MenuIconId = (typeof MENU_ICON_IDS)[number];
export type MenuIconsRecord = Partial<Record<MenuIconId, StoredImage>>;

export type ImageKitFolder = "/products" | "/categories" | "/hero";

export function storeImage(url: string, fileId = ""): StoredImage {
  return { url: url.trim(), fileId: fileId.trim() };
}

function readImageRecord(value: unknown): StoredImage | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const urlCandidate = [record.url, record.URL, record.src, record.secure_url, record.path].find(
    (item) => typeof item === "string" && item.trim().startsWith("http")
  );
  const fileIdCandidate = [record.fileId, record.file_id, record.fileID].find((item) => typeof item === "string");

  if (typeof urlCandidate === "string") {
    return storeImage(urlCandidate, typeof fileIdCandidate === "string" ? fileIdCandidate : "");
  }

  return null;
}

export function isStoredImage(value: unknown): value is StoredImage {
  return readImageRecord(value) !== null;
}

export function parseStoredImage(value: unknown): StoredImage | null {
  const fromRecord = readImageRecord(value);
  if (fromRecord) {
    return fromRecord;
  }

  if (typeof value === "string" && value.trim().startsWith("http")) {
    return storeImage(value);
  }

  return null;
}

export function parseStoredImages(value: unknown): StoredImage[] {
  const single = parseStoredImage(value);
  if (single && !Array.isArray(value)) {
    return [single];
  }

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

/** يستخرج رابط الصورة من نص أو كائن { url, fileId } أو أشكال قديمة بأمان. */
export function resolveImageSrc(image: unknown): string {
  if (!image) {
    return "";
  }

  if (typeof image === "string") {
    return image.trim();
  }

  const parsed = readImageRecord(image);
  if (parsed?.url) {
    return parsed.url;
  }

  if (typeof image === "object" && image !== null && "url" in image) {
    const url = (image as { url?: unknown }).url;
    return typeof url === "string" ? url.trim() : "";
  }

  return "";
}

export function imageUrl(image: StoredImage | string | unknown, options?: OptimizeOptions): string {
  const url = resolveImageSrc(image);
  if (!url) {
    return "";
  }

  return optimizeImageKitUrl(url, options);
}

/** أول صورة غلاف للمنتج — يدعم النص والكائن والمصفوفة المختلطة. */
export function productCoverUrl(images: unknown, options?: OptimizeOptions): string {
  if (Array.isArray(images)) {
    for (const item of images) {
      const url = imageUrl(item, options);
      if (url) {
        return url;
      }
    }
    return "";
  }

  return imageUrl(images, options);
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
