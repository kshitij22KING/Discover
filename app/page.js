"use client";
import { useState } from "react";
import Discover from "@/components/Discover";

export default function Page() {
  const [tab, setTab] = useState("discover");

  return (
    <div className="shell">
      <main className="screen">
        {/* Home stays intentionally blank: it stands in for Coy's existing experience */}
        {tab === "home" && <div className="home-blank" aria-label="Home (placeholder)" />}
        {/* Discover stays mounted so swipe state survives a tab switch */}
        <div hidden={tab !== "discover"} className="screen-fill">
          <Discover />
        </div>
      </main>

      <nav className="tabbar" aria-label="Main">
        <button className={tab === "home" ? "on" : ""} onClick={() => setTab("home")} aria-current={tab === "home"}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>
          Home
        </button>
        <button className={tab === "discover" ? "on" : ""} onClick={() => setTab("discover")} aria-current={tab === "discover"}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.3 6c-2.3 4.4-9.3 9-9.3 9z" /></svg>
          Discover
        </button>
      </nav>
    </div>
  );
}
