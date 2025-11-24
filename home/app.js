// Simple client-side list of games. Edit or extend this array as needed.
// Make sure `link` points to the correct path for your snake game (e.g. "../snake/index.html" or "/snake.html")
const games = [
  {
    id: 'snake',
    title: 'Snake',
    description: 'Classic snake game',
    link: '../snake/index.html',
    // inline SVG thumbnail (keeps the card self-contained)
    svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Snake icon">
  <rect width="64" height="64" rx="10" fill="#0b2a1b"/>
  <path d="M10 36c4-6 10-8 18-8s14 2 18 8c2 3 2 6 0 9s-6 4-9 2c-3-1-4-5-1-8 2-2 2-3 0-5s-6-3-10-3-8 1-10 3c-2 2-2 3 0 5 3 3 2 7-1 8-3 1-7 1-9-2s-2-6 0-9z" fill="#22c55e"/>
  <circle cx="46" cy="34" r="3" fill="#052918"/>
</svg>`
];

const container = document.getElementById('gamesContainer');
const template = document.getElementById('gameCardTemplate');

function renderGames() {
  container.innerHTML = '';
  games.forEach(g => {
    const node = template.content.cloneNode(true);
    const link = node.querySelector('.game-link');
    const thumb = node.querySelector('.thumb');
    const title = node.querySelector('.game-title');

    link.href = g.link || '#';
    title.textContent = g.title;
    thumb.innerHTML = g.svg || '';

    // Accessible label
    link.setAttribute('aria-label', `Open ${g.title} game`);
    container.appendChild(node);
  });
}

renderGames();
