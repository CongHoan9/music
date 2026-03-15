const container = document.getElementById("pillar")
const width = container.clientWidth
const height = container.clientHeight
const scene = new THREE.Scene()
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
camera.position.z = 1
const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(width, height)
container.appendChild(renderer.domElement)

const vertexShader = `
varying vec2 vUv;
void main()
{
    vUv = uv;
    gl_Position = vec4(position,1.0);
}
`
const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform float uIntensity;
uniform float uGlowAmount;
uniform float uPillarWidth;
uniform float uPillarHeight;
uniform float uNoiseIntensity;
uniform float uPillarRotCos;
uniform float uPillarRotSin;
uniform float uRotCos;
uniform float uRotSin;
uniform float uWaveCos;
uniform float uWaveSin;
varying vec2 vUv;
const int MAX_ITER = 80;
void main()
{
    vec2 uv = (vUv*2.0-1.0) * vec2(uResolution.x/uResolution.y,1.0);
    uv = vec2(
    uPillarRotCos * uv.x - uPillarRotSin * uv.y,
    uPillarRotSin * uv.x + uPillarRotCos * uv.y
    );
    vec3 ro = vec3(0.0,0.0,-10.0);
    vec3 rd = normalize(vec3(uv,1.0));
    vec3 col = vec3(0.0);
    float t = 0.1;
    for(int i = 0; i < MAX_ITER; i++)
    {
        vec3 p = ro + rd*t;
        p.xz = vec2(uRotCos*p.x - uRotSin*p.z, uRotSin*p.x + uRotCos*p.z);
        vec3 q = p;
        q.y = p.y*uPillarHeight + uTime;
        float freq = 1.0;
        float amp = 1.0;
        for(int j = 0; j < 4; j++)
        {
            q.xz = vec2(uWaveCos*q.x - uWaveSin*q.z, uWaveSin*q.x + uWaveCos*q.z);
            q += cos(q.zxy*freq - uTime*float(j)*2.0)*amp;
            freq *= 2.0;
            amp *= 0.5;
        }
        float d = length(cos(q.xz)) - 0.2;
        float bound = length(p.xz) - uPillarWidth;
        float k = 4.0;
        float h = max(k - abs(d-bound),0.0);
        d = max(d,bound) + h*h*0.0625/k;
        d = abs(d)*0.15 + 0.01;
        float grad = clamp((15.0-p.y)/30.0,0.0,1.0);
        col += mix(uBottomColor,uTopColor,grad)/d;
        t += d;
        if(t>50.0) break;
        }
    col = tanh(col*uGlowAmount);
    col -= fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)/15.0 * uNoiseIntensity;
    gl_FragColor = vec4(col*uIntensity,1.0);
}
`
const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uTopColor: { value: new THREE.Vector3(0.32, 0.15, 1.0) },
        uBottomColor: { value: new THREE.Vector3(1.0, 0.62, 0.99) },
        uIntensity: { value: 1.0 },
        uGlowAmount: { value: 0.005 },
        uPillarWidth: { value: 3.0 },
        uPillarHeight: { value: 0.4 },
        uNoiseIntensity: { value: 0.5 },
        uRotCos: { value: 1.0 },
        uRotSin: { value: 0.0 },
        uWaveSin: { value: Math.sin(0.4) },
        uWaveCos: { value: Math.cos(0.4) },
        uPillarRotCos: { value: Math.cos(0.4) },
        uPillarRotSin: { value: Math.sin(0.4) }
    },
    transparent: true,
    depthWrite: false,
    depthTest: false

})
const geometry = new THREE.PlaneGeometry(2, 2)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
let time = 0
function animate() {
    time += 0.016
    material.uniforms.uTime.value = time
    material.uniforms.uRotCos.value = Math.cos(time * 0.3)
    material.uniforms.uRotSin.value = Math.sin(time * 0.3)
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()