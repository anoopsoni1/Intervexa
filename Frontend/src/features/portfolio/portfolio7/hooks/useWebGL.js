import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import vertexShader from "../shaders/vertex.glsl?raw";
import fragmentShader from "../shaders/fragment.glsl?raw";

export function useWebGL(canvasRef) {
  const uniformsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 12);
    camera.position.z = 2.1;

    /** Plane is 2×2 units; scale so it always covers the full viewport at its Z depth (no letterboxing). */
    const PLANE_BASE = 2;
    const fitPlaneToViewport = (mesh, worldZ, bleed = 1.12) => {
      const dist = camera.position.z - worldZ;
      if (dist <= 0.01) return;
      const vFov = (camera.fov * Math.PI) / 180;
      const viewH = 2 * Math.tan(vFov / 2) * dist;
      const viewW = viewH * camera.aspect;
      mesh.scale.set((viewW / PLANE_BASE) * bleed, (viewH / PLANE_BASE) * bleed, 1);
    };

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
    };
    uniformsRef.current = uniforms;

    const materialMain = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
    });
    const materialBack = materialMain.clone();
    materialBack.blending = THREE.AdditiveBlending;
    materialBack.transparent = true;
    materialBack.opacity = 0.42;

    const geometry = new THREE.PlaneGeometry(PLANE_BASE, PLANE_BASE, 1, 1);
    const meshMain = new THREE.Mesh(geometry, materialMain);
    const meshBack = new THREE.Mesh(geometry, materialBack);
    meshMain.position.z = -0.25;
    meshBack.position.z = -1.45;
    fitPlaneToViewport(meshMain, meshMain.position.z, 1.18);
    fitPlaneToViewport(meshBack, meshBack.position.z, 1.28);
    scene.add(meshBack);
    scene.add(meshMain);

    const pointer = (event) => {
      const x = event.clientX / window.innerWidth;
      const y = 1 - event.clientY / window.innerHeight;
      gsap.to(uniforms.uMouse.value, { x, y, duration: 0.45, ease: "power3.out" });
      gsap.to(camera.position, {
        x: (x - 0.5) * 0.35,
        y: (y - 0.5) * 0.2,
        duration: 1.1,
        ease: "power3.out",
      });
    };

    const resize = () => {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      fitPlaneToViewport(meshMain, meshMain.position.z, 1.18);
      fitPlaneToViewport(meshBack, meshBack.position.z, 1.28);
    };

    let paused = false;
    const onVisibility = () => {
      paused = document.hidden;
    };

    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    let frameId = 0;
    const clock = new THREE.Clock();
    const render = () => {
      if (paused) {
        frameId = requestAnimationFrame(render);
        return;
      }
      uniforms.uTime.value = clock.getElapsedTime();
      meshMain.rotation.z = Math.sin(uniforms.uTime.value * 0.12) * 0.07;
      meshBack.rotation.x = Math.cos(uniforms.uTime.value * 0.08) * 0.08;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      materialMain.dispose();
      materialBack.dispose();
      geometry.dispose();
      renderer.dispose();
      uniformsRef.current = null;
    };
  }, [canvasRef]);

  return uniformsRef;
}

