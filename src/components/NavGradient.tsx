import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { toGlslVec3 } from '../styles/mauiPalette'

const VERT = /* glsl */ `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

/*
  Design intent: deep Maui tropical — lush jungle shadow fading into teal-green
  coastal water, lit by warm amber sunset light. Two slowly drifting luminous
  points suggest bioluminescence or caustic light through shallow water.

  Noise: 2-octave FBm with quintic interpolation — very smooth, large-scale
  undulations only. No film grain; the palette does the textural work.
*/
const FRAG = /* glsl */ `
  precision mediump float;
  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec2  u_origin;

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

  // Two octaves only — keeps blobs large and calm
  float fbm(vec2 p) {
    return noise(p) * 0.62 + noise(p * 2.05 + vec2(3.71, 2.39)) * 0.38;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv.y    = 1.0 - uv.y;

    // Two independent time streams: slow main flow, faster shimmer drift
    float t  = u_time * 0.055;
    float ts = u_time * 0.28;

    // Large-scale smooth undulation — single warp, very calm
    float n = fbm(uv * 1.4 + vec2(t * 0.20, t * 0.12));

    // Gentle diagonal gradient bias: darker lower-left → richer upper-right
    float diag = uv.y * 0.42 + (1.0 - uv.x) * 0.14;
    float v    = mix(n, diag, 0.32) + 0.06;
    v          = clamp(v, 0.0, 1.0);

    // ── Five-stop Maui palette ─────────────────────────────────────────────
    // deep shadow → emerald → tropical green → teal-green → warm amber-gold
    vec3 c1 = ${toGlslVec3('shadow')};   // near-black teal shadow
    vec3 c2 = ${toGlslVec3('emerald')};  // deep emerald
    vec3 c3 = ${toGlslVec3('jungle')};   // tropical green (Maui jungle)
    vec3 c4 = ${toGlslVec3('bay')};      // teal-green (Maui bays)
    vec3 c5 = ${toGlslVec3('amber')};    // warm amber-gold (sunset / site)

    vec3 col = c1;
    col = mix(col, c2, smoothstep(0.10, 0.30, v));
    col = mix(col, c3, smoothstep(0.30, 0.52, v));
    col = mix(col, c4, smoothstep(0.52, 0.72, v));
    col = mix(col, c5, smoothstep(0.72, 0.95, v));

    // Vignette: gently darken corners, keep center clear for legibility
    float vig = 1.0 - 0.38 * dot((uv - 0.5) * 1.75, (uv - 0.5) * 1.75);
    col *= clamp(vig, 0.52, 1.0);

    // Warm amber glow radiating from the reveal origin (menu button)
    float od = length(uv - u_origin);
    col += vec3(0.105, 0.068, 0.016) * exp(-od * od * 2.8);

    // Two drifting luminous points — like bioluminescence / light through water
    vec2 p1  = vec2(0.28 + sin(ts * 0.82) * 0.17, 0.44 + cos(ts * 0.62) * 0.13);
    vec2 p2  = vec2(0.72 + cos(ts * 0.68) * 0.14, 0.56 + sin(ts * 0.77) * 0.15);
    float s1 = exp(-dot(uv - p1, uv - p1) * 20.0);
    float s2 = exp(-dot(uv - p2, uv - p2) * 26.0);
    col += vec3(0.038, 0.115, 0.092) * (s1 * 0.50 + s2 * 0.38);

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`

type Props = {
  isVisible: boolean
  originRef: { readonly current: { x: number; y: number } }
}

export default function NavGradient({ isVisible, originRef }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const glRef       = useRef<WebGLRenderingContext | null>(null)
  const startRef    = useRef(0)
  const uniformsRef = useRef<{
    time:       WebGLUniformLocation | null
    resolution: WebGLUniformLocation | null
    origin:     WebGLUniformLocation | null
  }>({ time: null, resolution: null, origin: null })

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
      time:       gl.getUniformLocation(prog, 'u_time'),
      resolution: gl.getUniformLocation(prog, 'u_resolution'),
      origin:     gl.getUniformLocation(prog, 'u_origin'),
    }
    glRef.current  = gl
    startRef.current = performance.now()

    function resize() {
      const cv = canvasRef.current
      const g  = glRef.current
      if (!cv || !g) return
      const w = Math.round(cv.clientWidth  * 0.5)
      const h = Math.round(cv.clientHeight * 0.5)
      if (cv.width !== w || cv.height !== h) {
        cv.width  = w
        cv.height = h
        g.viewport(0, 0, w, h)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      glRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    function render() {
      const gl     = glRef.current
      const canvas = canvasRef.current
      if (!gl || !canvas) return

      const t  = (performance.now() - startRef.current) * 0.001
      const u  = uniformsRef.current
      const cw = canvas.clientWidth  || 1
      const ch = canvas.clientHeight || 1
      const { x, y } = originRef.current

      gl.uniform1f(u.time,       t)
      gl.uniform2f(u.resolution, gl.drawingBufferWidth, gl.drawingBufferHeight)
      gl.uniform2f(u.origin,     x / cw, 1.0 - y / ch)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    gsap.ticker.add(render)
    return () => gsap.ticker.remove(render)
  }, [isVisible, originRef])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        zIndex: 0,
      }}
    />
  )
}
