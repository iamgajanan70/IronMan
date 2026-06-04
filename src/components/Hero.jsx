import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import './Hero.css'
import Navbar from './Navbar'

const Hero = () => {
  const heroRef = useRef(null)
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const velRef = useRef({ x: 0, y: 0 })
  const lastMouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return

    const resize = () => {
      const displayWidth = canvas.clientWidth
      const displayHeight = canvas.clientHeight
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth
        canvas.height = displayHeight
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
    }
    window.addEventListener('resize', resize)
    resize()

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      // Standard coordinates
      const x = e.clientX - rect.left
      const y = rect.height - (e.clientY - rect.top)

      velRef.current.x = x - lastMouseRef.current.x
      velRef.current.y = y - lastMouseRef.current.y

      mouseRef.current = { x, y }
      lastMouseRef.current = { x, y }
    }
    window.addEventListener('mousemove', onMove)

    const vsSource = `
      attribute vec4 a_position;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = a_position;
        v_texCoord = a_position.xy * 0.5 + 0.5;
      }
    `

    const fsSource = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform vec2 u_resolution;
      uniform vec2 u_imgRes;
      uniform vec2 u_mouse;
      uniform vec2 u_trail;
      uniform vec2 u_velocity;
      uniform float u_time;
      uniform sampler2D u_image0;
      uniform sampler2D u_image1;

      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
          dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution;
        float sAspect = u_resolution.x / u_resolution.y;
        float iAspect = u_imgRes.x / u_imgRes.y;
        vec2 uv = v_texCoord;
        uv.y = 1.0 - uv.y;

        if (sAspect > iAspect) {
          float scale = sAspect / iAspect;
          uv.y = (uv.y - 0.5) / scale + 0.5;
        } else {
          float scale = iAspect / sAspect;
          uv.x = (uv.x - 0.5) / scale + 0.5;
        }

        vec2 m = u_mouse / u_resolution;
        vec2 t = u_trail / u_resolution;
        vec2 p1 = st - m;
        vec2 p2 = st - t;
        p1.x *= sAspect;
        p2.x *= sAspect;

        vec2 vel = u_velocity * 0.002;
        float angle = atan(vel.y, vel.x);
        float dist_vel = length(vel);
        float cosA = cos(-angle);
        float sinA = sin(-angle);
        vec2 rp = vec2(p1.x * cosA - p1.y * sinA, p1.x * sinA + p1.y * cosA);
        float stretch = 1.0 + dist_vel * 6.0;
        
        float influence = 0.0;
        influence += 0.08 / length(rp / vec2(stretch, 1.0 / sqrt(stretch)));
        influence += 0.06 / length(p2);
        
        float n = snoise(st * 3.5 + u_time * 0.5) * 0.15;
        influence += n;
        float mask = smoothstep(0.45, 0.55, influence);

        vec4 tex0 = texture2D(u_image0, uv);
        vec4 tex1 = texture2D(u_image1, uv);
        gl_FragColor = mix(tex0, tex1, mask);
      }
    `

    const createShader = (gl, type, source) => {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const program = gl.createProgram()
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource))
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource))
    gl.linkProgram(program)
    gl.useProgram(program)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const imgResLocation = gl.getUniformLocation(program, 'u_imgRes')
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse')
    const trailLocation = gl.getUniformLocation(program, 'u_trail')
    const velocityLocation = gl.getUniformLocation(program, 'u_velocity')
    const timeLocation = gl.getUniformLocation(program, 'u_time')

    const loadTexture = (url, index) => {
      const tex = gl.createTexture()
      gl.activeTexture(gl.TEXTURE0 + index)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

      const image = new Image()
      image.src = url
      image.onload = () => {
        gl.activeTexture(gl.TEXTURE0 + index)
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        if (index === 0) gl.uniform2f(imgResLocation, image.width, image.height)
      }
      return tex
    }

    loadTexture('/images/twoo.jpg', 0)
    loadTexture('/images/one.jpg', 1)

    gl.uniform1i(gl.getUniformLocation(program, 'u_image0'), 0)
    gl.uniform1i(gl.getUniformLocation(program, 'u_image1'), 1)

    let smoothedMouse = { x: 0, y: 0 }
    let smoothedTrail = { x: 0, y: 0 }
    let smoothedVel = { x: 0, y: 0 }

    const render = (time) => {
      smoothedMouse.x += (mouseRef.current.x - smoothedMouse.x) * 0.12
      smoothedMouse.y += (mouseRef.current.y - smoothedMouse.y) * 0.12
      smoothedTrail.x += (smoothedMouse.x - smoothedTrail.x) * 0.1
      smoothedTrail.y += (smoothedMouse.y - smoothedTrail.y) * 0.1
      smoothedVel.x += (velRef.current.x - smoothedVel.x) * 0.1
      smoothedVel.y += (velRef.current.y - smoothedVel.y) * 0.1

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform2f(mouseLocation, smoothedMouse.x, smoothedMouse.y)
      gl.uniform2f(trailLocation, smoothedTrail.x, smoothedTrail.y)
      gl.uniform2f(velocityLocation, smoothedVel.x, smoothedVel.y)
      gl.uniform1f(timeLocation, time * 0.001)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
      requestAnimationFrame(render)
    }
    requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  }

  const item = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 14 } },
  }

  const navbarVariant = {
    hidden: { y: -80, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 70, damping: 15 } },
  }

  return (
    <div className="hero" ref={heroRef}>
      <canvas ref={canvasRef} className="hero-canvas" />

      <motion.div variants={navbarVariant} initial="hidden" animate="visible">
        <Navbar />
      </motion.div>

      <motion.div
        className="hero-content"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="left" variants={item}>
          <motion.span className="st-eyebrow" variants={item}>
            MARVEL CINEMATIC UNIVERSE
          </motion.span>
          <h1 className="st-title">THE IRON<br />AVENGER</h1>
          <motion.p className="st-desc" variants={item}>
            He is genius. He is fire. Born from captivity, forged in metal — the world's last line of defense wears no cape, needs no serum, and fears nothing but the day his arc reactor stops beating.
          </motion.p>
          <motion.button className="st-btn" variants={item}>
            Enter the Armor
          </motion.button>
        </motion.div>

        <motion.div className="right" variants={item}>
          <motion.span className="st-eyebrow right-eyebrow" variants={item}>
            Tony Stark
          </motion.span>
          <h1 className="st-title">THE MAN<br />BEHIND THE<br />MACHINE</h1>
          <motion.p className="st-text" variants={item}>
            A genius, billionaire, playboy, philanthropist, and futurist,
            he built his first suit to escape death—and every suit since to defy it.
            Behind every alloy and act of reckless bravery is one irreplaceable heartbeat.
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Hero
