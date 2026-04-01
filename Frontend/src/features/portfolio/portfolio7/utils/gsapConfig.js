import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Flip } from "gsap/Flip";

let configured = false;

export function setupGsap() {
  if (configured) return;
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, Flip);
  configured = true;
}

