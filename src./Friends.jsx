
import { useState } from "react";
import "./Friends.css";

const initialFriends = [
  {
    id: 1,
    name: "Priya Sharma",
    course: "CSE · 2nd Year",
    interests: ["DSA", "Web Development"],
    initials: "PS",
  },
  {
    id: 2,
    name: "Arjun Kumar",
    course: "AIML · 2nd Year",
    interests: ["Machine Learning", "Python"],
    initials: "AK",
  },
  {
    id: 3,
    name: "Meera Ravi",
    course: "IT · 2nd Year",
    interests: ["DBMS", "Competitive Coding"],
    initials: "MR",
  },
];

export default function Friends() {
  const [addedFriends, setAddedFriends] = useState([]);

  function toggleFriend(id) {
    setAddedFriends((current) =>
      current.includes(id)
        ? current.filter((friendId) => friendId !== id)
        : [...current, id]
    );
  }

  return (
    <section className="friends-page">
      <div className="friends-heading">
        <p className="eyebrow">STUDY BETTER TOGETHER</p>
        <h1>Find your study circle.</h1>
        <p>Connect with students who share your academic interests.</p>
      </div>

      <div className="friends-summary">
        <div>
          <span className="friends-summary-number">
            {addedFriends.length}
          </span>
          <span>Friends added</span>
        </div>
        <p>Small steps, shared goals, better study habits.</p>
      </div>

      <div className="friends-grid">
        {initialFriends.map((friend) => {
          const isAdded = addedFriends.includes(friend.id);

          return (
            <article className="friend-card" key={friend.id}>
              <div className="friend-avatar">{friend.initials}</div>
              <h2>{friend.name}</h2>
              <p className="friend-course">{friend.course}</p>

              <div className="friend-interests">
                {friend.interests.map((interest) => (
                  <span key={interest}>{interest}</span>
                ))}
              </div>

              <button
                className={
                  isAdded
                    ? "friend-button friend-added"
                    : "friend-button"
                }
                onClick={() => toggleFriend(friend.id)}
              >
                {isAdded ? "✓ Added" : "+ Add Friend"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}