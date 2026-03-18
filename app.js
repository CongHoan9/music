const CONFIG = {
    musicList: [
        { img: "image/All_I_Want_Is_You.png", src: "video/All I Want Is You.mp4", title: "All I Want Is You", artist: "Rebzyyx", lyric: "lyric/All I Want Is You.json", duration: "2:31", },
        { img: "image/Ecstacy.png", src: "video/Ecstacy.mp4", title: "Ecstacy", artist: "SUICIDAL-IDOL", lyric: "lyric/Ecstacy.json", duration: "2:00", },
        { img: "image/One_Of_The_Girls.png", src: "video/One Of The Girls.mp4", title: "One Of The Girls", artist: "The Weeknd • JENNIE • Lily-Rose Depp", lyric: "lyric/One Of The Girls.json", duration: "4:05", },
        { img: "image/Mind_Games.png", src: "video/Mind Games.mp4", title: "Mind Games", artist: "Sickick", lyric: "lyric/Mind Games.json", duration: "4:20", },
        { img: "image/Under_The_Influence.png", src: "video/Under The Influence.mp4", title: "Under The Influence", artist: "Chris Brown", lyric: "lyric/Under The Influence.json", duration: "3:06", },
    ],
};
const header = document.querySelector("header");
ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
        if (self.direction === 1) {
            gsap.to(header, { y: "-100%", duration: 0.3, ease: "power2.out" });
        }
        else {
            gsap.to(header, { y: "0%", duration: 0.3, ease: "power2.out" });
        }
    }
});

function createFloatingHearts() {
    const c = document.getElementById("hearts-container");
    const ctx = c.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    function resizeCanvas() {
        const W = c.offsetWidth;
        const H = c.offsetHeight;
        c.width = W * dpr;
        c.height = H * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        return { W, H };
    }
    let { W, H } = resizeCanvas();
    const colors = ["#ffe4e6", "#ffccd5", "#ffb6c1", "#ff99ac", "#ff7f9c"];
    const hearts = [];
    for (let i = 0; i < 10; i++) {
        hearts.push({
            x: Math.random() * W,
            y: Math.random() * H,
            size: 20 + Math.random() * 10,
            speed: 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            drift: (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.5
        });
    }
    window.addEventListener("resize", () => {
        const oldW = W;
        ({ W, H } = resizeCanvas());
        const scaleX = W / oldW;
        for (const h of hearts) {
            h.x *= scaleX;
        }
    });
    function drawHeart(ctx, x, y, size, color) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 24, size / 24);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(2, 9.1371);
        ctx.bezierCurveTo(2, 14, 6.01943, 16.5914, 8.96173, 18.9109);
        ctx.bezierCurveTo(10, 19.7294, 11, 20.5, 12, 20.5);
        ctx.bezierCurveTo(13, 20.5, 14, 19.7294, 15.0383, 18.9109);
        ctx.bezierCurveTo(17.9806, 16.5914, 22, 14, 22, 9.1371);
        ctx.bezierCurveTo(22, 4.27416, 16.4998, 0.825464, 12, 5.50063);
        ctx.bezierCurveTo(7.50016, 0.825464, 2, 4.27416, 2, 9.1371);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    function frame() {
        ctx.clearRect(0, 0, W, H);
        for (const h of hearts) {
            h.y -= h.speed;
            h.x += h.drift;
            h.alpha -= 0.0001;

            ctx.globalAlpha = Math.max(h.alpha, 0);
            drawHeart(ctx, h.x, h.y, h.size, h.color);
            ctx.globalAlpha = 1;

            if (h.y < -30) {
                h.y = H + 20;
                h.x = Math.random() * W;
                h.size = 20 + Math.random() * 10;
                h.speed = 1;
                h.color = colors[Math.floor(Math.random() * colors.length)];
                h.alpha = Math.random() * 0.5;
            }
        }
        requestAnimationFrame(frame);
    }
    frame();
}

const player = document.getElementById("music-video");
async function preloadLyrics() {
    await Promise.all(
        CONFIG.musicList.map(async (track) => {
            if (!track.lyric) return;
            try {
                const res = await fetch(track.lyric);
                const raw = await res.json();
                track.lyric = raw
                    .filter(line => line.time !== undefined && line.parts)
                    .map(line => ({
                        start: line.time,
                        parts: line.parts
                    }));
            }
            catch (e) {
                console.warn("Không load được lyric:", e);
                track.lyric = [];
            }
        })
    );
}

function initAudio() {
    const listEl = document.getElementById("music-list")
    const lyricContainer = document.getElementById("lyric-container")
    const lyricMask = lyricContainer.querySelector(".lyric-mask")
    const player = document.getElementById("music-video")
    const musicTitle = document.getElementById("music-title")
    const musicArtist = document.getElementById("music-artist")
    const musicDuration = document.getElementById("music-duration")
    let currentIndex = null
    let currentButton = null
    let lastLyricIndex = -1
    const iconPlay = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M4.018 14L14.41 8 4.018 2z"/></svg>`
    const iconPause = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"><path d="M5 3h2v10H5V3zm4 0h2v10H9V3z"/></svg>`
    function resetButtons() {
        document.querySelectorAll("#music-list button")
            .forEach(b => b.innerHTML = iconPlay)
    }
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00"
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        return `${m}:${s < 10 ? "0" + s : s}`
    }
    function updateRemainingTime() {
        if (!isNaN(player.duration)) {
            const remain = player.duration - player.currentTime
            musicDuration.textContent = formatTime(remain)
        }
    }
    function loadLyric(track) {
        return track.lyric || []
    }
    function renderLyrics(lyrics) {
        lyricMask.innerHTML = lyrics.map(line =>
            `<div class="text-sm opacity-70">
                ${line.parts.map(p =>
                `<span ${p.color ? `data-color="${p.color}"` : ""}>${p.text}</span>`
            ).join("")}
            </div>`
        ).join("")
    }
    function updateLyric(lyrics) {
        if (!lyrics.length) return
        const ctMs = player.currentTime * 1000
        let currentLyricIndex = -1
        for (let i = 0; i < lyrics.length; i++) {
            if (ctMs >= lyrics[i].start) currentLyricIndex = i
            else break
        }
        if (currentLyricIndex === lastLyricIndex) return
        const lines = lyricMask.children
        for (let i = 0; i < lines.length; i++) {
            const el = lines[i]
            const spans = el.querySelectorAll("span")
            if (i === currentLyricIndex) {
                el.classList.remove("text-sm", "opacity-70")
                el.classList.add("text-base", "font-bold", "opacity-100")
                spans.forEach(span => {
                    span.classList.remove("text-sm", "opacity-70")
                    span.classList.add("text-base", "font-bold")
                    if (span.dataset.color) {
                        span.classList.add("bg-white", "px-1", "rounded")
                        span.style.color = span.dataset.color
                    }
                })
            } else {
                el.classList.remove("text-base", "font-bold", "opacity-100")
                el.classList.add("text-sm", "opacity-70")
                spans.forEach(span => {
                    span.classList.remove("text-base", "font-bold", "bg-white", "px-1", "rounded")
                    span.classList.add("text-sm", "opacity-70")
                    span.style.color = ""
                })
            }
        }
        const currentEl = lines[currentLyricIndex]
        if (currentEl) {
            const rect = currentEl.getBoundingClientRect()
            const containerRect = lyricContainer.getBoundingClientRect()
            const scrollTop =
                rect.top - containerRect.top +
                lyricContainer.scrollTop -
                lyricContainer.clientHeight / 2 +
                rect.height / 2
            lyricContainer.scrollTo({
                top: scrollTop,
                behavior: "smooth"
            })
        }
        lastLyricIndex = currentLyricIndex
    }
    async function playTrack(index, resumeTime = 0, shouldPlay = true) {
        const track = CONFIG.musicList[index]
        if (!track) return
        currentIndex = index
        lastLyricIndex = -1
        const lyric = loadLyric(track)
        lyricMask.innerHTML = ""
        if (lyric.length) renderLyrics(lyric)
        musicTitle.textContent = track.title || ""
        musicArtist.textContent = track.artist || ""
        player.src = track.src
        player.currentTime = resumeTime
        if (shouldPlay) {
            await player.play().catch(() => { })
        }
    }
    player.addEventListener("timeupdate", () => {
        if (currentIndex === null) return
        const track = CONFIG.musicList[currentIndex]
        updateLyric(track.lyric || [])
        updateRemainingTime()
        localStorage.setItem("currentTrackIndex", currentIndex)
        localStorage.setItem("currentTrackTime", player.currentTime)
    })
    player.addEventListener("play", () => {
        resetButtons()
        if (currentButton)
            currentButton.innerHTML = iconPause

        localStorage.setItem("isPlaying", "true")
    })
    player.addEventListener("pause", () => {
        if (currentButton)
            currentButton.innerHTML = iconPlay
        localStorage.setItem("isPlaying", "false")
    })
    player.addEventListener("ended", () => {
        let nextIndex = currentIndex + 1
        if (nextIndex >= CONFIG.musicList.length)
            nextIndex = 0
        currentButton = listEl.children[nextIndex].querySelector("button")
        playTrack(nextIndex, 0, true)

    })
    listEl.innerHTML = ""
    CONFIG.musicList.forEach((track, i) => {
        const li = document.createElement("li")
        li.className =
            "p-3 h-[70px] bg-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,.10)] rounded-2xl transition relative hover:-translate-y-1 z-10 [&:hover~li]:translate-y-2"
        li.innerHTML = `
        <div class="grid grid-cols-[auto_1fr_auto] gap-3 items-center">
            <div class="w-12 h-12 rounded-md overflow-hidden">
                <img src="${track.img || ""}" class="object-cover w-full h-full">
            </div>
            <div class="grid grid-rows-[1fr_1fr] whitespace-nowrap">
                <span class="font-semibold">${track.title}</span>
                <span class="text-sm opacity-70">${track.artist || ""}</span>
            </div>
            <button class="px-2 py-2 bg-rose-500 text-white rounded-full flex items-center justify-center">
                ${iconPlay}
            </button>
        </div>
        `
        const btn = li.querySelector("button")
        btn.addEventListener("click", () => {
            if (currentIndex === i) {
                if (player.paused) player.play()
                else player.pause()
            } else {
                currentButton = btn
                playTrack(i)
            }
        })
        listEl.appendChild(li)
    })
    const savedIndex = localStorage.getItem("currentTrackIndex")
    const savedTime = localStorage.getItem("currentTrackTime")
    const savedIsPlaying = localStorage.getItem("isPlaying")
    if (savedIndex !== null) {
        const index = parseInt(savedIndex)
        currentButton = listEl.children[index].querySelector("button")
        playTrack(
            index,
            savedTime ? parseFloat(savedTime) : 0,
            savedIsPlaying === "true"
        )
    } else {
        currentButton = listEl.children[0].querySelector("button")
        playTrack(0, 0, true)
    }

}
function safeRun(fn, name) {
    try { fn(); }
    catch (e) { console.error(`Error in ${name}:`, e); }
}

async function boot() {
    await preloadLyrics();
    safeRun(initAudio, "initAudio");
    safeRun(createFloatingHearts, "createFloatingHearts");
}

document.addEventListener("DOMContentLoaded", boot)
gsap.registerPlugin(ScrollTrigger);
document.querySelectorAll(".scroll-float").forEach(el => {
    const text = el.textContent.trim();
    el.innerHTML = "";
    const wrapper = document.createElement("span");
    wrapper.className = "scroll-float-text";
    el.appendChild(wrapper);
    text.split("").forEach(char => {
        const span = document.createElement("span");
        span.className = "char";
        span.innerHTML = char === " " ? "&nbsp;" : char;
        wrapper.appendChild(span);
    });
    const chars = wrapper.querySelectorAll(".char");
    const duration = parseFloat(el.dataset.duration) || 1;
    const ease = el.dataset.ease || "back.inOut(2)";
    const start = el.dataset.start || "center bottom+=50%";
    const end = el.dataset.end || "bottom bottom-=50%";
    const stagger = parseFloat(el.dataset.stagger) || 0.03;
    gsap.fromTo(
        chars,
        {
            opacity: 0,
            scaleY: 2.3,
            scaleX: 0.7,
            yPercent: 120,
            transformOrigin: "50% 50%"
        },
        {
            opacity: 1,
            yPercent: 0,
            scaleY: 1,
            scaleX: 1,
            ease: ease,
            duration: duration,
            stagger: stagger,
            scrollTrigger: {
                trigger: el,
                start: start,
                end: end,
                scrub: 1,
                stagger: stagger
            }
        }
    );
});
