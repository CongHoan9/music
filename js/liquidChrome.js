import * as OGL from 'https://cdn.jsdelivr.net/npm/ogl@latest/+esm';
const container = document.getElementById("liquid-container")
const baseColor = [0.1, 0.0, 0.0]
const speed = 0.2
const amplitude = 0.2
const frequencyX = 3
const frequencyY = 3
const interactive = true
const renderer = new OGL.Renderer({
    antialias: true,
    dpr: Math.min(window.devicePixelRatio, 2)
})
const gl = renderer.gl
gl.clearColor(1, 1, 1, 1)

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position,0.0,1.0);
}
`
const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform vec3 uBaseColor;
uniform float uAmplitude;
uniform float uFrequencyX;
uniform float uFrequencyY;
uniform vec2 uMouse;
varying vec2 vUv;
vec4 renderImage(vec2 uvCoord){
    vec2 fragCoord = uvCoord * uResolution.xy;
    vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x,uResolution.y);
    for(float i = 1.0; i < 10.0; i++){
        uv.x += uAmplitude/i * cos(i*uFrequencyX*uv.y + uTime + uMouse.x*3.14159);
        uv.y += uAmplitude/i * cos(i*uFrequencyY*uv.x + uTime + uMouse.y*3.14159);
    }
    vec2 diff = (uvCoord - uMouse);
    float dist = length(diff);
    float falloff = exp(-dist*5.0);
    float ripple = sin(10.0*dist - uTime*2.0) * 0.3;
    uv += (diff/(dist+0.0001))*ripple*falloff;
    vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
    return vec4(color,1.0);
}
void main(){
    vec4 col = vec4(0.0);
    int samples = 0;
    for(int i = -1; i<= 1; i++){
        for(int j = -1; j <= 1; j++){
            vec2 offset = vec2(float(i),float(j)) *
            (1.0/min(uResolution.x,uResolution.y));
            col += renderImage(vUv + offset);
            samples++;
        }
    }
    gl_FragColor = col / float(samples);
}
`
const geometry = new OGL.Triangle(gl)
const program = new OGL.Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uResolution: {
            value: new Float32Array([
                gl.canvas.width,
                gl.canvas.height,
                gl.canvas.width / gl.canvas.height
            ])
        },
        uBaseColor: { value: new Float32Array(baseColor) },
        uAmplitude: { value: amplitude },
        uFrequencyX: { value: frequencyX },
        uFrequencyY: { value: frequencyY },
        uMouse: { value: new Float32Array([0, 0]) }
    }
})
const mesh = new OGL.Mesh(gl, { geometry, program })
function resize() {
    renderer.setSize(
        container.offsetWidth,
        container.offsetHeight
    )
    const res = program.uniforms.uResolution.value
    res[0] = gl.canvas.width
    res[1] = gl.canvas.height
    res[2] = gl.canvas.width / gl.canvas.height
}

window.addEventListener("resize", resize)
resize()
/* ===== mouse ===== */
function mouseMove(e) {
    const rect = container.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = 1 - (e.clientY - rect.top) / rect.height
    const mouse = program.uniforms.uMouse.value
    mouse[0] = x
    mouse[1] = y
}
function touchMove(e) {
    const t = e.touches[0]
    const rect = container.getBoundingClientRect()
    const x = (t.clientX - rect.left) / rect.width
    const y = 1 - (t.clientY - rect.top) / rect.height
    const mouse = program.uniforms.uMouse.value
    mouse[0] = x
    mouse[1] = y
}
if (interactive) {
    window.addEventListener("mousemove", mouseMove)
    window.addEventListener("touchmove", touchMove, { passive: true })
}
function update(t) {
    requestAnimationFrame(update)
    program.uniforms.uTime.value = t * 0.001 * speed
    renderer.render({ scene: mesh })
}
requestAnimationFrame(update)
container.appendChild(gl.canvas)

