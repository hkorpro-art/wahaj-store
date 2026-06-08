export type Contrast = "light" | "dark";

export type ElementContrasts = {
  logo: Contrast;
  menu: Contrast;
  cart: Contrast;
  search: Contrast;
};

type Region = { x: number; y: number; width: number; height: number };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

export async function detectImageBrightness(
  imageUrl: string,
  regions: Region[]
): Promise<Contrast[]> {
  const img = await loadImage(imageUrl);

  const scale = Math.min(120 / img.width, 120 / img.height, 1);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return regions.map(() => "dark" as const);

  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  return regions.map((region) => {
    const x1 = Math.round(region.x * w);
    const y1 = Math.round(region.y * h);
    const rw = Math.round(region.width * w);
    const rh = Math.round(region.height * h);

    let totalLuminance = 0;
    let count = 0;

    for (let y = y1; y < Math.min(y1 + rh, h); y += 2) {
      for (let x = x1; x < Math.min(x1 + rw, w); x += 2) {
        const i = (y * w + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalLuminance += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        count++;
      }
    }

    const avg = totalLuminance / count;
    return avg > 140 ? "light" : "dark";
  });
}
