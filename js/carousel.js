/*
  PAINEL DE RECEPÇÃO
  ------------------------------------------------
  Para adicionar conteúdo:
  1. Coloque os arquivos dentro da pasta "midia".
  2. Edite a lista MEDIA abaixo.
  3. Salve e publique novamente.

  Imagens: JPG, JPEG, PNG, WEBP
  Vídeos: MP4, WEBM, OGG

  Imagens ficam 10 segundos.
  Vídeos avançam automaticamente quando terminam.
*/

const IMAGE_DURATION = 10000;

// Coloque aqui os nomes dos arquivos existentes na pasta "midia".
// A ordem da lista é a ordem de exibição.
const MEDIA = [
  "img1.jpeg",
  "img2.jpeg",
  "img3.jpeg",
  "img4.png",
  "img5.png",
  "img6.png",
  "img7.png",
  "img8.png",
  "img9.png",
  "img10.png",
  "img11.png",
  "img12.png",
  "img13.png",
  "img14.png",
  "img15.png",
  // "banner-01.jpg",
  // "banner-02.jpg",
  // "video-01.mp4",
];

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg"];

const image = document.getElementById("image");
const video = document.getElementById("video");
const mediaContainer = document.getElementById("mediaContainer");
const loader = document.getElementById("loader");
const empty = document.getElementById("empty");
const progress = document.getElementById("progress");
const progressBar = progress.querySelector("span");

let currentIndex = 0;
let timer = null;
let progressTimer = null;
let currentStartedAt = 0;
let currentDuration = IMAGE_DURATION;

function getExtension(filename) {
  const clean = filename.split("?")[0].toLowerCase();
  const dot = clean.lastIndexOf(".");
  return dot >= 0 ? clean.slice(dot) : "";
}

function isImage(filename) {
  return IMAGE_EXTENSIONS.includes(getExtension(filename));
}

function isVideo(filename) {
  return VIDEO_EXTENSIONS.includes(getExtension(filename));
}

function clearTimers() {
  clearTimeout(timer);
  clearInterval(progressTimer);
  timer = null;
  progressTimer = null;
}

function resetProgress() {
  progressBar.style.width = "0%";
  currentStartedAt = performance.now();
}

function startProgress(duration) {
  currentDuration = duration;
  resetProgress();

  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    const elapsed = performance.now() - currentStartedAt;
    const percentage = Math.min(100, (elapsed / currentDuration) * 100);
    progressBar.style.width = `${percentage}%`;
  }, 100);
}

function next() {
  clearTimers();

  if (!MEDIA.length) return;

  currentIndex = (currentIndex + 1) % MEDIA.length;
  showCurrent();
}

function showCurrent() {
  clearTimers();

  const file = MEDIA[currentIndex];
  const url = `midia/${encodeURIComponent(file)}`;

  image.classList.remove("fade-in");
  video.classList.remove("fade-in");

  if (isVideo(file)) {
    image.style.display = "none";
    video.style.display = "block";
    video.src = url;
    video.currentTime = 0;

    video.onloadedmetadata = () => {
      video.play().catch(() => {
        // Algumas TVs exigem interação para áudio, mas o vídeo está muted.
        // Se ainda assim bloquear, o usuário pode tocar na tela/controle.
      });

      mediaContainer.classList.remove("hidden");
      loader.classList.add("hidden");
      empty.classList.add("hidden");
      progress.classList.remove("hidden");
      video.classList.add("fade-in");

      if (Number.isFinite(video.duration) && video.duration > 0) {
        startProgress(video.duration * 1000);
      }
    };

    video.onended = next;

    video.onerror = () => {
      console.warn(`Não foi possível carregar: ${file}`);
      next();
    };

  } else if (isImage(file)) {
    video.pause();
    video.removeAttribute("src");
    video.load();

    video.style.display = "none";
    image.style.display = "block";
    image.src = url;

    image.onload = () => {
      mediaContainer.classList.remove("hidden");
      loader.classList.add("hidden");
      empty.classList.add("hidden");
      progress.classList.remove("hidden");
      image.classList.add("fade-in");

      startProgress(IMAGE_DURATION);
      timer = setTimeout(next, IMAGE_DURATION);
    };

    image.onerror = () => {
      console.warn(`Não foi possível carregar: ${file}`);
      next();
    };

  } else {
    console.warn(`Formato não suportado: ${file}`);
    next();
  }
}

function initialize() {
  if (!MEDIA.length) {
    loader.classList.add("hidden");
    empty.classList.remove("hidden");
    return;
  }

  currentIndex = 0;
  showCurrent();
}

// Permite avançar com clique/toque/tecla durante testes.
// Na TV, o cursor fica oculto e isso não interfere na reprodução.
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === " " || event.key === "Enter") {
    next();
  }
});

document.addEventListener("click", next);
document.addEventListener("touchstart", next, { passive: true });

initialize();
