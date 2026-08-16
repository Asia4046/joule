import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type ChapterSeed = {
  name: string;
  branch?: string;
  main: number; // avg questions JEE Main
  adv: number; // avg questions JEE Adv
  wm: number; // weightage % Main
  wa: number; // weightage % Adv
  diff: number; // 1-5
  topics: string[];
};

// 2026 JEE Main & Advanced weightage based on paper analysis
// averages across all sessions. JEE Main = 30 Q/subject; Advanced = ~17 Q/subject.
// Chapters removed from Main in NTA 2024 revision carry 0 % for Main.
const PHYSICS: ChapterSeed[] = [
  { name: "Units and Measurements", main: 0.5, adv: 0, wm: 2.5, wa: 0, diff: 1, topics: ["Dimensional analysis", "Significant figures", "Errors in measurement"] },
  { name: "Kinematics", main: 2, adv: 1, wm: 7.5, wa: 5.9, diff: 2, topics: ["Motion in 1D", "Projectile motion", "Relative velocity", "Graphs of motion"] },
  { name: "Laws of Motion", main: 2, adv: 1, wm: 6, wa: 5.9, diff: 3, topics: ["Newton's laws", "Friction", "Free body diagrams", "Pulley systems"] },
  { name: "Work, Energy and Power", main: 1, adv: 1, wm: 3.5, wa: 5.9, diff: 2, topics: ["Work-energy theorem", "Conservation of energy", "Collisions", "Power"] },
  { name: "Rotational Motion", main: 2, adv: 2, wm: 6, wa: 11.8, diff: 4, topics: ["Torque", "Moment of inertia", "Angular momentum", "Rolling motion", "Rigid body dynamics"] },
  { name: "Gravitation", main: 1, adv: 1, wm: 3, wa: 5.9, diff: 2, topics: ["Kepler's laws", "Gravitational potential", "Satellites", "Escape velocity"] },
  { name: "Properties of Solids and Liquids", main: 1, adv: 0.5, wm: 3.5, wa: 2.9, diff: 2, topics: ["Elasticity", "Viscosity", "Surface tension", "Bernoulli's theorem", "Thermal expansion"] },
  { name: "Thermodynamics", main: 2.5, adv: 2, wm: 8.5, wa: 11.8, diff: 3, topics: ["Laws of thermodynamics", "Heat engines", "Kinetic theory", "Specific heat"] },
  { name: "Oscillations and Waves", main: 1, adv: 1, wm: 4, wa: 5.9, diff: 3, topics: ["SHM", "Damped oscillations", "Wave motion", "Sound waves", "Doppler effect"] },
  { name: "Electrostatics", main: 2.5, adv: 2, wm: 9.5, wa: 11.8, diff: 4, topics: ["Coulomb's law", "Electric field", "Gauss's law", "Capacitance", "Electric potential"] },
  { name: "Current Electricity", main: 2.5, adv: 1, wm: 9, wa: 5.9, diff: 3, topics: ["Ohm's law", "Kirchhoff's laws", "Wheatstone bridge", "Meter bridge", "Electrical power"] },
  { name: "Magnetic Effects of Current", main: 1.5, adv: 1, wm: 5, wa: 5.9, diff: 3, topics: ["Biot-Savart law", "Ampere's law", "Force on moving charge", "Cyclotron"] },
  { name: "Magnetism and Matter", main: 0.5, adv: 0, wm: 1.5, wa: 0, diff: 2, topics: ["Bar magnet", "Magnetic materials", "Earth's magnetism", "Hysteresis"] },
  { name: "EMI and Alternating Current", main: 1.5, adv: 1, wm: 5, wa: 5.9, diff: 4, topics: ["Faraday's law", "Lenz's law", "Inductance", "LCR circuits", "Transformers"] },
  { name: "Electromagnetic Waves", main: 0.5, adv: 0, wm: 1, wa: 0, diff: 1, topics: ["EM spectrum", "Displacement current", "Maxwell's equations"] },
  { name: "Ray Optics", main: 2, adv: 1, wm: 6, wa: 5.9, diff: 3, topics: ["Reflection", "Refraction", "Lenses", "Prisms", "Optical instruments"] },
  { name: "Wave Optics", main: 1, adv: 1, wm: 3.5, wa: 5.9, diff: 3, topics: ["Interference", "Diffraction", "Polarization", "Young's double slit"] },
  { name: "Dual Nature of Matter and Radiation", main: 1.5, adv: 0.5, wm: 5, wa: 2.9, diff: 2, topics: ["Photoelectric effect", "de Broglie waves", "X-rays"] },
  { name: "Atoms and Nuclei", main: 1, adv: 0.5, wm: 4.5, wa: 2.9, diff: 2, topics: ["Bohr model", "Nuclear binding energy", "Radioactivity", "Fission and fusion"] },
  { name: "Semiconductor Electronics", main: 1, adv: 0, wm: 3.5, wa: 0, diff: 2, topics: ["Semiconductors", "Diodes", "Logic gates", "Transistors"] },
  { name: "Experimental Physics", main: 0.5, adv: 0, wm: 2, wa: 0, diff: 3, topics: ["Error analysis", "Vernier calipers", "Screw gauge"] },
];

const CHEMISTRY: ChapterSeed[] = [
  { name: "Some Basic Concepts of Chemistry", branch: "Physical", main: 0.5, adv: 0, wm: 2, wa: 0, diff: 1, topics: ["Mole concept", "Stoichiometry", "Concentration terms"] },
  { name: "Atomic Structure", branch: "Physical", main: 1, adv: 1, wm: 4.5, wa: 5.9, diff: 2, topics: ["Quantum numbers", "Orbitals", "Photoelectric effect", "Hydrogen spectrum"] },
  { name: "Chemical Bonding", branch: "Inorganic", main: 2.5, adv: 1.5, wm: 8, wa: 8.8, diff: 3, topics: ["VSEPR theory", "Hybridization", "Molecular orbital theory", "Dipole moment"] },
  { name: "States of Matter", branch: "Physical", main: 0, adv: 0, wm: 0, wa: 0, diff: 2, topics: ["Gas laws", "Ideal gas equation", "Real gases"] },
  { name: "Thermodynamics and Thermochemistry", branch: "Physical", main: 2, adv: 1, wm: 6, wa: 5.9, diff: 3, topics: ["Enthalpy", "Entropy", "Gibbs energy", "Hess's law", "Bond energy"] },
  { name: "Chemical and Ionic Equilibrium", branch: "Physical", main: 2, adv: 1, wm: 5.5, wa: 5.9, diff: 4, topics: ["Equilibrium constant", "Le Chatelier principle", "pH and buffers", "Solubility product"] },
  { name: "Electrochemistry", branch: "Physical", main: 1, adv: 0.5, wm: 4, wa: 2.9, diff: 3, topics: ["Nernst equation", "Electrolysis", "Conductance", "Batteries"] },
  { name: "Chemical Kinetics", branch: "Physical", main: 1, adv: 1, wm: 4, wa: 5.9, diff: 3, topics: ["Rate laws", "Order of reaction", "Arrhenius equation"] },
  { name: "Solutions", branch: "Physical", main: 1, adv: 0.5, wm: 3.5, wa: 2.9, diff: 2, topics: ["Raoult's law", "Colligative properties", "Henry's law"] },
  { name: "Surface Chemistry", branch: "Physical", main: 0, adv: 0, wm: 0, wa: 0, diff: 1, topics: ["Adsorption", "Colloids and emulsions", "Catalysis"] },
  { name: "GOC (General Organic Chemistry)", branch: "Organic", main: 3, adv: 2, wm: 10, wa: 11.8, diff: 3, topics: ["Inductive effect", "Resonance", "Hyperconjugation", "Reaction intermediates", "Isomerism"] },
  { name: "Hydrocarbons", branch: "Organic", main: 2, adv: 1.5, wm: 5.5, wa: 8.8, diff: 2, topics: ["Alkanes", "Alkenes", "Alkynes", "Aromaticity"] },
  { name: "Haloalkanes and Haloarenes", branch: "Organic", main: 1, adv: 1, wm: 3.5, wa: 5.9, diff: 2, topics: ["SN1 and SN2", "Elimination reactions"] },
  { name: "Alcohols, Phenols and Ethers", branch: "Organic", main: 1, adv: 0.5, wm: 3.5, wa: 2.9, diff: 2, topics: ["Preparation of alcohols", "Reactions of phenols", "Williamson synthesis"] },
  { name: "Aldehydes, Ketones and Carboxylic Acids", branch: "Organic", main: 2.5, adv: 2, wm: 8, wa: 11.8, diff: 3, topics: ["Aldol condensation", "Cannizzaro reaction", "Nucleophilic addition", "Acidity of carboxylic acids"] },
  { name: "Amines and Diazonium Salts", branch: "Organic", main: 1, adv: 0.5, wm: 3.5, wa: 2.9, diff: 2, topics: ["Basicity of amines", "Diazotization", "Coupling reactions"] },
  { name: "Biomolecules and Polymers", branch: "Organic", main: 1, adv: 0, wm: 3, wa: 0, diff: 1, topics: ["Carbohydrates", "Proteins", "Vitamins", "Polymerization"] },
  { name: "Practical Organic Chemistry", branch: "Organic", main: 0.5, adv: 0.5, wm: 2, wa: 2.9, diff: 2, topics: ["Qualitative analysis", "Functional group tests"] },
  { name: "Classification of Elements and Periodicity", branch: "Inorganic", main: 0.5, adv: 0, wm: 2.5, wa: 0, diff: 1, topics: ["Periodic trends", "Ionization energy", "Electronegativity"] },
  { name: "Hydrogen", branch: "Inorganic", main: 0, adv: 0, wm: 0, wa: 0, diff: 1, topics: ["Position in periodic table", "Hydrides", "Water and hydrogen peroxide", "Heavy water"] },
  { name: "s-Block Elements", branch: "Inorganic", main: 0, adv: 0, wm: 0, wa: 0, diff: 1, topics: ["Group 1 and 2 trends", "Oxides and hydroxides", "Carbonates and sulfates", "Anomalous behaviour"] },
  { name: "p-Block Elements", branch: "Inorganic", main: 2, adv: 1, wm: 7, wa: 5.9, diff: 3, topics: ["Group 13-14", "Group 15-16", "Group 17-18", "Interhalogen compounds"] },
  { name: "d- and f-Block Elements", branch: "Inorganic", main: 1, adv: 0.5, wm: 4, wa: 2.9, diff: 3, topics: ["Transition metals", "Coordination compounds", "Lanthanoids and actinoids"] },
  { name: "Coordination Compounds", branch: "Inorganic", main: 2, adv: 1.5, wm: 7.5, wa: 8.8, diff: 4, topics: ["Werner's theory", "Crystal field theory", "Isomerism in complexes", "Nomenclature"] },
  { name: "Metallurgy", branch: "Inorganic", main: 0.5, adv: 0, wm: 3, wa: 0, diff: 2, topics: ["Extraction processes", "Ellingham diagrams"] },
  { name: "Qualitative Salt Analysis", branch: "Inorganic", main: 0.5, adv: 0, wm: 2.5, wa: 0, diff: 2, topics: ["Cation analysis", "Anion analysis"] },
  { name: "Environmental Chemistry", branch: "Inorganic", main: 0, adv: 0, wm: 0, wa: 0, diff: 1, topics: ["Air and water pollution", "Green chemistry", "Ozone depletion"] },
];

const MATHEMATICS: ChapterSeed[] = [
  { name: "Sets, Relations and Functions", main: 1, adv: 0.5, wm: 3.5, wa: 2.9, diff: 2, topics: ["Sets", "Relations", "Functions", "Domain and range"] },
  { name: "Complex Numbers and Quadratic Equations", main: 1.5, adv: 1.5, wm: 5.5, wa: 8.8, diff: 3, topics: ["Algebra of complex numbers", "Argand plane", "Roots of unity", "Quadratic equations", "Principle of mathematical induction"] },
  { name: "Matrices and Determinants", main: 2, adv: 1.5, wm: 7, wa: 8.8, diff: 3, topics: ["Matrix algebra", "Determinants", "Inverse of matrix", "System of equations"] },
  { name: "Permutations and Combinations", main: 1, adv: 1, wm: 3.5, wa: 5.9, diff: 3, topics: ["Counting principles", "Circular permutations", "Selections with repetition"] },
  { name: "Binomial Theorem", main: 1, adv: 0.5, wm: 3.5, wa: 2.9, diff: 2, topics: ["Binomial expansion", "General term", "Applications"] },
  { name: "Sequences and Series", main: 2, adv: 1, wm: 7, wa: 5.9, diff: 3, topics: ["AP and GP", "AGP", "Summation techniques", "Telescoping"] },
  { name: "Limits, Continuity and Differentiability", main: 2, adv: 2, wm: 7, wa: 11.8, diff: 4, topics: ["Limits", "Continuity", "Differentiability", "L'Hopital's rule"] },
  { name: "Application of Derivatives", main: 1.5, adv: 1.5, wm: 5, wa: 8.8, diff: 3, topics: ["Tangents and normals", "Maxima and minima", "Rate of change", "Rolle's theorem"] },
  { name: "Integral Calculus", main: 3.5, adv: 2, wm: 12, wa: 11.8, diff: 4, topics: ["Indefinite integrals", "Definite integrals", "Area under curves", "Integration techniques"] },
  { name: "Differential Equations", main: 1, adv: 1, wm: 3.5, wa: 5.9, diff: 3, topics: ["Order and degree", "Variable separable", "Linear differential equations"] },
  { name: "Straight Lines and Pair of Lines", main: 1, adv: 0.5, wm: 3, wa: 2.9, diff: 2, topics: ["Line equations", "Angle between lines", "Family of lines"] },
  { name: "Circles", main: 1, adv: 0.5, wm: 3, wa: 2.9, diff: 3, topics: ["Equation of circle", "Tangents", "Radical axis"] },
  { name: "Conic Sections", main: 2, adv: 1.5, wm: 6, wa: 8.8, diff: 4, topics: ["Parabola", "Ellipse", "Hyperbola"] },
  { name: "3D Geometry", main: 2.5, adv: 0.5, wm: 8, wa: 2.9, diff: 3, topics: ["Direction cosines", "Planes", "Lines in 3D", "Shortest distance"] },
  { name: "Vector Algebra", main: 1, adv: 0.5, wm: 4, wa: 2.9, diff: 3, topics: ["Vector operations", "Dot and cross product", "Scalar triple product"] },
  { name: "Probability", main: 2, adv: 1, wm: 7, wa: 5.9, diff: 3, topics: ["Classical probability", "Conditional probability", "Bayes' theorem", "Binomial distribution"] },
  { name: "Statistics", main: 0.5, adv: 0, wm: 2.5, wa: 0, diff: 1, topics: ["Mean and variance", "Standard deviation", "Correlation"] },
  { name: "Trigonometry", main: 1.5, adv: 0.5, wm: 4.5, wa: 2.9, diff: 3, topics: ["Trigonometric identities", "Inverse trigonometric functions", "Solution of triangles", "Heights and distances"] },
  { name: "Mathematical Reasoning", main: 0, adv: 0, wm: 0, wa: 0, diff: 1, topics: ["Statements", "Logical operations", "Truth tables"] },
];

const SUBJECTS: Record<string, ChapterSeed[]> = {
  Physics: PHYSICS,
  Chemistry: CHEMISTRY,
  Mathematics: MATHEMATICS,
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000);

// deterministic pseudo-random
let seed = 42;
const rand = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (a: number, b: number) => a + rand() * (b - a);

async function main() {
  console.log("Seeding syllabus...");
  for (const [subject, chapters] of Object.entries(SUBJECTS)) {
    for (const c of chapters) {
      await prisma.chapter.upsert({
        where: { subject_slug: { subject, slug: slugify(c.name) } },
        create: {
          subject,
          branch: c.branch,
          name: c.name,
          slug: slugify(c.name),
          jeeMainRelevance: Math.max(1, Math.min(5, Math.round(c.main * 2))),
          jeeAdvRelevance: Math.max(1, Math.min(5, Math.round(c.adv * 2.5))),
          difficulty: c.diff,
          avgQuestionsMain: c.main,
          avgQuestionsAdv: c.adv,
          weightageMain: c.wm,
          weightageAdv: c.wa,
          topics: { create: c.topics.map((t, i) => ({ name: t, order: i })) },
        },
        update: {
          weightageMain: c.wm,
          weightageAdv: c.wa,
          avgQuestionsMain: c.main,
          avgQuestionsAdv: c.adv,
        },
      });
    }
  }

  await seedYearWeightages();
  await seedDemoUser();
}

// ---------- year-wise weightage (2026 only) ----------

const WEIGHTAGE_YEARS = [2026];

async function seedYearWeightages() {
  console.log("Seeding year-wise weightage (2026)...");
  const chapters = await prisma.chapter.findMany({ orderBy: { id: "asc" } });
  await prisma.chapterWeightage.deleteMany({});

  const rows: {
    chapterId: string;
    year: number;
    exam: string;
    questions: number;
    weightage: number;
  }[] = [];

  for (const ch of chapters) {
    for (const exam of ["main", "advanced"] as const) {
      const baseW = exam === "main" ? ch.weightageMain : ch.weightageAdv;
      const baseQ = exam === "main" ? ch.avgQuestionsMain : ch.avgQuestionsAdv;
      rows.push({
        chapterId: ch.id,
        year: 2026,
        exam,
        weightage: Math.round(baseW * 10) / 10,
        questions: Math.round(baseQ * 10) / 10,
      });
    }
  }

  await prisma.chapterWeightage.createMany({ data: rows });
  console.log(`Seeded ${rows.length} year-weightage rows.`);
}

async function seedDemoUser() {
  const demoEmail = "demo@jee.app";
  const existing = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (existing) {
    console.log("Demo user already exists, skipping demo data.");
    return;
  }

  console.log("Creating demo user...");
  const user = await prisma.user.create({
    data: {
      email: demoEmail,
      name: "Demo Student",
      passwordHash: await bcrypt.hash("demo1234", 12),
      profile: { create: { targetExam: "both", targetYear: 2027, targetPercentile: 99.2, targetRank: 5000, dailyStudyTargetMinutes: 360, dailyQuestionTarget: 60 } },
      preferences: { create: {} },
    },
  });

  const chapters = await prisma.chapter.findMany({ include: { topics: true } });

  // chapter states: mixed statuses
  console.log("Seeding chapter states...");
  const statuses = ["mastered", "completed", "completed", "learning", "learning", "revision_due", "not_started"];
  for (const ch of chapters) {
    const r = rand();
    let status: string;
    if (r < 0.12) status = "mastered";
    else if (r < 0.35) status = "completed";
    else if (r < 0.55) status = "learning";
    else if (r < 0.62) status = "revision_due";
    else status = "not_started";
    if (status === "not_started") continue;
    const solved = Math.floor(between(20, 220));
    const acc = between(0.45, 0.92);
    const state = await prisma.chapterState.create({
      data: {
        userId: user.id,
        chapterId: ch.id,
        status,
        confidence: Math.max(1, Math.min(5, Math.round(acc * 5))),
        questionsSolved: solved,
        questionsCorrect: Math.round(solved * acc),
        lastStudiedAt: daysAgo(Math.floor(between(0, 25))),
        nextRevisionAt: status === "revision_due" ? daysAgo(2) : daysFromNow(Math.floor(between(1, 20))),
        revisionCount: Math.floor(between(0, 4)),
        topics: {
          create: (status === "mastered" || status === "completed"
            ? ch.topics
            : ch.topics.slice(0, Math.max(1, Math.floor(ch.topics.length / 2)))
          ).map((t) => ({ topicId: t.id, done: true })),
        },
      },
    });
    void state;
  }

  // study sessions: last 90 days, mostly consistent with some gaps
  console.log("Seeding study sessions...");
  const sessionTypes = ["concept", "practice", "revision", "lecture", "reading", "analysis"];
  const studied = await prisma.chapterState.findMany({ where: { userId: user.id }, include: { chapter: true } });
  for (let d = 90; d >= 0; d--) {
    const skip = rand() < 0.18; // rest days
    if (skip) continue;
    const nSessions = 1 + Math.floor(rand() * 3);
    for (let s = 0; s < nSessions; s++) {
      const st = pick(studied);
      const dur = Math.floor(between(30, 120));
      const hour = 7 + Math.floor(rand() * 14);
      const start = daysAgo(d);
      start.setHours(hour, Math.floor(rand() * 60), 0, 0);
      await prisma.studySession.create({
        data: {
          userId: user.id,
          subject: st.chapter.subject,
          chapterId: st.chapterId,
          type: pick(sessionTypes),
          startedAt: start,
          endedAt: new Date(start.getTime() + dur * 60000),
          durationMinutes: dur,
        },
      });
    }
  }

  // question logs: last 60 days
  console.log("Seeding question logs...");
  for (let d = 60; d >= 0; d -= 1) {
    if (rand() < 0.3) continue;
    const st = pick(studied);
    const total = Math.floor(between(15, 70));
    const acc = between(0.5, 0.9);
    const correct = Math.round(total * acc);
    await prisma.questionLog.create({
      data: {
        userId: user.id,
        subject: st.chapter.subject,
        chapterId: st.chapterId,
        total,
        correct,
        incorrect: total - correct,
        date: daysAgo(d),
      },
    });
  }

  // mock tests: 10 over 90 days, improving trend
  console.log("Seeding mock tests...");
  const sources = ["Allen Major", "Aakash AIATS", "Physics Wallash", "Resonance Part Test", "NTA Abhyas"];
  for (let i = 0; i < 10; i++) {
    const t = 9 - i; // newer = higher
    const totalMarks = 300;
    const marks = 130 + t * 7 + Math.floor(between(-12, 12));
    const attempted = 55 + Math.floor(between(0, 12));
    const correct = Math.round(attempted * (0.55 + t * 0.028 + between(-0.03, 0.03)));
    const incorrect = attempted - correct;
    const p = marks * (0.36 + between(-0.05, 0.05));
    const c = marks * (0.33 + between(-0.05, 0.05));
    await prisma.mockTest.create({
      data: {
        userId: user.id,
        name: `${pick(sources)} #${i + 1}`,
        date: daysAgo(90 - i * 9),
        examType: rand() < 0.7 ? "main" : "advanced",
        source: pick(sources),
        totalMarks,
        marksObtained: marks,
        physicsMarks: Math.round(p),
        chemistryMarks: Math.round(c),
        mathsMarks: Math.round(marks - p - c),
        attempted,
        correct,
        incorrect,
        skipped: 75 - attempted,
        timeMinutes: 180,
        negativeMarks: incorrect,
        percentile: 92 + i * 0.65 + between(-0.5, 0.5),
      },
    });
  }

  // mistakes
  console.log("Seeding mistakes...");
  const mistakeTypes = ["conceptual", "calculation", "silly", "misread", "formula_forgotten", "time_pressure", "guessing"];
  const topicsAll = await prisma.topic.findMany({ include: { chapter: true } });
  for (let i = 0; i < 24; i++) {
    const t = pick(topicsAll);
    await prisma.mistake.create({
      data: {
        userId: user.id,
        subject: t.chapter.subject,
        chapterId: t.chapterId,
        topicId: t.id,
        question: `Q: ${t.name} — JEE-level problem where the correct approach involved applying the core concept carefully. (Demo entry)`,
        myReasoning: "Applied the standard formula but missed the edge case in the problem statement.",
        solution: "Use the constraint given in the second line of the question before substituting values.",
        source: pick(["Allen DPP", "HC Verma", "Cengage", "PYQ 2023", "FIITJEE AITS"]),
        mistakeType: pick(mistakeTypes),
        difficulty: pick(["easy", "medium", "hard"]),
        date: daysAgo(Math.floor(between(0, 45))),
        status: rand() < 0.3 ? "revisited" : "open",
      },
    });
  }

  // revisions due
  console.log("Seeding revisions...");
  for (let i = 0; i < 8; i++) {
    const t = pick(topicsAll);
    await prisma.revision.create({
      data: {
        userId: user.id,
        topicId: t.id,
        subject: t.chapter.subject,
        dueAt: rand() < 0.6 ? daysAgo(Math.floor(between(0, 3))) : daysFromNow(Math.floor(between(1, 5))),
      },
    });
  }

  // goals
  console.log("Seeding goals...");
  await prisma.goal.createMany({
    data: [
      { userId: user.id, title: "Study 6 hours", kind: "daily", metric: "hours", target: 6, current: between(2, 6) },
      { userId: user.id, title: "Solve 60 questions", kind: "daily", metric: "questions", target: 60, current: Math.floor(between(20, 60)) },
      { userId: user.id, title: "Finish Integral Calculus", kind: "weekly", metric: "custom", target: 1, current: 0.6 },
      { userId: user.id, title: "Take 2 mock tests", kind: "weekly", metric: "mocks", target: 2, current: 1 },
      { userId: user.id, title: "JEE Main 99+ percentile", kind: "long_term", metric: "custom", target: 100, current: 97.5 },
      { userId: user.id, title: "JEE Advanced under AIR 5000", kind: "long_term", metric: "custom", target: 100, current: 45 },
    ],
  });

  // journal
  console.log("Seeding journal...");
  const moods = ["focused", "tired", "motivated", "frustrated", "calm", "energetic"];
  for (let i = 0; i < 12; i++) {
    await prisma.journalEntry.create({
      data: {
        userId: user.id,
        date: daysAgo(i * 3),
        title: pick(["Deep work day", "Mock analysis", "Backlog clearing", "Concept building", "Revision sprint"]),
        mood: pick(moods),
        studiedWhat: pick(["Rotational motion + problems", "GOC reaction mechanisms", "Definite integration tricks", "Coordination compounds CFT"]),
        understood: "The core concept finally clicked after redoing the derivation from scratch.",
        struggled: pick(["Rolling without slipping problems", "Cannizzaro vs Aldol conditions", "Definite integral properties"]),
        mistakes: "Rushed two questions and misread the given units.",
        tomorrow: "Revise today's mistakes and solve 20 more questions on the same topic.",
        body: "Good session today. Timer helped me stay off the phone. Need to keep the momentum going this week.",
      },
    });
  }

  // resources
  console.log("Seeding resources...");
  await prisma.resource.createMany({
    data: [
      { userId: user.id, type: "book", title: "HC Verma — Concepts of Physics Vol 1 & 2", subject: "Physics", tags: "fundamentals,problems", favorite: true },
      { userId: user.id, type: "book", title: "Irodov — Problems in General Physics", subject: "Physics", tags: "advanced" },
      { userId: user.id, type: "book", title: "NCERT Chemistry Class 11 & 12", subject: "Chemistry", tags: "must-read,inorganic", favorite: true },
      { userId: user.id, type: "book", title: "MS Chouhan — Organic Chemistry", subject: "Chemistry", tags: "organic" },
      { userId: user.id, type: "book", title: "Cengage Mathematics Series", subject: "Mathematics", tags: "problems" },
      { userId: user.id, type: "video", title: "Rotational Motion full course", url: "https://www.youtube.com/results?search_query=rotational+motion+jee", subject: "Physics", tags: "lectures" },
      { userId: user.id, type: "website", title: "NTA Abhyas App mocks", url: "https://nta.ac.in/", subject: "Physics", tags: "mocks" },
      { userId: user.id, type: "problem_set", title: "PYQ last 10 years — all subjects", subject: "Physics", tags: "pyq", favorite: true, completed: false },
      { userId: user.id, type: "notes", title: "Short notes — Organic reagents map", subject: "Chemistry", tags: "revision" },
    ],
  });

  console.log("Seed complete. Demo login: demo@jee.app / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
