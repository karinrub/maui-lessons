import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion'
import { toGlslVec3 } from '../../styles/mauiPalette'
import './HomeAmbientBackground.css'

const VERT = /* glsl */ `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

/*
  Design intent: the light-mode sibling of NavGradient. The home page canvas
  is warm cream paper with two slow atmospheric washes drifting across it —
  one warm amber (sunlight through shallow water), one cool bay-teal (reef
  shadow). Both stay within a few percent of the base luminance so text and
  media always sit on a calm, legible ground.

  u_scroll deepens the whole field toward bay/jungle as the visitor leaves
  the hero and the dark services canvas rises, so the section handoff reads
  as one continuous tonal shift instead of a dark card landing on stark cream.
*/
const FRAG = /* glsl */ `
  precision mediump float;
  uniform float u_time;
  uniform vec2  u_resolution;
  uniform float u_scroll;

  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 17.5);
    return fract(p.x * p.y);
  }

  // Quintic-smooth value noise — maximum smoothness, zero banding
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(
      mix(hash(i),                   hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Two octaves only — large, calm undulations
  float fbm(vec2 p) {
    return noise(p) * 0.62 + noise(p * 2.05 + vec2(3.71, 2.39)) * 0.38;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.y    = 1.0 - uv.y;

    vec2 p = uv;
    p.x *= u_resolution.x / u_resolution.y;

    float t = u_time * 0.03;

    vec3 cream  = vec3(0.961, 0.941, 0.906); // site canvas #f5f0e7
    vec3 amber  = ${toGlslVec3('amber')};
    vec3 bay    = ${toGlslVec3('bay')};
    vec3 jungle = ${toGlslVec3('jungle')};

    vec3 col = cream;

    // Soft daylight near the top of the viewport
    col += vec3(0.026, 0.022, 0.016) * smoothstep(0.55, 0.0, uv.y);

    // Warm amber wash — sunlight drifting across the paper
    float warm = smoothstep(0.45, 0.88, fbm(p * 0.85 + vec2(t * 0.34, -t * 0.21)));
    col = mix(col, mix(cream, amber, 0.30), warm * 0.15);

    // Cool bay-teal wash — reef shadow moving the opposite way
    float cool = smoothstep(0.50, 0.92, fbm(p * 1.45 + vec2(-t * 0.27, t * 0.30) + 4.7));
    col = mix(col, mix(cream, bay, 0.24), cool * 0.13);

    // Scroll deepening: the field leans toward bay/jungle as the dark
    // services canvas arrives, keeping the section handoff on related ground
    vec3 deep = mix(cream, mix(bay, jungle, 0.4), 0.11);
    col = mix(col, deep, u_scroll * 0.85);

    // Barely-there corner falloff keeps the center airy
    vec2 c = uv - 0.5;
    col -= vec3(0.034, 0.029, 0.021) * dot(c, c) * 1.35;

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`

// Deepening completes roughly as the deck canvas settles into the pin
const SCROLL_DEPTH_VIEWPORTS = 2.2

export default function HomeAmbientBackground() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const startRef = useRef(0)
  const scrollMixRef = useRef(0)
  const uniformsRef = useRef<{
    time: WebGLUniformLocation | null
    resolution: WebGLUniformLocation | null
    scroll: WebGLUniformLocation | null
  }>({ time: null, resolution: null, scroll: null })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s, src)
      gl!.compileShader(s)
      return s
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const posLoc = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    uniformsRef.current = {
      time: gl.getUniformLocation(prog, 'u_time'),
      resolution: gl.getUniformLocation(prog, 'u_resolution'),
      scroll: gl.getUniformLocation(prog, 'u_scroll'),
    }
    glRef.current = gl
    startRef.current = performance.now()

    function resize() {
      const cv = canvasRef.current
      const g = glRef.current
      if (!cv || !g) return
      // Half resolution — the shader is all soft gradients, so the upscale is invisible
      const w = Math.round(cv.clientWidth * 0.5)
      const h = Math.round(cv.clientHeight * 0.5)
      if (cv.width !== w || cv.height !== h) {
        cv.width = w
        cv.height = h
        g.viewport(0, 0, w, h)
      }
    }

    function draw(elapsedSeconds: number, scrollMix: number) {
      const g = glRef.current
      if (!g) return
      const u = uniformsRef.current
      g.uniform1f(u.time, elapsedSeconds)
      g.uniform2f(u.resolution, g.drawingBufferWidth, g.drawingBufferHeight)
      g.uniform1f(u.scroll, scrollMix)
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4)
    }

    resize()
    window.addEventListener('resize', resize)

    if (prefersReducedMotion) {
      // Single static frame: the tinted atmosphere without any motion
      const staticFrame = () => draw(40, 0)
      staticFrame()
      window.addEventListener('resize', staticFrame)
      return () => {
        window.removeEventListener('resize', resize)
        window.removeEventListener('resize', staticFrame)
        glRef.current = null
      }
    }

    function render() {
      const elapsed = (performance.now() - startRef.current) * 0.001
      const depthRange = window.innerHeight * SCROLL_DEPTH_VIEWPORTS || 1
      const target = Math.min(Math.max(window.scrollY / depthRange, 0), 1)
      // Ease toward the scroll target so the tonal shift stays liquid
      scrollMixRef.current += (target - scrollMixRef.current) * 0.06
      draw(elapsed, scrollMixRef.current)
    }

    gsap.ticker.add(render)

    return () => {
      gsap.ticker.remove(render)
      window.removeEventListener('resize', resize)
      glRef.current = null
    }
  }, [prefersReducedMotion])

  return (
    <div className="home-ambient" aria-hidden="true">
      <canvas ref={canvasRef} className="home-ambient__canvas" />
    </div>
  )
}
