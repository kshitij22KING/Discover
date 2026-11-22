"use client";
import { useCallback, useEffect, useState } from "react";
import SwipeCard from "./SwipeCard";
import Photo from "./Photo";

const FLY_MS = 260;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Discover() {
  const [view, setView] = useState("swipe"); // "swipe" | "matches"
  const [feed, setFeed] = useState(null); // null = loading
  const [matches, setMatches] = useState([]);
  const [exiting, setExiting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [match, setMatch] = useState(null);
  const [error, setError] = useState("");

  const loadFeed = useCallback(async () => {
    try {
      const r = await fetch("/api/feed");
      setFeed((await r.json()).profiles);
      setError("");
    } catch {
      setError("Couldn't load profiles. Check your connection and try again.");
      setFeed([]);
    }
  }, []);

  const loadMatches = useCallback(async () => {
    try {
      const r = await fetch("/api/matches");
      setMatches((await r.json()).matches);
    } catch {
      setError("Couldn't load your matches. Try again.");
    }
  }, []);

  useEffect(() => {
    loadFeed();
    loadMatches();
  }, [loadFeed, loadMatches]);

  const top = feed?.[0];
  const next = feed?.[1];

  const swipe = useCallback(
    async (action) => {
      if (busy || !top) return;
      setBusy(true);
      setExiting(action);
      setError("");
      try {
        const [res] = await Promise.all([
          fetch("/api/swipe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileId: top.id, action }),
          }),
          sleep(FLY_MS),
        ]);
        // 409 means the server already has a swipe for this profile: drop the stale card.
        if (!res.ok && res.status !== 409) throw new Error("swipe failed");
        const data = await res.json();
        setFeed((f) => f.filter((p) => p.id !== top.id));
        if (data.match) {
          setMatch(data.profile);
          loadMatches();
        }
      } catch {
        setError("That swipe didn't save. Try again.");
      } finally {
        setExiting(null);
        setBusy(false);
      }
    },
    [busy, top, loadMatches]
  );

  // Desktop keyboard: ← pass, → like
  useEffect(() => {
    const onKey = (e) => {
      if (view !== "swipe" || match) return;
      if (e.key === "ArrowRight") swipe("like");
      if (e.key === "ArrowLeft") swipe("pass");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swipe, view, match]);

  async function startOver() {
    await fetch("/api/reset", { method: "POST" });
    setFeed(null);
    setMatches([]);
    loadFeed();
  }

  return (
    <section className="discover">
      <header className="top">
        <h1>Discover</h1>
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={view === "swipe"} className={view === "swipe" ? "on" : ""} onClick={() => setView("swipe")}>
            Swipe
          </button>
          <button
            role="tab"
            aria-selected={view === "matches"}
            className={view === "matches" ? "on" : ""}
            onClick={() => {
              setView("matches");
              loadMatches();
            }}
          >
            Matches{matches.length > 0 && <span className="count">{matches.length}</span>}
          </button>
        </div>
      </header>

      {error && (
        <p className="toast" role="alert">
          {error}
        </p>
      )}

      {view === "swipe" && (
        <>
          <div className="deck">
            {feed === null && <p className="muted center">Finding people…</p>}

            {feed && feed.length === 0 && (
              <div className="empty">
                <h2>You've seen everyone for now</h2>
                <p>New people show up here as they join. Check your matches in the meantime.</p>
                <div className="empty-actions">
                  <button className="btn primary" onClick={() => { setView("matches"); loadMatches(); }}>
                    View matches
                  </button>
                  <button className="btn ghost" onClick={startOver}>
                    Reset demo data
                  </button>
                </div>
              </div>
            )}

            {next && (
              <div className="card behind" aria-hidden="true">
                <Photo profile={next} className="card-photo" />
              </div>
            )}
            {top && (
              <SwipeCard key={top.id} profile={top} onSwipe={swipe} exiting={exiting} disabled={busy} />
            )}
          </div>

          {top && (
            <div className="actions">
              <button className="round pass" onClick={() => swipe("pass")} disabled={busy} aria-label={`Pass on ${top.name}`}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
              <span className="muted small">{feed.length} left</span>
              <button className="round like" onClick={() => swipe("like")} disabled={busy} aria-label={`Like ${top.name}`}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.3 6c-2.3 4.4-9.3 9-9.3 9z" /></svg>
              </button>
            </div>
          )}
        </>
      )}

      {view === "matches" && (
        <div className="matches">
          {matches.length === 0 ? (
            <div className="empty">
              <h2>No matches yet</h2>
              <p>A match appears here only when you and someone else both like each other. Keep swiping.</p>
              <button className="btn primary" onClick={() => setView("swipe")}>Back to swiping</button>
            </div>
          ) : (
            <ul className="match-grid">
              {matches.map((m) => (
                <li key={m.id}>
                  <Photo profile={m} className="match-photo" />
                  <div className="match-meta">
                    <strong>{m.name}, {m.age}</strong>
                    <span>{m.place}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {match && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="It's a match">
          <div className="match-modal">
            <h2>It's a match!</h2>
            <p>You and {match.name} liked each other.</p>
            <Photo profile={match} className="modal-photo" />
            <div className="modal-actions">
              <button className="btn primary" onClick={() => { setMatch(null); setView("matches"); }}>
                See matches
              </button>
              <button className="btn ghost" onClick={() => setMatch(null)}>Keep swiping</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
