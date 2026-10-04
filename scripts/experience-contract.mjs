import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mirrorPath = resolve(
  root,
  "src/features/album-experience/schemas/experience-spec-v1.schema.json",
);
const canonicalPath = resolve(
  process.env.EXPERIENCE_SCHEMA_SOURCE ??
    resolve(root, "../Travel-diary-backend/contracts/experience-spec-v1.schema.json"),
);
const shouldWrite = process.argv.includes("--write");

if (!existsSync(canonicalPath)) {
  console.error(`Canonical ExperienceSpec schema was not found at ${canonicalPath}`);
  process.exit(1);
}

const canonical = readFileSync(canonicalPath, "utf8");
JSON.parse(canonical);

if (shouldWrite) {
  writeFileSync(mirrorPath, canonical);
  console.log(`Updated ${mirrorPath} from the canonical backend contract.`);
  process.exit(0);
}

const mirror = readFileSync(mirrorPath, "utf8");
if (mirror !== canonical) {
  console.error("ExperienceSpec mirror has drifted. Run `npm run contract:sync`.");
  process.exit(1);
}

const schema = JSON.parse(canonical);
const zodSource = readFileSync(
  resolve(root, "src/features/album-experience/schemas/experience-spec.ts"),
  "utf8",
);
const version = schema?.properties?.schemaVersion?.const;
if (
  typeof version !== "string" ||
  !zodSource.includes(`EXPERIENCE_SCHEMA_VERSION = "${version}"`)
) {
  console.error("The Zod runtime validator and canonical schema use different versions.");
  process.exit(1);
}

console.log(`ExperienceSpec ${version} contract is synchronized.`);
