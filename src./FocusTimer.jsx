
import { useEffect, useState } from "react";

function FocusTimer() {
  
const [minutes, setMinutes] = useState(25);
const [seconds, setSeconds] = useState(0);
const [isRunning, setIsRunning] = useState(false);
const [customMinutes, setCustomMinutes] = useState(25);


const [completedSessions, setCompletedSessions] = useState(() => {
  return Number(localStorage.getItem("campuscue-sessions") || 0);
});

const [totalStudyMinutes, setTotalStudyMinutes] = useState(() => {
  return Number(localStorage.getItem("campuscue-study-minutes") || 0);
});

const [studyDates, setStudyDates] = useState(() => {
  return JSON.parse(localStorage.getItem("campuscue-study-dates") || "[]");
});
const [dailyStudyMinutes, setDailyStudyMinutes] = useState(() => {
  return JSON.parse(
    localStorage.getItem("campuscue-daily-study-minutes") || "{}"
  );
});

useEffect(() => {
  localStorage.setItem("campuscue-sessions", completedSessions);
  localStorage.setItem("campuscue-study-minutes", totalStudyMinutes);
  localStorage.setItem("campuscue-study-dates", JSON.stringify(studyDates));
  localStorage.setItem(
    "campuscue-daily-study-minutes",
    JSON.stringify(dailyStudyMinutes)
  );
}, [completedSessions, totalStudyMinutes, studyDates, dailyStudyMinutes]);
const getWeeklyStudyData = () => {
  const today = new Date();
  const weekData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const dateKey = date.toLocaleDateString("en-CA");

    weekData.push({
      day: date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      minutes: dailyStudyMinutes[dateKey] || 0,
    });
  }

  return weekData;
};

const calculateStreak = () => {
  const dates = new Set(studyDates);
  let streak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = today.toLocaleDateString("en-CA");
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toLocaleDateString("en-CA");

  let currentDate = dates.has(todayKey) ? today : yesterday;

  while (dates.has(currentDate.toLocaleDateString("en-CA"))) {
    streak++;
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds((prev) => prev - 1);
      } else if (minutes > 0) {
        setMinutes((prev) => prev - 1);
        setSeconds(59);

      
    } else {
  setIsRunning(false);
  setCompletedSessions((prev) => prev + 1);
  setTotalStudyMinutes((prev) => prev + customMinutes);
  setStudyDates((prev) => {
  const today = new Date().toLocaleDateString("en-CA");

  if (prev.includes(today)) {
    return prev;
  }

  return [...prev, today];
});
  alert("Focus session completed! Great work!");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, minutes, seconds]);

  const resetTimer = () => {
    
  setIsRunning(false);
  setMinutes(customMinutes);
  setSeconds(0);
};
  

  const formatTime = (value) => String(value).padStart(2, "0");

  return (
    <div className="focus-timer">
      <h2>Focus Timer</h2>

<div className="duration-setting">
  <label htmlFor="focus-duration">Focus duration (minutes)</label>

  <input
    id="focus-duration"
    type="number"
    min="1"
    max="180"
    value={customMinutes}
    disabled={isRunning}
    onChange={(e) => {
      const value = Number(e.target.value);

      if (value >= 1 && value <= 180) {
        setCustomMinutes(value);
        setMinutes(value);
        setSeconds(0);
      }
    }}
  />
</div>

      <div className="timer-display">
        {formatTime(minutes)}:{formatTime(seconds)}
      </div>

      <p>Focus on one task at a time.</p>

<div className="study-stats">
  <div className="stat-item">
    <span className="stat-number">{completedSessions}</span>
    <span className="stat-label">Sessions Completed</span>
  </div>

  <div className="stat-item">
    <span className="stat-number">{totalStudyMinutes}</span>
    <span className="stat-label">Minutes Studied</span>
  </div>

<div className="stat-item">
  <span className="stat-number">
    🔥 {calculateStreak()}
  </span>
  <span className="stat-label">Day Study Streak</span>
</div>
<div className="weekly-study">
  <h3>📊 Weekly Study Activity</h3>

  <div className="weekly-chart">
    {getWeeklyStudyData().map((item) => (
      <div className="chart-column" key={item.day}>
        <span className="chart-minutes">{item.minutes}m</span>

        <div className="chart-bar-container">
          <div
            className="chart-bar"
            style={{
              height: `${Math.max(
                (item.minutes /
                  Math.max(
                    ...getWeeklyStudyData().map((day) => day.minutes),
                    60
                  )) *
                  100,
                item.minutes > 0 ? 8 : 0
              )}%`,
            }}
          />
        </div>

        <span className="chart-day">{item.day}</span>
      </div>
    ))}
  </div>
</div>
</div>

      <div className="timer-buttons">
        <button onClick={() => setIsRunning((prev) => !prev)}>
          {isRunning ? "Pause" : "Start Focus"}
        </button>

        <button onClick={resetTimer}>
          Reset
        </button>
      </div>

    </div>
  );
}

export default FocusTimer;