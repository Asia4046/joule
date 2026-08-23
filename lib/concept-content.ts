export type ConceptSection = { heading: string; body: string[] };
export type ConceptFormula = { tex: string; label: string; note?: string };
export type ConceptContent = {
  title: string;
  tagline: string;
  simTitle: string;
  simAbout: string;
  /** Defaults to "Physics" — used for chapter lookups on the lab page. */
  subject?: "Physics" | "Chemistry";
  sections: ConceptSection[];
  formulas: ConceptFormula[];
  tips: string[];
};

export const CONCEPT_CONTENT: Record<string, ConceptContent> = {
  "units-and-measurements": {
    title: "Units & Measurement",
    tagline: "Precision, errors and dimensional analysis — the language of every JEE numerical.",
    simTitle: "Precision & error propagation lab",
    simAbout: "Measure a rod with instruments of different least counts; watch random errors build a distribution.",
    sections: [
      {
        heading: "What measurement really means",
        body: [
          "Every physical measurement compares a quantity against a standard unit. The SI system builds all of mechanics from seven base units — length (m), mass (kg), time (s), and others. Everything else (velocity, force, energy) is a derived combination.",
          "No measurement is exact. The least count of the instrument sets the floor on precision, while repeated readings scatter around the true value due to random errors. Systematic errors, by contrast, shift every reading the same way — a zero error in a vernier calipers is the classic example.",
        ],
      },
      {
        heading: "How errors combine",
        body: [
          "For a quantity like x = a + b, absolute errors add: Δx = Δa + Δb. For products and quotients like x = ab²/√c, relative errors add: Δx/x = Δa/a + 2Δb/b + ½Δc/c. The exponent multiplies the relative error — a power of 2 doubles it.",
          "The standard error of the mean of n readings falls as 1/√n: quadruple your readings and your uncertainty halves. That square-root law is why averaging beats single careful readings.",
        ],
      },
      {
        heading: "Dimensional analysis",
        body: [
          "Writing [Force] = M L T⁻² lets you check any equation homogeneity in seconds and predict how a physical quantity scales when you change units. It cannot, however, detect dimensionless errors or find numerical constants.",
          "In JEE, dimensional homogeneity questions and error-propagation numericals appear almost every year — usually as fast 2-minute marks if the rules above are automatic.",
        ],
      },
    ],
    formulas: [
      { tex: "\\Delta x = \\Delta a + \\Delta b", label: "Absolute error, sums" },
      { tex: "\\frac{\\Delta x}{x} = \\frac{\\Delta a}{a} + 2\\frac{\\Delta b}{b} + \\frac{1}{2}\\frac{\\Delta c}{c}", label: "Relative error, x = ab²/√c" },
      { tex: "\\sigma_{\\bar{x}} = \\frac{\\sigma}{\\sqrt{n}}", label: "Standard error of mean" },
      { tex: "\\text{LC} = 1\\,\\text{MSD} - 1\\,\\text{VSD}", label: "Vernier least count" },
      { tex: "[F] = M L T^{-2}", label: "Dimensions of force" },
    ],
    tips: [
      "Relative errors always add — never subtract — because worst cases are assumed in both directions.",
      "In x = aⁿ, the relative error is multiplied by |n|. This is the most common trap in error numericals.",
      "A vernier with n divisions on VSD matching (n−1) MSD has LC = MSD/n — derive it, don't memorise.",
      "Dimensional analysis validates form, not completeness — √2 or 2π factors are invisible to it.",
    ],
  },
  "kinematics": {
    title: "Kinematics",
    tagline: "Describing motion — the projectile problem is JEE's most repeated physics setup.",
    simTitle: "Projectile range lab",
    simAbout: "Set launch speed and angle; compare trajectory, range and time of flight against the 45° optimum.",
    sections: [
      {
        heading: "Independence of components",
        body: [
          "Projectile motion is two independent 1-D motions: uniform velocity horizontally (x = uₓt) and uniform acceleration vertically (v_y = u_y − gt). Gravity never touches the horizontal component — air resistance is always neglected in JEE kinematics unless stated.",
          "Time of flight is fixed by the vertical motion alone; range then follows from T × uₓ. This factorisation is the single most useful idea for solving projectile problems fast.",
        ],
      },
      {
        heading: "The complementary angle trick",
        body: [
          "Ranges are equal for θ and 90° − θ because R = u² sin2θ / g is symmetric about 45°. Maximum range occurs at 45°; for a target at height h, the optimal angle is below 45°.",
          "On an inclined plane, rotate axes: take x along the incline, g splits into g sinθ along it, and the same kinematic equations apply in the rotated frame with effective gravity components.",
        ],
      },
      {
        heading: "Relative velocity",
        body: [
          "River-boat, rain-man and interception problems all reduce to v_rel = v_object − v_observer. To cross a river in minimum time, head straight across; to cross at the shortest path, head upstream so the resultant is perpendicular to the flow.",
          "For interception (a chaser aiming at a target), require relative velocity along the line joining them — the relative distance must close to zero along that line.",
        ],
      },
    ],
    formulas: [
      { tex: "R = \\frac{u^2 \\sin 2\\theta}{g}", label: "Range (level ground)" },
      { tex: "T = \\frac{2u\\sin\\theta}{g}", label: "Time of flight" },
      { tex: "H = \\frac{u^2 \\sin^2\\theta}{2g}", label: "Maximum height" },
      { tex: "R_{\\theta} = R_{90°-\\theta}", label: "Complementary angles" },
      { tex: "x = u_x t,\\quad y = u_y t - \\tfrac{1}{2}g t^2", label: "Parametric trajectory" },
    ],
    tips: [
      "At the highest point vertical velocity is zero but horizontal velocity u cosθ survives — speed there is u cosθ, not zero.",
      "For θ and 90°−θ: same range, but times of flight differ (ratio tanθ).",
      "In river crossing, minimum time uses full boat speed across; drift = v_river × T.",
      "Use v² = u² + 2as to avoid solving quadratics when time is not asked.",
    ],
  },
  "laws-of-motion": {
    title: "Laws of Motion",
    tagline: "Free body diagrams, friction and constraint relations — the engine of JEE mechanics.",
    simTitle: "Friction & FBD sandbox",
    simAbout: "Push a block with adjustable force, mass and μ; watch the FBD arrows and motion respond.",
    sections: [
      {
        heading: "Newton's laws in problem form",
        body: [
          "The second law, F_net = ma, is a vector statement — apply it axis by axis after drawing a free body diagram. The FBD is not decoration; every mark in a mechanics problem depends on getting it right.",
          "Static friction is self-adjusting up to f_max = μ_s N. Until the applied force exceeds μ_s N the block stays put and friction exactly cancels the push. Once sliding, kinetic friction μ_k N takes over and is constant regardless of speed.",
        ],
      },
      {
        heading: "Connected bodies and constraints",
        body: [
          "For a string over a frictionless pulley, tension is the same throughout and accelerations are linked by the string's geometry. Write one FBD per body, then impose the constraint (e.g. a₂ = 2a₁ for a movable pulley).",
          "On an inclined plane, resolve along and perpendicular to the slope. The normal force is mg cosθ — never mg — and tanθ_c = μ_s defines the angle of repose.",
        ],
      },
      {
        heading: "Pseudo-forces and momentum",
        body: [
          "In a non-inertial (accelerating) frame, add a pseudo-force −ma_frame to every body and solve normally. Lift-off and sliding problems inside accelerating vehicles become trivial this way.",
          "Impulse J = FΔt = Δp connects force-time graphs to momentum change — the area under an F–t curve is the impulse delivered.",
        ],
      },
    ],
    formulas: [
      { tex: "f_s \\le \\mu_s N, \\quad f_k = \\mu_k N", label: "Static & kinetic friction" },
      { tex: "a = \\frac{F - \\mu m g}{m}", label: "Block under horizontal push" },
      { tex: "a = g(\\sin\\theta - \\mu\\cos\\theta)", label: "Slide down an incline" },
      { tex: "\\tan\\theta_{\\text{repose}} = \\mu_s", label: "Angle of repose" },
      { tex: "\\vec{J} = \\int F\\,dt = \\Delta \\vec{p}", label: "Impulse–momentum" },
    ],
    tips: [
      "μ_s > μ_k always — a block needs more force to start moving than to keep it moving.",
      "For stacked blocks, check which interface slips first by comparing required friction with f_max at each surface.",
      "In wedge problems with no external force, momentum conservation of (block + wedge) along the horizontal is the fastest route.",
      "Normal force is zero at the top of a vertical circle inside a loop — that condition gives the minimum speed √(gR).",
    ],
  },
  "work-energy-and-power": {
    title: "Work, Energy & Power",
    tagline: "Energy bookkeeping turns hard force problems into one-line solutions.",
    simTitle: "Energy transformation ramp",
    simAbout: "Slide a block down a rough incline; watch potential energy split into kinetic and heat in real time.",
    sections: [
      {
        heading: "The work–energy theorem",
        body: [
          "The net work done on a body equals its change in kinetic energy: W_net = ΔKE. This holds for variable forces too — you just integrate F·ds along the path. It converts a force problem into an energy audit.",
          "Work by a constant force is W = F s cosθ, so forces perpendicular to motion (normal force, magnetic Lorentz force) never do work. Friction's work is negative and path-dependent — it converts mechanical energy into heat.",
        ],
      },
      {
        heading: "Conservative forces and potentials",
        body: [
          "Gravity and ideal springs are conservative: work depends only on endpoints, which lets you define potential energy (U = mgh, U = ½kx²). The mechanical energy KE + U is conserved when only conservative forces act.",
          "With friction present, use Δ(KE + U) = −f × distance slid. On the sim's ramp you can see exactly this split: the height lost becomes kinetic plus the heat shown as a red bar.",
        ],
      },
      {
        heading: "Power",
        body: [
          "Instantaneous power P = F·v. For a vehicle moving at constant speed against resistance, the engine's power sets the maximum speed: P = F_resistance × v_max.",
          "Elastic collisions conserve both momentum and KE; inelastic ones conserve momentum only. A completely inelastic collision has the bodies moving together afterwards — maximum KE loss consistent with momentum conservation.",
        ],
      },
    ],
    formulas: [
      { tex: "W_{\\text{net}} = \\Delta KE", label: "Work–energy theorem" },
      { tex: "KE + U = \\text{const}", label: "Conservation, conservative forces" },
      { tex: "W_f = -\\mu m g \\cos\\theta \\cdot s", label: "Work by friction (incline)" },
      { tex: "P = \\vec{F}\\cdot\\vec{v}", label: "Instantaneous power" },
      { tex: "U_s = \\tfrac{1}{2}k x^2", label: "Spring potential energy" },
    ],
    tips: [
      "Normal force and centripetal components of gravity do zero work — skipping them saves time in energy equations.",
      "For vertical circles (string case), use energy conservation between bottom and top plus the tension condition at the top.",
      "In collisions, momentum conservation applies during the collision even with external forces — the collision interval is too short for impulse.",
      "Efficiency questions: useful power / input power; expect η < 1 with friction present.",
    ],
  },
  "rotational-motion": {
    title: "Rotational Motion",
    tagline: "Moment of inertia, torque and angular momentum — where JEE separates the well-drilled from the rest.",
    simTitle: "Angular momentum skater",
    simAbout: "Slide the masses inward: I drops, ω rises, L stays constant — and KE climbs (your arms did work).",
    sections: [
      {
        heading: "Moment of inertia is the new mass",
        body: [
          "Rotational dynamics mirrors linear dynamics: I replaces m, τ replaces F, α replaces a, L = Iω replaces p = mv. Moment of inertia depends on the axis — always confirm which axis the problem means before using a formula.",
          "The parallel-axis theorem I = I_cm + Md² shifts the axis; the perpendicular-axis theorem applies to planar bodies only: I_z = I_x + I_y.",
        ],
      },
      {
        heading: "Rolling without slipping",
        body: [
          "The rolling condition v = ωR ties linear and angular motion together. Total KE of a rolling body is ½mv²(1 + k) where k = I/mR² — the shape factor. A sphere (k = 2/5) has less energy locked in rotation than a ring (k = 1), so it accelerates faster downhill: a = g sinθ / (1 + k).",
          "The race order down any incline is independent of mass and radius: sphere > disk > ring. The sim shows exactly this — a beautiful consequence of energy partitioning.",
        ],
      },
      {
        heading: "Angular momentum conservation",
        body: [
          "With zero external torque about an axis, L = Iω is conserved. A spinning skater pulling in her arms, a collapsing star, or a person walking on a rotating platform — all the same equation.",
          "For combined translation + rotation, analyse the system's L about a fixed point (often the contact point or pivot) to eliminate unknown reaction forces.",
        ],
      },
    ],
    formulas: [
      { tex: "a = \\frac{g\\sin\\theta}{1 + I/mR^2}", label: "Rolling acceleration down incline" },
      { tex: "KE = \\tfrac{1}{2}mv^2\\left(1 + \\tfrac{I}{mR^2}\\right)", label: "Total KE when rolling" },
      { tex: "I = I_{cm} + Md^2", label: "Parallel axis theorem" },
      { tex: "\\tau = I\\alpha, \\quad L = I\\omega", label: "Rotational second law" },
      { tex: "v_{\\text{top}} = 2v_{cm},\\; v_{\\text{bot}} = 0", label: "Rolling velocity distribution" },
    ],
    tips: [
      "Ring k=1, disk k=½, solid sphere k=⅖, hollow sphere k=⅔ — memorise the shape factor, not the full I.",
      "Friction in rolling without slipping is static and does no net work — the contact point has zero velocity.",
      "For a body rolling down an incline, friction provides the torque but gravity provides the energy.",
      "Angular momentum about the contact point of a rolling body is L = I_cm ω + mvR — useful in instantaneous-axis problems.",
    ],
  },
  "gravitation": {
    title: "Gravitation",
    tagline: "Orbits, escape velocity and the inverse-square law that binds the solar system.",
    simTitle: "Orbital mechanics sandbox",
    simAbout: "Launch a satellite at different speeds; trace circles, ellipses and escape trajectories.",
    sections: [
      {
        heading: "The inverse-square law",
        body: [
          "Newton's law F = GMm/r² gives the gravitational field g = GM/r² of a point (or spherical) mass. Outside a uniform sphere, the field behaves as if all mass were at the centre; inside a uniform sphere it grows linearly with r.",
          "Gravitational PE is U = −GMm/r with the zero chosen at infinity. The negative sign encodes the binding: you must supply +GMm/r to separate the masses infinitely.",
        ],
      },
      {
        heading: "Orbits",
        body: [
          "Setting gravity as centripetal force gives v_c = √(GM/r) for a circular orbit. The period follows Kepler's third law: T² ∝ r³. Escape needs v_e = √(2GM/r) — exactly √2 times the circular speed at that radius.",
          "Launch between v_c and v_e and you get an ellipse (Kepler's first law); exactly v_e, a parabola; beyond, a hyperbola. The sim lets you see all four families by dragging one slider.",
        ],
      },
      {
        heading: "Kepler and energy in orbit",
        body: [
          "Kepler's second law (equal areas in equal times) is angular momentum conservation — it holds for any central force, not just inverse-square.",
          "Total orbital energy is E = −GMm/2r: negative for bound orbits, and equal to half the potential energy. To move a satellite from radius r₁ to r₂, compute ΔE directly rather than integrating forces.",
        ],
      },
    ],
    formulas: [
      { tex: "v_c = \\sqrt{\\frac{GM}{r}}", label: "Circular orbit speed" },
      { tex: "v_e = \\sqrt{\\frac{2GM}{r}} = \\sqrt{2}\\,v_c", label: "Escape velocity" },
      { tex: "T^2 = \\frac{4\\pi^2 r^3}{GM}", label: "Kepler's third law" },
      { tex: "U = -\\frac{GMm}{r}, \\quad E = -\\frac{GMm}{2r}", label: "Orbital energies" },
      { tex: "g_h = g\\left(\\frac{R}{R+h}\\right)^2", label: "g at height h" },
    ],
    tips: [
      "Escape velocity is independent of the satellite's mass and launch direction (energy is a scalar).",
      "Geostationary orbit: T = 24 h, equatorial, west-to-east — about 42,000 km from Earth's centre.",
      "Inside a uniform density sphere, g ∝ r; at the surface it's maximum.",
      "Binding energy of an orbiting satellite = GMm/2r — the energy to take it to infinity.",
    ],
  },
  "properties-of-solids-and-liquids": {
    title: "Properties of Solids & Liquids",
    tagline: "Elasticity, viscosity and surface tension — the everyday physics JEE loves to test.",
    simTitle: "Viscous drag: terminal velocity",
    simAbout: "Drop a ball into fluids of different viscosities; watch velocity approach terminal value.",
    sections: [
      {
        heading: "Elasticity",
        body: [
          "Within the elastic limit, stress/strain is a constant: Young's modulus (length), bulk modulus (volume), shear modulus (shape). The interatomic origin is the same — the slope of the interatomic potential well.",
          "For a wire of length L, area A under load mg, elongation is ΔL = mgL/(YA). Thermal stress arises even with fixed ends: σ = YαΔθ.",
        ],
      },
      {
        heading: "Viscosity and Stokes' law",
        body: [
          "Viscous force between layers is F = −ηA dv/dy. A sphere of radius r moving at v through a fluid experiences Stokes drag 6πηrv. Falling under gravity, it accelerates until 6πηrv = mg (buoyancy-corrected), giving the terminal velocity in the sim.",
          "Terminal velocity scales as r² — a raindrop twice as big falls four times faster. Below terminal velocity, the v–t curve is exponential approach, exactly what the sim plots.",
        ],
      },
      {
        heading: "Surface tension and capillarity",
        body: [
          "Surface tension S is energy per unit area (or force per unit length). It makes drops spherical, supports insects on water, and drives capillary rise h = 2S cosθ/(ρgr).",
          "Excess pressure inside a drop is 2S/r (soap bubble: 4S/r) — smaller drops have higher internal pressure, which is why two bubbles of different sizes connected by a tube evolve counter-intuitively.",
        ],
      },
    ],
    formulas: [
      { tex: "\\Delta L = \\frac{FL}{AY}", label: "Young's modulus elongation" },
      { tex: "F = 6\\pi \\eta r v", label: "Stokes' law" },
      { tex: "v_t = \\frac{2r^2(\\rho-\\sigma)g}{9\\eta}", label: "Terminal velocity" },
      { tex: "h = \\frac{2S\\cos\\theta}{\\rho g r}", label: "Capillary rise" },
      { tex: "\\Delta P = \\frac{2S}{r}", label: "Excess pressure in a drop" },
    ],
    tips: [
      "Terminal velocity assumes low Reynolds number — Stokes' law fails for large, fast spheres.",
      "In capillarity, mercury has θ > 90° so it depresses; cosθ carries the sign.",
      "Bernoulli problems: pick two points along a streamline, one where pressure/velocity is known.",
      "Elastic PE of a stretched wire = ½ × stress × strain × volume.",
    ],
  },
  "thermodynamics": {
    title: "Thermodynamics",
    tagline: "PV diagrams, the first law and processes — guaranteed marks in every JEE paper.",
    simTitle: "Piston & PV diagram",
    simAbout: "Compress a gas isothermally or adiabatically; see the curve traced and work/heat accumulate.",
    sections: [
      {
        heading: "The first law",
        body: [
          "ΔQ = ΔU + W: heat supplied either raises internal energy or does work. For an ideal gas, U depends only on temperature — ΔU = nC_v ΔT regardless of the process. That single fact unlocks most JEE thermodynamics.",
          "Sign conventions matter: W is positive when the gas expands (does work on the piston). Work is the area under the PV curve — on the sim you can watch that area being swept out live.",
        ],
      },
      {
        heading: "The four processes",
        body: [
          "Isothermal (ΔT = 0): PV = const, W = nRT ln(V₂/V₁). Adiabatic (ΔQ = 0): PV^γ = const, steeper than an isotherm — compression heats the gas, as the sim shows by the temperature readout.",
          "Isochoric (ΔV = 0): no work, all heat goes to ΔU. Isobaric: W = PΔV. Cyclic processes return to the start: ΔU = 0 over the cycle and net work equals the enclosed area — positive clockwise.",
        ],
      },
      {
        heading: "Efficiency and the second law",
        body: [
          "A Carnot engine between T_h and T_c has η = 1 − T_c/T_h — the ceiling no real engine exceeds. Refrigerators invert it: COP = T_c/(T_h − T_c).",
          "The second law forbids a perfect engine or perfect refrigerator; entropy of an isolated system never decreases.",
        ],
      },
    ],
    formulas: [
      { tex: "\\Delta Q = \\Delta U + W", label: "First law" },
      { tex: "PV^\\gamma = \\text{const}", label: "Adiabatic relation" },
      { tex: "W_{\\text{iso}} = nRT\\ln\\frac{V_2}{V_1}", label: "Isothermal work" },
      { tex: "C_p - C_v = R", label: "Mayer's relation" },
      { tex: "\\eta = 1 - \\frac{T_c}{T_h}", label: "Carnot efficiency" },
    ],
    tips: [
      "For any ideal-gas process, ΔU = nC_vΔT — even adiabatic and cyclic steps.",
      "Adiabatic curves are steeper than isotherms through the same point (factor γ).",
      "In cyclic processes, net work = enclosed PV area; direction (clockwise) sets the sign.",
      "γ = 5/3 monatomic, 7/5 diatomic — C_v = R/(γ−1) recovers everything.",
    ],
  },
  "oscillations-and-waves": {
    title: "Oscillations & Waves",
    tagline: "SHM, damping, resonance and the wave equation — the heart of JEE physics.",
    simTitle: "Damped & forced oscillator",
    simAbout: "Tune ζ to move between under, critical and over damping; add forcing to hunt for resonance.",
    sections: [
      {
        heading: "Simple harmonic motion",
        body: [
          "SHM is any motion where restoring force ∝ −displacement: a = −ω²x. The solution x(t) = A cos(ωt + φ) with ω fixed by the system — √(k/m) for a spring, √(g/L) for a pendulum. Energy oscillates between kinetic and potential at 2ω while the total stays ½kA².",
          "A damped oscillator adds a drag term −bv: x(t) = A e^(−ζω₀t) cos(ω_d t) with ω_d = ω₀√(1−ζ²). The envelope decays exponentially — visible directly on the sim's time trace.",
        ],
      },
      {
        heading: "The three damping regimes",
        body: [
          "ζ < 1 underdamped: oscillations with decaying amplitude. ζ = 1 critically damped: fastest return to equilibrium with no overshoot — what car suspensions and galvanometers aim for. ζ > 1 overdamped: sluggish return. The Q factor Q = 1/2ζ measures how many cycles it takes to decay.",
          "Add sinusoidal forcing and the steady-state amplitude peaks near ω₀ when damping is light — resonance. Heavier damping flattens and shifts the peak lower, as the sim's response curve shows.",
        ],
      },
      {
        heading: "Waves",
        body: [
          "A travelling wave y(x,t) = A sin(kx − ωt + φ) moves with v = ω/k = √(T/μ) on a string, v = √(γRT/M) in a gas. The medium doesn't travel — each element just oscillates in place.",
          "Superposition of two waves travelling oppositely gives standing waves y = 2A sin kx cos ωt: nodes every λ/2. Strings fixed at both ends select f_n = nv/2L; open and closed pipes do the same for air columns (a closed pipe supports only odd harmonics).",
        ],
      },
    ],
    formulas: [
      { tex: "x(t) = A e^{-\\zeta\\omega_0 t}\\cos(\\omega_d t + \\varphi)", label: "Damped oscillation" },
      { tex: "\\omega_d = \\omega_0\\sqrt{1-\\zeta^2}", label: "Damped frequency" },
      { tex: "\\zeta = \\frac{b}{2\\sqrt{km}}", label: "Damping ratio" },
      { tex: "Q = \\frac{1}{2\\zeta}", label: "Quality factor" },
      { tex: "v = f\\lambda = \\sqrt{T/\\mu}", label: "Wave speed on a string" },
      { tex: "y = 2A\\sin kx\\,\\cos\\omega t", label: "Standing wave" },
    ],
    tips: [
      "ζ ≥ 1 kills oscillation; ω_d exists only for ζ < 1.",
      "At resonance (light damping) displacement lags the force by 90°; amplitude ~ Q × static response.",
      "In SHM, velocity is maximum at equilibrium and zero at extremes; acceleration peaks at extremes.",
      "Beat frequency = |f₁ − f₂| — superposition of close frequencies, not a new wave.",
    ],
  },
  "electrostatics": {
    title: "Electrostatics",
    tagline: "Coulomb's law, fields and potential — the foundation of all electromagnetism.",
    simTitle: "Electric field explorer",
    simAbout: "Drag two charges, adjust their magnitudes, and watch field lines and test charges respond.",
    sections: [
      {
        heading: "Charge and Coulomb's law",
        body: [
          "Like charges repel with F = kq₁q₂/r² (k = 9×10⁹ N m²/C²). Charge is quantised in units of e and always conserved. Coulomb forces superpose linearly — the net force on a charge is the vector sum over all others.",
          "The field concept replaces action-at-a-distance: E = F/q. Field lines start on positive charges, end on negatives, never cross, and their density encodes strength. The sim draws them exactly by this rule.",
        ],
      },
      {
        heading: "Potential and energy",
        body: [
          "Potential V = kq/r is a scalar — potentials simply add. The field is the negative gradient of V: E = −dV/dr, so equipotential surfaces are perpendicular to field lines and no work is done moving along one.",
          "A dipole (charges ±q separated by 2a) has moment p = 2aq pointing − to +. Its far field falls as 1/r³ and it feels τ = pE sinθ in a uniform field, plus a net force only in a non-uniform field.",
        ],
      },
      {
        heading: "Gauss's law",
        body: [
          "∮E·dA = q_enclosed/ε₀. Exploit symmetry: outside a charged sphere the field is as if all charge sat at the centre; inside a uniformly charged sphere it grows linearly; for an infinite line or plane the Gaussian pillbox gives E = λ/2πε₀r and σ/2ε₀.",
          "Conductors in electrostatic equilibrium have E = 0 inside, all charge on the surface, and the surface is an equipotential — cavity fields vanish unless charge sits inside the cavity.",
        ],
      },
    ],
    formulas: [
      { tex: "F = \\frac{k q_1 q_2}{r^2}", label: "Coulomb's law" },
      { tex: "E = \\frac{kq}{r^2}, \\quad V = \\frac{kq}{r}", label: "Point charge field & potential" },
      { tex: "U = \\frac{k q_1 q_2}{r}", label: "Pair potential energy" },
      { tex: "\\oint \\vec{E}\\cdot d\\vec{A} = \\frac{q_{enc}}{\\varepsilon_0}", label: "Gauss's law" },
      { tex: "\\tau = \\vec{p}\\times\\vec{E}", label: "Dipole torque" },
    ],
    tips: [
      "Field lines never intersect — two directions at one point would be unphysical.",
      "Zero V does not imply zero E (midpoint of a dipole) and vice versa (inside a conductor).",
      "For symmetric charge distributions, Gauss's law beats direct integration every time.",
      "Work by an external agent to assemble charges = total electrostatic PE, counted pair by pair.",
    ],
  },
  "current-electricity": {
    title: "Current Electricity",
    tagline: "Drift velocity, Ohm's law and circuits — reliable marks with clean technique.",
    simTitle: "Drift velocity circuit",
    simAbout: "Set EMF and resistance; watch electron drift speed, current and bulb brightness respond.",
    sections: [
      {
        heading: "Current and drift",
        body: [
          "Current I = dq/dt = nAe v_d, where v_d is the tiny drift velocity (~mm/s) superimposed on thermal speeds (~10⁶ m/s). The electric field establishing the drift travels near light speed — that's why the lamp lights instantly.",
          "v_d = eEτ/m, with τ the relaxation time. Despite the slow drift, heating is enormous because energy transfer is via the field doing work on electrons that constantly collide with the lattice.",
        ],
      },
      {
        heading: "Circuit laws",
        body: [
          "Ohm's law V = IR holds for metallic conductors at fixed temperature. Series resistances add; parallel conductances add. Kirchhoff's junction rule is charge conservation, the loop rule is energy conservation.",
          "A real cell has internal resistance r: terminal voltage V = ε − Ir, maximum at zero current. Maximum power transfer to R occurs at R = r — visible in the sim as brightness peaking then falling.",
        ],
      },
      {
        heading: "Wheatstone bridge and meters",
        body: [
          "A balanced Wheatstone bridge (P/Q = R/S) draws no current through the galvanometer — the basis of the meter bridge and of practical resistance measurement.",
          "An ammeter is a shunted galvanometer (low resistance, in series); a voltmeter is a multiplied one (high resistance, in parallel). An ideal ammeter has R = 0, an ideal voltmeter R = ∞.",
        ],
      },
    ],
    formulas: [
      { tex: "I = nAev_d", label: "Current from drift velocity" },
      { tex: "v_d = \\frac{eE\\tau}{m}", label: "Drift velocity" },
      { tex: "P = I^2R = \\frac{V^2}{R}", label: "Joule heating" },
      { tex: "V = \\varepsilon - Ir", label: "Terminal voltage" },
      { tex: "\\frac{P}{Q} = \\frac{R}{S}", label: "Wheatstone balance" },
    ],
    tips: [
      "Current is the same through series elements; voltage is the same across parallel ones.",
      "Adding resistors in parallel lowers equivalent R below the smallest branch.",
      "For maximum power transfer, R = r, and efficiency is then only 50%.",
      "Meter bridge errors: end corrections and non-uniform wire — JEE loves these conceptual twists.",
    ],
  },
  "magnetic-effects-of-current": {
    title: "Magnetic Effects of Current",
    tagline: "Biot–Savart, Ampère's law and the Lorentz force — circular motion in a field.",
    simTitle: "Charged particle in a magnetic field",
    simAbout: "Tune q, v and B; trace the circular path and check r = mv/qB live.",
    sections: [
      {
        heading: "Sources of B",
        body: [
          "Biot–Savart gives the field of a current element: dB = (μ₀/4π) I dl × r̂ /r². Integrated, it yields the infinite-wire field B = μ₀I/2πr (the target of Ampère's law) and the loop field at centre B = μ₀I/2R.",
          "Ampère's law ∮B·dl = μ₀ I_enc mirrors Gauss's law: use it when symmetry (long wire, solenoid, toroid) makes B constant on the loop. Inside a long solenoid B = μ₀nI is uniform.",
        ],
      },
      {
        heading: "Force on charges and currents",
        body: [
          "The Lorentz force F = q(v × B) is always perpendicular to v — it does no work, changes direction not speed, and turns a perpendicular velocity into uniform circular motion with r = mv/qB, frequency f = qB/2πm independent of speed.",
          "A current-carrying wire in a field feels F = I L × B; two parallel wires attract (same direction) with force per length μ₀I₁I₂/2πd. A velocity selector crosses E and B: only particles with v = E/B pass straight.",
        ],
      },
      {
        heading: "Applications",
        body: [
          "The cyclotron exploits the speed-independence of the cyclotron frequency to accelerate particles spiral-wise. The mass spectrometer and the Hall effect both measure q/m or carrier density from the radius or voltage of magnetic deflection.",
          "A moving coil galvanometer uses torque NIAB = kφ for a linear current scale; converted to ammeter/voltmeter by shunt/multiplier.",
        ],
      },
    ],
    formulas: [
      { tex: "r = \\frac{mv}{qB}", label: "Radius of circular path" },
      { tex: "f = \\frac{qB}{2\\pi m}", label: "Cyclotron frequency" },
      { tex: "B = \\frac{\\mu_0 I}{2\\pi r}", label: "Infinite wire field" },
      { tex: "\\vec{F} = q(\\vec{v}\\times\\vec{B})", label: "Lorentz force" },
      { tex: "\\vec{F} = I\\vec{L}\\times\\vec{B}", label: "Force on a wire" },
    ],
    tips: [
      "Magnetic force never does work — KE of a charged particle is unchanged by B alone.",
      "If v has a component along B, the path is a helix with unchanged pitch.",
      "Use the right-hand rule consistently: fingers along v (or I), curl toward B; thumb gives force for +q (reverse for −q).",
      "In a velocity selector, E, B and v are mutually perpendicular and v = E/B.",
    ],
  },
  "magnetism-and-matter": {
    title: "Magnetism & Matter",
    tagline: "Bar magnets, materials and the Earth's field — compact but frequently examined.",
    simTitle: "Bar magnet field & compass",
    simAbout: "Place a compass anywhere around a bar magnet; watch it align with the net local field.",
    sections: [
      {
        heading: "The bar magnet",
        body: [
          "A bar magnet behaves as a dipole of moment M: on its axis B = μ₀2M/4πr³, on the equator μ₀M/4πr³. The dipole field lines — closed loops from N to S outside — are what the sim draws around the magnet.",
          "In a uniform field a magnet feels no net force but a torque τ = MB sinθ; in a non-uniform field it also translates, attracting toward stronger field. This is why a compass needle (a small magnet) aligns with the local field wherever you place it.",
        ],
      },
      {
        heading: "Classification of materials",
        body: [
          "Diamagnetic (χ slightly negative) weakly repel and move from stronger to weaker field. Paramagnetic (χ small positive) weakly attract and follow Curie's law χ ∝ 1/T. Ferromagnetic (χ huge) form domains and show hysteresis.",
          "Above the Curie temperature, ferromagnets become paramagnetic. Hard magnets have fat hysteresis loops; soft iron (thin loop) is chosen for electromagnet cores.",
        ],
      },
      {
        heading: "Earth's magnetism",
        body: [
          "The Earth is approximately a dipole with its S-pole near geographic north. Declination is the angle between geographic and magnetic meridians; dip (inclination) is the angle the field makes with horizontal — 0° at the magnetic equator, 90° at the poles.",
          "A tangent law governs a deflecting-magnetometer: tanθ = B_H/B, useful for comparing fields.",
        ],
      },
    ],
    formulas: [
      { tex: "B_{axis} = \\frac{\\mu_0 2M}{4\\pi r^3}", label: "Magnet field on axis" },
      { tex: "\\tau = MB\\sin\\theta", label: "Torque on a magnet" },
      { tex: "U = -\\vec{M}\\cdot\\vec{B}", label: "Dipole potential energy" },
      { tex: "\\chi \\propto \\frac{1}{T}", label: "Curie's law (paramagnetic)" },
      { tex: "B_H = B\\cos\\delta", label: "Horizontal component & dip" },
    ],
    tips: [
      "Field lines inside a magnet run S → N; outside N → S. They are closed loops.",
      "Cutting a magnet in half gives two weaker magnets — monopoles don't exist.",
      "Diamagnetism is present in all materials; it is just masked when para/ferromagnetism exists.",
      "A freely suspended magnet aligns with the local net field — including any external field you add.",
    ],
  },
  "emi-and-alternating-current": {
    title: "EMI & Alternating Current",
    tagline: "Faraday's law, generators and LCR circuits — the electrodynamics of every grid.",
    simTitle: "AC generator & sinusoid",
    simAbout: "Rotate a coil in a magnetic field; watch the emf sinusoid build and RMS markers track it.",
    sections: [
      {
        heading: "Faraday's law",
        body: [
          "A changing flux induces an emf ε = −dΦ/dt; Lenz's minus sign says the induced current opposes the change causing it — energy conservation in disguise. Flux can change via B, area, or orientation: the generator rotates area orientation.",
          "Motional emf B l v of a sliding rod, eddy currents in braking, and transformers (ε₂/ε₁ = N₂/N₁) are all the same law wearing different clothes.",
        ],
      },
      {
        heading: "AC circuits",
        body: [
          "A sinusoidal emf ε = ε₀ sin ωt drives current that lags in an inductor (−90°) and leads in a capacitor (+90°). Impedance combines them geometrically: Z = √(R² + (X_L − X_C)²). At resonance X_L = X_C, Z = R and current peaks — the tuned circuit behind radio.",
          "Average power is P = V_rms I_rms cosφ, with cosφ = R/Z the power factor. RMS values make AC formulas look like DC: P = V²rms/R for a resistor.",
        ],
      },
      {
        heading: "Generators and transformers",
        body: [
          "A coil rotating at ω in field B produces ε₀ = NBAω — the sim's spinning coil with its live sine trace. Slip rings give AC; a split-ring commutator gives DC.",
          "An ideal transformer conserves power: stepping voltage up steps current down. Real losses are resistive (Joule), eddy-current, hysteresis and flux leakage.",
        ],
      },
    ],
    formulas: [
      { tex: "\\varepsilon = -\\frac{d\\Phi}{dt}", label: "Faraday–Lenz law" },
      { tex: "\\varepsilon_0 = NBA\\omega", label: "Peak generator emf" },
      { tex: "Z = \\sqrt{R^2 + (X_L - X_C)^2}", label: "LCR impedance" },
      { tex: "f_0 = \\frac{1}{2\\pi\\sqrt{LC}}", label: "Resonance frequency" },
      { tex: "P = V_{rms} I_{rms}\\cos\\varphi", label: "AC average power" },
    ],
    tips: [
      "Inductor: current lags voltage; capacitor: current leads. Remember 'CIVIL'.",
      "At resonance, V_L = V_C can exceed the source voltage — fine, they cancel.",
      "RMS × √2 = peak for sinusoids only.",
      "Lenz's law direction: induced effects always fight the change in flux, never aid it.",
    ],
  },
  "electromagnetic-waves": {
    title: "Electromagnetic Waves",
    tagline: "Light as a self-sustaining E–B wave — and the full spectrum JEE expects you to know.",
    simTitle: "EM wave propagator",
    simAbout: "See coupled E and B fields oscillating perpendicular to each other and to propagation.",
    sections: [
      {
        heading: "How the wave sustains itself",
        body: [
          "A changing E creates B (Maxwell–Ampère) and a changing B creates E (Faraday). The two fields bootstrap each other into a wave travelling at c = 1/√(μ₀ε₀) ≈ 3×10⁸ m/s in vacuum, needing no medium.",
          "E, B and the propagation direction form a right-handed set; E and B are in phase with E₀ = c B₀. In the sim, the red E field and blue B field oscillate perpendicular to each other along the direction of travel.",
        ],
      },
      {
        heading: "Energy and momentum",
        body: [
          "The Poynting vector S = (1/μ₀) E × B gives energy flux; intensity falls as 1/r² from a point source. Radiation pressure on a perfect absorber is I/c (2I/c for a reflector) — the physics of solar sails.",
          "The spectrum by increasing frequency: radio, microwave, IR, visible (700–400 nm), UV, X-ray, gamma. Production mechanisms differ (oscillating circuits vs hot bodies vs electron bombardment vs nuclear decay).",
        ],
      },
      {
        heading: "Displacement current",
        body: [
          "Between capacitor plates no conduction current flows, yet a magnetic field exists there. Maxwell's displacement current I_d = ε₀ dΦ_E/dt patches Ampère's law and makes the equation set consistent — the keystone that predicts EM waves.",
        ],
      },
    ],
    formulas: [
      { tex: "c = \\frac{1}{\\sqrt{\\mu_0\\varepsilon_0}}", label: "Wave speed in vacuum" },
      { tex: "E_0 = c B_0", label: "Field amplitude relation" },
      { tex: "I = \\frac{1}{2}\\varepsilon_0 c E_0^2", label: "Intensity (sinusoid)" },
      { tex: "P_{\\text{rad}} = \\frac{I}{c}", label: "Radiation pressure (absorber)" },
      { tex: "I_d = \\varepsilon_0 \\frac{d\\Phi_E}{dt}", label: "Displacement current" },
    ],
    tips: [
      "E, B, v form a right-handed triad — use it to fix directions instantly.",
      "Memorise the spectrum order and one production mechanism + one use per band.",
      "In a medium, v = c/n while frequency stays fixed; wavelength shrinks.",
      "EM waves are transverse — they can be polarised, unlike sound.",
    ],
  },
  "ray-optics": {
    title: "Ray Optics",
    tagline: "Mirrors, lenses and images — high-frequency, high-certainty JEE scoring.",
    simTitle: "Lens ray tracer",
    simAbout: "Move the object or change focal length; principal rays construct the image in real time.",
    sections: [
      {
        heading: "Sign convention discipline",
        body: [
          "JEE uses the Cartesian convention: distances measured from the pole/optical centre, positive along incident light (usually rightward). Object distances u are then negative for real objects; convex lenses have positive f, concave negative.",
          "Most ray-optics errors are sign errors. Fix the convention once, apply it mechanically to the mirror formula 1/v + 1/u = 1/f and the lens formula 1/v − 1/u = 1/f.",
        ],
      },
      {
        heading: "Ray construction",
        body: [
          "Three principal rays trace any image: parallel-to-axis through focus; through centre undeviated (lens) or reflected symmetrically (mirror); through focus emerging parallel. The sim draws exactly these.",
          "Magnification m = v/u (lens) or −v/u (mirror) gives image size and orientation. Two lenses in contact: f = f₁f₂/(f₁+f₂); separated systems multiply magnifications.",
        ],
      },
      {
        heading: "Phenomena",
        body: [
          "Total internal reflection occurs beyond the critical angle sin C = 1/n from denser to rarer — the principle of optical fibres and the brilliance of diamonds.",
          "A prism deviates by δ = i + e − A, minimum at symmetric passage with n = sin((A+δm)/2)/sin(A/2). Dispersion splits colours because n varies with λ — violet bends more than red.",
        ],
      },
    ],
    formulas: [
      { tex: "\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}", label: "Lens formula" },
      { tex: "m = \\frac{v}{u}", label: "Lens magnification" },
      { tex: "\\frac{1}{f} = \\frac{1}{f_1} + \\frac{1}{f_2}", label: "Lenses in contact" },
      { tex: "\\sin C = \\frac{1}{n}", label: "Critical angle" },
      { tex: "P = \\frac{1}{f(\\text{m})}", label: "Power in dioptres" },
    ],
    tips: [
      "Convex lens image: real & inverted beyond f, virtual & erect & magnified inside f (the magnifying glass case).",
      "A plane mirror forms a virtual image at equal distance behind; the field of view depends on eye position.",
      "For combinations, process one element at a time — the image of one becomes the object of the next.",
      "Small-angle prism deviation δ = (n−1)A is independent of the angle of incidence.",
    ],
  },
  "wave-optics": {
    title: "Wave Optics",
    tagline: "Interference and diffraction — where light remembers it is a wave.",
    simTitle: "Young's double slit",
    simAbout: "Vary slit separation and wavelength; watch the fringe pattern and width update live.",
    sections: [
      {
        heading: "Interference",
        body: [
          "Two coherent sources superpose: at a screen point with path difference Δ, bright fringes occur at Δ = nλ, dark at (2n−1)λ/2. Young's double slit gives fringe width β = λD/d — proportional to wavelength, inversely to slit separation.",
          "Intensity goes as I = 4I₀ cos²(φ/2): equal-amplitude interference never exceeds 4I₀. If amplitudes differ, the minima are not fully dark — visibility (I_max − I_min)/(I_max + I_min) measures coherence.",
        ],
      },
      {
        heading: "Thin films and coherence",
        body: [
          "Soap-bubble colours come from one extra λ/2 reflection phase at the top surface: constructive reflection needs 2μt cosθ = (2n−1)λ/2. Same physics governs anti-reflective coatings (MgF₂ on lenses, quarter-wave thickness).",
          "Coherence demands a fixed phase relationship. Independent bulbs never interfere; a single source split two ways (division of wavefront or amplitude) always does.",
        ],
      },
      {
        heading: "Diffraction and polarisation",
        body: [
          "Single-slit diffraction: minima at a sinθ = nλ, central maximum twice as wide as the others — interference vs diffraction is 'many sources vs continuum of sources'. The Rayleigh criterion θ = 1.22λ/D sets telescope resolution.",
          "Polarisation (Malus's law I = I₀ cos²θ) proves light is transverse. Brewster's angle tanθ_B = n gives fully polarised reflection — why polaroid sunglasses cut glare off roads.",
        ],
      },
    ],
    formulas: [
      { tex: "\\beta = \\frac{\\lambda D}{d}", label: "Fringe width (YDSE)" },
      { tex: "\\Delta = n\\lambda \\;\\text{(bright)}, \\; (n+\\tfrac{1}{2})\\lambda\\;\\text{(dark)}", label: "Path difference rules" },
      { tex: "I = 4I_0\\cos^2(\\varphi/2)", label: "Intensity distribution" },
      { tex: "a\\sin\\theta = n\\lambda", label: "Single-slit minima" },
      { tex: "I = I_0\\cos^2\\theta", label: "Malus's law" },
    ],
    tips: [
      "Immersing YDSE in a medium shrinks β by factor 1/n — wavelength shortens.",
      "White-light YDSE: central fringe white, coloured fringes symmetric about it.",
      "In a single slit, doubling the slit width halves the central maximum's width and quadruples its intensity.",
      "Interference fringes are equally spaced; diffraction fringes are not.",
    ],
  },
  "dual-nature-of-matter-and-radiation": {
    title: "Dual Nature of Matter & Radiation",
    tagline: "Photons, the photoelectric effect and de Broglie waves — the quantum gateway.",
    simTitle: "Photoelectric effect",
    simAbout: "Sweep light frequency and intensity; watch electrons eject with the right stopping voltage.",
    sections: [
      {
        heading: "The photon",
        body: [
          "Light of frequency ν delivers energy in packets E = hν (h = 6.63×10⁻³⁴ J s). Intensity sets the number of photons per second, not their individual energy — the single fact the wave picture could not explain.",
          "Einstein's photoelectric equation K_max = hν − φ makes the effect instant (no build-up time) and gives a threshold frequency ν₀ = φ/h below which no emission occurs however intense the light.",
        ],
      },
      {
        heading: "Stopping voltage and graphs",
        body: [
          "The stopping potential eV₀ equals K_max, so V₀ = (h/e)ν − φ/e. A V₀–ν graph is a straight line whose slope is h/e (universal) and intercept −φ/e (material-specific). Photocurrent saturates when all emitted electrons are collected.",
          "The sim shows both: electrons leave the metal with speeds set by colour, and the I–V curve bends at −V₀.",
        ],
      },
      {
        heading: "Matter waves",
        body: [
          "de Broglie: any particle with momentum p has wavelength λ = h/p. An electron through a potential V has λ = 1.227/√V nm — the basis of the electron microscope, whose resolution beats optical microscopes by ~10³.",
          "Heisenberg's uncertainty Δx·Δp ≥ h/4π caps how sharply position and momentum can coexist — macroscopic objects are far from this limit, electrons are not.",
        ],
      },
    ],
    formulas: [
      { tex: "E = h\\nu = \\frac{hc}{\\lambda}", label: "Photon energy" },
      { tex: "K_{max} = h\\nu - \\phi", label: "Einstein's equation" },
      { tex: "eV_0 = K_{max}", label: "Stopping potential" },
      { tex: "\\lambda = \\frac{h}{p}", label: "de Broglie wavelength" },
      { tex: "\\lambda_e = \\frac{1.227}{\\sqrt{V}}\\,\\text{nm}", label: "Electron through p.d. V" },
    ],
    tips: [
      "Increasing intensity raises photocurrent but never K_max; only frequency raises K_max.",
      "Below threshold, zero emission — regardless of intensity or exposure time.",
      "Number of photons per second = P/(hν) for a beam of power P.",
      "For the same KE, lighter particles have longer de Broglie wavelengths.",
    ],
  },
  "atoms-and-nuclei": {
    title: "Atoms & Nuclei",
    tagline: "Bohr model, spectra and nuclear binding — the quantum atom in JEE scope.",
    simTitle: "Bohr model: photon emission",
    simAbout: "Click energy levels to trigger transitions; see the emitted photon's colour and wavelength.",
    sections: [
      {
        heading: "The Bohr atom",
        body: [
          "Bohr quantised angular momentum (mvr = nh/2π), giving stationary states E_n = −13.6 Z²/n² eV and radii r_n = 0.529 n²/Z Å. Only transitions between these levels emit or absorb light.",
          "Photon energy is the gap: hν = E_i − E_f. The sim lets you pick the levels and instantly see which spectral series (Lyman, Balmer, …) the photon belongs to.",
        ],
      },
      {
        heading: "Spectra",
        body: [
          "The Rydberg formula 1/λ = R(1/n₁² − 1/n₂²) reproduces hydrogen's series: Lyman (UV, to n=1), Balmer (visible, to n=2), Paschen (IR, to n=3). Each series converges as n₂ → ∞.",
          "Ionisation energy is the n=1 → ∞ gap (13.6 eV × Z²); the series limit wavelength corresponds to exactly this energy.",
        ],
      },
      {
        heading: "The nucleus",
        body: [
          "Nuclear radius R = R₀A^(1/3). Binding energy per nucleon peaks at iron (~8.8 MeV) — fusion releases energy below it, fission above it. Mass defect Δm c² is the bookkeeping.",
          "Radioactive decay is probabilistic: N = N₀e^(−λt), half-life t½ = ln2/λ, activity A = λN. Alpha shifts (A−4, Z−2), beta (Z+1), gamma (nothing) — the displacement laws.",
        ],
      },
    ],
    formulas: [
      { tex: "E_n = -\\frac{13.6 Z^2}{n^2}\\,\\text{eV}", label: "Bohr energy levels" },
      { tex: "\\frac{1}{\\lambda} = R\\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)", label: "Rydberg formula" },
      { tex: "r_n = \\frac{0.529\\, n^2}{Z}\\,\\text{Å}", label: "Orbit radius" },
      { tex: "N = N_0 e^{-\\lambda t}, \\quad t_{1/2} = \\frac{\\ln 2}{\\lambda}", label: "Radioactive decay" },
      { tex: "\\Delta m c^2 = BE", label: "Mass defect & binding energy" },
    ],
    tips: [
      "For hydrogen-like ions, all energies scale as Z² and radii shrink as 1/Z.",
      "Balmer lines are the only visible ones — know Hα (656 nm red) by sight.",
      "In beta decay, the mass number is unchanged but a neutron becomes a proton (plus antineutrino).",
      "Binding energy per nucleon peaking at Fe-56 explains both stellar energy chains.",
    ],
  },
  "semiconductor-electronics": {
    title: "Semiconductor Electronics",
    tagline: "Diodes, rectifiers and logic gates — the applied-physics closer of the JEE syllabus.",
    simTitle: "Diode rectifier",
    simAbout: "Toggle half/full-wave rectification; compare input and output waveforms live.",
    sections: [
      {
        heading: "The p–n junction",
        body: [
          "Joining p and n silicon creates a depletion layer and a built-in potential (~0.7 V for Si). Forward bias narrows the layer and current rises exponentially; reverse bias widens it until breakdown — the diode conducts one way.",
          "The I–V characteristic is asymmetric: a valve, not a wire. In the sim, the input sine passes only its positive halves in half-wave mode; a bridge flips the negative halves up in full-wave mode.",
        ],
      },
      {
        heading: "Rectification",
        body: [
          "Half-wave rectification uses one diode and delivers a ripple frequency equal to the input's. Full-wave (centre-tap or bridge) doubles the ripple frequency, easing filtering. Ripple factor, efficiency (40.6% half-wave, 81.2% full-wave bridge) and PIV are the standard JEE numbers.",
          "A capacitor across the load smooths the output toward DC — charging at peaks, discharging slowly through the load.",
        ],
      },
      {
        heading: "Devices and gates",
        body: [
          "The Zener diode in reverse breakdown makes a voltage regulator; the LED emits when forward driven; a photodiode conducts with illumination; a solar cell converts light to EMF.",
          "Logic gates implement Boolean functions: NAND and NOR are universal — any circuit can be built from either alone. Know the truth tables cold; JEE asks combinations, not definitions.",
        ],
      },
    ],
    formulas: [
      { tex: "I = I_0\\left(e^{eV/kT} - 1\\right)", label: "Diode equation" },
      { tex: "\\eta_{\\text{half}} = 40.6\\%,\\; \\eta_{\\text{full}} = 81.2\\%", label: "Rectifier efficiency" },
      { tex: "f_{\\text{ripple,half}} = f,\\; f_{\\text{ripple,full}} = 2f", label: "Ripple frequency" },
      { tex: "V_{\\text{out}} \\approx V_Z", label: "Zener regulation" },
    ],
    tips: [
      "In a bridge rectifier, exactly two diodes conduct per half-cycle — the pair diagonal to the supply.",
      "PIV of a bridge diode = peak voltage; for half-wave with capacitor filter it doubles.",
      "Doping increases conductivity by adding carriers, not by heating.",
      "NAND/NOR universality: favourite one-mark question — practise building NOT/AND/OR from NAND only.",
    ],
  },
  "experimental-physics": {
    title: "Experimental Physics",
    tagline: "Vernier calipers, screw gauge and graphs — free marks if you know the instruments.",
    simTitle: "Vernier calipers practice",
    simAbout: "Drag the vernier jaw to a random object width, read the scales, and check yourself.",
    sections: [
      {
        heading: "Reading a vernier",
        body: [
          "The vernier scale divides 9 main-scale divisions into 10, making each vernier division 0.9 mm: least count = 0.1 mm (0.01 mm for a micrometer-style 10:1 ratio). Read MSR at the vernier zero, add LC × the coinciding vernier division.",
          "Subtract any zero error (positive when the vernier zero sits right of the main zero with jaws closed) before reporting the measurement.",
        ],
      },
      {
        heading: "Screw gauge",
        body: [
          "Pitch 0.5 mm with a 50-division circular scale gives LC = 0.01 mm. Reading = pitch-scale + (circular division × LC), again corrected for zero error (positive/negative by which side the zero sits).",
          "Backlash error — slack motion when reversing rotation — is avoided by always approaching the final reading in the same rotational direction.",
        ],
      },
      {
        heading: "Graph technique",
        body: [
          "Plot to fill the graph paper, choose sensible scales, and draw the best-fit line — never join points dot-to-dot. Slope uses two well-separated points ON the line, not data points.",
          "The intercept carries physical meaning (e.g. V-intercept = EMF in a V–I plot; slope −r). Expect one graph question in every JEE mechanics or electricity experiment set.",
        ],
      },
    ],
    formulas: [
      { tex: "\\text{LC} = \\frac{\\text{pitch}}{\\text{divisions on circular scale}}", label: "Least count" },
      { tex: "\\text{Reading} = \\text{MSR} + (\\text{VSD} \\times \\text{LC}) - \\text{zero error}", label: "Vernier reading" },
      { tex: "\\text{Slope} = \\frac{\\Delta y}{\\Delta x}\\;\\text{(from best-fit line)}", label: "Graph slope" },
    ],
    tips: [
      "Least count of a standard vernier: 0.1 mm; screw gauge: 0.01 mm.",
      "Zero error and zero correction have opposite signs — read the question for which is asked.",
      "In ohm's-law plots, slope = R; in pendulum T²–L plots, slope = 4π²/g.",
      "Report final answers to the instrument's least count, not calculator precision.",
    ],
  },
  // ── JEE Advanced question labs: standalone archetypes built around famous Adv patterns ──
  collisions: {
    title: "Collisions & Restitution",
    tagline: "Momentum always survives the crash — kinetic energy surrenders a fraction (1−e²).",
    simTitle: "Collision & restitution lab",
    simAbout: "Head-on 1-D collision with tunable masses, speeds and coefficient of restitution.",
    sections: [
      {
        heading: "What a collision conserves",
        body: [
          "In every collision — elastic, inelastic or explosive — linear momentum is conserved during the brief contact because the contact forces are internal and huge compared to external impulses. Kinetic energy is a different story: only e = 1 (perfectly elastic) preserves it.",
          "The coefficient of restitution e = (relative velocity of separation)/(relative velocity of approach) links the before and after states. Together with momentum conservation, two equations solve any 1-D collision for the two unknown final velocities — no Newton's-law integration needed.",
          "JEE Advanced has leaned on this repeatedly: the famous 2019 paper 1 problem stacked balls that undergo successive collisions and asked for total collisions (answer via relative-velocity ratios); several other problems hide a collision inside a projectile or a block-wedge chain where you must recognise the collision instant.",
        ],
      },
      {
        heading: "Special cases JEE loves",
        body: [
          "Equal masses with e = 1 exchange velocities exactly — the lab above shows this as a clean swap. A heavy body hitting a stationary light one barely slows while the light one shoots off at up to twice the heavy body's speed.",
          "Perfectly inelastic (e = 0) means the bodies move together after impact — maximum kinetic energy loss consistent with momentum, ΔKE = ½μv²_rel, where μ = m₁m₂/(m₁+m₂) is the reduced mass. This same reduced mass hides in Bohr-model and SHM problems.",
          "In 2-D collisions of a particle with a stationary target (billiards style), equal masses scatter at 90° to each other after an elastic hit — a result JEE Advanced asks you to prove or exploit.",
        ],
      },
      {
        heading: "Collision chains and repeated impacts",
        body: [
          "When a ball bounces down steps or between a wall and an incoming block, the trick is to treat each impact independently and track velocities, not positions. Coefficient e with the wall gives v' = e·v; each bounce loses a factor e in speed and e² in energy.",
          "Total distance travelled by a bouncing ball forms a geometric series: first drop h, then 2e²h, 2e⁴h, … summing to h(1+e²)/(1−e²). Total time follows the same series with √ factors — a classic computation-saving identity.",
        ],
      },
    ],
    formulas: [
      { tex: "m_1u_1 + m_2u_2 = m_1v_1 + m_2v_2", label: "Momentum conservation" },
      { tex: "e = \\frac{v_2 - v_1}{u_1 - u_2}", label: "Restitution (1-D)" },
      { tex: "v_1 = \\frac{(m_1 - em_2)u_1 + (1+e)m_2 u_2}{m_1+m_2}", label: "Final velocity, body 1" },
      { tex: "\\Delta KE = \\tfrac{1}{2}\\,\\frac{m_1 m_2}{m_1+m_2}(1-e^2)(u_1-u_2)^2", label: "Energy lost (1-D)" },
      { tex: "h_{total} = h\\,\\frac{1+e^2}{1-e^2}", label: "Bouncing-ball total height" },
    ],
    tips: [
      "Momentum conservation applies DURING the collision; energy methods apply before/after. Never mix them mid-impact.",
      "For equal masses, elastic, one stationary: velocities simply swap — zero computation.",
      "Energy loss peaks at e = 0 (move together) and vanishes at e = 1 — check limits to validate answers.",
      "In block-wedge problems with frictionless contact, horizontal momentum is conserved even though total momentum is not.",
    ],
  },
  "rolling-motion": {
    title: "Rolling Motion",
    tagline: "Down the same incline, shape alone decides the winner — mass and radius never enter.",
    simTitle: "Rolling race",
    simAbout: "Ring, hollow sphere, disc and solid sphere released together on one incline.",
    sections: [
      {
        heading: "Why rolling splits gravity's work",
        body: [
          "A body rolling without slipping divides gravitational potential energy between translation (½mv²) and rotation (½Iω²). With I = kmR² (k = 1 for a ring, ½ for a disc, ⅖ for a solid sphere, ⅔ for a hollow sphere) and ω = v/R, energy conservation gives v² = 2gh/(1+k) — the mass and the radius cancel identically.",
          "The acceleration down a slope follows the same censorship: a = g sinθ/(1+k). The solid sphere (k = ⅖) always beats the disc (½), which beats the hollow sphere (⅔), which beats the ring (k = 1) — regardless of their masses or sizes. JEE Advanced has tested exactly this ranking several times, once with a numerical 'time ratio' twist.",
        ],
      },
      {
        heading: "Friction's supporting role",
        body: [
          "Counter-intuitively, friction points UP the incline for a body rolling down: gravity acts through the centre of mass and provides no torque about it, so friction alone supplies the torque that spins the body up — at the cost of reducing the translational acceleration. Without friction the body slides with a = g sinθ — larger than any rolling acceleration — but never rotates.",
          "Rolling without slipping demands a minimum friction: μ ≥ k·tanθ/(1+k). Ask 'will it roll or slide?' before computing anything; JEE Advanced regularly sets μ below this threshold so the body slips and the kinematics change entirely.",
        ],
      },
      {
        heading: "Rolling energy bookkeeping",
        body: [
          "Total kinetic energy of a rolling body is (1+k)/2 · mv² — translation plus rotation in a fixed ratio set by shape. This fixed fraction is why rolling bodies reach the bottom slower than sliding ones from the same height, and why a rolling sphere's rotational share is exactly 2/7 of its total KE.",
          "For rolling on level ground struck impulsively (a cue ball), the point of impact relative to the centre of mass decides whether it initially slips, and friction then drives it toward pure rolling with v = ωR. Tracking that transition is a recurring Advanced-level multi-step problem.",
        ],
      },
    ],
    formulas: [
      { tex: "a = \\frac{g\\sin\\theta}{1 + I/mR^2}", label: "Rolling acceleration on incline" },
      { tex: "v_{bottom} = \\sqrt{\\frac{2gh}{1+k}}", label: "Speed at bottom (k = I/mR²)" },
      { tex: "\\mu_{min} = \\frac{\\tan\\theta}{1 + 1/k}", label: "Friction needed to roll" },
      { tex: "KE_{rot} = \\frac{k}{1+k}\\,KE_{total}", label: "Rotation's fixed share" },
      { tex: "v = \\omega R", label: "Rolling constraint" },
    ],
    tips: [
      "Memorise the ladder: solid sphere (⅖) > disc (½) > hollow sphere (⅔) > ring (1) — 'smaller k wins'.",
      "Mass and radius cancel everywhere in pure rolling — if your answer contains them, re-check.",
      "Sliding (frictionless) beats every rolling body down an incline; rolling with slipping sits in between.",
      "On level ground, rolling friction in JEE means static friction doing zero net work — no energy loss.",
    ],
  },
  "doppler-effect": {
    title: "Doppler Effect",
    tagline: "Wavefronts keep no memory except where they were born — that memory is the shift.",
    simTitle: "Doppler effect",
    simAbout: "A moving source emits circular wavefronts that compress ahead and stretch behind.",
    sections: [
      {
        heading: "The mechanism, not the formula",
        body: [
          "Sound speed in a medium depends only on the medium — every wavefront expands at v regardless of how the source moves. But each successive wavefront is emitted from a new position, so ahead of a moving source the circles crowd together (shorter λ, higher f) and behind they spread (longer λ, lower f).",
          "This is why source motion and observer motion are not symmetric: a moving source changes the wavelength printed into the medium, while a moving observer merely sweeps through wavefronts at a different rate. JEE Advanced traps almost always hinge on this asymmetry.",
        ],
      },
      {
        heading: "Signs, limits and special cases",
        body: [
          "The master formula f′ = f(v + v_o)/(v − v_s) uses speeds positive toward the other party. Source approaching observer is the denominator shrinking — f′ grows without bound as v_s → v, which is the sonic boom singularity (not in syllabus, but its origin is).",
          "A source moving in a circle past a stationary observer (JEE Advanced 2016-style) gives a periodically varying f′, maximum when the velocity points at the observer, minimum when it points away, and exactly f when the velocity is perpendicular — i.e. when the line-of-sight component of velocity vanishes.",
          "Reflection problems (a sound bouncing off a moving wall) treat the wall as a moving observer first, then a moving source for the return leg — two Doppler shifts applied in sequence.",
        ],
      },
      {
        heading: "Light vs sound",
        body: [
          "For light there is no medium, so only relative line-of-sight velocity matters (relativistic formula, qualitatively in syllabus). The 'approaching star blueshifts' statement is the astronomy version of the same physics.",
          "Keep v_sound = 343 m/s at 20 °C (≈ 330 m/s at 0 °C) at your fingertips; temperature changes v and hence the shift — a fact Advanced papers have used to disguise a simple computation.",
        ],
      },
    ],
    formulas: [
      { tex: "f' = f\\,\\frac{v \\pm v_o}{v \\mp v_s}", label: "Doppler effect (signs toward each other)" },
      { tex: "\\lambda' = \\frac{v - v_s}{f}", label: "Wavelength ahead of source" },
      { tex: "f' = f\\left(1 \\pm \\frac{v_s}{v}\\right)^{-1}", label: "Source-only form" },
      { tex: "v_{sound} = 343\\ \\text{m/s at } 20^\\circ\\text{C}", label: "Speed of sound" },
      { tex: "\\frac{\\Delta f}{f} \\approx \\frac{v_{radial}}{v}", label: "Small-shift approximation" },
    ],
    tips: [
      "Ask 'who is moving relative to the MEDIUM?' — for sound, medium matters; for light, only relative motion.",
      "Source and observer crossing exactly perpendicular: no shift at that instant (line-of-sight velocity is zero).",
      "Reflected sound off a moving object = two sequential Doppler shifts; don't double-count in one step.",
      "As v_s → v, f′ → ∞ for approaching source — if a numerical gives this, suspect a mis-set sign.",
    ],
  },
  "rc-transients": {
    title: "RC Circuits & Transients",
    tagline: "Every capacitor voltage is an exponential with one personality: the time constant τ = RC.",
    simTitle: "RC transient lab",
    simAbout: "Charge and discharge a capacitor through a resistor; watch Vc and I evolve against τ.",
    sections: [
      {
        heading: "The exponential fingerprint",
        body: [
          "At t = 0 a charging capacitor is a short circuit (Vc = 0, current jumps to ε/R); at t = ∞ it is an open circuit (I = 0, Vc = ε). Between those extremes everything is exponential: Vc = ε(1 − e^(−t/τ)) and I = (ε/R)e^(−t/τ) with τ = RC.",
          "The time constant is the time to close 63.2% of the remaining gap — and also the time the initial slope line would take to reach the final value. After 5τ the circuit is within 0.7% of steady state, the practical 'done' marker.",
          "Discharging flips the roles: Vc = εe^(−t/τ) decays through the same resistor with the SAME τ — the half-life t½ = τ ln 2 ≈ 0.693τ appears in both directions, a favourite Advanced numerical.",
        ],
      },
      {
        heading: "Reading transient graphs like JEE wants",
        body: [
          "An RC plot question usually asks for τ from a graph: read the initial slope's intercept, or the 63.2%/36.8% landmark, or the half-life divided by ln 2. Recognising which landmark is on the graph is 90% of the marks.",
          "For charging, the charge on the capacitor Q = Cε(1 − e^(−t/τ)) — the same shape as Vc since Q = CVc. The current, however, DECAYS during charging: current falling while voltage rises is the classic conceptual trap.",
          "In circuits with multiple resistors, first find the Thevenin equivalent seen by the capacitor to get τ = R_eq·C, then write the single-exponential solution for Vc(t) toward V_∞. Steady-state first, transient second — always in that order.",
        ],
      },
      {
        heading: "Energy audit",
        body: [
          "Charging a capacitor to Q = Cε stores energy ½Cε², but the battery delivered Q·ε = Cε² — exactly half is dissipated in the resistance regardless of R's value. This 50% efficiency is independent of how fast you charge, a genuinely surprising result JEE Advanced has asked students to prove.",
          "During discharge the entire stored ½CV² is dissipated in the resistor; integrating I²R over the exponential confirms it — a quick energy-conservation check for multi-capacitor problems.",
        ],
      },
    ],
    formulas: [
      { tex: "V_C(t) = \\varepsilon\\left(1 - e^{-t/RC}\\right)", label: "Charging voltage" },
      { tex: "I(t) = \\frac{\\varepsilon}{R}e^{-t/RC}", label: "Charging current" },
      { tex: "V_C(t) = V_0\\, e^{-t/RC}", label: "Discharging voltage" },
      { tex: "t_{1/2} = RC\\ln 2 \\approx 0.693\\,RC", label: "Half-life of transient" },
      { tex: "\\eta = \\frac{\\tfrac{1}{2}C\\varepsilon^2}{C\\varepsilon^2} = 50\\%", label: "Charging efficiency" },
    ],
    tips: [
      "At t = 0⁺, replace capacitors by wires; at steady state, by open circuits — the two boundary sketches solve most problems.",
      "Current through a charging capacitor is maximum at t = 0 and decays; voltage does the opposite.",
      "Multi-resistor circuit? Reduce to Thevenin equivalent first: τ = R_eq C, V_∞ from the divider.",
      "Half the charging energy is ALWAYS lost in resistance — even for arbitrarily small R.",
    ],
  },
  "nuclear-decay": {
    title: "Radioactive Decay",
    tagline: "No nucleus knows its age — yet the population obeys a perfect exponential.",
    simTitle: "Radioactive decay",
    simAbout: "96 nuclei decay at random while their population traces N₀·2^(−t/T½).",
    sections: [
      {
        heading: "Randomness with a law",
        body: [
          "Individual nuclei decay without memory — the probability per unit time (λ, the decay constant) is constant no matter how long a nucleus has existed. This 'nuclear atheism' is exactly why the population follows dN/dt = −λN and N(t) = N₀e^(−λt).",
          "The half-life T½ = ln2/λ is the time for half a sample to decay; after n half-lives, exactly N₀/2ⁿ remains. JEE Advanced prefers reasoning in powers of two over grinding exponentials — e.g. '3.25 half-lives' should immediately read as N₀ × 2^(−3.25).",
          "The mean life τ_mean = 1/λ = T½/ln2 ≈ 1.44 T½ is the arithmetic average lifetime; it is longer than the half-life because the decay curve's tail drags the average up. Papers frequently ask which is bigger and why.",
        ],
      },
      {
        heading: "Activity and half-life tricks",
        body: [
          "Activity A = λN = A₀(½)^(t/T½) — the same halving clock applies to counts per second. Carbon dating, isotope mixing and 'how much of a 2 isotope sample remains' questions are all this one line in disguise.",
          "The fraction decayed vs remaining distinction is the top silly-mistake source: after 4 half-lives, 1/16 remains but 15/16 has decayed. Read which one is asked.",
        ],
      },
      {
        heading: "Decay chains",
        body: [
          "When a parent decays into a radioactive daughter (A → B → C), the daughter's population first grows, peaks, then falls — governed by the Bateman equations. For JEE, the two exploitable limits: secular equilibrium (λ_A ≪ λ_B: daughter activity eventually equals parent's) and the case where the daughter is stable (total B approaches N₀).",
          "Alpha and beta decay shift the nuclide along N–Z: alpha lowers both A and Z (Z−2, A−4); beta⁻ raises Z by 1 at fixed A. Decay-series questions are pure bookkeeping once these two rules are automatic.",
        ],
      },
    ],
    formulas: [
      { tex: "N(t) = N_0 e^{-\\lambda t} = N_0 \\left(\\tfrac{1}{2}\\right)^{t/T_{1/2}}", label: "Decay law" },
      { tex: "A = \\lambda N = -\\frac{dN}{dt}", label: "Activity" },
      { tex: "T_{1/2} = \\frac{\\ln 2}{\\lambda}", label: "Half-life" },
      { tex: "\\tau_{mean} = \\frac{1}{\\lambda} = \\frac{T_{1/2}}{\\ln 2}", label: "Mean life" },
      { tex: "\\text{after } n \\text{ half-lives: } \\frac{N_0}{2^n}", label: "Halving rule" },
    ],
    tips: [
      "Convert everything to half-lives first — JEE numericals are engineered to be powers of 2.",
      "Mean life > half-life always (factor 1/ln2 ≈ 1.44); know why the tail lifts the average.",
      "Activity falls with the same half-life as the population — count rate IS a population measurement.",
      "Alpha: A−4, Z−2 · beta⁻: Z+1 — write the balance explicitly in series questions.",
    ],
  },
  "standing-waves": {
    title: "Standing Waves & Harmonics",
    tagline: "A string fixed at both ends only permits λ = 2L/n — everything else follows.",
    simTitle: "Standing waves on a string",
    simAbout: "Choose the harmonic; see nodes, antinodes and the sonometer frequency ladder respond.",
    sections: [
      {
        heading: "Why only certain wavelengths survive",
        body: [
          "Two identical waves travelling in opposite directions (an incident and a reflected wave) superpose into y = 2A sin(kx)·cos(ωt) — a spatial sine envelope oscillating in time. The boundary condition y = 0 at both fixed ends forces sin(kL) = 0, so kL = nπ and λ_n = 2L/n for integer n.",
          "Each allowed pattern (mode) is a standing wave with stationary nodes (zero displacement always) and antinodes (maximum amplitude) halfway between. The nth mode has n loops, n+1 nodes, and frequency f_n = n·f₁ where the fundamental f₁ = v/2L — the harmonic ladder JEE Advanced loves to climb.",
        ],
      },
      {
        heading: "What controls the pitch",
        body: [
          "Wave speed on a string is v = √(T/µ) — tension up, frequency up; linear density up, frequency down. Stretching a string to twice its length both increases L and decreases µ, so sonometer problems need BOTH effects applied: f ∝ (1/L)√(T/µ).",
          "A tuning fork loading a sonometer wire at resonance shares its frequency; changing tension until beats vanish is how the wire's f₁ is matched. JEE Advanced 2019 asked for the mass hung on a wire given resonance conditions — pure f₁ = (1/2L)√(T/µ) bookkeeping with T = mg.",
        ],
      },
      {
        heading: "Same physics, other boundaries",
        body: [
          "A pipe open at both end mirrors the string: both ends are antinodes, f_n = n·v/2L. A pipe closed at one end allows only odd harmonics f_n = (2n−1)·v/4L — the missing even harmonics are the classic identification question.",
          "When a wave reflects from a denser medium (fixed end) it inverts phase; from a rarer medium it doesn't. That single rule decides node vs antinode at every junction — in composite strings, at organ-pipe mouths, and in quarter-wave reflectors.",
        ],
      },
    ],
    formulas: [
      { tex: "\\lambda_n = \\frac{2L}{n},\\quad n = 1,2,3\\ldots", label: "Allowed wavelengths" },
      { tex: "f_n = \\frac{n}{2L}\\sqrt{\\frac{T}{\\mu}}", label: "Harmonic frequencies (string)" },
      { tex: "v = \\sqrt{\\frac{T}{\\mu}}", label: "Wave speed on string" },
      { tex: "y(x,t) = 2A\\sin(kx)\\cos(\\omega t)", label: "Standing wave" },
      { tex: "f_n = (2n-1)\\frac{v}{4L}", label: "Closed pipe (odd only)" },
    ],
    tips: [
      "Fixed–fixed and open–open share the same harmonic ladder; closed–open keeps only odd n — the fastest identifier.",
      "nth mode: n loops, n+1 nodes, n antinodes. Count before you calculate.",
      "Sonometer: stretching changes µ too — apply f ∝ (1/L)√(T/µ), not just 1/L.",
      "Reflection from denser medium inverts phase (node at junction); rarer does not (antinode).",
    ],
  },
  "train-in-tunnel": {
    title: "Train in a Tunnel: Piston Effect",
    tagline: "A train is a loose piston — the air it displaces must squeeze through the gap at vA₁/(A₂−A₁).",
    simTitle: "Train in a tunnel — the piston effect",
    simAbout: "Ride with the train: watch displaced air squeeze through the annular gap and blast backward.",
    sections: [
      {
        heading: "The loose piston",
        body: [
          "A train of cross-section A₁ driving through a tunnel of cross-section A₂ (A₂ > A₁) is a piston that does not seal. Every second it sweeps a volume v·A₁ of air out of its way, and with nowhere else to go, that air streams back through the annular gap between the train's sides and the tunnel walls.",
          "In the ground frame the flow is unsteady — messy. Jump to the train's frame and it becomes a steady flow problem: air far ahead approaches at v and fills the whole tunnel cross-section A₂, then must squeeze through the gap of area A₂ − A₁. Continuity gives it in one line: v·A₂ = u′(A₂ − A₁), so u′ = vA₂/(A₂−A₁) = v/(1−β), where β = A₁/A₂ is the blockage ratio.",
          "Notice what the algebra is telling you: the gap speed depends only on the ratio β, never on the absolute size. A model train in a straw and a metro in a tunnel behave identically if their blockage ratios match.",
        ],
      },
      {
        heading: "Two speeds, one subtraction",
        body: [
          "u′ = v/(1−β) is the air speed relative to the TRAIN. Relative to the TUNNEL walls, the gap air drifts backward at u = u′ − v = vA₁/(A₂−A₁) = vβ/(1−β). JEE asks for both framings — the IIT-JEE 2005 screening original and its many descendants hinge on reading which one the question wants, and the answers differ by exactly v.",
          "There is a ground-frame audit that arrives at the same place without changing frames: the train sweeps volume at vA₁ per second, and that volume exits through the gap at speed u, so u(A₂ − A₁) = vA₁. One equation, no calculus — this is the entire problem.",
          "Always run the limit checks: β → 0 (the train vanishes) gives u′ → v and u → 0 — nothing to displace, nothing happens. β → 1 makes both speeds diverge — with no gap, incompressible flow is impossible, which is why tightly sealed trains in real tunnels generate pressure waves instead (your ears popping in a metro).",
        ],
      },
      {
        heading: "Pressure, drag and the platform draft",
        body: [
          "Apply Bernoulli in the train's frame between the free stream (speed v, pressure P₀) and the gap (speed u′): P_gap = P₀ − ½ρ(u′² − v²). The annulus acts as a Venturi — the tighter the fit, the harder the suction through the gap, exactly the ½ρv²[(1/(1−β))² − 1] the sim tracks.",
          "Ahead of the nose, air piles up into a compression zone; behind the tail, the departing jet leaves a suction zone. The pressure difference pushes the train backward — pure aerodynamic drag from displacement, present even with zero friction — and it is why tunnels impose speed limits that open track does not.",
          "The same pressure landscape is the platform draft: high pressure ahead of the nose shoves you away, then the low-pressure wake yanks debris (and careless passengers) toward the passing train. The yellow line exists because this problem is on the exam of life too.",
        ],
      },
    ],
    formulas: [
      { tex: "vA_2 = u'(A_2 - A_1)", label: "Continuity in the train's frame" },
      { tex: "u' = \\frac{v}{1-\\beta} = \\frac{vA_2}{A_2-A_1}", label: "Gap air speed rel. train" },
      { tex: "u = \\frac{vA_1}{A_2-A_1} = u' - v", label: "Gap air speed rel. tunnel (backward)" },
      { tex: "u(A_2 - A_1) = vA_1", label: "Ground-frame displaced-volume audit" },
      { tex: "P_0 - P_{gap} = \\tfrac{1}{2}\\rho\\left(u'^2 - v^2\\right)", label: "Bernoulli drop across the gap" },
    ],
    tips: [
      "Switch to the train's frame first — the unsteady mess becomes a steady flow and continuity is one line.",
      "u′ depends only on the blockage ratio β = A₁/A₂; doubling every area changes nothing.",
      "Rel. train vs rel. tunnel differ by exactly v — underline which one the question asks before substituting.",
      "As β → 1 the answers diverge — a sign that the incompressible model itself is breaking (real tunnels: pressure waves, ear pop).",
      "Front of train = compression (push), rear = suction (pull): the platform draft is this pressure profile wearing a safety announcement.",
    ],
  },

  "lens-systems": {
    title: "Lens Combinations",
    tagline: "Two lenses in contact, two separated, telescope and microscope architectures — one matrix method rules them all.",
    simTitle: "Lens combination bench",
    simAbout: "Chain up to three convex/concave lenses at chosen separations; rays, intermediate images and the effective focal length update live.",
    sections: [
      {
        heading: "Lenses in contact: powers just add",
        body: [
          "For thin lenses touching, the combined focal length obeys 1/F = 1/f₁ + 1/f₂ — equivalently P = P₁ + P₂ in dioptres. This is how an optometrist stacks trial lenses to hit a prescription, and why a convex + weaker concave pair behaves as one weaker convex lens.",
          "The sim reproduces this exactly: drag two lenses to the same bench position and the effective focal length converges to the contact formula.",
        ],
      },
      {
        heading: "Separated lenses: the separation matters",
        body: [
          "With separation d, 1/F = 1/f₁ + 1/f₂ − d/(f₁f₂). A wide separation weakens the combination; in the limit d = f₁ + f₂ you get an afocal system (beam compressor / simple telescope) — parallel light in, parallel light out, effective f → ∞.",
          "Microscopes and telescopes are the two JEE-favourite architectures: telescope = objective with long f₁ + eyepiece with short f₂, separation f₁ + f₂, magnification M = f₁/f₂; microscope = both short-focal, object just outside the objective's focus, large tube length L, M ≈ (L/f₀)(D/fₑ).",
        ],
      },
      {
        heading: "The matrix method: one tool for everything",
        body: [
          "Represent a ray by (height y, slope θ). Free space over distance d is [[1,d],[0,1]]; a thin lens is [[1,0],[−1/f,1]]. Multiply the matrices in order and the whole system is two equations. An image forms where the output height no longer depends on the input slope (B = 0) — that condition gives the image distance, and the magnification falls out as element D of the propagated matrix.",
          "The same machinery handles intermediate images: after each lens, ask where the partial system focuses. The sim marks these in amber — the object for lens 2 is the image from lens 1, which is exactly how multi-stage problems are solved by hand.",
        ],
      },
    ],
    formulas: [
      { tex: "\\frac{1}{F} = \\frac{1}{f_1} + \\frac{1}{f_2}", label: "Lenses in contact" },
      { tex: "\\frac{1}{F} = \\frac{1}{f_1} + \\frac{1}{f_2} - \\frac{d}{f_1 f_2}", label: "Separated by d" },
      { tex: "P = P_1 + P_2 - d\\,P_1 P_2", label: "Power form (dioptres)" },
      { tex: "M_{\\text{telescope}} = \\frac{f_1}{f_2},\\quad d = f_1 + f_2", label: "Afocal telescope" },
      { tex: "\\begin{pmatrix} y' \\\\ \\theta' \\end{pmatrix} = \\begin{pmatrix} 1 & d \\\\ 0 & 1 \\end{pmatrix}\\begin{pmatrix} 1 & 0 \\\\ -1/f & 1 \\end{pmatrix}\\begin{pmatrix} y \\\\ \\theta \\end{pmatrix}", label: "Ray-transfer matrices" },
    ],
    tips: [
      "Image from lens 1 = object for lens 2. If it forms to the right of lens 2, its distance becomes a virtual object (negative in the Cartesian convention) — the step most students flub.",
      "Effective power of separated lenses is always less than the contact value; the d/(f₁f₂) term is the tell.",
      "Magnifications multiply: m_total = m₁·m₂. Two inversions give an erect final image — count sign flips instead of re-deriving.",
      "Afocal check: if the sim says 'output collimated', parallel rays in give parallel rays out — that's a telescope or beam expander, and the angular magnification is the diameter ratio of the beams.",
      "Units discipline: dioptres require metres. A 25 cm lens is +4 D, and mixing cm with D is the #1 numerical error in optics.",
    ],
  },

  "atomic-structure": {
    title: "Atomic Structure",
    subject: "Chemistry",
    tagline: "Quantum numbers, orbitals and the hydrogen spectrum — where chemistry borrows physics' rulebook.",
    simTitle: "Atomic orbital visualiser",
    simAbout: "Pick any (n, l, m) up to 3d and watch the probability density |ψ|² take shape in a chosen plane slice.",
    sections: [
      {
        heading: "Quantum numbers are an address, not a label",
        body: [
          "Solving the Schrödinger equation for hydrogen gives three quantum numbers that pin down an orbital: n (size/energy), l (shape, 0 to n−1: s, p, d, f…) and mₗ (orientation, −l to +l). A fourth, mₛ = ±½, labels the electron's spin — Pauli's exclusion principle says no two electrons in an atom share all four.",
          "Orbitals are not orbits. |ψ|² is a probability density: the electron is a standing wave of the nucleus's electric field, and the lobes you see in the visualiser are where it is likely to be found, not paths it travels.",
        ],
      },
      {
        heading: "Nodes: the fingerprints of (n, l)",
        body: [
          "Radial nodes = n − l − 1 (spheres where the radial wavefunction crosses zero); angular nodes = l (planes/cones through the nucleus). Total nodes = n − 1. A 3p orbital (n=3, l=1) has 1 radial + 1 angular node; 3d has 0 radial + 2 angular.",
          "Radial probability (4πr²R²) peaks at the Bohr radius for 1s but the density |ψ|² is maximum at the nucleus — examiners love this distinction.",
        ],
      },
      {
        heading: "The hydrogen spectrum",
        body: [
          "Eₙ = −13.6 Z²/n² eV. Lines come from transitions: Lyman (to n=1, UV), Balmer (to n=2, visible), Paschen/Brackett/Pfund (IR). The Rydberg formula 1/λ = RZ²(1/n₁² − 1/n₂²) computes every wavelength in the series.",
          "de Broglie's λ = h/mv wrapped around a circumference (2πr = nλ) reproduces Bohr quantisation — the bridge between particle pictures and wave pictures that JEE questions repeatedly probe.",
        ],
      },
    ],
    formulas: [
      { tex: "E_n = -\\frac{13.6\\,Z^2}{n^2}\\ \\text{eV}", label: "Hydrogen-like energy levels" },
      { tex: "\\text{radial nodes} = n - l - 1,\\quad \\text{angular nodes} = l", label: "Node counting" },
      { tex: "\\frac{1}{\\lambda} = RZ^2\\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)", label: "Rydberg formula" },
      { tex: "\\psi_{nlm} = R_{nl}(r)\\,Y_l^m(\\theta, \\phi)", label: "Wavefunction factorisation" },
      { tex: "2\\pi r = n\\lambda = \\frac{nh}{mv}", label: "de Broglie → Bohr" },
    ],
    tips: [
      "Orbital counting: number of orbitals in the n-th shell = n²; electrons = 2n². Half-filled and fully-filled subshells gain exchange-energy stability — hence Cr = [Ar]3d⁵4s¹.",
      "Node questions are free marks: total nodes n−1, radial n−l−1, angular l. Verify with the visualiser.",
      "Energy order for H-like species depends only on n (3s = 3p = 3d); multi-electron atoms break the degeneracy (3d > 3p > 3s) because of penetration/shielding.",
      "Series limits: Lyman 91.2 nm, Balmer 364.6 nm — the shortest wavelength of each series is the n₂ → ∞ limit.",
      "Heisenberg: Δx·Δp ≥ h/4π — it forbids exact orbits, not measurement of one variable.",
    ],
  },

  "classification-of-elements-and-periodicity": {
    title: "Classification & Periodicity",
    subject: "Chemistry",
    tagline: "The periodic table is not trivia — its trends are the master key to almost every inorganic question.",
    simTitle: "Periodic trends explorer",
    simAbout: "Colour the table by atomic radius, electronegativity, ionisation energy or electron affinity and trace group/period trends.",
    sections: [
      {
        heading: "Why trends exist",
        body: [
          "Across a period, nuclear charge (Z) grows while electrons enter the same shell — shielding stays roughly constant, so effective nuclear charge Z_eff rises and atoms contract. Down a group, each new shell outruns the added charge, so size grows.",
          "Every other trend follows from radius: ionisation energy and electronegativity rise across a period (harder to remove/hold electrons closer), and fall down a group. Electron affinity is the odd one — irregular because of subshell structure (N's half-filled 2p³ resists gaining, Be's empty 2p is inaccessible).",
        ],
      },
      {
        heading: "The anomalies examiners test",
        body: [
          "IE order anomalies: Be > B (2s² is tighter than 2p¹) and N > O (half-filled 2p³ beats 2p⁴). Down a group, IE drops but not monotonically for heavy elements where relativistic contraction complicates things.",
          "Metallic character, basicity of oxides and reducing power all move opposite to electronegativity; acidic character of oxides moves with it. Once you anchor radius and Z_eff, you can derive these on the fly instead of memorising rows.",
        ],
      },
      {
        heading: "Modern periodic law",
        body: [
          "Moseley's atomic number (Z), not Mendeleev's atomic mass, is the true sorting key — that single fix resolved the Te/I and Co/Ni inversions. s/p/d/f blocks mirror the subshell being filled.",
          "Predict positions from electron configuration: an element ending in ns² np⁵ is a halogen (group 17); (n−1)d¹⁰ ns² is group 12. The block tells the group faster than counting boxes.",
        ],
      },
    ],
    formulas: [
      { tex: "Z_{\\text{eff}} = Z - \\sigma", label: "Slater screening" },
      { tex: "IE_2 > IE_1 \\text{ (always)}", label: "Successive ionisation energies" },
      { tex: "\\text{EN} \\propto \\frac{Z_{\\text{eff}}}{r}", label: "Electronegativity scaling" },
      { tex: "r_{\\text{cation}} < r_{\\text{atom}} < r_{\\text{anion}}", label: "Ionic radii order" },
    ],
    tips: [
      "Ionisation energy comparisons: always check the electron being removed — which shell, which subshell, half/fully-filled bonus.",
      "Diagonal relationships (Li–Mg, Be–Al, B–Si) arise because similar charge density beats the group trend.",
      "Second IE of Na is huge (breaks into the neon core); for Mg it is IE₃. Jump positions identify the group.",
      "Electron affinity ≠ electronegativity: EA is a thermodynamic quantity for the isolated atom (Cl > F), EN is a bonded-atom rating (F > Cl).",
      "Lanthanoid contraction makes 5d elements unusually small — why Zr ≈ Hf and why Hg is liquid.",
    ],
  },

  "chemical-bonding": {
    title: "Chemical Bonding",
    subject: "Chemistry",
    tagline: "VSEPR shapes, hybridisation and dipole moments — the highest-scoring chapter of inorganic chemistry.",
    simTitle: "VSEPR geometry workbench",
    simAbout: "Pick a species from BeF₂ to SF₆, drag to rotate, and watch lone pairs bend the shape.",
    sections: [
      {
        heading: "The VSEPR method",
        body: [
          "Shape follows from steric number = bond pairs + lone pairs on the central atom. Count the domains, not the atoms: a double bond counts as one domain, so CO₂ (two double bonds) is as linear as BeF₂.",
          "Lone pairs are fatter than bond pairs — they sit closer to the nucleus and push bonded atoms together. Repulsion order: lp–lp > lp–bp > bp–bp. That single ranking predicts every distortion: 109.5° (CH₄) → 107° (NH₃) → 104.5° (H₂O).",
        ],
      },
      {
        heading: "Hybridisation and dipole moments",
        body: [
          "Steric number maps directly to hybridisation: 2→sp, 3→sp², 4→sp³, 5→sp³d, 6→sp³d². Do not memorise shapes and hybridisation separately — derive both from the same count.",
          "A molecule is polar only if its bond dipoles fail to cancel. Symmetric arrangements (linear AX₂, trigonal planar AX₃, tetrahedral AX₄, octahedral AX₆) give zero dipole even with polar bonds. NF₃ has a smaller dipole than NH₃ because its lone-pair moment opposes the bond moments.",
        ],
      },
      {
        heading: "Molecular orbital theory",
        body: [
          "MO theory beats VSEPR where electrons delocalise: bond order = (N_b − N_a)/2. O₂ has bond order 2 with two unpaired π* electrons — paramagnetic, something Lewis structures cannot show.",
          "For N₂ and its ions, removing an electron from bonding MO lowers bond order (N₂⁺ = 2.5) but for O₂ removing an antibonding electron raises it (O₂⁺ = 2.5 > O₂ = 2). Stability order questions are pure MO bookkeeping.",
        ],
      },
    ],
    formulas: [
      { tex: "\\text{steric number} = \\text{bp} + \\text{lp}", label: "VSEPR count" },
      { tex: "\\text{bond order} = \\frac{N_b - N_a}{2}", label: "MO bond order" },
      { tex: "\\mu = q \\times d", label: "Dipole moment" },
      { tex: "\\text{\\% ionic} \\approx 1.7\\,\\Delta\\text{EN} - 3.5", label: "Pauling electronegativity estimate" },
    ],
    tips: [
      "In trigonal bipyramids, lone pairs always take equatorial slots — only two 90° neighbours instead of three. Hence SF₄ see-saw, ClF₃ T-shaped, XeF₄ square planar.",
      "XeF₄ is square planar, not tetrahedral: two lone pairs go trans to each other. Drawing it flat loses marks.",
      "Species with identical steric number share hybridisation — compare iso-electronic pairs like NH₃ and H₃O⁺ quickly.",
      "Bond angle comparisons: H₂O < NH₃ < CH₄ and OF₂ < OH₂ (more electronegative substituents pull bond pairs out, shrinking angles).",
      "Paramagnetism check in MO: odd electron count or partially filled degenerate MOs — O₂ is the classic exam trap.",
    ],
  },

  "chemical-and-ionic-equilibrium": {
    title: "Chemical & Ionic Equilibrium",
    subject: "Chemistry",
    tagline: "Le Chatelier's principle, Kp/Kc and pH — physical chemistry's most reliable score bank.",
    simTitle: "Le Chatelier pressure tube",
    simAbout: "N₂O₄ ⇌ 2NO₂ in a sealed syringe — squeeze or heat the tube and watch the equilibrium re-solve exactly.",
    sections: [
      {
        heading: "K, Q and the direction of shift",
        body: [
          "Equilibrium constants depend only on temperature. The reaction quotient Q has the same expression with current concentrations: Q < K drives the forward reaction, Q > K the reverse. Every Le Chatelier question is secretly a Q-vs-K comparison.",
          "For N₂O₄ ⇌ 2NO₂, Kp = Kc(RT) because Δn_gas = 1. Only gases enter Kp (pressures) and only dissolved species enter Kc — pure solids and liquids never appear.",
        ],
      },
      {
        heading: "Stress responses",
        body: [
          "Compression (higher P, smaller V) shifts toward fewer gas moles — reverse here. Heating shifts toward the endothermic side; since forward is endothermic (ΔH° = +57.2 kJ), Kp itself rises with T via the van't Hoff equation, not just Q.",
          "Adding an inert gas at constant volume changes nothing (no partial pressure changes); at constant pressure it dilutes the mixture, acting like an expansion. A catalyst changes only the speed — never the position of equilibrium.",
        ],
      },
      {
        heading: "Ionic equilibrium",
        body: [
          "Weak acids never fully dissociate: Ka = x²/(C−x), and for dilute solutions α = √(Ka/C) — the Ostwald dilution law. pH = ½(pKa − log C) for a weak acid follows from it.",
          "Buffers resist pH change: pH = pKa + log([salt]/[acid]) (Henderson–Hasselbalch). At the half-equivalence point pH = pKa exactly — that's how you read Ka from a titration curve. For salts, Ksp × common-ion reasoning decides precipitation.",
        ],
      },
    ],
    formulas: [
      { tex: "K_p = K_c (RT)^{\\Delta n}", label: "Kp–Kc relation" },
      { tex: "\\ln\\frac{K_2}{K_1} = -\\frac{\\Delta H}{R}\\left(\\frac{1}{T_2} - \\frac{1}{T_1}\\right)", label: "van't Hoff equation" },
      { tex: "K_p = \\frac{4\\alpha^2 P}{1-\\alpha^2}", label: "Degree of dissociation, N₂O₄ ⇌ 2NO₂" },
      { tex: "\\text{pH} = \\text{p}K_a + \\log\\frac{[\\text{salt}]}{[\\text{acid}]}", label: "Henderson–Hasselbalch" },
      { tex: "\\alpha = \\sqrt{\\frac{K_a}{C}}", label: "Ostwald dilution law" },
    ],
    tips: [
      "Never write solids or pure liquids in K. CaCO₃ ⇌ CaO + CO₂ has Kp = P(CO₂) alone.",
      "Inert gas at constant V → no shift; at constant P → shifts toward more gas moles. The distinction is a favourite trap.",
      "Exothermic reaction + temperature rise → K falls (Le Chatelier on K itself, not just Q).",
      "Degree of dissociation rises with dilution (weak electrolytes), with temperature for endothermic dissociation, and falls with added common ion.",
      "When Q is given instead of K, compare them first — many 'shift' questions need no calculation beyond the sign of K − Q.",
    ],
  },

  "chemical-kinetics": {
    title: "Chemical Kinetics",
    subject: "Chemistry",
    tagline: "Rate laws, half-lives and Arrhenius — where the integrated equations do all the work.",
    simTitle: "Rate-law explorer",
    simAbout: "Integrated rate laws for zero, first and second order — watch the ensemble, the curve and the straight-line test together.",
    sections: [
      {
        heading: "Order is experimental",
        body: [
          "Order is the exponent the rate law assigns to a concentration — it must be measured, not read from the stoichiometric equation (except for elementary steps, where order = molecularity). Rate = k[A]^n with n = 0, 1 or 2 covers almost every JEE question.",
          "Units of k betray the order: mol L⁻¹ s⁻¹ (zero), s⁻¹ (first), L mol⁻¹ s⁻¹ (second). If a unit conversion question appears, this is the entire trick.",
        ],
      },
      {
        heading: "Integrated laws and half-lives",
        body: [
          "Integrate the rate law once and the exam becomes arithmetic: zero order [A] = [A]₀ − kt (straight [A]–t plot, [A] hits zero at t = [A]₀/k); first order ln[A] = ln[A]₀ − kt (constant t½ = ln2/k, independent of concentration); second order 1/[A] = 1/[A]₀ + kt (t½ doubles each halving).",
          "First-order kinetics rules radioactivity, ester hydrolysis in excess water and many decompositions. The constancy of t½ is its fingerprint: if 50% remains after equal intervals regardless of the starting amount, it's first order.",
        ],
      },
      {
        heading: "Temperature dependence",
        body: [
          "Arrhenius: k = Ae^(−Ea/RT). Plot ln k against 1/T and the slope is −Ea/R — graphical questions hand you two points and expect this line. A catalyst raises A or lowers Ea; it never changes ΔG or the equilibrium constant.",
          "The '10-degree rule' (rate roughly doubles per 10 K) is just Arrhenius evaluated twice. For a reaction to finish in half the time at the same conversion, k must double.",
        ],
      },
    ],
    formulas: [
      { tex: "[A] = [A]_0 - kt", label: "Zero order" },
      { tex: "\\ln[A] = \\ln[A]_0 - kt", label: "First order" },
      { tex: "\\frac{1}{[A]} = \\frac{1}{[A]_0} + kt", label: "Second order" },
      { tex: "t_{1/2}: \\; \\frac{[A]_0}{2k}, \\; \\frac{\\ln 2}{k}, \\; \\frac{1}{k[A]_0}", label: "Half-lives by order" },
      { tex: "\\ln k = \\ln A - \\frac{E_a}{RT}", label: "Arrhenius (log form)" },
    ],
    tips: [
      "Identify order from the plot: [A] vs t straight → zero; ln[A] vs t straight → first; 1/[A] vs t straight → second. The sim's inset shows exactly this.",
      "First order: fraction remaining after n half-lives = (1/2)ⁿ — 75% completion takes 2 t½ regardless of concentration.",
      "Zero order stops at t = [A]₀/k: the rate is zero after depletion, so extrapolate carefully.",
      "Molecularity (elementary-step count, never zero or fractional) ≠ order (overall, can be zero/fractional).",
      "For method of initial rates, isolate variables: doubling [A] quadruples rate ⇒ order 2 in A.",
    ],
  },

  "coordination-compounds": {
    title: "Coordination Compounds",
    subject: "Chemistry",
    tagline: "Crystal field theory, isomerism and nomenclature — Werner's world, worth 7.5% of JEE Main.",
    simTitle: "Crystal-field splitting lab",
    simAbout: "Ligand strength sets Δ; Δ vs the pairing energy P decides high or low spin, the CFSE and the magnetic moment.",
    sections: [
      {
        heading: "Why d orbitals split",
        body: [
          "In an octahedral field the ligands sit on the x, y and z axes. The e_g orbitals (dz², dx²−y²) point straight at them and are repelled upward; the t₂g set (dxy, dyz, dzx) hides between the axes and drops. The gap Δo keeps the barycentre fixed: e_g rises 0.6Δo, t₂g falls 0.4Δo.",
          "Tetrahedral fields put four ligands off-axis, so the ordering flips (e below t₂) and the gap shrinks to Δt = (4/9)Δo — too small to force pairing, which is why tetrahedral complexes are always high spin.",
        ],
      },
      {
        heading: "High spin, low spin and CFSE",
        body: [
          "Only d⁴–d⁷ octahedral complexes face a choice: promote to e_g (high spin) or pair in t₂g (low spin). Strong-field ligands (CN⁻, NH₃) give Δo > P and low spin; weak-field ligands (halides, H₂O) give high spin. Co³⁺ is low spin with almost every ligand — [CoF₆]³⁻ is the famous exception.",
          "Crystal field stabilisation energy books the balance: CFSE = (n(t₂g)(−0.4) + n(e_g)(+0.6))Δo. d⁶ low spin gives −2.4Δo — the most stabilised configuration, one reason Co³⁺ complexes are so numerous.",
        ],
      },
      {
        heading: "Counting, colours and names",
        body: [
          "Spin-only magnetic moment μ = √(n(n+2)) BM from the unpaired-electron count n. High-spin d⁵ (Mn²⁺) has n = 5 → 5.92 BM; low-spin d⁶ has n = 0 → diamagnetic. A quick μ measurement reveals the spin state.",
          "Isomerism rewards careful drawing: geometrical cis/trans (square planar MA₂B₂), optical enantiomers ([M(AA)₃]³⁺ type), hydrate isomers ([Cr(H₂O)₆]Cl₃ vs [Cr(H₂O)₅Cl]Cl₂·H₂O). Name ligands alphabetically with the metal last (cation first), oxidation state in Roman numerals.",
        ],
      },
    ],
    formulas: [
      { tex: "\\text{CFSE}_{oct} = (n_{t_{2g}}(-0.4) + n_{e_g}(0.6))\\,\\Delta_o", label: "Octahedral CFSE" },
      { tex: "\\Delta_t = \\tfrac{4}{9}\\Delta_o", label: "Tetrahedral gap" },
      { tex: "\\mu = \\sqrt{n(n+2)}\\ \\text{BM}", label: "Spin-only moment" },
      { tex: "E_{\\text{photon}} = h\\nu = \\Delta_o", label: "Colour from the gap" },
    ],
    tips: [
      "Spectrochemical series ladder to memorise: I⁻ < Br⁻ < Cl⁻ < F⁻ < H₂O < NH₃ < en < CN⁻. Strong-field ⇒ low spin ⇒ smaller μ.",
      "e_g before t₂g in filling order for octahedral; reversed labels but same idea for tetrahedral — the sim makes the flip visible.",
      "Only d⁴–d⁷ octahedral complexes face a real high/low-spin choice — outside that range both fillings give the same configuration.",
      "Colour is the complement of the absorbed colour: absorb red ⇒ look green. Larger Δo (stronger field) ⇒ absorption shifts blueward.",
      "EAN or oxidation-state slips sink nomenclature: count charges on ligands (NH₃ = 0, Cl⁻ = −1, en = 0) before writing the Roman numeral.",
    ],
  },

  "electrochemistry": {
    title: "Electrochemistry",
    subject: "Chemistry",
    tagline: "Galvanic cells, the Nernst equation and ΔG = −nFE — where thermodynamics becomes voltage.",
    simTitle: "Daniell cell — Nernst equation",
    simAbout: "Slide the ion concentrations and temperature; the meter, electron flow and ion drift all follow the Nernst equation exactly.",
    sections: [
      {
        heading: "Anatomy of a galvanic cell",
        body: [
          "Oxidation at the anode (Zn → Zn²⁺ + 2e⁻), reduction at the cathode (Cu²⁺ + 2e⁻ → Cu). Electrons flow anode → cathode through the wire; the salt bridge lets ions complete the circuit so neither half-cell accumulates charge.",
          "In a galvanic cell the anode is negative and the cathode positive — reversed in electrolysis. Cell notation writes anode on the left: Zn | Zn²⁺ ‖ Cu²⁺ | Cu, with the salt bridge as the double bar.",
        ],
      },
      {
        heading: "The Nernst equation",
        body: [
          "E = E° − (RT/nF) ln Q. At 298 K with base-10 logs this becomes E = E° − (0.0591/n) log Q — the form JEE expects. For the Daniell cell (n = 2), raising [Zn²⁺] or lowering [Cu²⁺] pushes Q up and drags E below 1.10 V.",
          "Concentration cells use the same electrode on both sides (E° = 0); the spontaneous direction equalises concentrations, and the biggest voltage such a cell can produce is set by the concentration ratio alone.",
        ],
      },
      {
        heading: "Electricity meets thermodynamics",
        body: [
          "ΔG = −nFE. A positive E means a spontaneous cell reaction: the Daniell cell's 1.10 V corresponds to ΔG = −212 kJ/mol. At equilibrium Q = K, E = 0 and no net current flows — a dead battery is an equilibrium mixture.",
          "Standard potentials combine as E°cell = E°cathode − E°anode (never multiply by stoichiometric coefficients) and relate to K: log K = nE°/0.0591. Large E° ⇒ large K ⇒ reaction essentially complete.",
        ],
      },
    ],
    formulas: [
      { tex: "E = E^\\circ - \\frac{RT}{nF}\\ln Q", label: "Nernst equation" },
      { tex: "E = E^\\circ - \\frac{0.0591}{n}\\log Q \\;(298\\,\\text{K})", label: "Nernst, base-10 form" },
      { tex: "\\Delta G = -nFE", label: "Free energy from voltage" },
      { tex: "E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}", label: "Combining standard potentials" },
      { tex: "\\log K = \\frac{nE^\\circ}{0.0591}", label: "Equilibrium constant of the cell reaction" },
    ],
    tips: [
      "E° values are intensive — doubling a half-equation never doubles E°. Only ΔG scales with stoichiometry.",
      "Anode/cathode sign flip between galvanic (−/+) and electrolytic (+/−) cells is the most common conceptual trap.",
      "Diluting the product ion (or concentrating the reactant ion) raises E — check Q, not intuition.",
      "At equilibrium E_cell = 0 but E° stays the same; the Nernst slope dies at Q = K.",
      "In concentration cells both E° are identical, so E = (0.0591/n) log(c_cathode/c_anode) directly.",
    ],
  },
};
