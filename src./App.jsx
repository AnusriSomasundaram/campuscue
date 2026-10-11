
import Login from "./Login";
import { useState } from "react";
import "./App.css";
import FocusTimer from "./FocusTimer";
import Friends from "./Friends";
import StudyGroups from "./StudyGroups";

const initialTasks = [
  {
    id: 1,
    title: "DBMS Assignment",
    subject: "Database Management Systems",
    category: "Assignment",
    dueDate: "2026-10-10",
    priority: "High",
    estimatedHours: 2,
    completed: false,
  },
  {
    id: 2,
    title: "Software Engineering Record",
    subject: "Software Engineering",
    category: "Assignment",
    dueDate: "2026-10-11",
    priority: "Medium",
    estimatedHours: 3,
    completed: false,
  },
  {
    id: 3,
    title: "AI Mini Project",
    subject: "Artificial Intelligence",
    category: "Project",
    dueDate: "2026-10-14",
    priority: "High",
    estimatedHours: 5,
    completed: false,
  },
];

function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("Overview");
  const [currentUser, setCurrentUser] = useState(null);

const handleLogin = (user) => {
  setCurrentUser(user);
};



const handleGuest = () => {
  setCurrentUser({
    name: "Guest Student",
    mode: "guest",
  });
};

  const today = new Date().toLocaleDateString("en-CA");
  const pending = tasks.filter((task) => !task.completed);
  const overdue = pending.filter((task) => task.dueDate < today);
  const completed = tasks.filter((task) => task.completed);

   const recommendedTasks = tasks
  .filter((task) => !task.completed)
  .slice()
  .sort((a, b) => {
    const priorityScore = { High: 3, Medium: 2, Low: 1 };

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const daysUntilDue = (task) => {
      const due = new Date(`${task.dueDate}T00:00:00`);
      return Math.ceil((due - todayDate) / (1000 * 60 * 60 * 24));
    };

    const score = (task) => {
      const days = daysUntilDue(task);
      const urgency = days < 0 ? 100 : 30 / (days + 1);
      const priority = priorityScore[task.priority] * 10;
      const effort = Math.min(Number(task.estimatedHours) || 1, 10);

      return urgency + priority + effort;
    };

    return score(b) - score(a);
  });

const nextTask = recommendedTasks[0];

const [calendarDate, setCalendarDate] = useState(() => new Date());

const calendarYear = calendarDate.getFullYear();
const calendarMonth = calendarDate.getMonth();

const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

const calendarDays = [
  ...Array(firstDayOfMonth).fill(null),
  ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
];

const changeCalendarMonth = (offset) => {
  setCalendarDate(
    new Date(calendarYear, calendarMonth + offset, 1)
  );
};

const getTasksForDay = (day) => {
  if (!day) return [];

  const dateKey = [
    calendarYear,
    String(calendarMonth + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");

  return tasks.filter((task) => task.dueDate === dateKey);
};

const getRecommendationReason = (task) => {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${task.dueDate}T00:00:00`);
  const daysLeft = Math.ceil(
    (dueDate - todayDate) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft < 0) {
    return `This task is overdue by ${Math.abs(daysLeft)} day(s), so it needs attention first.`;
  }

  if (daysLeft === 0) {
    return "This task is due today. Complete it first to avoid missing the deadline.";
  }

  if (daysLeft === 1) {
    return "This task is due tomorrow, so starting now can help you finish on time.";
  }

  if (task.priority === "High") {
    return `This task has high priority and is due in ${daysLeft} days.`;
  }

  return `This task is due in ${daysLeft} days and is your current recommended next step.`;
};

const todayForInsights = new Date();
todayForInsights.setHours(0, 0, 0, 0);

const nextWeek = new Date(todayForInsights);
nextWeek.setDate(nextWeek.getDate() + 7);

const pendingStudyHours = pending.reduce(
  (total, task) => total + (Number(task.estimatedHours) || 1),
  0
);

const upcomingDeadlines = pending.filter((task) => {
  const due = new Date(`${task.dueDate}T00:00:00`);
  return due >= todayForInsights && due <= nextWeek;
});

const workloadByDay = {};

upcomingDeadlines.forEach((task) => {
  workloadByDay[task.dueDate] =
    (workloadByDay[task.dueDate] || 0) +
    (Number(task.estimatedHours) || 1);
});

const busiestDayEntry = Object.entries(workloadByDay).sort(
  (a, b) => b[1] - a[1]
)[0];

const busiestDay = busiestDayEntry
  ? {
      date: busiestDayEntry[0],
      hours: busiestDayEntry[1],
    }
  : null;
  const visibleTasks = tasks.filter((task) => {
    if (filter === "Pending") return !task.completed;
    if (filter === "Completed") return task.completed;
    return true;
  });

  function addTask(event) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const newTask = {
      id: Date.now(),
      title: form.get("title"),
      subject: form.get("subject"),
      category: form.get("category"),
      dueDate: form.get("dueDate"),
      priority: form.get("priority"),
      
      estimatedHours: Number(form.get("estimatedHours")) || 1,
      completed: false,
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);
    setShowForm(false);
    event.currentTarget.reset();
  }

  function toggleTask(id) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function formatDate(date) {
    return new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  function getDeadlineLabel(date) {
    if (date < today) return "Overdue";
    if (date === today) return "Due today";

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = [
      tomorrow.getFullYear(),
      String(tomorrow.getMonth() + 1).padStart(2, "0"),
      String(tomorrow.getDate()).padStart(2, "0"),
    ].join("-");

    if (date === tomorrowString) return "Tomorrow";
    return formatDate(date);
  }
  if (!currentUser) {
    return <Login onLogin={handleLogin} onGuest={handleGuest} />;
  }

 

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-icon">C</span>
          <span>CampusCue</span>
        </a>

        <p className="nav-label">WORKSPACE</p>
        <a className="nav-link active" href="#dashboard">
          <span>▦</span> Overview
        </a>
        <a className="nav-link" href="#deadlines">
          <span>◷</span> My deadlines
        </a>

        <div className="sidebar-note">
          <span className="note-icon">✦</span>
          <h3>Small steps add up.</h3>
          <p>Stay organized, focus on what matters, and make this semester count.</p>
        </div>

        <div className="profile">
          <div className="avatar">S</div>
          <div>
            <strong>Student workspace</strong>
            <p>My academic planner</p>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <span className="breadcrumb">Workspace / Overview</span>
          <span className="today-chip">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </span>
        </header>

<nav className="dashboard-tabs">
  <button
    className={activeTab === "Overview" ? "dashboard-tab active-tab" : "dashboard-tab"}
    onClick={() => setActiveTab("Overview")}
  >
    ▦ Overview
  </button>

  <button
    className={activeTab === "Deadlines" ? "dashboard-tab active-tab" : "dashboard-tab"}
    onClick={() => setActiveTab("Deadlines")}
  >
    ◷ Deadlines
  </button>

  

  <button
    className={activeTab === "Focus Timer" ? "dashboard-tab active-tab" : "dashboard-tab"}
    onClick={() => setActiveTab("Focus Timer")}
  >
    ◴ Focus Timer
  </button>

<button
  className={
    activeTab === "Friends"
      ? "dashboard-tab active-tab"
      : "dashboard-tab"
  }
  onClick={() => setActiveTab("Friends")}
>
  ♡ Friends
</button>

<button
  className={
    activeTab === "Study Groups"
      ? "dashboard-tab active-tab"
      : "dashboard-tab"
  }
  onClick={() => setActiveTab("Study Groups")}
>
  👥 Study Groups
</button>
<button
    className={activeTab === "Calendar" ? "dashboard-tab active-tab" : "dashboard-tab"}
    onClick={() => setActiveTab("Calendar")}
  >
    ▦ Calendar
  </button>
</nav>
        {activeTab === "Overview" && (
        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR PERSONAL ACADEMIC PLANNER</p>
            <h1>Make room for what matters.</h1>
            <p className="welcome-text">
              Keep your deadlines in one place and take your semester one task at a time.
            </p>
          </div>
          <button className="primary-button" onClick={() => setShowForm(!showForm)}>
            <span>＋</span> Add a deadline
          </button>
        </section>
        )}
        {activeTab === "Focus Timer" && <FocusTimer />}

        {activeTab === "Friends" && <Friends />}   
        {activeTab === "Study Groups" && <StudyGroups />}
        {activeTab === "Overview" && (
        <section className="smart-plan">
  <div className="smart-plan-heading">
    <span className="smart-plan-icon">✦</span>
    <div>
      <p className="eyebrow">YOUR PERSONAL STUDY ASSISTANT</p>
      <h2>Your next best task</h2>
      <p>Focus on what matters most right now.</p>
    </div>
  </div>

  {nextTask ? (
    <div className="recommended-task">
      <div>
        <span className="recommendation-label">RECOMMENDED NEXT</span>
        <h3>{nextTask.title}</h3>
        <p>{nextTask.subject}</p>
        <p className="recommendation-reason">
         Why this task? {getRecommendationReason(nextTask)}
        </p>
        <div className="recommendation-details">
          <span>{nextTask.priority} priority</span>
          <span>{nextTask.estimatedHours || 1} hours estimated</span>
          <span>Due {formatDate(nextTask.dueDate)}</span>
        </div>
      </div>

      <button
        className="primary-button"
        onClick={() => toggleTask(nextTask.id)}
      >
        Mark complete
      </button>
    </div>
  ) : (
    <div className="recommended-task">
      <div>
        <h3>You're all caught up! 🎉</h3>
        <p>Add a new deadline to build your next study plan.</p>
      </div>
    </div>
  )}
        </section>
        )}
        {activeTab === "Overview" && (
        <section className="insights-grid">
  <div className="insight-card">
    <span className="insight-icon">◷</span>
    <p>Pending study time</p>
    <h3>{pendingStudyHours} hours</h3>
    <span>Estimated effort across unfinished tasks</span>
  </div>

  <div className="insight-card">
    <span className="insight-icon">▦</span>
    <p>Next 7 days</p>
    <h3>{upcomingDeadlines.length} deadlines</h3>
    <span>Upcoming tasks to plan for</span>
  </div>

  <div className="insight-card">
    <span className="insight-icon">⚡</span>
    <p>Busiest day</p>
    <h3>
      {busiestDay
        ? new Date(`${busiestDay.date}T00:00:00`).toLocaleDateString(
            "en-IN",
            { day: "numeric", month: "short" }
          )
        : "No deadlines"}
    </h3>
    <span>
      {busiestDay
        ? `${busiestDay.hours} estimated study hours`
        : "Your week looks clear"}
    </span>
  </div>
  <div className="insight-card progress-card">
  <span className="insight-icon">✓</span>
  <p>Task completion</p>
  <h3>
    {tasks.length === 0
      ? 0
      : Math.round(
          (tasks.filter((task) => task.completed).length / tasks.length) *
            100
        )}
    %
  </h3>
  <div className="progress-track">
    <div
      className="progress-fill"
      style={{
        width: `${
          tasks.length === 0
            ? 0
            : (tasks.filter((task) => task.completed).length / tasks.length) *
              100
        }%`,
      }}
    />
  </div>
  <span>
    {tasks.filter((task) => task.completed).length} of {tasks.length} tasks
    completed
  </span>
</div>
        </section>
        )}
        {activeTab === "Overview" && (
        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-top">
              <span>Pending tasks</span>
              <span className="stat-icon purple">◷</span>
            </div>
            <strong>{pending.length}</strong>
            <p>Still on your list</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Due today</span>
              <span className="stat-icon orange">◴</span>
            </div>
            <strong>{pending.filter((task) => task.dueDate === today).length}</strong>
            <p>Keep these in sight</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Overdue</span>
              <span className="stat-icon red">!</span>
            </div>
            <strong>{overdue.length}</strong>
            <p>Need your attention</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Completed</span>
              <span className="stat-icon green">✓</span>
            </div>
            <strong>{completed.length}</strong>
            <p>Tasks you've finished</p>
          </article>
        </section>
        )}
       
{(activeTab === "Overview" || activeTab === "Deadlines") && showForm && (
          <section className="form-card">
            <div className="section-heading">
              <div>
                <h2>Add a deadline</h2>
                <p>Capture it now, so you don't forget it later.</p>
              </div>
              <button
                className="close-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={addTask} className="task-form">
              <label>
                Task name
                <input name="title" placeholder="e.g. DBMS Assignment" required />
              </label>

              <label>
                Subject
                <input name="subject" placeholder="e.g. Database Systems" required />
              </label>

              <label>
                Type
                <select name="category" defaultValue="Assignment">
                  <option>Assignment</option>
                  <option>Exam</option>
                  <option>Project</option>
                  <option>Event</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Due date
                <input
                  type="date"
                  name="dueDate"
                  min="2020-01-01"
                  required
                />
              </label>

              
              <label>
  Priority
  <select name="priority" defaultValue="Medium">
    <option>Low</option>
    <option>Medium</option>
    <option>High</option>
  </select>
              </label>

              <label>
  Estimated effort (hours)
  <input
    type="number"
    name="estimatedHours"
    min="1"
    max="100"
    step="0.5"
    defaultValue="2"
    required
  />
              </label>

<button className="primary-button form-submit" type="submit">
  Save deadline
</button>
            </form>
          </section>
          )}
        

        {activeTab === "Deadlines" && (
        <section className="deadline-section" id="deadlines">
          <div className="section-heading">
            <div>
              <p className="eyebrow">STAY ONE STEP AHEAD</p>
              <h2>Your deadlines</h2>
              <p className="section-description">
                Every task in one place. Progress starts with knowing what's next.
              </p>
            </div>
            <select
              className="filter-select"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter deadlines"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="task-list">
            {visibleTasks.length === 0 ? (
              <div className="empty-state">
                <span>✦</span>
                <h3>Nothing on this list</h3>
                <p>Add a deadline or choose another filter.</p>
              </div>
            ) : (
              visibleTasks
                .slice()
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .map((task) => (
                  <article className={`task-row ${task.completed ? "is-completed" : ""}`} key={task.id}>
                    <button
                      className={`task-check ${task.completed ? "checked" : ""}`}
                      onClick={() => toggleTask(task.id)}
                      aria-label={task.completed ? "Mark as pending" : "Mark as completed"}
                    >
                      {task.completed ? "✓" : ""}
                    </button>

                    <div className="task-info">
                      <h3>{task.title}</h3>
                      <p>{task.subject}</p>
                    </div>

                    <span className="category-chip">{task.category}</span>
                    <span className={`priority-chip ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <span className={`deadline-date ${!task.completed && task.dueDate < today ? "late" : ""}`}>
                      <strong>{formatDate(task.dueDate)}</strong>
                      <small>{task.completed ? "Completed" : getDeadlineLabel(task.dueDate)}</small>
                    </span>
                  </article>
                ))
            )}
          </div>
        
        </section>
        )}

        {activeTab === "Calendar" && (
        <section className="calendar-section">
          <div className="calendar-heading">
            <div>
              <h2>Deadline Calendar</h2>
              <p>See what's due each day.</p>
            </div>

            <div className="calendar-controls">
              <button onClick={() => changeCalendarMonth(-1)}>
                ←
              </button>
              <strong>
                {calendarDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </strong>
              <button onClick={() => changeCalendarMonth(1)}>
                →
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div className="calendar-weekday" key={day}>
                  {day}
                </div>
              )
            )}

            {calendarDays.map((day, index) => {
              const dayTasks = getTasksForDay(day);
     

              return (
                <div
                  className={`calendar-day ${day ? "" : "empty-day"}`}
                  key={`${calendarYear}-${calendarMonth}-${index}`}
                >
                  {day && (
                    <>
                      <span className="calendar-day-number">{day}</span>

                      {dayTasks.map((task) => (
                        <div
                          className={`calendar-task ${
                            task.priority === "High" ? "high-priority" : ""
                          }`}
                          key={task.id}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        )}

        <footer className="footer">
          <span>CampusCue</span>
          <span>A little more organized, every day.</span>
        </footer>
      </main>
    </div>
  );
}

export default App;