// *** PLAYER CONTROLS ***
const playPauseBtn = document.getElementById("play-pause-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const equalizerBars = document.querySelectorAll(".equalizer .bar");
const artistName = document.getElementById("artist-name");
const trackName = document.getElementById("track-name");

let isPlaying = false;
let currentTrackIndex = 0;

// Playlist des artistes et boucles
const playlist = [
  { artist: "M83", track: "Outro", audio: "audio/clip-m83.mp3" },
  {
    artist: "Chinese Man",
    track: "Le pudding",
    audio: "audio/clip-chineseman.mp3",
  },
  {
    artist: "L'impératrice",
    track: "Vanille Fraise",
    audio: "audio/clip-imperatrice.mp3",
  },
  { artist: "Bonobo", track: "Cirrus", audio: "audio/clip-bonobo.mp3" },
  {
    artist: "Wax Taylor",
    track: "Que Sera",
    audio: "audio/clip-waxtaylor.mp3",
  },
  { artist: "Kavinsky", track: "Roadga", audio: "audio/clip-kavinsky.mp3" },
  { artist: "R. Lang", track: "Ecrea Symphony", audio: "audio/loop.mp3" },
];

const audio = new Audio(playlist[currentTrackIndex].audio);

// Met à jour les informations sur la piste actuelle
function updateTrackInfo() {
  if (artistName) artistName.textContent = playlist[currentTrackIndex].artist;
  if (trackName) trackName.textContent = playlist[currentTrackIndex].track;
  audio.src = playlist[currentTrackIndex].audio;
}

// Lecture / Pause
if (playPauseBtn) {
  playPauseBtn.addEventListener("click", () => {
    if (!isPlaying) {
      audio.play();
      playPauseBtn.textContent = "⏸";
      isPlaying = true;
      equalizerBars.forEach(
        (bar) => (bar.style.animationPlayState = "running")
      );
    } else {
      audio.pause();
      playPauseBtn.textContent = "▶";
      isPlaying = false;
      equalizerBars.forEach((bar) => (bar.style.animationPlayState = "paused"));
    }
  });
}

// Piste suivante
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    updateTrackInfo();
    if (isPlaying) audio.play();
  });
}

// Piste précédente
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    currentTrackIndex =
      (currentTrackIndex - 1 + playlist.length) % playlist.length;
    updateTrackInfo();
    if (isPlaying) audio.play();
  });
}

// Mise à jour initiale de la piste
updateTrackInfo();

// *** FILTRES ET CARDS DES CONCERTS ***
function initCardsAndFilters() {
  const concertsContainer = document.getElementById("concerts-container");
  const backgroundImage = "./image/illu-secondaire.jpg"; // Chemin de l'image de fond
  let concerts = [];

  if (!concertsContainer) {
    console.error("Container des concerts introuvable.");
    return;
  }

  // Charger les données JSON
  fetch("festival.json")
    .then((response) => {
      if (!response.ok) throw new Error("Erreur de chargement des données");
      return response.json();
    })
    .then((data) => {
      concerts = data;
      displayConcerts(concerts, concertsContainer, backgroundImage);
    })
    .catch((error) => console.error("Erreur :", error));

  // Gestion des filtres
  document.getElementById("filter-day")?.addEventListener("change", (event) => {
    const day = event.target.value;
    const filtered =
      day === "all" ? concerts : concerts.filter((c) => c.date === day);
    displayConcerts(filtered, concertsContainer, backgroundImage);
  });

  document.getElementById("filter-price")?.addEventListener("click", () => {
    const sorted = [...concerts].sort((a, b) => a.price - b.price);
    displayConcerts(sorted, concertsContainer, backgroundImage);
  });

  document.getElementById("filter-tickets")?.addEventListener("click", () => {
    const sorted = [...concerts].sort((a, b) => a.ticketsSold - b.ticketsSold);
    displayConcerts(sorted, concertsContainer, backgroundImage);
  });
}

// Affichage des concerts
function displayConcerts(data, container, bgImage) {
  container.innerHTML = "";
  data.forEach((concert) => {
    const ticketsAvailable = 1000 - concert.ticketsSold;
    const progressWidth = (concert.ticketsSold / 1000) * 100;
    const progressColor = ticketsAvailable > 0 ? "blue" : "pink";

    let badgeText = "";
    let badgeClass = "";
    if (ticketsAvailable <= 10) {
      badgeText = "Sold Out";
      badgeClass = "badge sold-out";
    } else if (ticketsAvailable <= 250) {
      badgeText = "Last Chance";
      badgeClass = "badge last-chance";
    }

    const card = `
      <div class="artist-card">
        ${badgeText ? `<div class="${badgeClass}">${badgeText}</div>` : ""}
        <div class="artist-image-container" style="background-image: url('${bgImage}');">
          <img src="${concert.image}" alt="Image de ${
      concert.artist
    }" class="artist-photo" />
        </div>
        <div class="artist-info">
          <h3>${concert.artist}</h3>
          <p>${concert.description}</p>
          <hr />
          <p><strong>Prix :</strong> ${concert.price}€</p>
          <p><strong>Date :</strong> ${concert.date}</p>
          <p><strong>Horaire :</strong> ${concert.time}</p>
          <div class="progress-bar">
            <div class="progress" style="width: ${progressWidth}%; background-color: ${progressColor};">
              ${
                ticketsAvailable > 0
                  ? `${ticketsAvailable} places restantes`
                  : "Complet"
              }
            </div>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += card;
  });
}

// *** INITIALISATION ***
document.addEventListener("DOMContentLoaded", () => {
  const bodyId = document.body.id;

  if (bodyId === "home-page") {
    initCountdown();
  } else if (bodyId === "concerts-page") {
    initCardsAndFilters();
  }
});

// *** COMPTEUR ***
function initCountdown() {
  const countdownDate = new Date("2025-06-15T12:00:00").getTime();
  const daysElement = document.getElementById("days");
  const hoursElement = document.getElementById("hours");
  const minutesElement = document.getElementById("minutes");
  const secondsElement = document.getElementById("seconds");

  function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = countdownDate - now;

    if (timeLeft <= 0) {
      document.querySelector(".countdown-container").innerHTML =
        "<h2>Le festival a commencé !</h2>";
      clearInterval(timer);
      return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    if (daysElement) daysElement.textContent = days;
    if (hoursElement) hoursElement.textContent = hours;
    if (minutesElement) minutesElement.textContent = minutes;
    if (secondsElement) secondsElement.textContent = seconds;
  }

  const timer = setInterval(updateCountdown, 1000);
  updateCountdown();
}
