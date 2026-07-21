import "../styles/main.css";
import { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin } from "gsap/all";
import Lenis from "lenis";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Menu,
  MessageCircle,
  Pause,
  Play,
  ShoppingBag,
  X,
  createIcons,
} from "lucide";
import { catalogo, formatoPrecio } from "../data/cortes.js";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFinePointer = window.matchMedia("(pointer: fine)").matches;
const body = document.body;

const iconSet = {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Menu,
  MessageCircle,
  Pause,
  Play,
  ShoppingBag,
  X,
};

const renderIcons = () => createIcons({ icons: iconSet, attrs: { "stroke-width": 2 } });

function renderCatalog() {
  const track = document.querySelector("[data-cuts-track]");
  if (!track) return;

  track.innerHTML = catalogo
    .map(
      (categoria, index) => `
        <${categoria.soloTienda ? "article" : "button"}
          class="cut-card"
          ${categoria.soloTienda ? "" : 'type="button"'}
          data-category="${categoria.id}"
          ${categoria.soloTienda ? "" : `aria-label="Ver cortes y precios de ${categoria.nombre}"`}
        >
          <span class="cut-card__image">
            <img src="${categoria.imagen}" alt="" width="800" height="600" loading="lazy" decoding="async">
          </span>
          <span class="cut-card__content">
            <span class="cut-card__top">
              <span class="cut-card__index">${String(index + 1).padStart(2, "0")}</span>
              <span class="cut-card__badge">${categoria.soloTienda ? "Solo en tienda" : `${categoria.productos.length} opciones`}</span>
            </span>
            <span>
              <span class="cut-card__eyebrow">${categoria.eyebrow}</span>
              <h3>${categoria.titulo}</h3>
              <span class="cut-card__description">${categoria.descripcion}</span>
              <span class="cut-card__action">
                ${categoria.soloTienda ? "Disponible en sucursal II" : 'Ver precios <i data-lucide="arrow-up-right" aria-hidden="true"></i>'}
              </span>
            </span>
          </span>
        </${categoria.soloTienda ? "article" : "button"}>
      `,
    )
    .join("");
}

function initPreloader() {
  const preloader = document.querySelector(".preloader");
  const value = document.querySelector(".preloader__value");
  const line = document.querySelector(".preloader__line");
  if (!preloader) return Promise.resolve();

  if (sessionStorage.getItem("la-providencia-loaded") || prefersReducedMotion) {
    preloader.remove();
    return Promise.resolve();
  }

  const heroVideo = document.querySelector(".hero__video");
  const videoReady = new Promise((resolve) => {
    if (!heroVideo || heroVideo.readyState >= 2) {
      resolve();
      return;
    }
    heroVideo.addEventListener("loadeddata", resolve, { once: true });
    window.setTimeout(resolve, 2600);
  });

  const progress = { value: 0 };
  const counterTween = gsap.to(progress, {
    value: 86,
    duration: 1.6,
    ease: "power2.out",
    onUpdate: () => {
      value.textContent = Math.round(progress.value);
      gsap.set(line, { scaleX: progress.value / 100 });
    },
  });

  return Promise.all([document.fonts.ready, videoReady]).then(
    () =>
      new Promise((resolve) => {
        counterTween.kill();
        gsap
          .timeline({
            onComplete: () => {
              preloader.remove();
              sessionStorage.setItem("la-providencia-loaded", "1");
              resolve();
            },
          })
          .to(progress, {
            value: 100,
            duration: 0.35,
            ease: "power2.out",
            onUpdate: () => {
              value.textContent = Math.round(progress.value);
              gsap.set(line, { scaleX: progress.value / 100 });
            },
          })
          .to(preloader, {
            clipPath: "inset(0 0 100% 0)",
            duration: 0.8,
            ease: "power4.inOut",
          });
      }),
  );
}

function initSmoothScroll() {
  if (prefersReducedMotion) return null;
  const lenis = new Lenis({
    anchors: true,
    duration: 1.05,
    smoothWheel: true,
    wheelMultiplier: 0.9,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

function initHeader(lenis) {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  const menuIcon = toggle?.querySelector("[data-lucide]");
  if (!header || !toggle || !menu) return;

  let lastY = window.scrollY;
  const onScroll = () => {
    const currentY = window.scrollY;
    header.classList.toggle("is-scrolled", currentY > 20);
    header.classList.toggle("is-hidden", currentY > lastY && currentY > 180 && !body.classList.contains("menu-open"));
    lastY = currentY;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const openMenu = () => {
    body.classList.add("menu-open", "is-locked");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Cerrar menú");
    menu.setAttribute("aria-hidden", "false");
    menuIcon?.setAttribute("data-lucide", "x");
    renderIcons();
    lenis?.stop();
    gsap
      .timeline()
      .set(menu, { autoAlpha: 1 })
      .fromTo(
        menu.querySelectorAll("nav a"),
        { y: 50, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.055, duration: 0.5, ease: "power3.out" },
      )
      .fromTo(".mobile-menu__meta", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, "-=0.15");
  };

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!body.classList.contains("menu-open")) return;
    body.classList.remove("menu-open", "is-locked");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    menu.setAttribute("aria-hidden", "true");
    menuIcon?.setAttribute("data-lucide", "menu");
    renderIcons();
    lenis?.start();
    gsap.to(menu, {
      autoAlpha: 0,
      duration: prefersReducedMotion ? 0 : 0.25,
      onComplete: () => gsap.set(menu.querySelectorAll("nav a"), { clearProps: "all" }),
    });
    if (restoreFocus) toggle.focus();
  };

  toggle.addEventListener("click", () => {
    if (body.classList.contains("menu-open")) closeMenu();
    else openMenu();
  });
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("menu-open")) closeMenu({ restoreFocus: true });
  });
}

function getFocusable(container) {
  return [...container.querySelectorAll('a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])')].filter(
    (element) => !element.hidden && element.offsetParent !== null,
  );
}

function trapFocus(event, container) {
  if (event.key !== "Tab") return;
  const focusable = getFocusable(container);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function initCutsModal(lenis) {
  const modal = document.querySelector("#cuts-modal");
  const title = modal?.querySelector("[data-modal-title]");
  const eyebrow = modal?.querySelector("[data-modal-eyebrow]");
  const list = modal?.querySelector("[data-modal-list]");
  const closeButton = modal?.querySelector(".modal__close");
  if (!modal || !title || !eyebrow || !list || !closeButton) return;

  let trigger = null;
  const close = () => {
    if (modal.hidden) return;
    const panel = modal.querySelector(".modal__panel");
    gsap.to(panel, {
      y: 28,
      autoAlpha: 0,
      duration: prefersReducedMotion ? 0 : 0.2,
      ease: "power2.in",
      onComplete: () => {
        modal.hidden = true;
        body.classList.remove("is-locked");
        lenis?.start();
        trigger?.focus();
      },
    });
  };

  const open = (categoria, button) => {
    trigger = button;
    title.textContent = categoria.titulo;
    eyebrow.textContent = categoria.eyebrow;
    list.innerHTML = categoria.productos
      .map(
        ([nombre, precio, unidad]) => `
          <div class="modal__item">
            <span>${nombre}</span>
            <span class="modal__price">${formatoPrecio.format(precio)} <span class="modal__unit">/ ${unidad}</span></span>
          </div>
        `,
      )
      .join("");
    modal.hidden = false;
    body.classList.add("is-locked");
    lenis?.stop();
    gsap.fromTo(
      modal.querySelector(".modal__panel"),
      { y: 36, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: prefersReducedMotion ? 0 : 0.35, ease: "power3.out" },
    );
    closeButton.focus();
  };

  document.querySelectorAll(".cut-card[data-category]").forEach((button) => {
    const category = catalogo.find((item) => item.id === button.dataset.category);
    if (category && !category.soloTienda) button.addEventListener("click", () => open(category, button));
  });
  modal.querySelectorAll("[data-close-modal]").forEach((element) => element.addEventListener("click", close));
  modal.addEventListener("keydown", (event) => trapFocus(event, modal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) close();
  });
}

function initLightbox(lenis) {
  const lightbox = document.querySelector("#lightbox");
  const stage = lightbox?.querySelector(".lightbox__stage");
  const count = lightbox?.querySelector(".lightbox__count");
  const closeButton = lightbox?.querySelector(".lightbox__close");
  const previousButton = lightbox?.querySelector(".lightbox__nav--prev");
  const nextButton = lightbox?.querySelector(".lightbox__nav--next");
  const items = [...document.querySelectorAll("[data-gallery] [data-media]")];
  if (!lightbox || !stage || !count || !closeButton || !previousButton || !nextButton || !items.length) return;

  let index = 0;
  let trigger = null;

  const show = () => {
    const item = items[index];
    const isVideo = item.dataset.type === "video";
    stage.innerHTML = isVideo
      ? `<video src="${item.dataset.media}" controls autoplay playsinline></video>`
      : `<img src="${item.dataset.media}" alt="${item.querySelector("img")?.alt || ""}">`;
    count.textContent = `${index + 1} / ${items.length}`;
    gsap.fromTo(stage.firstElementChild, { autoAlpha: 0, scale: 0.98 }, { autoAlpha: 1, scale: 1, duration: prefersReducedMotion ? 0 : 0.3 });
  };

  const close = () => {
    lightbox.hidden = true;
    stage.innerHTML = "";
    body.classList.remove("is-locked");
    lenis?.start();

    trigger?.focus();
  };

  const open = (item) => {
    trigger = item;
    index = items.indexOf(item);
    document.querySelectorAll(".gallery-item__reel-video").forEach((video) => video.pause());
    lightbox.hidden = false;
    body.classList.add("is-locked");
    lenis?.stop();
    show();
    closeButton.focus();
  };

  const move = (direction) => {
    index = (index + direction + items.length) % items.length;
    show();
  };

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const isDesktopReelVideo =
        !prefersReducedMotion &&
        window.matchMedia("(min-width: 900px)").matches &&
        item.dataset.type === "video" &&
        item.dataset.reelActive === "true";
      if (!isDesktopReelVideo) open(item);
    });
  });
  closeButton.addEventListener("click", close);
  previousButton.addEventListener("click", () => move(-1));
  nextButton.addEventListener("click", () => move(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
  lightbox.addEventListener("keydown", (event) => trapFocus(event, lightbox));
  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });
}

function initCursorAndMagnets() {
  if (!isFinePointer || prefersReducedMotion) return;
  const cursor = document.querySelector(".cursor");
  const cursorLabel = cursor?.querySelector("span");
  if (!cursor || !cursorLabel) return;

  const xTo = gsap.quickTo(cursor, "x", { duration: 0.16, ease: "power3.out" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.16, ease: "power3.out" });
  window.addEventListener("pointermove", (event) => {
    cursor.style.opacity = "1";
    xTo(event.clientX - cursor.offsetWidth / 2);
    yTo(event.clientY - cursor.offsetHeight / 2);
  });
  window.addEventListener("pointerleave", () => {
    cursor.style.opacity = "0";
  });

  document.querySelectorAll("[data-cursor], .gallery-item, .cut-card").forEach((element) => {
    element.addEventListener("pointerenter", () => {
      cursor.classList.add("is-active");
      cursorLabel.textContent = element.dataset.cursor || (element.classList.contains("gallery-item") ? "Ver" : "Precios");
    });
    element.addEventListener("pointerleave", () => {
      cursor.classList.remove("is-active");
      cursorLabel.textContent = "";
    });
  });

  document.querySelectorAll(".magnetic").forEach((element) => {
    const x = gsap.quickTo(element, "x", { duration: 0.35, ease: "power3.out" });
    const y = gsap.quickTo(element, "y", { duration: 0.35, ease: "power3.out" });
    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      x((event.clientX - bounds.left - bounds.width / 2) * 0.18);
      y((event.clientY - bounds.top - bounds.height / 2) * 0.18);
    });
    element.addEventListener("pointerleave", () => {
      gsap.to(element, { x: 0, y: 0, duration: 0.65, ease: "elastic.out(1, 0.3)" });
    });
  });
}

function initVideoVisibility() {
  const videos = document.querySelectorAll("video");
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!target.autoplay) return;
        if (isIntersecting && !prefersReducedMotion) target.play().catch(() => {});
        else target.pause();
      });
    },
    { threshold: 0.1 },
  );
  videos.forEach((video) => observer.observe(video));
}

function initMobileProgress() {
  const viewport = document.querySelector(".cuts__viewport");
  const progress = document.querySelector(".cuts__progress span");
  if (!viewport || !progress) return;
  viewport.addEventListener(
    "scroll",
    () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      gsap.set(progress, { scaleX: max ? viewport.scrollLeft / max : 1 });
    },
    { passive: true },
  );
}

function initReviewsMarquee() {
  const track = document.querySelector(".reviews__track");
  const marquee = track?.closest(".reviews__marquee");
  if (!track || !marquee) return () => {};

  const originals = [...track.querySelectorAll("figure")];
  if (originals.length < 2) return () => {};

  const clones = [];
  const appendClone = (review) => {
    const clone = review.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
    clones.push(clone);
  };

  originals.forEach(appendClone);
  const distance = clones[0].offsetLeft - originals[0].offsetLeft;
  if (distance <= 0) {
    clones.forEach((clone) => clone.remove());
    return () => {};
  }

  const ensureCoverage = () => {
    while (track.scrollWidth - distance < marquee.clientWidth + 1) {
      appendClone(originals[clones.length % originals.length]);
    }
  };
  ensureCoverage();

  const resizeObserver = new ResizeObserver(ensureCoverage);
  resizeObserver.observe(marquee);

  const loop = gsap.to(track, {
    x: -distance,
    duration: distance / 52,
    ease: "none",
    repeat: -1,
  });
  const pause = () => loop.pause();
  const resume = () => loop.play();

  track.addEventListener("pointerenter", pause);
  track.addEventListener("pointerleave", resume);
  track.addEventListener("focusin", pause);
  track.addEventListener("focusout", resume);

  return () => {
    resizeObserver.disconnect();
    track.removeEventListener("pointerenter", pause);
    track.removeEventListener("pointerleave", resume);
    track.removeEventListener("focusin", pause);
    track.removeEventListener("focusout", resume);
    loop.kill();
    clones.forEach((clone) => clone.remove());
    gsap.set(track, { clearProps: "transform" });
  };
}
function initAnimations() {
  if (prefersReducedMotion) {
    document.querySelectorAll(".manifesto__copy .word").forEach((word) => (word.style.opacity = "1"));
    return;
  }

  const media = gsap.matchMedia();

  gsap.to(".ticker__track", {
    xPercent: -50,
    duration: 24,
    ease: "none",
    repeat: -1,
  });


  media.add(
    {
      desktop: "(min-width: 761px)",
      mobile: "(max-width: 760px)",
      reel: "(min-width: 900px)",
    },
    (context) => {
      const { desktop, reel } = context.conditions;
      const cleanupReviews = desktop ? initReviewsMarquee() : () => {};
      const heroSplit = new SplitText(".hero h1", { type: "lines", linesClass: "hero-line" });
      const heroLead = new SplitText(".hero__lower > p", { type: "lines" });
      const heroTimeline = gsap.timeline({ defaults: { ease: "power4.out" } });
      heroTimeline
        .from(heroSplit.lines, { yPercent: 105, autoAlpha: 0, duration: 1, stagger: 0.11 })
        .from(".hero__eyebrow", { y: 20, autoAlpha: 0, duration: 0.45 }, 0.2)
        .from(heroLead.lines, { y: 22, autoAlpha: 0, duration: 0.55, stagger: 0.07 }, 0.45)
        .from(".hero__actions .button", { y: 20, autoAlpha: 0, duration: 0.45, stagger: 0.08 }, 0.62);

      gsap.to(".hero__video", {
        yPercent: 10,
        scale: 1.04,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      const manifestoSplit = new SplitText("[data-manifesto]", { type: "words" });
      gsap.to(manifestoSplit.words, {
        opacity: 1,
        stagger: 0.12,
        ease: "none",
        scrollTrigger: {
          trigger: ".manifesto",
          start: "top 60%",
          end: "bottom 55%",
          scrub: 1,
        },
      });

      if (desktop) {
        const houseTwo = document.querySelector(".house--two");
        gsap.set(houseTwo, { position: "absolute", inset: 0, xPercent: 100 });
        gsap.to(houseTwo, {
          xPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".houses__stage",
            start: "top top",
            end: "+=110%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        const cutsTrack = document.querySelector(".cuts__track");
        const cutsViewport = document.querySelector(".cuts__viewport");
        const getDistance = () => Math.max(0, cutsTrack.scrollWidth - cutsViewport.clientWidth);

        const cutsTween = gsap.to(cutsTrack, {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: ".cuts",
            start: "top top",
            end: () => `+=${getDistance() + window.innerWidth * 0.4}`,
            pin: true,
            scrub: 1,

            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set(".cuts__progress span", { scaleX: self.progress }),
          },
        });

        const diagramStates = [
          {
            label: "Res / vaca",
            body: "M54,79 C84,39 157,29 226,46 C276,58 326,54 349,87 C362,106 356,133 334,149 L323,207 L292,207 L285,155 C252,166 213,168 177,160 L166,207 L134,207 L130,151 C105,144 88,129 77,109 L50,111 C33,106 34,87 54,79 Z",
            details: [
              "M76 108 C120 105 157 109 191 125",
              "M132 54 L130 151",
              "M219 45 L214 164",
              "M286 60 L284 155",
              "M48 82 L34 67 M50 88 L31 91",
              "M340 83 Q370 61 379 78",
            ],
          },
          {
            label: "Cerdo",
            body: "M62,105 C73,67 122,49 176,55 C213,25 286,35 322,70 C339,73 357,81 370,99 L349,111 C344,139 325,154 301,160 L300,205 L269,205 L259,164 C221,170 179,168 143,157 L128,205 L98,205 L101,151 C72,141 49,128 62,105 Z",
            details: [
              "M327 78 C345 70 363 79 371 98",
              "M111 68 L108 151",
              "M184 53 L181 166",
              "M259 48 L258 164",
              "M66 103 C43 88 43 68 57 65 C69 63 75 75 67 82",
              "M337 108 Q351 118 366 108",
            ],
          },
          {
            label: "Embutidos",
            body: "M54 158 C72 84 142 55 219 70 C277 82 315 118 353 98 C378 85 391 113 374 132 C337 174 288 151 245 130 C188 102 130 110 104 166 C92 192 47 185 54 158 Z",
            details: [
              "M56 149 C46 145 39 139 34 131",
              "M111 104 Q125 130 106 165",
              "M171 73 Q177 107 154 123",
              "M234 73 Q236 108 220 121",
              "M293 97 Q294 128 278 145",
              "M370 104 C380 101 388 96 394 88",
            ],
          },
          {
            label: "Vísceras",
            body: "M214 211 C194 183 119 145 113 94 C108 52 148 34 181 63 C199 27 251 24 278 57 C310 96 280 147 214 211 Z",
            details: [
              "M181 64 C168 43 170 24 183 13",
              "M208 55 C205 31 216 17 230 12",
              "M239 55 C250 34 265 27 281 33",
              "M205 87 C219 116 215 153 202 185",
              "M151 87 C176 92 194 111 205 138",
              "M275 76 C248 83 227 103 216 130",
            ],
          },
          {
            label: "Abarrotes",
            body: "M169 39 L169 70 C169 84 148 96 145 119 L135 207 C134 221 143 229 157 229 L266 229 C280 229 289 220 287 207 L277 119 C274 96 253 84 253 70 L253 39 Z",
            details: [
              "M168 39 L254 39 L254 23 L168 23 Z",
              "M153 126 C189 120 239 120 276 127 L282 185 C244 192 178 192 141 184 Z",
              "M170 72 L252 72",
              "M187 140 C202 151 221 151 235 140",
              "M211 133 L211 177",
              "M191 158 L231 158",
            ],
          },
          {
            label: "Frutas y Verduras",
            body: "M208 76 C177 47 125 64 112 109 C96 165 143 213 181 207 C198 204 207 214 224 210 C266 220 315 169 305 116 C296 67 244 52 208 76 Z",
            details: [
              "M208 78 C205 50 214 25 233 16",
              "M218 45 C239 23 267 27 276 47 C253 56 232 55 218 45 Z",
              "M286 211 C302 175 318 135 342 88",
              "M310 163 C286 156 278 138 283 124 C302 125 315 139 310 163 Z",
              "M325 127 C315 105 324 90 341 83 C351 103 345 119 325 127 Z",
              "M341 92 C343 67 359 56 376 60 C376 79 362 91 341 92 Z",
            ],
          },
        ];
        const diagramDetails = gsap.utils.toArray(".diagram-detail");
        const diagramLabel = document.querySelector(".cuts__visual-label");
        gsap.from(["#product-shape", ...diagramDetails], {
          drawSVG: "0%",
          duration: 0.9,
          stagger: 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".cuts",
            start: "top 72%",
            once: true,
          },
        });
        const morphTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: ".cuts",
            start: "top top",
            end: () => `+=${getDistance() + window.innerWidth * 0.4}`,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const activeIndex = Math.min(diagramStates.length - 1, Math.round(self.progress * (diagramStates.length - 1)));
              if (diagramLabel) diagramLabel.textContent = diagramStates[activeIndex].label;
            },
          },
        });

        diagramStates.slice(1).forEach((state, stateIndex) => {
          morphTimeline.to(
            "#product-shape",
            { morphSVG: { shape: state.body, type: "rotational" }, duration: 1, ease: "power1.inOut" },
            stateIndex,
          );
          diagramDetails.forEach((detail, detailIndex) => {
            morphTimeline.to(
              detail,
              { morphSVG: { shape: state.details[detailIndex], type: "rotational" }, duration: 1, ease: "power1.inOut" },
              stateIndex,
            );
          });
        });

        gsap.utils.toArray(".cut-card__image img").forEach((image) => {
          gsap.fromTo(
            image,
            { xPercent: -6 },
            {
              xPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: image.closest(".cut-card"),
                containerAnimation: cutsTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        DrawSVGPlugin.getLength(".order__line path");
        gsap.from(".order__line path", {
          drawSVG: "0%",
          ease: "none",
          scrollTrigger: {
            trigger: ".order__timeline",
            start: "top 65%",
            end: "bottom 55%",
            scrub: 1,
          },
        });
      }

      if (reel) {
        const galleryItems = gsap.utils.toArray(".gallery-item");
        const galleryFrame = document.querySelector(".gallery__grid");
        const reelCopy = document.querySelector(".gallery__reel-copy");
        const current = document.querySelector("[data-reel-current]");
        const branch = document.querySelector("[data-reel-branch]");
        const title = document.querySelector("[data-reel-title]");
        const description = document.querySelector("[data-reel-description]");
        const progress = document.querySelector(".gallery__reel-progress span");
        let activeIndex = 0;

        const getFrameSize = (item) => {
          const ratio = Number.parseFloat(item.dataset.reelRatio) || 1;
          const maxWidth = Math.min(window.innerWidth * 0.48, 620);
          const maxHeight = Math.min(window.innerHeight * 0.7, 700);
          let width = maxWidth;
          let height = width / ratio;
          if (height > maxHeight) {
            height = maxHeight;
            width = height * ratio;
          }
          return { width: Math.round(width), height: Math.round(height) };
        };

        const resizeFrame = (item, immediate = false) => {
          const size = getFrameSize(item);
          gsap.to(galleryFrame, {
            ...size,
            duration: immediate ? 0 : 0.56,
            ease: "power3.inOut",
            overwrite: true,
          });
        };

        const updateVideoControl = (item, playing) => {
          const icon = item.querySelector(".gallery-item__play [data-lucide]");
          item.classList.toggle("is-playing", playing);
          item.setAttribute("aria-label", `${playing ? "Pausar" : "Reproducir"}: ${item.dataset.reelTitle}`);
          icon?.setAttribute("data-lucide", playing ? "pause" : "play");
          renderIcons();
        };

        const pauseReelVideo = (item) => {
          const video = item?.querySelector(".gallery-item__reel-video");
          if (!video) return;
          video.pause();
          updateVideoControl(item, false);
        };

        const toggleReelVideo = (item) => {
          if (item.dataset.reelActive !== "true") return;
          const video = item.querySelector(".gallery-item__reel-video");
          if (!video) return;
          if (video.paused) {
            galleryItems.forEach((candidate) => pauseReelVideo(candidate));
            video.play().then(() => updateVideoControl(item, true)).catch(() => updateVideoControl(item, false));
          } else {
            pauseReelVideo(item);
          }
        };

        const updateCopy = (item, index) => {
          if (!reelCopy) return;
          const copyElements = [current, branch, title, description].filter(Boolean);
          gsap
            .timeline()
            .to(copyElements, { y: -10, autoAlpha: 0, duration: 0.14, stagger: 0.018, ease: "power2.in" })
            .add(() => {
              current.textContent = String(index + 1).padStart(2, "0");
              branch.textContent = item.dataset.reelBranch;
              title.textContent = item.dataset.reelTitle;
              description.textContent = item.dataset.reelDescription;
            })
            .fromTo(copyElements, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.28, stagger: 0.025, ease: "power3.out" });
        };

        const setGalleryItem = (nextIndex, direction = 1, immediate = false) => {
          const previousItem = galleryItems[activeIndex];
          const nextItem = galleryItems[nextIndex];
          if (!nextItem || (!immediate && nextIndex === activeIndex)) return;

          pauseReelVideo(previousItem);
          galleryItems.forEach((item, index) => {
            item.tabIndex = index === nextIndex ? 0 : -1;
            item.dataset.reelActive = index === nextIndex ? "true" : "false";
          });

          resizeFrame(nextItem, immediate);
          gsap.killTweensOf([previousItem, nextItem]);
          gsap.set(nextItem, { zIndex: 2, visibility: "visible", pointerEvents: "auto" });
          if (immediate) {
            gsap.set(galleryItems, { autoAlpha: 0, pointerEvents: "none" });
            gsap.set(nextItem, { autoAlpha: 1, yPercent: 0, scale: 1, pointerEvents: "auto" });
          } else {
            gsap
              .timeline()
              .to(previousItem, { yPercent: direction > 0 ? -9 : 9, scale: 0.97, autoAlpha: 0, pointerEvents: "none", duration: 0.28, ease: "power2.in" })
              .fromTo(
                nextItem,
                { yPercent: direction > 0 ? 10 : -10, scale: 0.97, autoAlpha: 0 },
                { yPercent: 0, scale: 1, autoAlpha: 1, duration: 0.42, ease: "power3.out" },
                "-=0.08",
              );
            updateCopy(nextItem, nextIndex);
          }
          activeIndex = nextIndex;
        };

        galleryItems
          .filter((item) => item.dataset.type === "video")
          .forEach((item) => item.addEventListener("click", () => toggleReelVideo(item)));

        setGalleryItem(0, 1, true);
        ScrollTrigger.create({
          trigger: ".gallery",
          start: "top top",
          end: () => `+=${(galleryItems.length - 1) * window.innerHeight * 0.78}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => resizeFrame(galleryItems[activeIndex], true),
          onUpdate: (self) => {
            const nextIndex = Math.min(galleryItems.length - 1, Math.round(self.progress * (galleryItems.length - 1)));
            setGalleryItem(nextIndex, self.direction);
            gsap.set(progress, { scaleX: self.progress });
          },
          onLeave: () => pauseReelVideo(galleryItems[activeIndex]),
          onLeaveBack: () => pauseReelVideo(galleryItems[activeIndex]),
        });
      } else {
        ScrollTrigger.batch(".gallery-item", {
          start: "top 88%",
          once: true,
          onEnter: (items) =>
            gsap.fromTo(items, { y: 44, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.7, ease: "power3.out" }),
        });
      }

      return () => {
        cleanupReviews();
        heroSplit.revert();
        heroLead.revert();
        manifestoSplit.revert();
      };
    },
  );

  document.querySelectorAll(".order__steps li").forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: "top 58%",
      end: "bottom 42%",
      onToggle: ({ isActive }) => {
        step.classList.toggle("is-active", isActive);
        if (isActive) {
          gsap.to(".order__count span", {
            yPercent: -10,
            autoAlpha: 0,
            duration: 0.16,
            onComplete: () => {
              const count = document.querySelector(".order__count span");
              count.textContent = step.dataset.step;
              gsap.fromTo(count, { yPercent: 10, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.24 });
            },
          });
        }
      },
    });
  });


  gsap.fromTo(
    ".footer__wordmark",
    { color: "transparent" },
    {
      color: "rgba(245, 236, 224, 0.92)",
      scrollTrigger: {
        trigger: ".site-footer",
        start: "top 75%",
        end: "top 35%",
        scrub: 1,
      },
    },
  );
}

async function init() {
  renderCatalog();
  renderIcons();
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  const preloaderPromise = initPreloader();
  const lenis = initSmoothScroll();
  initHeader(lenis);
  initCutsModal(lenis);
  initLightbox(lenis);
  initCursorAndMagnets();
  initVideoVisibility();
  initMobileProgress();

  await preloaderPromise;
  initAnimations();
  ScrollTrigger.refresh();
}

init();
