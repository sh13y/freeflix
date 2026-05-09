/* ===== FreeFlix — App Logic ===== */
const API_KEY = window.TMDB_API_KEY || 'YOUR_API_KEY_HERE';
const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';
const VIDSRC = 'https://vidsrc.mov/embed';

// State
let currentPage = 'home';
let moviePage = 1, tvPage = 1;
let currentItem = null;
let currentType = 'movie';
let heroData = null;
let searchTimeout = null;
let previousPage = 'home';
let movieGenre = '', tvGenre = '';

// ===== TMDB Fetch Helper =====
async function tmdb(endpoint, params = {}) {
  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB Error: ${res.status}`);
  return res.json();
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', async () => {
  setupSearch();
  setupNavScroll();
  await loadHome();
  hideLoader();
});

function hideLoader() {
  const l = document.getElementById('globalLoader');
  l.classList.add('hidden');
  setTimeout(() => l.style.display = 'none', 600);
}

// ===== Navigation =====
function navigateTo(page, data) {
  if (page !== 'detail') previousPage = currentPage;
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === page);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'movies' && document.getElementById('moviesGrid').children.length === 0) loadMoviesPage();
  if (page === 'tvshows' && document.getElementById('tvGrid').children.length === 0) loadTVPage();
  if (page === 'detail' && data) loadDetail(data.id, data.type);
}

function goBack() {
  navigateTo(previousPage);
}

// ===== Home Page =====
async function loadHome() {
  try {
    const [trending, popular, topRated] = await Promise.all([
      tmdb('/trending/movie/week'),
      tmdb('/tv/popular'),
      tmdb('/movie/top_rated')
    ]);
    // Hero
    if (trending.results.length) {
      const h = trending.results[Math.floor(Math.random() * Math.min(5, trending.results.length))];
      heroData = h;
      const bd = document.getElementById('heroBackdrop');
      bd.style.backgroundImage = `url(${IMG}/w1280${h.backdrop_path})`;
      document.getElementById('heroTitle').textContent = h.title || h.name;
      document.getElementById('heroOverview').textContent = h.overview;
      document.getElementById('heroYear').textContent = (h.release_date || h.first_air_date || '').slice(0, 4);
      document.getElementById('heroRating').textContent = `★ ${h.vote_average?.toFixed(1)}`;
    }
    renderRow('trendingMovies', trending.results, 'movie');
    renderRow('popularTV', popular.results, 'tv');
    renderRow('topRated', topRated.results, 'movie');
  } catch (e) { console.error('Home load error:', e); }
}

function playHeroMovie() {
  if (!heroData) return;
  navigateTo('detail', { id: heroData.id, type: 'movie' });
  setTimeout(() => playContent(), 800);
}
function viewHeroDetails() {
  if (!heroData) return;
  navigateTo('detail', { id: heroData.id, type: 'movie' });
}

// ===== Render Helpers =====
function renderRow(containerId, items, type) {
  const c = document.getElementById(containerId);
  c.innerHTML = '';
  items.forEach(item => {
    if (!item.poster_path) return;
    c.appendChild(createCard(item, type));
  });
}

function createCard(item, type) {
  const card = document.createElement('div');
  card.className = 'card';
  card.onclick = () => navigateTo('detail', { id: item.id, type });
  const title = item.title || item.name || 'Untitled';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '';
  const poster = item.poster_path ? `${IMG}/w342${item.poster_path}` : '';

  card.innerHTML = `
    <div class="card-img-wrap">
      <img src="${poster}" alt="${title}" loading="lazy">
      ${rating ? `<span class="card-rating">★ ${rating}</span>` : ''}
      ${type === 'tv' ? '<span class="card-type">TV</span>' : ''}
    </div>
    <div class="card-info">
      <div class="card-title">${title}</div>
      <div class="card-year">${year}</div>
    </div>`;
  return card;
}

function renderGrid(containerId, items, type) {
  const c = document.getElementById(containerId);
  items.forEach(item => {
    if (!item.poster_path) return;
    c.appendChild(createCard(item, type));
  });
}

function showSkeletons(containerId, count = 8) {
  const c = document.getElementById(containerId);
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton skeleton-card';
    c.appendChild(sk);
  }
}

function clearSkeletons(containerId) {
  document.getElementById(containerId).querySelectorAll('.skeleton').forEach(s => s.remove());
}

// ===== Movies Page =====
async function loadMoviesPage() {
  moviePage = 1;
  const grid = document.getElementById('moviesGrid');
  grid.innerHTML = '';
  showSkeletons('moviesGrid', 12);
  // Load genres
  try {
    const g = await tmdb('/genre/movie/list');
    const f = document.getElementById('movieGenreFilters');
    f.innerHTML = '<button class="genre-btn active" onclick="filterMovieGenre(\'\')">All</button>';
    g.genres.forEach(genre => {
      f.innerHTML += `<button class="genre-btn" onclick="filterMovieGenre(${genre.id})">${genre.name}</button>`;
    });
  } catch (e) { }
  await fetchMovies();
}

async function fetchMovies() {
  try {
    const params = { page: moviePage };
    const endpoint = movieGenre ? '/discover/movie' : '/movie/popular';
    if (movieGenre) params.with_genres = movieGenre;
    const data = await tmdb(endpoint, params);
    clearSkeletons('moviesGrid');
    renderGrid('moviesGrid', data.results, 'movie');
    document.getElementById('loadMoreMovies').style.display = moviePage < data.total_pages ? 'inline-flex' : 'none';
  } catch (e) { console.error(e); clearSkeletons('moviesGrid'); }
}

function loadMoreMovies() { moviePage++; showSkeletons('moviesGrid', 6); fetchMovies(); }

function filterMovieGenre(id) {
  movieGenre = id;
  moviePage = 1;
  document.getElementById('moviesGrid').innerHTML = '';
  document.querySelectorAll('#movieGenreFilters .genre-btn').forEach(b => {
    b.classList.toggle('active', (id === '' && b.textContent === 'All') || b.onclick?.toString().includes(id));
  });
  showSkeletons('moviesGrid', 12);
  fetchMovies();
}

// ===== TV Page =====
async function loadTVPage() {
  tvPage = 1;
  const grid = document.getElementById('tvGrid');
  grid.innerHTML = '';
  showSkeletons('tvGrid', 12);
  try {
    const g = await tmdb('/genre/tv/list');
    const f = document.getElementById('tvGenreFilters');
    f.innerHTML = '<button class="genre-btn active" onclick="filterTVGenre(\'\')">All</button>';
    g.genres.forEach(genre => {
      f.innerHTML += `<button class="genre-btn" onclick="filterTVGenre(${genre.id})">${genre.name}</button>`;
    });
  } catch (e) { }
  await fetchTV();
}

async function fetchTV() {
  try {
    const params = { page: tvPage };
    const endpoint = tvGenre ? '/discover/tv' : '/tv/popular';
    if (tvGenre) params.with_genres = tvGenre;
    const data = await tmdb(endpoint, params);
    clearSkeletons('tvGrid');
    renderGrid('tvGrid', data.results, 'tv');
    document.getElementById('loadMoreTV').style.display = tvPage < data.total_pages ? 'inline-flex' : 'none';
  } catch (e) { console.error(e); clearSkeletons('tvGrid'); }
}

function loadMoreTV() { tvPage++; showSkeletons('tvGrid', 6); fetchTV(); }

function filterTVGenre(id) {
  tvGenre = id;
  tvPage = 1;
  document.getElementById('tvGrid').innerHTML = '';
  document.querySelectorAll('#tvGenreFilters .genre-btn').forEach(b => {
    b.classList.toggle('active', (id === '' && b.textContent === 'All') || b.onclick?.toString().includes(id));
  });
  showSkeletons('tvGrid', 12);
  fetchTV();
}

// ===== Detail Page =====
async function loadDetail(id, type) {
  currentType = type;
  currentItem = null;
  const playerSection = document.getElementById('playerSection');
  playerSection.style.display = 'none';
  document.getElementById('playerFrame').src = '';

  try {
    const data = await tmdb(`/${type}/${id}`, { append_to_response: 'credits,recommendations' });
    currentItem = data;
    const title = data.title || data.name;
    const year = (data.release_date || data.first_air_date || '').slice(0, 4);
    const runtime = data.runtime ? `${data.runtime} min` : (data.episode_run_time?.[0] ? `${data.episode_run_time[0]} min/ep` : '');
    const genres = (data.genres || []).map(g => g.name).join(', ');

    // Backdrop
    if (data.backdrop_path) {
      document.getElementById('detailBackdrop').style.backgroundImage = `url(${IMG}/w1280${data.backdrop_path})`;
    }
    // Poster
    document.getElementById('detailPoster').src = data.poster_path ? `${IMG}/w500${data.poster_path}` : '';
    document.getElementById('detailPoster').alt = title;
    // Info
    document.getElementById('detailTitle').textContent = title;
    // Meta tags
    const metaHtml = [];
    if (year) metaHtml.push(`<span class="tag">${year}</span>`);
    if (data.vote_average) metaHtml.push(`<span class="tag rating">★ ${data.vote_average.toFixed(1)}</span>`);
    if (runtime) metaHtml.push(`<span class="tag">${runtime}</span>`);
    if (genres) metaHtml.push(`<span class="tag">${genres}</span>`);
    document.getElementById('detailMeta').innerHTML = metaHtml.join('');
    document.getElementById('detailOverview').textContent = data.overview || '';

    // Extra info
    const extra = [];
    const cast = data.credits?.cast?.slice(0, 5).map(c => c.name).join(', ');
    const director = data.credits?.crew?.find(c => c.job === 'Director');
    if (director) extra.push(`<span><strong>Director:</strong> ${director.name}</span>`);
    if (cast) extra.push(`<span><strong>Cast:</strong> ${cast}</span>`);
    if (data.status) extra.push(`<span><strong>Status:</strong> ${data.status}</span>`);
    if (type === 'tv' && data.number_of_seasons) extra.push(`<span><strong>Seasons:</strong> ${data.number_of_seasons}</span>`);
    document.getElementById('detailExtra').innerHTML = extra.join('');

    // TV Episodes
    const epSection = document.getElementById('episodesSection');
    if (type === 'tv' && data.number_of_seasons) {
      epSection.style.display = 'block';
      const select = document.getElementById('seasonSelect');
      select.innerHTML = '';
      for (let i = 1; i <= data.number_of_seasons; i++) {
        select.innerHTML += `<option value="${i}">Season ${i}</option>`;
      }
      loadEpisodes();
    } else {
      epSection.style.display = 'none';
    }

    // Recommendations
    if (data.recommendations?.results?.length) {
      document.getElementById('recommendationsSection').style.display = 'block';
      renderRow('recommendations', data.recommendations.results, type);
    } else {
      document.getElementById('recommendationsSection').style.display = 'none';
    }

    // Update play button text
    document.getElementById('playBtn').textContent = type === 'tv' ? '▶ Watch S1 E1' : '▶ Watch Now';

  } catch (e) { console.error('Detail load error:', e); }
}

async function loadEpisodes() {
  if (!currentItem || currentType !== 'tv') return;
  const season = document.getElementById('seasonSelect').value;
  const grid = document.getElementById('episodesGrid');
  grid.innerHTML = '<div class="skeleton" style="height:80px;grid-column:1/-1"></div>';

  try {
    const data = await tmdb(`/tv/${currentItem.id}/season/${season}`);
    grid.innerHTML = '';
    (data.episodes || []).forEach(ep => {
      const card = document.createElement('div');
      card.className = 'episode-card';
      card.onclick = () => playEpisode(season, ep.episode_number, card);
      card.innerHTML = `
        <div class="ep-still">
          ${ep.still_path ? `<img src="${IMG}/w300${ep.still_path}" alt="E${ep.episode_number}" loading="lazy">` : ''}
        </div>
        <div class="ep-info">
          <div class="ep-number">Episode ${ep.episode_number}</div>
          <div class="ep-name">${ep.name || ''}</div>
          <div class="ep-overview">${ep.overview || ''}</div>
        </div>`;
      grid.appendChild(card);
    });
  } catch (e) { grid.innerHTML = '<p style="color:var(--text3)">Could not load episodes.</p>'; }
}

// ===== Player =====
function playContent() {
  if (!currentItem) return;
  const section = document.getElementById('playerSection');
  const frame = document.getElementById('playerFrame');
  const titleEl = document.getElementById('playerTitle');

  if (currentType === 'movie') {
    frame.src = `${VIDSRC}/movie/${currentItem.id}`;
    titleEl.textContent = `Now Playing: ${currentItem.title}`;
  } else {
    const season = document.getElementById('seasonSelect')?.value || 1;
    frame.src = `${VIDSRC}/tv/${currentItem.id}/${season}/1`;
    titleEl.textContent = `Now Playing: ${currentItem.name} — S${season} E1`;
    // Highlight first episode
    document.querySelectorAll('.episode-card').forEach((c, i) => c.classList.toggle('active', i === 0));
  }
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function playEpisode(season, episode, cardEl) {
  if (!currentItem) return;
  const frame = document.getElementById('playerFrame');
  const section = document.getElementById('playerSection');
  const titleEl = document.getElementById('playerTitle');

  frame.src = `${VIDSRC}/tv/${currentItem.id}/${season}/${episode}`;
  titleEl.textContent = `Now Playing: ${currentItem.name} — S${season} E${episode}`;
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.querySelectorAll('.episode-card').forEach(c => c.classList.remove('active'));
  if (cardEl) cardEl.classList.add('active');
}

function closePlayer() {
  document.getElementById('playerSection').style.display = 'none';
  document.getElementById('playerFrame').src = '';
}

// ===== Search =====
function setupSearch() {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const q = input.value.trim();
    if (q.length < 2) return;
    searchTimeout = setTimeout(() => performSearch(q), 400);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(searchTimeout);
      const q = input.value.trim();
      if (q.length >= 2) performSearch(q);
    }
  });
}

function toggleSearch() {
  const bar = document.getElementById('searchBar');
  bar.classList.toggle('open');
  if (bar.classList.contains('open')) {
    document.getElementById('searchInput').focus();
  } else {
    document.getElementById('searchInput').value = '';
  }
}

async function performSearch(query) {
  navigateTo('search');
  document.getElementById('searchResultsTitle').textContent = `Results for "${query}"`;
  const grid = document.getElementById('searchGrid');
  grid.innerHTML = '';
  showSkeletons('searchGrid', 12);

  try {
    const data = await tmdb('/search/multi', { query });
    clearSkeletons('searchGrid');
    data.results.forEach(item => {
      if (item.media_type === 'person' || !item.poster_path) return;
      grid.appendChild(createCard(item, item.media_type));
    });
    if (grid.children.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text3);font-style:italic;padding:40px 0">No results found. Try a different search term.</p>';
    }
  } catch (e) { clearSkeletons('searchGrid'); console.error(e); }
}

// ===== Mobile Menu =====
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
  document.getElementById('mobileMenuBtn').classList.toggle('active');
}

// ===== Scroll Effect =====
function setupNavScroll() {
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 30);
  });
}
