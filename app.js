const CONFIG = {
    musicList: [
        { img: "image/All_I_Want_Is_You.png", src: "music/All I Want Is You.mp3", title: "All I Want Is You", artist: "Rebzyyx", lyric: "lyric/All I Want Is You.json", duration: "2:31", },// Rebzyyx
        { img: "image/One_Of_The_Girls.png", src: "music/One Of The Girls.mp3", title: "One Of The Girls", artist: "The Weeknd • JENNIE • Lily-Rose Depp", lyric: "lyric/One Of The Girls.json", duration: "4:05", },// The Weeknd, Lily-Rose Depp, Mike Dean, Ramsey, Sam Levinson
        { img: "image/Under_The_Influence.png", src: "music/Under The Influence.mp3", title: "Under The Influence", artist: "Chris Brown", lyric: "lyric/Under The Influence.json", duration: "3:06", }, // Chris Brown
        { img: "image/I_Was_Never_There.png", src: "music/I Was Never There.mp3", title: "I Was Never There", artist: "The Weeknd", lyric: "lyric/I Was Never There.json", duration: "4:02", }, // The Weeknd
        { img: "image/Mind_Games.png", src: "music/Mind Games.mp3", title: "Mind Games", artist: "Sickick", lyric: "lyric/Mind Games.json", duration: "4:20", }, // Sickick
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

function animate() {
    requestAnimationFrame(animate);
    [scene1, scene2].forEach((ctx) => {
        const { geometry, renderer, scene, camera } = ctx;
        if (geometry) {
            const time = performance.now() * 0.001;
            const pos = geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i);
                const y = pos.getY(i);
                const distance = Math.sqrt(x * x + y * y);
                const wave = 0.1 * Math.sin(time * 3 + distance * 2) * (1 / (1 + distance));
                pos.setZ(i, wave);
            }
            pos.needsUpdate = true;
            renderer.render(scene, camera);
        }
    });
}

function initAudio() {
    const listEl = document.getElementById("music-list");
    const lyricContainer = document.getElementById("lyric-container");
    const lyricMask = lyricContainer.querySelector(".lyric-mask");
    const musicImage = document.getElementById("music-image");
    const musicTitle = document.getElementById("music-title");
    const musicArtist = document.getElementById("music-artist");
    const musicDuration = document.getElementById("music-duration");
    let currentIndex = null;
    let updateInterval = null;
    const iconPlay = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"> <path d="M4.018 14L14.41 8 4.018 2z" /> </svg>`;
    const iconPause = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16"> <path d="M5 3h2v10H5V3zm4 0h2v10H9V3z" /> </svg>`;
    function resetButtons() {
        document.querySelectorAll("#music-list button").forEach(b => b.innerHTML = iconPlay);
    }
    async function loadLyric(track) {
        if (track.lyrics) return track.lyrics;
        const lyricsArr = [];
        if (!track.lyric) return lyricsArr;
        try {
            const res = await fetch(track.lyric);
            const raw = await res.json();
            raw.forEach(line => {
                if (line.time !== undefined && line.parts) {
                    lyricsArr.push({ start: line.time, parts: line.parts });
                }
            });
        } catch (e) {
            console.warn("Không load được lyric:", e);
        }
        track.lyrics = lyricsArr;
        return lyricsArr;
    }
    let lastLyricIndex = -1;
    function updateLyric(audio, lyrics) {
        if (!lyrics.length) return;
        const ctMs = audio.currentTime * 1000;
        let currentLyricIndex = -1;
        for (let i = 0; i < lyrics.length; i++) {
            if (ctMs >= lyrics[i].start) currentLyricIndex = i;
            else break;
        }
        if (currentLyricIndex !== -1 && currentLyricIndex !== lastLyricIndex) {
            const maskDiv = lyricMask;
            [...maskDiv.children].forEach((el, i) => {
                const spans = el.querySelectorAll("span");
                if (i === currentLyricIndex) {
                    el.classList.add("text-base", "font-bold", "opacity-100");
                    el.classList.remove("text-sm", "opacity-70");
                    spans.forEach((span) => {
                        span.classList.add("text-base", "font-bold", "opacity-100");
                        span.classList.remove("text-sm", "opacity-70");
                        if (span.dataset.color) {
                            span.classList.add("bg-white/30", "px-1", "pb-[1px]", "rounded");
                            span.style.color = span.dataset.color;
                        }
                    });
                } 
                else {
                    el.classList.add("text-sm", "opacity-70");
                    el.classList.remove("text-base", "font-bold", "opacity-100");
                    spans.forEach(span => {
                        span.classList.add("text-sm", "opacity-70");
                        span.classList.remove("text-base", "font-bold", "opacity-100", "bg-white/30", "px-1", "pb-[1px]", "rounded");
                        span.style.color = '';
                    });
                }
            });
            const currentEl = maskDiv.children[currentLyricIndex];
            if (currentEl) {
                requestAnimationFrame(() => {
                    const rect = currentEl.getBoundingClientRect();
                    const containerRect = lyricContainer.getBoundingClientRect();
                    const scrollTop = rect.top - containerRect.top + lyricContainer.scrollTop - (lyricContainer.clientHeight / 2) + (rect.height / 2);
                    lyricContainer.scrollTo({ top: scrollTop, behavior: "smooth" });
                });
            }
            lastLyricIndex = currentLyricIndex;
        }
    }
    function resetTrackState(index) {
        if (index === null || !listEl.children[index]) return;
        const li = listEl.children[index];
        const audio = li.querySelector("audio");
        audio.pause();
        audio.currentTime = 0;
        lyricMask.innerHTML = "";
        if (musicTitle) musicTitle.textContent = "";
        if (musicArtist) musicArtist.textContent = "";
        if (musicImage) musicImage.src = "";
        if (musicDuration) musicDuration.textContent = "";
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = null;
        delete CONFIG.musicList[index].lyric;
    }
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    function updateButtonState(audio, button) {
        button.innerHTML = audio.paused ? iconPlay : iconPause;
        localStorage.setItem("isPlaying", audio.paused ? "false" : "true");
    }
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    }
    function updateRemainingTime(audio) {
        if (musicDuration && !isNaN(audio.duration)) {
            const remaining = audio.duration - audio.currentTime;
            musicDuration.textContent = formatTime(remaining);
        }
    }
    async function playTrack(index, resumeTime = 0, shouldPlay = true) {
        return new Promise(async (resolve) => {
            const li = listEl.children[index];
            if (!li) return resolve();
            const audio = li.querySelector("audio");
            const numberEl = li.querySelector(".track-number");
            const titleEl = li.querySelector(".track-title");
            const track = CONFIG.musicList[index];
            if (currentIndex !== null && currentIndex !== index) {
                resetTrackState(currentIndex);
                localStorage.removeItem("currentTrackImage");
            }
            let imgSrc = track.img || '';
            resetButtons();
            currentIndex = index;
            lastLyricIndex = -1;
            lyricMask.innerHTML = "";
            const lyrics = await loadLyric(track);
            if (lyrics.length > 0) {
                lyrics.forEach(l => {
                    const lineEl = document.createElement("div");
                    lineEl.className = "text-sm opacity-70";
                    l.parts.forEach(part => {
                        const span = document.createElement("span");
                        span.textContent = part.text;
                        if (part.color) {
                            span.setAttribute("data-color", part.color);
                        }
                        lineEl.appendChild(span);
                    });
                    lyricMask.appendChild(lineEl);
                });
            }
            if (musicTitle) musicTitle.textContent = track.title || "";
            if (musicArtist) musicArtist.textContent = track.artist || "";
            if (musicImage) musicImage.src = imgSrc || "";
            audio.addEventListener('loadedmetadata', () => {
                updateRemainingTime(audio);
            }, { once: true });
            localStorage.setItem("currentTrackIndex", index);
            localStorage.setItem("currentTrackTime", resumeTime);
            localStorage.setItem("currentLyricIndex", -1);
            const bgDiv = document.getElementById("bg-blur");
            bgDiv.style.backgroundImage = track.img ? `url(${track.img})` : "";
            try {
                audio.currentTime = resumeTime;
                if (!isNaN(audio.duration)) {
                    updateRemainingTime(audio);
                }
                if (shouldPlay) {
                    await audio.play();
                    const video = document.getElementById("main-video");
                    if (video && !video.paused) {
                        video.pause();
                    }
                }
            } catch (err) {
                console.warn("Không thể phát track:", err);
                resolve();
                return;
            }
            audio.removeEventListener("timeupdate", audio._timeupdateHandler);
            audio.removeEventListener("ended", audio._endedHandler);
            audio._timeupdateHandler = () => {
                updateLyric(audio, lyrics);
                debounce(() => {
                    localStorage.setItem("currentTrackTime", audio.currentTime);
                    localStorage.setItem("currentLyricIndex", lastLyricIndex);
                }, 1000)();
            };
            audio._endedHandler = () => {
                resetTrackState(currentIndex);
                localStorage.removeItem("currentTrackImage");
                const nextIndex = (currentIndex + 1) % CONFIG.musicList.length;
                playTrack(nextIndex, 0, true);
            };
            audio.addEventListener("timeupdate", audio._timeupdateHandler);
            audio.addEventListener("ended", audio._endedHandler, { once: true });
            if (updateInterval) clearInterval(updateInterval);
            updateInterval = setInterval(() => {
                if (!audio.paused) {
                    updateRemainingTime(audio);
                }
            }, 1000);
            audio.addEventListener("pause", () => {
                if (updateInterval) clearInterval(updateInterval);
                updateInterval = null;
            }, { once: true });
            audio.addEventListener("play", () => {
                if (!updateInterval) {
                    updateInterval = setInterval(() => {
                        if (!audio.paused) {
                            updateRemainingTime(audio);
                        }
                    }, 1000);
                }
            }, { once: true });
            resolve();
        });
    }
    listEl.innerHTML = "";
    CONFIG.musicList.forEach((track, i) => {
        const li = document.createElement("li");
        li.setAttribute("tabindex", "0");
        li.className = "p-3 h-[70px] bg-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,.10)] rounded-2xl transition relative hover:-translate-y-1 z-10 [&:hover~li]:translate-y-2 [&:focus~li]:translate - y - 3 -mt-[66px]";
        const topWrap = document.createElement("div");
        topWrap.className = "grid grid-cols-[auto_1fr_auto] gap-3 items-center";
        const imgWrap = document.createElement("div");
        imgWrap.className = "w-12 h-12 aspect-square rounded-md overflow-hidden";
        const img = document.createElement("img");
        img.src = track.img || "";
        img.alt = track.title;
        img.className = "object-cover aspect-square";
        imgWrap.appendChild(img);
        const textWrap = document.createElement("div");
        textWrap.className = "grid grid-rows-[1fr_1fr] whitespace-nowrap";
        const title = document.createElement("span");
        title.textContent = track.title;
        title.className = "font-semibold overflow-x-hidden";
        const artist = document.createElement("span");
        artist.textContent = track.artist || "";
        artist.className = "text-sm opacity-70 overflow-x-hidden";
        textWrap.appendChild(title);
        textWrap.appendChild(artist);
        const btn = document.createElement("button");
        btn.innerHTML = iconPlay;
        btn.className = "px-2 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-500 flex items-center justify-center";
        topWrap.appendChild(imgWrap);
        topWrap.appendChild(textWrap);
        topWrap.appendChild(btn);
        const audioEl = document.createElement("audio");
        audioEl.src = track.src;
        li.appendChild(audioEl);
        li.appendChild(topWrap);
        listEl.appendChild(li);
        btn.addEventListener("click", () => {
            if (currentIndex === i) {
                const audio = li.querySelector("audio");
                if (audio.paused) {
                    audio.play().catch(err => {
                        console.warn("Không thể phát:", err);
                    });
                } else {
                    audio.pause();
                }
            } else {
                playTrack(i, 0, true);
            }
        });
        audioEl.addEventListener("play", () => {
            updateButtonState(audioEl, btn);
            const video = document.getElementById("main-video");
            if (video && !video.paused) {
                video.pause();
            }
        });
        audioEl.addEventListener("pause", () => updateButtonState(audioEl, btn));
        audioEl.addEventListener("error", () => {
            console.warn("Lỗi phát nhạc");
            updateButtonState(audioEl, btn);
        });
    });
    const savedIndex = localStorage.getItem("currentTrackIndex");
    const savedTime = localStorage.getItem("currentTrackTime");
    const savedLyricIndex = localStorage.getItem("currentLyricIndex");
    const savedIsPlaying = localStorage.getItem("isPlaying");
    if (savedIndex !== null) {
        currentIndex = parseInt(savedIndex, 10);
        lastLyricIndex = parseInt(savedLyricIndex, 10) || -1;
        const li = listEl.children[currentIndex];
        const audio = li.querySelector("audio");
        const track = CONFIG.musicList[currentIndex];
        let imgSrc = track.img || '';
        Promise.all([loadLyric(track), new Promise(resolve => audio.addEventListener("canplay", resolve, { once: true }))])
            .then(([lyrics]) => {
                lyricMask.innerHTML = "";
                if (lyrics.length > 0) {
                    lyrics.forEach(l => {
                        const lineEl = document.createElement("div");
                        lineEl.className = "text-sm opacity-70";
                        l.parts.forEach(part => {
                            const span = document.createElement("span");
                            span.textContent = part.text;
                            if (part.color) {
                                span.setAttribute("data-color", part.color);
                            }
                            lineEl.appendChild(span);
                        });
                        lyricMask.appendChild(lineEl);
                    });
                } else {
                    const placeholder = document.createElement("div");
                    placeholder.textContent = "Không có lời bài hát.";
                    placeholder.className = "text-sm opacity-70 italic";
                    lyricMask.appendChild(placeholder);
                }
                if (musicTitle) musicTitle.textContent = track.title || "";
                if (musicArtist) musicArtist.textContent = track.artist || "";
                if (musicImage) musicImage.src = imgSrc || "";
                audio.addEventListener('loadedmetadata', () => {
                    updateRemainingTime(audio);
                }, { once: true });
                updateLyric(audio, lyrics);
                const shouldPlay = savedIsPlaying === "true";
                playTrack(currentIndex, savedTime ? parseFloat(savedTime) : 0, shouldPlay);
            });
    }
}

function safeRun(fn, name) {
    try { fn(); }
    catch (e) { console.error(`Error in ${name}:`, e); }
}

function boot() {
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

gsap.timeline({
    scrollTrigger: {
        trigger: "#envelope",  // The envelope element as the trigger
        start: "top 80%",      // Start animation when top of envelope hits 80% from top of viewport
        end: "bottom 20%",     // End when bottom of envelope hits 20% from top (adjust for duration)
        scrub: 1,              // Smooth scrubbing tied to scroll speed
        anticipatePin: 1,      // Pre-calculate pinning for smoother scroll
        markers: false         // Set to true for debugging ScrollTrigger markers
    }
})
.to("#flap", {
    duration: 1,
    rotationX: -180,
    ease: "power2.inOut"
}, 0) 
.to("#flap", {
     zIndex: 0 
}, 0.2)
.to("#letter", {
    duration: 0.5,
    y: -80, 
    opacity: 1, 
    ease: "power1.out"
}, .5) 
.to(".hearts .heart", {
    duration: 0.8,
    y: -100,           
    opacity: 0,         
    stagger: 0.1,         
    ease: "power2.out"
}, .5); 

gsap.timeline({
    scrollTrigger: {
        trigger: "#chocolate-wrapper", 
        start: "top 100%",      
        end: "bottom 50%",     
        scrub: 1,             
        anticipatePin: 1,  
        markers: false   
    }
})
.to("#chocolate-box-cover", {
    duration: 1,
    rotationY: 100, 
    transformOrigin: "right center",
    ease: "power2.inOut"
}, 0);
