export type ConceptSection = { heading: string; body: string[] };
export type ConceptFormula = { tex: string; label: string; note?: string };
export type ConceptContent = {
  title: string;
  tagline: string;
  simTitle: string;
  simAbout: string;
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
    tagline: "Moment of inertia, torque and rolling — where JEE separates the well-drilled from the rest.",
    simTitle: "Rolling race: ring vs disk vs sphere",
    simAbout: "Race three bodies down an incline; see why the sphere always wins and geometry decides the order.",
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
};
