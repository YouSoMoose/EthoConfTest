"use client";

import { useEffect } from 'react';

export default function CarbonGamePage() {
  useEffect(() => {
    // Dynamically add module scripts after hydration so they don't interfere with SSR
    const existing = document.querySelectorAll('script[data-carbon-game]');
    if (existing && existing.length) return; // already injected

    const formulas = document.createElement('script');
    formulas.type = 'module';
    formulas.src = '/carbon-game/js/formulas.js?v=1';
    formulas.setAttribute('data-carbon-game', '1');
    document.body.appendChild(formulas);

    const app = document.createElement('script');
    app.type = 'module';
    app.src = '/carbon-game/js/app.js?v=1';
    app.setAttribute('data-carbon-game', '1');
    document.body.appendChild(app);

    return () => {
      // cleanup on unmount
      document.querySelectorAll('script[data-carbon-game]').forEach(s => s.remove());
    };
  }, []);

  // Render the same markup as the static index.html body so server and client markup match
  return (
    <main className="app" style={{ padding: 16 }}>
      <header>
        <h1>Carbon Game</h1>
        <p className="subtitle">Answer a short questionnaire — lower points are better.</p>
      </header>

      <section id="question-area" className="card">
        <div id="progress" className="progress"><div id="progress-bar"></div></div>
        <div id="question-root"></div>
        <div className="controls">
          <button id="prevBtn" className="btn">Back</button>
          <button id="nextBtn" className="btn primary">Next</button>
        </div>
      </section>

      <section id="result-area" className="card hidden">
        <h2>Your Score</h2>
        <div id="score" className="score">—</div>
        <div id="score-label" className="score-label"></div>

        <div className="leaderboard-entry">
          <label htmlFor="nameInput">Save your score to the leaderboard</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input id="nameInput" placeholder="Your name" />
            <button id="saveLeaderboardBtn" className="btn">Save</button>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button id="restartBtn" className="btn">Restart</button>
          <button id="viewLeaderboardBtn" className="btn">View Leaderboard</button>
        </div>
      </section>

      <section id="leaderboard-area" className="card hidden">
        <h2>Leaderboard</h2>
        <div id="leaderboard-list">No entries yet.</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button id="closeLeaderboardBtn" className="btn">Close</button>
            <button id="exportLeaderboardBtn" className="btn">Export</button>
            <button id="exportToCardBtn" className="btn">Export to Conference Card</button>
            <button id="clearLeaderboardBtn" className="btn">Clear</button>
        </div>
      </section>

      <footer>
        <small>Built to be embedded via iframe. Replace formulas in <code>js/formulas.js</code>.</small>
      </footer>
    </main>
  );
}
