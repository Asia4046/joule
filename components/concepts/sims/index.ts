import type { ComponentType } from "react";
import ErrorSim from "./ErrorSim";
import ProjectileSim from "./ProjectileSim";
import FrictionSim from "./FrictionSim";
import EnergyRampSim from "./EnergyRampSim";
import RollingRaceSim from "./RollingRaceSim";
import OrbitSim from "./OrbitSim";
import ViscositySim from "./ViscositySim";
import PistonSim from "./PistonSim";
import DampedOscillatorSim from "./DampedOscillatorSim";
import FieldLinesSim from "./FieldLinesSim";
import DriftSim from "./DriftSim";
import ChargeInBSim from "./ChargeInBSim";
import BarMagnetSim from "./BarMagnetSim";
import GeneratorSim from "./GeneratorSim";
import EMWaveSim from "./EMWaveSim";
import LensSim from "./LensSim";
import YDSESIm from "./YDSESIm";
import PhotoelectricSim from "./PhotoelectricSim";
import BohrSim from "./BohrSim";
import RectifierSim from "./RectifierSim";
import VernierSim from "./VernierSim";

/** Chapter slug → interactive simulation component. All sims are client components. */
export const SIM_REGISTRY: Record<string, ComponentType> = {
  "units-and-measurements": ErrorSim,
  kinematics: ProjectileSim,
  "laws-of-motion": FrictionSim,
  "work-energy-and-power": EnergyRampSim,
  "rotational-motion": RollingRaceSim,
  gravitation: OrbitSim,
  "properties-of-solids-and-liquids": ViscositySim,
  thermodynamics: PistonSim,
  "oscillations-and-waves": DampedOscillatorSim,
  electrostatics: FieldLinesSim,
  "current-electricity": DriftSim,
  "magnetic-effects-of-current": ChargeInBSim,
  "magnetism-and-matter": BarMagnetSim,
  "emi-and-alternating-current": GeneratorSim,
  "electromagnetic-waves": EMWaveSim,
  "ray-optics": LensSim,
  "wave-optics": YDSESIm,
  "dual-nature-of-matter-and-radiation": PhotoelectricSim,
  "atoms-and-nuclei": BohrSim,
  "semiconductor-electronics": RectifierSim,
  "experimental-physics": VernierSim,
};
