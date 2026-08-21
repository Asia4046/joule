import type { ComponentType } from "react";
import ErrorSim from "./ErrorSim";
import ProjectileSim from "./ProjectileSim";
import FrictionSim from "./FrictionSim";
import EnergyRampSim from "./EnergyRampSim";
import AngularMomentumSim from "./AngularMomentumSim";
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
import CollisionSim from "./CollisionSim";
import RollingSim from "./RollingSim";
import DopplerSim from "./DopplerSim";
import RCCircuitSim from "./RCCircuitSim";
import DecaySim from "./DecaySim";
import StandingWaveSim from "./StandingWaveSim";
import TrainTunnelSim from "./TrainTunnelSim";
import LensSystemSim from "./LensSystemSim";
import AtomicOrbitalSim from "./AtomicOrbitalSim";
import PeriodicTrendsSim from "./PeriodicTrendsSim";

/** Chapter slug → interactive simulation component. All sims are client components. */
export const SIM_REGISTRY: Record<string, ComponentType> = {
  "units-and-measurements": ErrorSim,
  kinematics: ProjectileSim,
  "laws-of-motion": FrictionSim,
  "work-energy-and-power": EnergyRampSim,
  "rotational-motion": AngularMomentumSim,
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
  // JEE Advanced question labs — standalone archetypes not tied to a single chapter
  collisions: CollisionSim,
  "rolling-motion": RollingSim,
  "doppler-effect": DopplerSim,
  "rc-transients": RCCircuitSim,
  "nuclear-decay": DecaySim,
  "standing-waves": StandingWaveSim,
  "train-in-tunnel": TrainTunnelSim,
  "lens-systems": LensSystemSim,
  // Chemistry labs
  "atomic-structure": AtomicOrbitalSim,
  "classification-of-elements-and-periodicity": PeriodicTrendsSim,
};
