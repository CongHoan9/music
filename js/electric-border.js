
class ElectricBorder {
    constructor(selector, config = {}) 
    {
        this.container = document.querySelector(selector)
        this.canvas = this.container.querySelector("canvas")
        this.ctx = this.canvas.getContext("2d")
        this.color = config.color || "#5227FF"
        this.speed = config.speed || 1
        this.chaos = config.chaos || 0.12
        this.thickness = config.thickness || 2
        this.borderRadius = config.borderRadius || 24
        this.time = 0
        this.last = 0
        this.init()
    }
    random(x) {
        return (Math.sin(x * 12.9898) * 43758.5453) % 1
    }
    noise2D(x, y) {
        const i = Math.floor(x)
        const j = Math.floor(y)
        const fx = x - i
        const fy = y - j
        const a = this.random(i + j * 57)
        const b = this.random(i + 1 + j * 57)
        const c = this.random(i + (j + 1) * 57)
        const d = this.random(i + 1 + (j + 1) * 57)
        const ux = fx * fx * (3 - 2 * fx)
        const uy = fy * fy * (3 - 2 * fy)
        return a * (1 - ux) * (1 - uy)
            + b * ux * (1 - uy)
            + c * (1 - ux) * uy
            + d * ux * uy
    }
    octavedNoise(x, time) 
    {
        let y = 0
        let amplitude = this.chaos
        let frequency = 10
        for (let i = 0; i < 10; i++) 
        {
            y += amplitude * this.noise2D(frequency * x, time * frequency * 0.3)
            frequency *= 1.6
            amplitude *= 0.7
        }
        return y
    }
    getPoint(t, left, top, width, height, r) {

        const straightW = width - 2 * r
        const straightH = height - 2 * r
        const arc = Math.PI * r / 2

        const perimeter =
            2 * straightW +
            2 * straightH +
            4 * arc

        const d = t * perimeter

        let acc = 0

        // top
        if (d <= acc + straightW)
            return { x: left + r + (d - acc), y: top }
        acc += straightW

        // top-right corner
        if (d <= acc + arc) {
            const p = (d - acc) / arc
            const a = -Math.PI / 2 + p * Math.PI / 2
            return {
                x: left + width - r + r * Math.cos(a),
                y: top + r + r * Math.sin(a)
            }
        }
        acc += arc

        // right
        if (d <= acc + straightH)
            return { x: left + width, y: top + r + (d - acc) }
        acc += straightH

        // bottom-right
        if (d <= acc + arc) {
            const p = (d - acc) / arc
            const a = p * Math.PI / 2
            return {
                x: left + width - r + r * Math.cos(a),
                y: top + height - r + r * Math.sin(a)
            }
        }
        acc += arc

        // bottom
        if (d <= acc + straightW)
            return { x: left + width - r - (d - acc), y: top + height }
        acc += straightW

        // bottom-left
        if (d <= acc + arc) {
            const p = (d - acc) / arc
            const a = Math.PI / 2 + p * Math.PI / 2
            return {
                x: left + r + r * Math.cos(a),
                y: top + height - r + r * Math.sin(a)
            }
        }
        acc += arc

        // left
        if (d <= acc + straightH)
            return { x: left, y: top + height - r - (d - acc) }
        acc += straightH

        // top-left
        const p = (d - acc) / arc
        const a = Math.PI + p * Math.PI / 2

        return {
            x: left + r + r * Math.cos(a),
            y: top + r + r * Math.sin(a)
        }
    }
    resize() 
    {
        const rect = this.container.getBoundingClientRect()
        this.width = rect.width + 120
        this.height = rect.height + 120
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        this.canvas.width = this.width * dpr
        this.canvas.height = this.height * dpr
        this.canvas.style.width = this.width + "px"
        this.canvas.style.height = this.height + "px"
        this.ctx.scale(dpr, dpr)
    }
    draw = (time) => {
        const dt = (time - this.last) / 1000
        this.time += dt * this.speed
        this.last = time
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.strokeStyle = this.color
        this.ctx.lineWidth = this.thickness
        this.ctx.shadowColor = this.color
        this.ctx.shadowBlur = 10
        const left = 60
        const top = 60
        const w = this.width - 120
        const h = this.height - 120
        const samples = 600
        this.ctx.beginPath()
        for (let i = 0; i <= samples; i++) {
            const t = i / samples
            const p = this.getPoint(t, left, top, w, h, this.borderRadius)
            const nx = this.octavedNoise(t * 8, this.time)
            const ny = this.octavedNoise(t * 8, this.time + 10)
            const x = p.x + nx * 60
            const y = p.y + ny * 60
            if (i === 0) this.ctx.moveTo(x, y)
            else this.ctx.lineTo(x, y)
        }
        this.ctx.closePath()
        this.ctx.stroke()
        requestAnimationFrame(this.draw)
    }
    init() 
    {
        this.resize()
        new ResizeObserver(() => {this.resize()
        }).observe(this.container)
        requestAnimationFrame(this.draw)
    }
} 
new ElectricBorder("#music-header", {
    color: "red",
    speed: 1,
    chaos: 0.0000001,
    borderRadius: 25,
    thickness: 1
})
