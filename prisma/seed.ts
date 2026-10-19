import { PrismaClient, Source, Stage } from "@prisma/client";
import { STAGES } from "../lib/stages";

const db = new PrismaClient();

// mulberry32: tiny deterministic PRNG so every run produces the same data.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261019);
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const pick = <T>(xs: readonly T[]) => xs[int(0, xs.length - 1)];
const shuffle = <T>(xs: T[]) => {
  for (let i = xs.length - 1; i > 0; i--) {
    const j = int(0, i);
    [xs[i], xs[j]] = [xs[j], xs[i]];
  }
  return xs;
};

const DAY = 86_400_000;

const JOBS = [
  {
    title: "Frontend Engineer",
    department: "Engineering",
    location: "Bengaluru",
    description: "Build fast, accessible interfaces for our hiring platform using React and Next.js.",
    skills: ["react", "typescript", "next.js", "css", "tailwind", "testing", "accessibility", "graphql"],
    count: 12,
  },
  {
    title: "Backend Engineer",
    department: "Engineering",
    location: "Hyderabad",
    description: "Design and scale the APIs and data pipelines behind every application we process.",
    skills: ["node.js", "postgresql", "go", "java", "redis", "kafka", "rest", "microservices"],
    count: 10,
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Pune",
    description: "Own end-to-end product design for recruiter workflows, from research to polished UI.",
    skills: ["figma", "prototyping", "user research", "design systems", "interaction design", "wireframing"],
    count: 8,
  },
  {
    title: "Data Analyst",
    department: "Analytics",
    location: "Remote",
    description: "Turn hiring funnel data into clear insights and dashboards for the leadership team.",
    skills: ["sql", "python", "excel", "tableau", "power bi", "statistics", "pandas"],
    count: 6,
  },
  {
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Bengaluru",
    description: "Keep our cloud infrastructure reliable, observable, and cost-efficient.",
    skills: ["aws", "kubernetes", "docker", "terraform", "ci/cd", "linux", "prometheus"],
    count: 4,
    closed: true,
  },
] as const;

const FIRST = [
  "Aarav", "Ananya", "Vihaan", "Diya", "Arjun", "Ishita", "Kabir", "Meera", "Rohan", "Saanvi",
  "Aditya", "Priya", "Karthik", "Lakshmi", "Siddharth", "Nandini", "Farhan", "Zoya", "Harpreet", "Gurleen",
  "Rahul", "Sneha", "Vikram", "Pooja", "Imran", "Ayesha", "Joseph", "Mary", "Tenzin", "Pema",
  "Suresh", "Kavya", "Manish", "Divya", "Nikhil", "Riya", "Arnav", "Tanvi", "Pranav", "Shreya",
];
const LAST = [
  "Sharma", "Iyer", "Reddy", "Nair", "Khan", "Singh", "Mukherjee", "Patel", "Menon", "Deshpande",
  "Gupta", "Rao", "Banerjee", "Kulkarni", "Fernandes", "Bhatia", "Chatterjee", "Pillai", "Joshi", "Qureshi",
];

const NOTES = [
  "Strong portfolio; follow up on notice period.",
  "Referred by a current team member.",
  "Prefers remote; open to quarterly travel.",
  "Expected CTC slightly above band.",
  "Great communication in the intro call.",
];

const STAGE_COUNTS: Record<Stage, number> = {
  APPLIED: 10, SCREENING: 8, INTERVIEW: 7, OFFER: 4, HIRED: 5, REJECTED: 6,
};

/** Stage path ending at `final`; REJECTED branches off somewhere between APPLIED and OFFER. */
function pathTo(final: Stage): Stage[] {
  if (final === Stage.REJECTED) return [...STAGES.slice(0, int(0, 3) + 1), Stage.REJECTED];
  return STAGES.slice(0, STAGES.indexOf(final) + 1);
}

async function main() {
  await db.stageChange.deleteMany();
  await db.candidate.deleteMany();
  await db.job.deleteMany();

  const now = Date.now();
  const jobs: { id: string; skills: readonly string[]; count: number }[] = [];
  for (const j of JOBS) {
    const { id } = await db.job.create({
      data: {
        title: j.title,
        department: j.department,
        location: j.location,
        description: j.description,
        status: "closed" in j ? "CLOSED" : "OPEN",
      },
    });
    jobs.push({ id, skills: j.skills as readonly string[], count: j.count });
  }

  const finals = shuffle(
    (Object.entries(STAGE_COUNTS) as [Stage, number][]).flatMap(([s, n]) => Array<Stage>(n).fill(s)),
  );
  const slots = jobs.flatMap((j) => Array(j.count).fill(j) as (typeof jobs)[number][]);
  const lastNames = shuffle([...LAST, ...LAST]);
  const sources = Object.values(Source);

  for (let i = 0; i < 40; i++) {
    const job = slots[i];
    const name = `${FIRST[i]} ${lastNames[i]}`;
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const stage = finals[i];
    const appliedAt = now - (1 + rand() * 89) * DAY;

    // Walk the path with 2-10 day gaps; squeeze gaps proportionally if they'd run past now.
    const path = pathTo(stage);
    const gaps = path.slice(1).map(() => int(2, 10) * DAY + int(0, 23) * 3_600_000);
    const total = gaps.reduce((a, b) => a + b, 0);
    const room = now - appliedAt - 60_000;
    const scale = total > room ? room / total : 1;
    let t = appliedAt;
    const history = path.map((toStage, k) => {
      if (k > 0) t += gaps[k - 1] * scale;
      return { fromStage: k === 0 ? null : path[k - 1], toStage, changedAt: new Date(t) };
    });

    await db.candidate.create({
      data: {
        name,
        email: `${slug.replace("-", ".")}@example.com`,
        phone: rand() < 0.85 ? `${pick(["9", "8", "7", "6"])}${String(int(0, 999_999_999)).padStart(9, "0")}` : null,
        skills: shuffle([...job.skills]).slice(0, int(3, 6)),
        source: pick(sources),
        resumeUrl: rand() < 0.5 ? `https://example.com/resumes/${slug}.pdf` : null,
        notes: rand() < 0.2 ? pick(NOTES) : null,
        stage,
        appliedAt: new Date(appliedAt),
        jobId: job.id,
        history: { create: history },
      },
    });
  }

  const perStage = await db.candidate.groupBy({ by: ["stage"], _count: true });
  console.log(`Jobs: ${await db.job.count()}`);
  console.log(`Candidates: ${await db.candidate.count()}`);
  for (const s of STAGES) console.log(`  ${s}: ${perStage.find((p) => p.stage === s)?._count ?? 0}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
