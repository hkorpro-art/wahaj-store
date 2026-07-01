import fs from "fs";
import path from "path";
import ImageKit from "imagekit";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
console.log("Loading env from:", envPath);
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
  if (match) {
    let value = match[2] ? match[2].trim() : "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const publicKey = env["NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY"];
const privateKey = env["IMAGEKIT_PRIVATE_KEY"];
const urlEndpoint = env["NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT"];

if (!publicKey || !privateKey || !urlEndpoint) {
  console.error("Missing ImageKit configuration in .env.local");
  process.exit(1);
}

const imagekit = new ImageKit({
  publicKey,
  privateKey,
  urlEndpoint
});

async function testUpload(testName, origin, referer) {
  console.log(`\n--- Running test: ${testName} ---`);
  console.log(`Origin: ${origin}, Referer: ${referer}`);

  let authParams;
  try {
    authParams = imagekit.getAuthenticationParameters();
  } catch (err) {
    console.error("❌ Signature generation failed:", err.message);
    return;
  }

  try {
    const testContent = `Hello connection test [${testName}] at ` + new Date().toISOString();
    const blob = new Blob([testContent], { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", blob, "test-origin.txt");
    formData.append("fileName", "test-origin.txt");
    formData.append("publicKey", publicKey);
    formData.append("signature", authParams.signature);
    formData.append("expire", String(authParams.expire));
    formData.append("token", authParams.token);
    formData.append("folder", "/products");
    formData.append("useUniqueFileName", "true");

    const headers = {};
    if (origin) headers["Origin"] = origin;
    if (referer) headers["Referer"] = referer;

    const start = performance.now();
    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: formData,
      headers: headers
    });
    const duration = performance.now() - start;

    console.log(`Fetch returned status: ${res.status} ${res.statusText} in ${Math.round(duration)}ms`);
    const bodyText = await res.text();
    console.log("Response Body:", bodyText);

    if (res.ok) {
      console.log(`✅ ${testName} succeeded!`);
      const parsed = JSON.parse(bodyText);
      if (parsed.fileId) {
        await imagekit.deleteFile(parsed.fileId);
      }
    } else {
      console.error(`❌ ${testName} failed: HTTP ${res.status}`);
    }
  } catch (err) {
    console.error(`❌ ${testName} failed with error:`, err.message);
  }
}

async function runAll() {
  // Test A: No browser headers
  await testUpload("Test A: Direct Node request (no Origin/Referer)", null, null);

  // Test B: Localhost origin
  await testUpload("Test B: Localhost Origin (http://localhost:3000)", "http://localhost:3000", "http://localhost:3000/admin");

  // Test C: Deployed origin (simulating Vercel)
  await testUpload("Test C: Deployed Origin (https://wahaj0.vercel.app)", "https://wahaj0.vercel.app", "https://wahaj0.vercel.app/admin");
}

runAll();
