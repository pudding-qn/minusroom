import { useRef, useEffect, useCallback, useState, useImperativeHandle, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

/* ═══════════════════════════════════════════════════════
   WebGL Water Ripple — real refraction distortion
   Two framebuffers ping-pong a height field.
   Mouse adds drops; the height field propagates waves;
   a final pass distorts the background texture through
   the normal map derived from the height field.
   ═══════════════════════════════════════════════════════ */
const WaterSurface = forwardRef(function WaterSurface(_, ref) {
  const canvasRef = useRef(null)
  const glRef = useRef(null)
  const programsRef = useRef({})
  const fbRef = useRef({ a: null, b: null })
  const bgRef = useRef(null)
  const addDropRef = useRef(null) // exposed to parent
  const rafRef = useRef(null)

  // Expose addDrop to parent so it can forward mouse events
  useImperativeHandle(ref, () => ({
    addDrop: (nx, ny, radius, strength) => {
      if (addDropRef.current) addDropRef.current(nx, ny, radius, strength)
    },
    getCanvas: () => canvasRef.current,
  }))

  // Compile a shader
  const compileShader = (gl, src, type) => {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s))
      return null
    }
    return s
  }

  // Link a program
  const linkProgram = (gl, vs, fs) => {
    const p = gl.createProgram()
    gl.attachShader(p, vs)
    gl.attachShader(p, fs)
    gl.linkProgram(p)
    return p
  }

  // Create a framebuffer with float texture
  const createFB = (gl, w, h, ext) => {
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    // Use HALF_FLOAT if available via extension
    if (ext) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, ext.HALF_FLOAT_OES, null)
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    const fb = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return { fb, tex }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: false })
    if (!gl) return
    glRef.current = gl

    const ext = gl.getExtension('OES_texture_half_float')
    gl.getExtension('OES_texture_half_float_linear')

    let W = window.innerWidth
    let H = window.innerHeight
    const SIM = 512 // simulation resolution
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'

    // ── Fullscreen quad ──
    const quadBuf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    // ── Shared vertex shader ──
    const VERT = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `

    // ── Drop shader — adds a smooth drop to height field ──
    const DROP_FRAG = `
      precision highp float;
      varying vec2 v_uv;
      uniform sampler2D u_tex;
      uniform vec2 u_center;
      uniform float u_radius;
      uniform float u_strength;
      void main() {
        vec4 cur = texture2D(u_tex, v_uv);
        float d = length(v_uv - u_center);
        float drop = u_strength * exp(-d * d / (u_radius * u_radius));
        gl_FragColor = vec4(cur.r + drop, cur.gba);
      }
    `

    // ── Propagate shader — wave equation step ──
    const PROP_FRAG = `
      precision highp float;
      varying vec2 v_uv;
      uniform sampler2D u_cur;
      uniform sampler2D u_prev;
      uniform vec2 u_texel;
      uniform float u_damping;
      void main() {
        float c = texture2D(u_cur, v_uv).r;
        float p = texture2D(u_prev, v_uv).r;
        float l = texture2D(u_cur, v_uv + vec2(-u_texel.x, 0.0)).r;
        float r = texture2D(u_cur, v_uv + vec2( u_texel.x, 0.0)).r;
        float t = texture2D(u_cur, v_uv + vec2(0.0,  u_texel.y)).r;
        float b = texture2D(u_cur, v_uv + vec2(0.0, -u_texel.y)).r;
        float next = (l + r + t + b) * 0.5 - p;
        next *= u_damping;
        gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
      }
    `

    // ── Render shader — distort background using height normals ──
    const RENDER_FRAG = `
      precision highp float;
      varying vec2 v_uv;
      uniform sampler2D u_water;
      uniform sampler2D u_bg;
      uniform vec2 u_texel;
      uniform float u_refraction;
      void main() {
        float l = texture2D(u_water, v_uv + vec2(-u_texel.x, 0.0)).r;
        float r = texture2D(u_water, v_uv + vec2( u_texel.x, 0.0)).r;
        float t = texture2D(u_water, v_uv + vec2(0.0,  u_texel.y)).r;
        float b = texture2D(u_water, v_uv + vec2(0.0, -u_texel.y)).r;
        vec2 normal = vec2(l - r, t - b);

        // Refraction scales up toward bottom for layered depth feel
        float yBias = 1.0 + smoothstep(0.3, 1.0, v_uv.y) * 0.8;
        vec2 uv = v_uv + normal * u_refraction * yBias;
        vec3 col = texture2D(u_bg, uv).rgb;

        // Caustic highlight on wave peaks — stronger at bottom
        float height = texture2D(u_water, v_uv).r;
        float causticStrength = 0.08 + smoothstep(0.4, 1.0, v_uv.y) * 0.06;
        float caustic = smoothstep(0.001, 0.015, abs(height)) * causticStrength;
        col += vec3(caustic * 0.75, caustic * 0.70, caustic * 0.55);

        // Specular shine — slightly more visible
        float spec = pow(max(0.0, dot(normalize(vec3(normal * 35.0, 1.0)), normalize(vec3(0.3, 0.5, 1.0)))), 6.0);
        col += vec3(spec * 0.06);

        // Subtle bottom vignette — gives depth
        float bottomFade = smoothstep(0.85, 1.0, v_uv.y);
        col = mix(col, col * vec3(0.96, 0.95, 0.94), bottomFade * 0.4);

        gl_FragColor = vec4(col, 1.0);
      }
    `

    // Compile programs
    const vs = compileShader(gl, VERT, gl.VERTEX_SHADER)
    const dropProg = linkProgram(gl, vs, compileShader(gl, DROP_FRAG, gl.FRAGMENT_SHADER))
    const propProg = linkProgram(gl, vs, compileShader(gl, PROP_FRAG, gl.FRAGMENT_SHADER))
    const renderProg = linkProgram(gl, vs, compileShader(gl, RENDER_FRAG, gl.FRAGMENT_SHADER))

    programsRef.current = { dropProg, propProg, renderProg }

    // Create 3 framebuffers: two for ping-pong wave sim, one for bg
    const simA = createFB(gl, SIM, SIM, ext)
    const simB = createFB(gl, SIM, SIM, ext)
    const simC = createFB(gl, SIM, SIM, ext) // previous frame
    fbRef.current = { a: simA, b: simB, c: simC, which: 0 }

    // ── Background texture — paint the Morandi + ink-wash scene ──
    const bgCanvas = document.createElement('canvas')
    bgCanvas.width = W * dpr
    bgCanvas.height = H * dpr
    const bctx = bgCanvas.getContext('2d')

    // Base
    bctx.fillStyle = '#FAFAF8'
    bctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height)

    // Ink washes
    const drawWash = (x, y, rw, rh, color, angle) => {
      bctx.save()
      bctx.translate(x, y)
      bctx.rotate(angle)
      const g = bctx.createRadialGradient(0, 0, 0, 0, 0, rw)
      g.addColorStop(0, color)
      g.addColorStop(0.5, color.replace(/[\d.]+\)$/, '0.02)'))
      g.addColorStop(1, 'rgba(0,0,0,0)')
      bctx.fillStyle = g
      bctx.beginPath()
      bctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2)
      bctx.fill()
      bctx.restore()
    }

    drawWash(W * dpr * 0.15, H * dpr * 0.2, 400 * dpr, 300 * dpr, 'rgba(60,65,75,0.05)', -0.3)
    drawWash(W * dpr * 0.8, H * dpr * 0.75, 350 * dpr, 280 * dpr, 'rgba(90,78,68,0.04)', 0.2)
    drawWash(W * dpr * 0.5, H * dpr * 0.5, 500 * dpr, 400 * dpr, 'rgba(80,80,85,0.018)', 0)

    // Subtle horizontal lines like water surface reflections
    bctx.globalAlpha = 0.015
    for (let y = 0; y < bgCanvas.height; y += 4 * dpr) {
      bctx.fillStyle = y % (8 * dpr) === 0 ? 'rgba(60,60,60,1)' : 'rgba(90,85,78,1)'
      bctx.fillRect(0, y, bgCanvas.width, 1)
    }
    bctx.globalAlpha = 1

    // Paper grain noise
    const imgData = bctx.getImageData(0, 0, bgCanvas.width, bgCanvas.height)
    const pixels = imgData.data
    for (let i = 0; i < pixels.length; i += 4) {
      const noise = (Math.random() - 0.5) * 6
      pixels[i] += noise
      pixels[i + 1] += noise
      pixels[i + 2] += noise
    }
    bctx.putImageData(imgData, 0, 0)

    // Upload as texture
    const bgTex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, bgTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgCanvas)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    bgRef.current = bgTex

    // ── Helper: run a shader on a framebuffer ──
    const runShader = (program, target, setupUniforms) => {
      gl.useProgram(program)
      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb)
        gl.viewport(0, 0, SIM, SIM)
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
      const posLoc = gl.getAttribLocation(program, 'a_pos')
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf)
      gl.enableVertexAttribArray(posLoc)
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
      setupUniforms(program)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    // ── Drop function ──
    // IMPORTANT: Cannot read from and write to the same framebuffer in WebGL.
    // Use a dedicated spare buffer. Read current 'a', write to 'spare', then
    // swap their tex/fb handles so 'a' always holds the latest state.
    const spare = createFB(gl, SIM, SIM, ext)
    const dropSwap = { src: null, dst: spare }

    const addDrop = (nx, ny, radius, strength) => {
      const cur = fbRef.current.a
      const dst = dropSwap.dst
      // Read from cur, write to dst
      runShader(dropProg, dst, (p) => {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, cur.tex)
        gl.uniform1i(gl.getUniformLocation(p, 'u_tex'), 0)
        gl.uniform2f(gl.getUniformLocation(p, 'u_center'), nx, 1.0 - ny)
        gl.uniform1f(gl.getUniformLocation(p, 'u_radius'), radius)
        gl.uniform1f(gl.getUniformLocation(p, 'u_strength'), strength)
      })
      // Swap handles: a ← dst, spare ← old a
      const tmpFb = cur.fb, tmpTex = cur.tex
      cur.fb = dst.fb;   cur.tex = dst.tex
      dst.fb = tmpFb;    dst.tex = tmpTex
    }
    addDropRef.current = addDrop

    // ── Render loop ──
    const texel = [1.0 / SIM, 1.0 / SIM]
    let ambient = 0

    const frame = () => {
      const { a, b, c } = fbRef.current

      // Propagate: b = propagate(a, c)
      runShader(propProg, b, (p) => {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, a.tex)
        gl.uniform1i(gl.getUniformLocation(p, 'u_cur'), 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, c.tex)
        gl.uniform1i(gl.getUniformLocation(p, 'u_prev'), 1)
        gl.uniform2f(gl.getUniformLocation(p, 'u_texel'), texel[0], texel[1])
        gl.uniform1f(gl.getUniformLocation(p, 'u_damping'), 0.988)
      })

      // Render to screen
      runShader(renderProg, null, (p) => {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, b.tex)
        gl.uniform1i(gl.getUniformLocation(p, 'u_water'), 0)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, bgRef.current)
        gl.uniform1i(gl.getUniformLocation(p, 'u_bg'), 1)
        gl.uniform2f(gl.getUniformLocation(p, 'u_texel'), texel[0], texel[1])
        gl.uniform1f(gl.getUniformLocation(p, 'u_refraction'), 0.035)
      })

      // Cycle: c ← a, a ← b, b ← c
      fbRef.current = { a: b, b: c, c: a, which: 0 }

      // Ambient drops — dual-layer: gentle everywhere + more at bottom
      ambient++
      if (ambient % 120 === 0) {
        // Full-surface gentle ambient
        const ax = 0.1 + Math.random() * 0.8
        const ay = 0.1 + Math.random() * 0.8
        addDrop(ax, ay, 0.015 + Math.random() * 0.012, 0.004 + Math.random() * 0.003)
      }
      if (ambient % 90 === 0) {
        // Bottom-biased ambient for living water feel
        const bx = 0.15 + Math.random() * 0.7
        const by = 0.55 + Math.random() * 0.4
        addDrop(bx, by, 0.01 + Math.random() * 0.01, 0.003 + Math.random() * 0.003)
      }

      rafRef.current = requestAnimationFrame(frame)
    }

    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
    }

    window.addEventListener('resize', onResize)

    // Initial ambient drops
    setTimeout(() => addDrop(0.5, 0.5, 0.04, 0.01), 500)
    setTimeout(() => addDrop(0.3, 0.6, 0.025, 0.006), 1200)
    setTimeout(() => addDrop(0.7, 0.4, 0.02, 0.005), 2000)

    rafRef.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 1, cursor: 'default' }}
    />
  )
})

/* ── Auth page ── */
export function AuthPage() {
  const { setUser } = useStore()
  const navigate = useNavigate()
  const [hovering, setHovering] = useState(false)
  const waterRef = useRef(null)
  const lastDropRef = useRef(0)

  const handleEnter = () => {
    setUser({ email: 'demo@minusroom.app', name: 'Demo User', provider: 'demo' })
    navigate('/space')
  }

  // Mouse move → water ripple
  const handleMouseMove = useCallback((e) => {
    if (!waterRef.current) return
    const now = Date.now()
    if (now - lastDropRef.current < 22) return
    lastDropRef.current = now

    const nx = e.clientX / window.innerWidth
    const ny = e.clientY / window.innerHeight
    const yFactor = ny
    const radius = 0.014 + yFactor * 0.008
    const strength = 0.012 + yFactor * 0.008
    waterRef.current.addDrop(nx, ny, radius, strength)

    // Trailing secondary drop for richer feel
    if (now % 3 === 0) {
      waterRef.current.addDrop(
        nx + (Math.random() - 0.5) * 0.025,
        ny + (Math.random() - 0.5) * 0.025,
        radius * 0.6,
        strength * 0.4
      )
    }
  }, [])

  // Click → burst of drops
  const handleClick = useCallback((e) => {
    if (!waterRef.current) return
    const nx = e.clientX / window.innerWidth
    const ny = e.clientY / window.innerHeight
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        waterRef.current?.addDrop(
          nx + (Math.random() - 0.5) * 0.05,
          ny + (Math.random() - 0.5) * 0.05,
          0.02 + Math.random() * 0.018,
          0.03 + Math.random() * 0.02
        )
      }, i * 50)
    }
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: '#FAFAF8', cursor: 'default' }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <WaterSurface ref={waterRef} />

      {/* ── Main content — pointer-events: none so mouse reaches canvas ── */}
      <div className="relative w-full max-w-sm text-center" style={{ zIndex: 10, pointerEvents: 'none' }}>
        <div className="anim-drift">

          {/* Top decorative line */}
          <div className="mx-auto mb-10" style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, transparent, rgba(90,78,68,0.25), transparent)' }} />

          {/* Brand */}
          <div className="mb-3">
            <span
              className="font-display"
              style={{ fontSize: 42, color: 'var(--text-1)', fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.02em' }}
            >
              minus
            </span>
            <span
              className="font-display"
              style={{ fontSize: 42, color: 'var(--accent)', fontWeight: 400, letterSpacing: '-0.02em' }}
            >
              ROOM
            </span>
          </div>

          {/* Slogan */}
          <p
            className="tracking-[0.25em] uppercase mb-10"
            style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: 9, letterSpacing: '0.28em' }}
          >
            Less Noise, More Room.
          </p>

          {/* Vertical Chinese phrase */}
          <div className="flex justify-center gap-16 mb-10">
            <div className="flex flex-col items-center gap-2">
              {'减噪'.split('').map((ch, i) => (
                <span
                  key={i}
                  className="font-display anim-dissolve"
                  style={{ fontSize: 18, color: 'var(--text-2)', fontWeight: 400, lineHeight: 1, animationDelay: `${0.3 + i * 0.15}s` }}
                >
                  {ch}
                </span>
              ))}
            </div>
            <div style={{ width: 1, alignSelf: 'stretch', background: 'linear-gradient(to bottom, transparent, rgba(90,78,68,0.15), transparent)' }} />
            <div className="flex flex-col items-center gap-2">
              {'留真'.split('').map((ch, i) => (
                <span
                  key={i}
                  className="font-display anim-dissolve"
                  style={{ fontSize: 18, color: 'var(--text-2)', fontWeight: 400, lineHeight: 1, animationDelay: `${0.5 + i * 0.15}s` }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed mx-auto max-w-[260px] mb-1.5 anim-dissolve" style={{ color: 'var(--text-2)', fontWeight: 400, lineHeight: 2.0, animationDelay: '0.6s' }}>
            属于自己的知识资产
          </p>
          <p className="text-xs mx-auto max-w-[260px] mb-10 anim-dissolve" style={{ color: 'var(--text-3)', fontWeight: 400, lineHeight: 1.8, letterSpacing: '0.08em', animationDelay: '0.75s' }}>
            无感采集 · AI 脱水 · 智能问答
          </p>

          {/* Enter button — seal style */}
          <div className="anim-dissolve" style={{ animationDelay: '0.9s' }}>
            <button
              onClick={handleEnter}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              style={{
                pointerEvents: 'auto',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 88, height: 88, borderRadius: 6, background: 'transparent',
                border: `1.5px solid ${hovering ? 'rgba(140,70,50,0.65)' : 'rgba(140,70,50,0.40)'}`,
                color: hovering ? 'rgba(140,70,50,0.80)' : 'rgba(140,70,50,0.55)',
                cursor: 'pointer',
                fontFamily: "'Cormorant Garamond', 'Noto Serif SC', Georgia, serif",
                fontSize: 16, fontWeight: 400, letterSpacing: '0.15em',
                transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                transform: hovering ? 'scale(1.06)' : 'scale(1)',
                boxShadow: hovering ? '0 0 0 4px rgba(140,70,50,0.06), 0 8px 32px rgba(140,70,50,0.10)' : '0 0 0 2px rgba(140,70,50,0.03)',
                outline: 'none', position: 'relative', writingMode: 'vertical-rl', lineHeight: 1.4,
              }}
            >
              进入房间
            </button>
          </div>

          <p className="text-[9px] mt-7 tracking-wide anim-dissolve" style={{ color: 'var(--text-3)', fontWeight: 400, animationDelay: '1.1s', letterSpacing: '0.1em' }}>
            以 Demo 身份体验
          </p>

          {/* Bottom decorative line */}
          <div className="mx-auto mt-8" style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(90,78,68,0.20), transparent)' }} />
        </div>
      </div>
    </div>
  )
}
