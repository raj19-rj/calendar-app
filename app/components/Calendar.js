"use client";
import { useState, useEffect, useRef } from "react";

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const INDIAN_HOLIDAYS = {
  "Jan 26": "Republic Day",
  "Mar 17": "Holi",
  "Apr 14": "Dr. Ambedkar Jayanti",
  "Apr 18": "Good Friday",
  "May 1": "Maharashtra Day",
  "Aug 15": "Independence Day",
  "Aug 16": "Janmashtami",
  "Oct 2": "Gandhi Jayanti",
  "Oct 20": "Dussehra",
  "Nov 5": "Diwali",
  "Dec 25": "Christmas",
};

const DEFAULT_IMAGES = [
  "https://picsum.photos/seed/january/1200/500",
  "https://picsum.photos/seed/february/1200/500",
  "https://picsum.photos/seed/march/1200/500",
  "https://picsum.photos/seed/april/1200/500",
  "https://picsum.photos/seed/may/1200/500",
  "https://picsum.photos/seed/june/1200/500",
  "https://picsum.photos/seed/july/1200/500",
  "https://picsum.photos/seed/august/1200/500",
  "https://picsum.photos/seed/september/1200/500",
  "https://picsum.photos/seed/october/1200/500",
  "https://picsum.photos/seed/november/1200/500",
  "https://picsum.photos/seed/december/1200/500",
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
function getHoliday(day, month) {
  const key = `${MONTHS[month].slice(0,3)} ${day}`;
  return INDIAN_HOLIDAYS[key] || null;
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
  const [customImages, setCustomImages] = useState({});
  const [animating, setAnimating] = useState(false);
  const [animDir, setAnimDir] = useState("left");
  const [showHolidayTooltip, setShowHolidayTooltip] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const n = localStorage.getItem("cal-notes");
    const i = localStorage.getItem("cal-images");
    const d = localStorage.getItem("cal-dark");
    if (n) setSavedNotes(JSON.parse(n));
    if (i) setCustomImages(JSON.parse(i));
    if (d) setDarkMode(JSON.parse(d));
  }, []);

  const bg = darkMode ? "#1a1a1a" : "#ffffff";
  const surface = darkMode ? "#2a2a2a" : "#fafaf9";
  const border = darkMode ? "#3a3a3a" : "#e7e5e4";
  const text = darkMode ? "#f5f5f4" : "#292524";
  const muted = darkMode ? "#a8a29e" : "#78716c";
  const subtle = darkMode ? "#57534e" : "#a8a29e";

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("cal-dark", JSON.stringify(next));
  };

  const changeMonth = (dir) => {
    if (animating) return;
    setAnimDir(dir);
    setAnimating(true);
    setTimeout(() => {
      if (dir === "left") {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
      } else {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
      }
      setAnimating(false);
    }, 250);
  };

  const goToday = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
      setAnimating(false);
    }, 250);
  };

  const handleDayClick = (day) => {
    const clicked = new Date(currentYear, currentMonth, day);
    if (!selecting || !startDate) {
      setStartDate(clicked);
      setEndDate(null);
      setSelecting(true);
      setNotes(savedNotes[clicked.toDateString()] || "");
    } else {
      const finalEnd = clicked < startDate ? startDate : clicked;
      const finalStart = clicked < startDate ? clicked : startDate;
      setStartDate(finalStart);
      setEndDate(finalEnd);
      setSelecting(false);
      const key = finalStart.toDateString() + "_" + finalEnd.toDateString();
      setNotes(savedNotes[key] || "");
    }
  };

  const saveNote = () => {
    if (!startDate || !notes.trim()) return;
    const key = startDate.toDateString() + (endDate ? "_" + endDate.toDateString() : "");
    const updated = { ...savedNotes, [key]: notes };
    setSavedNotes(updated);
    localStorage.setItem("cal-notes", JSON.stringify(updated));
  };

  const deleteNote = (key) => {
    const updated = { ...savedNotes };
    delete updated[key];
    setSavedNotes(updated);
    localStorage.setItem("cal-notes", JSON.stringify(updated));
    setNotes("");
  };

  const clearSelection = () => {
    setStartDate(null);
    setEndDate(null);
    setSelecting(false);
    setNotes("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const updated = { ...customImages, [currentMonth]: ev.target.result };
      setCustomImages(updated);
      localStorage.setItem("cal-images", JSON.stringify(updated));
      setShowUploader(false);
    };
    reader.readAsDataURL(file);
  };

  const resetImage = () => {
    const updated = { ...customImages };
    delete updated[currentMonth];
    setCustomImages(updated);
    localStorage.setItem("cal-images", JSON.stringify(updated));
    setShowUploader(false);
  };

  const currentImage = customImages[currentMonth] || DEFAULT_IMAGES[currentMonth];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const rangeLabel = () => {
    if (!startDate) return "No date selected";
    if (!endDate) return startDate.toDateString();
    return `${startDate.toDateString()} → ${endDate.toDateString()}`;
  };

  const getDayCount = () => {
    if (!startDate || !endDate) return null;
    const diff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    return `${diff} day${diff > 1 ? "s" : ""}`;
  };

  return (
    <div style={{
      width: "100%", maxWidth: 960, background: bg,
      borderRadius: 24, boxShadow: darkMode
        ? "0 25px 60px rgba(0,0,0,0.6)"
        : "0 25px 60px rgba(0,0,0,0.15)",
      overflow: "hidden", transition: "all 0.3s", fontFamily: "system-ui, sans-serif"
    }}>

      {/* Hero Image */}
      <div style={{ position: "relative", width: "100%", height: 260, overflow: "hidden" }}>
        <img
          src={currentImage}
          alt={MONTHS[currentMonth]}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            opacity: animating ? 0 : 1,
            transform: animating
              ? `translateX(${animDir === "left" ? "-30px" : "30px"})`
              : "translateX(0)",
            transition: "opacity 0.25s ease, transform 0.25s ease"
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.55))",
          display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "1rem 1.5rem"
        }}>
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={toggleDark} style={{
              background: "rgba(255,255,255,0.2)", border: "none",
              borderRadius: 20, padding: "6px 14px", color: "white",
              fontSize: 12, cursor: "pointer", backdropFilter: "blur(4px)"
            }}>
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button onClick={() => setShowUploader(!showUploader)} style={{
              background: "rgba(255,255,255,0.2)", border: "none",
              borderRadius: 20, padding: "6px 14px", color: "white",
              fontSize: 12, cursor: "pointer", backdropFilter: "blur(4px)"
            }}>
              🖼 Wallpaper
            </button>
          </div>

          {/* Wallpaper uploader */}
          {showUploader && (
            <div style={{
              background: "rgba(0,0,0,0.7)", borderRadius: 12,
              padding: "12px 16px", backdropFilter: "blur(8px)",
              display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap"
            }}>
              <span style={{ color: "white", fontSize: 12 }}>Custom wallpaper for {MONTHS[currentMonth]}:</span>
              <button onClick={() => fileInputRef.current.click()} style={{
                background: "white", color: "#292524", border: "none",
                borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer"
              }}>Upload Image</button>
              {customImages[currentMonth] && (
                <button onClick={resetImage} style={{
                  background: "rgba(255,100,100,0.8)", color: "white", border: "none",
                  borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer"
                }}>Reset Default</button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*"
                onChange={handleImageUpload} style={{ display: "none" }} />
            </div>
          )}

          {/* Month title */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={() => changeMonth("left")} style={{
              color: "white", background: "rgba(255,255,255,0.2)", border: "none",
              borderRadius: "50%", width: 40, height: 40, fontSize: 20,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)", transition: "background 0.2s"
            }}>‹</button>
            <div style={{ textAlign: "center" }}>
              <div style={{
                color: "white", fontSize: "2.8rem", fontWeight: 700,
                textShadow: "0 2px 12px rgba(0,0,0,0.5)", letterSpacing: 1,
                opacity: animating ? 0 : 1, transition: "opacity 0.25s"
              }}>
                {MONTHS[currentMonth]}
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "1rem" }}>{currentYear}</div>
            </div>
            <button onClick={() => changeMonth("right")} style={{
              color: "white", background: "rgba(255,255,255,0.2)", border: "none",
              borderRadius: "50%", width: 40, height: 40, fontSize: 20,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)", transition: "background 0.2s"
            }}>›</button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flexWrap: "wrap" }}>

        {/* Calendar Grid */}
        <div style={{ flex: 1, minWidth: 300, padding: "1.25rem 1.5rem" }}>

          {/* Today button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button onClick={goToday} style={{
              background: "transparent", border: `1px solid ${border}`,
              borderRadius: 8, padding: "4px 12px", fontSize: 12,
              color: muted, cursor: "pointer"
            }}>Today</button>
            {startDate && (
              <button onClick={clearSelection} style={{
                background: "transparent", border: `1px solid ${border}`,
                borderRadius: 8, padding: "4px 12px", fontSize: 12,
                color: muted, cursor: "pointer"
              }}>Clear</button>
            )}
            {getDayCount() && (
              <span style={{ fontSize: 12, color: muted, fontWeight: 500 }}>
                {getDayCount()} selected
              </span>
            )}
          </div>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
            {DAYS.map(d => (
              <div key={d} style={{
                textAlign: "center", fontSize: 11, fontWeight: 600,
                color: subtle, textTransform: "uppercase", padding: "4px 0"
              }}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0" }}>
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
              const holiday = getHoliday(day, currentMonth);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              let cellBg = "transparent";
              let cellColor = isWeekend ? (darkMode ? "#f87171" : "#dc2626") : text;
              let fontWeight = "normal";
              let borderStyle = "none";

              if (isStart || isEnd) {
                cellBg = darkMode ? "#e7e5e4" : "#292524";
                cellColor = darkMode ? "#292524" : "white";
                fontWeight = "700";
              } else if (inRange) {
                cellBg = darkMode ? "#3a3a3a" : "#e7e5e4";
              } else if (isToday) {
                borderStyle = `2px solid ${darkMode ? "#e7e5e4" : "#292524"}`;
                fontWeight = "600";
              }

              return (
                <div key={day} style={{ position: "relative", textAlign: "center" }}>
                  <div
                    onClick={() => handleDayClick(day)}
                    onMouseEnter={() => {
                      setHoveredDate(date);
                      if (holiday) setShowHolidayTooltip(`${day}-${currentMonth}`);
                    }}
                    onMouseLeave={() => {
                      setHoveredDate(null);
                      setShowHolidayTooltip(null);
                    }}
                    style={{
                      fontSize: 13, padding: "7px 4px", borderRadius: "50%",
                      cursor: "pointer", userSelect: "none", position: "relative",
                      background: cellBg, color: cellColor,
                      fontWeight, border: borderStyle,
                      transition: "all 0.15s", margin: "0 2px"
                    }}
                  >
                    {day}
                    {holiday && (
                      <span style={{
                        position: "absolute", bottom: 2, left: "50%",
                        transform: "translateX(-50%)",
                        width: 4, height: 4, borderRadius: "50%",
                        background: darkMode ? "#fbbf24" : "#f59e0b",
                        display: "block"
                      }} />
                    )}
                  </div>
                  {showHolidayTooltip === `${day}-${currentMonth}` && holiday && (
                    <div style={{
                      position: "absolute", bottom: "110%", left: "50%",
                      transform: "translateX(-50%)",
                      background: darkMode ? "#292524" : "#1c1917",
                      color: "white", fontSize: 10, padding: "4px 8px",
                      borderRadius: 6, whiteSpace: "nowrap", zIndex: 100,
                      pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                    }}>
                      {holiday}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Range label */}
          <div style={{ marginTop: 14, textAlign: "center", fontSize: 11, color: subtle, fontWeight: 500 }}>
            {selecting ? "Click another date to complete range" : rangeLabel()}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: subtle }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
              Holiday
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#dc2626" }}>
              <span>■</span> Weekend
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: subtle }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", border: `1.5px solid ${text}`, display: "inline-block" }} />
              Today
            </div>
          </div>
        </div>

        {/* Notes Panel */}
        <div style={{
          width: 250, minWidth: 250, background: surface,
          borderLeft: `1px solid ${border}`,
          padding: "1.25rem", display: "flex",
          flexDirection: "column", gap: 10
        }}>
          <div>
            <h2 style={{ fontSize: 11, fontWeight: 600, color: subtle, textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>
              Notes
            </h2>
            <p style={{ fontSize: 10, color: subtle, margin: "4px 0 0" }}>{rangeLabel()}</p>
          </div>

          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={startDate ? "Write your notes here..." : "Select a date first..."}
            disabled={!startDate}
            style={{
              width: "100%", minHeight: 120, background: bg,
              border: `1px solid ${border}`, borderRadius: 10,
              padding: 10, fontSize: 12, color: text,
              resize: "none", outline: "none",
              fontFamily: "inherit", boxSizing: "border-box",
              opacity: startDate ? 1 : 0.5
            }}
          />

          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={saveNote} disabled={!startDate || !notes.trim()} style={{
              flex: 1, background: startDate && notes.trim()
                ? (darkMode ? "#e7e5e4" : "#292524")
                : border,
              color: startDate && notes.trim()
                ? (darkMode ? "#292524" : "white")
                : subtle,
              border: "none", borderRadius: 10, padding: "9px 0",
              fontSize: 12, fontWeight: 500,
              cursor: startDate && notes.trim() ? "pointer" : "not-allowed",
              transition: "all 0.2s"
            }}>
              Save
            </button>
            <button onClick={clearSelection} style={{
              background: "transparent", border: `1px solid ${border}`,
              borderRadius: 10, padding: "9px 12px", fontSize: 12,
              color: muted, cursor: "pointer"
            }}>✕</button>
          </div>

          {/* Saved notes list */}
          {Object.keys(savedNotes).length > 0 && (
            <div style={{ marginTop: 4 }}>
              <p style={{ fontSize: 10, color: subtle, fontWeight: 600, textTransform: "uppercase", margin: "0 0 8px" }}>
                Saved ({Object.keys(savedNotes).length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                {Object.entries(savedNotes).map(([key, val]) => (
                  <div key={key} style={{
                    background: bg, border: `1px solid ${border}`,
                    borderRadius: 8, padding: "8px 10px",
                    position: "relative"
                  }}>
                    <p style={{ fontSize: 9, color: subtle, margin: 0 }}>
                      {key.replace("_", " → ")}
                    </p>
                    <p style={{ fontSize: 11, color: text, margin: "3px 0 0", wordBreak: "break-word" }}>
                      {val}
                    </p>
                    <button onClick={() => deleteNote(key)} style={{
                      position: "absolute", top: 6, right: 6,
                      background: "transparent", border: "none",
                      color: subtle, cursor: "pointer", fontSize: 10, padding: 2
                    }}>✕</button>
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