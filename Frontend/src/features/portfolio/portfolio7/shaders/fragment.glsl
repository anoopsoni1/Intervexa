uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uHover;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * noise(p);
    p *= 2.0;
    amp *= 0.55;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  vec2 center = vec2(0.5);

  vec2 mouseOffset = (uMouse - center) * 0.35;
  vec2 p = uv + mouseOffset;

  float t = uTime * 0.2;
  float n1 = fbm(p * 4.0 + t);
  float n2 = fbm((p + n1 * 0.14) * 10.0 - t * 1.9);
  float n3 = noise((p + n2 * 0.08) * 24.0 + uTime * 0.15);
  float wave = sin((p.y + n2 * 0.08) * 16.0 + uTime * 0.8) * (0.032 + uHover * 0.022);

  float dist = distance(uv, uMouse);
  float ripple = smoothstep(0.56, 0.0, dist) * (0.09 + uHover * 0.15);
  float swirl = smoothstep(0.55, 0.02, dist) * (0.04 + uHover * 0.06);
  uv += vec2(
    wave + ripple * sin(24.0 * dist - uTime * 4.0) + swirl * (uv.y - 0.5),
    wave * 0.65 + ripple * cos(26.0 * dist - uTime * 3.0) - swirl * (uv.x - 0.5)
  );

  float grain = noise(uv * uResolution.xy / min(uResolution.x, uResolution.y) * 1.6 + uTime * 0.25);
  float vignette = smoothstep(0.95, 0.25, distance(uv, center));

  vec3 base = vec3(0.02, 0.02, 0.03);
  vec3 accent = vec3(0.91, 0.35, 0.13);
  vec3 deep = vec3(0.09, 0.12, 0.22);
  vec3 flow = mix(base, deep, smoothstep(0.2, 0.95, n1 + n3 * 0.4));
  flow = mix(flow, accent, smoothstep(0.6, 1.05, n1 + n2 * 0.36 + ripple));

  float chroma = 0.0025 + uHover * 0.0025;
  flow.r += noise(uv * 11.0 + uTime) * chroma;
  flow.b -= noise(uv * 9.0 - uTime * 0.7) * chroma;
  flow *= 0.55 + vignette * 0.45;
  flow += (grain - 0.5) * 0.07;

  gl_FragColor = vec4(flow, 1.0);
}

