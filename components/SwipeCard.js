"use client";
import { useRef, useState } from "react";
import Photo from "./Photo";

const THRESHOLD = 110; // px of horizontal drag that commits a swipe

export default function SwipeCard({ profile, onSwipe, exiting, disabled }) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef(null);

  // While flying off, override the drag position with a fixed off-screen target.
  const x = exiting === "like" ? 520 : exiting === "pass" ? -520 : dx;
  const rot = x / 16;
  const likeOpacity = Math.min(Math.max(x / THRESHOLD, 0), 1);
  const passOpacity = Math.min(Math.max(-x / THRESHOLD, 0), 1);

  function down(e) {
    if (disabled) return;
    start.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e) {
    if (start.current == null) return;
    setDx(e.clientX - start.current);
  }
  function up() {
    if (start.current == null) return;
    start.current = null;
    setDragging(false);
    if (dx > THRESHOLD) onSwipe("like");
    else if (dx < -THRESHOLD) onSwipe("pass");
    else setDx(0); // snap back
  }

  return (
    <article
      className={`card ${dragging ? "dragging" : ""}`}
      style={{ transform: `translateX(${x}px) rotate(${rot}deg)`, opacity: exiting ? 0.0 : 1 }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <Photo profile={profile} className="card-photo" />
      <div className="stamp like" style={{ opacity: exiting === "like" ? 1 : likeOpacity }}>Like</div>
      <div className="stamp pass" style={{ opacity: exiting === "pass" ? 1 : passOpacity }}>Pass</div>
      <div className="card-info">
        <h2>
          {profile.name} <span className="age">{profile.age}</span>
        </h2>
        <p className="place">{profile.place}</p>
        <p className="bio">{profile.bio}</p>
        <ul className="tags">
          {profile.interests.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
