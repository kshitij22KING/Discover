"use client";
import { useState } from "react";

// Deterministic gradient per profile, shown behind the photo and as the fallback
// when the placeholder image can't load (offline, blocked, etc.).
function gradientFor(id) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `linear-gradient(160deg, hsl(${h} 70% 62%), hsl(${(h + 60) % 360} 65% 38%))`;
}

export default function Photo({ profile, className = "" }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`photo ${className}`} style={{ background: gradientFor(profile.id) }}>
      {failed ? (
        <span className="photo-initial">{profile.name[0]}</span>
      ) : (
        <img src={profile.photo} alt="" draggable={false} onError={() => setFailed(true)} />
      )}
    </div>
  );
}
