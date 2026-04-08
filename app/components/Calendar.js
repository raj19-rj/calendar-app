"use client";
import { useState, useEffect } from "react";

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const MONTH_IMAGES = [
  "https://picsum.photos/seed/january/800/400",
  "https://picsum.photos/seed/february/800/400",
  "https://picsum.photos/seed/march/800/400",
  "https://picsum.photos/seed/april/800/400",
  "https://picsum.photos/seed/may/800/400",
  "https://picsum.photos/seed/june/800/400",
  "https://picsum.photos/seed/july/800/400",
  "https://picsum.photos/seed/august/800/400",
  "https://picsum.photos/seed/september/800/400",
  "https://picsum.photos/seed/october/800/400",
  "https://picsum.photos/seed/november/800/400",
  "https://picsum.photos/seed/december/800/400",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function isBetween(date, start, end) {
  if (!date || !start || !end) return false;
  const d = date.getTime();
  const s = Math.min(start.getTime(), end.getTime());
  const e = Math.max(start.getTime(), end.getTime());
  return d > s && d < e;
}

export default function Calendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState({});
  const [hoveredDate, setHoveredDate] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("calendar-notes");
    if (stored) setSavedNotes(JSON.parse(stored));
  }, []);

  const saveNote = () => {
    if (!startDate) return;
    const key = startDate.toDateString() + (endDate ? "_" + endDate.toDateString() : "");
    const updated = { ...savedNotes, [key]: notes };
    setSavedNotes(updated);
    localStorage.setItem("calendar-notes", JSON.stringify(updated));
    alert("Note saved!");
  };

  const handleDayClick = (day) => {
    const clicked = new Date(currentYear, currentMonth, day);
    if (!selecting || !startDate) {
      setStartDate(clicked);
      setEndDate(null);
      setSelecting(true);
      const key = clicked.toDateString();
      setNotes(savedNotes[key] || "");
    } else {
      setEndDate(clicked);
      setSelecting(false);
      const key = startDate.toDateString() + "_" + clicked.toDateString();
      setNotes(savedNotes[key] || "");
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayStyle = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    const isStart = isSameDay(date, startDate);
    const isEnd = isSameDay(date, endDate);
    const hoverEnd = selecting && hoveredDate;
    const inRange = endDate
      ? isBetween(date, startDate, endDate)
      : hoverEnd && isBetween(date, startDate, hoveredDate);
    const isToday = isSameDay(date, today);

    if (isStart || isEnd)
      return "bg-stone-800 text-white rounded-full font-bold";
    if (inRange)
      return "bg-stone-300 text-stone-800 rounded-full";
    if (isToday)
      return "border-2 border-stone-500 text-stone-700 rounded-full font-semibold";
    return "text-stone-700 hover:bg-stone-200 rounded-full";
  };

  const rangeLabel = () => {
    if (!startDate) return "No date selected";
    if (!endDate) return startDate.toDateString();
    return `${startDate.toDateString()} → ${endDate.toDateString()}`;
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">

      {/* Hero Image */}
      <div className="relative w-full h-64">
        <img
          src={MONTH_IMAGES[currentMonth]}
          alt={MONTHS[currentMonth]}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))",
          display: "flex", alignItems: "flex-end", padding: "1.5rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <button onClick={prevMonth} style={{
              color: "white", background: "rgba(255,255,255,0.2)",
              border: "none", borderRadius: "50%", width: 36, height: 36,
              fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}>‹</button>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ color: "white", fontSize: "2.5rem", fontWeight: "bold", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                {MONTHS[currentMonth]}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.1rem", margin: 0 }}>{currentYear}</p>
            </div>
            <button onClick={nextMonth} style={{
              color: "white", background: "rgba(255,255,255,0.2)",
              border: "none", borderRadius: "50%", width: 36, height: 36,
              fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}>›</button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flexWrap: "wrap" }}>

        {/* Calendar Grid */}
        <div style={{ flex: 1, minWidth: 300, padding: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#a8a29e", textTransform: "uppercase", padding: "4px 0" }}>
                {d}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px 0" }}>
            {blanks.map((_, i) => <div key={"b" + i} />)}
            {days.map(day => {
              const date = new Date(currentYear, currentMonth, day);
              const isStart = isSameDay(date, startDate);
              const isEnd = isSameDay(date, endDate);
              const hoverEnd = selecting && hoveredDate;
              const inRange = endDate
                ? isBetween(date, startDate, endDate)
                : hoverEnd && isBetween(date, startDate, hoveredDate);
              const isToday = isSameDay(date, today);

              let bg = "transparent";
              let color = "#44403c";
              let fontWeight = "normal";
              let border = "none";

              if (isStart || isEnd) { bg = "#292524"; color = "white"; fontWeight = "bold"; }
              else if (inRange) { bg = "#d6d3d1"; color = "#44403c"; }
              else if (isToday) { border = "2px solid #78716c"; color = "#44403c"; fontWeight = "600"; }

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() => setHoveredDate(new Date(currentYear, currentMonth, day))}
                  onMouseLeave={() => setHoveredDate(null)}
                  style={{
                    textAlign: "center", fontSize: 14, padding: "8px 4px",
                    borderRadius: "50%", cursor: "pointer", userSelect: "none",
                    background: bg, color, fontWeight, border,
                    transition: "all 0.15s"
                  }}
                  onMouseOver={e => { if (!isStart && !isEnd && !inRange) e.currentTarget.style.background = "#e7e5e4"; }}
                  onMouseOut={e => { if (!isStart && !isEnd && !inRange) e.currentTarget.style.background = bg; }}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "#a8a29e", fontWeight: 500 }}>
            {selecting ? "Click another date to complete range" : rangeLabel()}
          </div>
        </div>

        {/* Notes Section */}
        <div style={{
          width: 260, minWidth: 260, background: "#fafaf9",
          borderLeft: "1px solid #e7e5e4", padding: "1.5rem",
          display: "flex", flexDirection: "column", gap: 12
        }}>
          <div>
            <h2 style={{ fontSize: 12, fontWeight: 600, color: "#78716c", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>
              Notes
            </h2>
            <p style={{ fontSize: 11, color: "#a8a29e", margin: "4px 0 0" }}>{rangeLabel()}</p>
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Write your notes here..."
            style={{
              flex: 1, width: "100%", minHeight: 160, background: "white",
              border: "1px solid #e7e5e4", borderRadius: 12, padding: 12,
              fontSize: 13, color: "#44403c", resize: "none",
              outline: "none", fontFamily: "inherit", boxSizing: "border-box"
            }}
          />
          <button
            onClick={saveNote}
            disabled={!startDate}
            style={{
              width: "100%", background: startDate ? "#292524" : "#d6d3d1",
              color: "white", border: "none", borderRadius: 12,
              padding: "10px 0", fontSize: 13, fontWeight: 500,
              cursor: startDate ? "pointer" : "not-allowed", transition: "background 0.2s"
            }}
          >
            Save Note
          </button>
          {Object.keys(savedNotes).length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: "#a8a29e", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Saved</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 140, overflowY: "auto" }}>
                {Object.entries(savedNotes).map(([key, val]) => (
                  <div key={key} style={{ background: "white", border: "1px solid #e7e5e4", borderRadius: 8, padding: 8 }}>
                    <p style={{ fontSize: 10, color: "#a8a29e", margin: 0 }}>{key.replace("_", " → ")}</p>
                    <p style={{ fontSize: 11, color: "#78716c", margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}