
import { useState, useEffect } from "react";
import "./StudyGroups.css";

import { db, auth } from "./firebase";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

function StudyGroups() {
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "DSA Practice Circle",
      subject: "Data Structures",
      description:
        "Practice coding problems and discuss algorithms together.",
      members: 8,
      joined: false,
    },
    {
      id: 2,
      name: "DBMS Exam Prep",
      subject: "Database Management",
      description:
        "Revise SQL, normalization, and important exam questions.",
      members: 12,
      joined: false,
    },
    {
      id: 3,
      name: "Web Dev Builders",
      subject: "Web Development",
      description:
        "Learn React and build small projects with fellow students.",
      members: 6,
      joined: false,
    },
  ]);

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [messageInput, setMessageInput] = useState("");

  // Listen for messages in the currently open chat
  useEffect(() => {
    if (!activeChat) return;

    const messagesRef = collection(
      db,
      "groups",
      String(activeChat.id),
      "messages"
    );

    const messagesQuery = query(
      messagesRef,
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const groupMessages = snapshot.docs.map((messageDoc) => ({
          id: messageDoc.id,
          ...messageDoc.data(),
        }));

        setMessages((currentMessages) => ({
          ...currentMessages,
          [activeChat.id]: groupMessages,
        }));
      },
      (error) => {
        console.error("Error loading chat messages:", error);
      }
    );

    return () => unsubscribe();
  }, [activeChat]);

  // Load saved membership for the signed-in user
  useEffect(() => {
    const user = auth.currentUser;

    if (!user) return;

    const unsubscribers = groups.map((group) => {
      const membershipRef = doc(
        db,
        "groups",
        String(group.id),
        "members",
        user.uid
      );

      return onSnapshot(
        membershipRef,
        (snapshot) => {
          setGroups((currentGroups) =>
            currentGroups.map((item) =>
              item.id === group.id
                ? { ...item, joined: snapshot.exists() }
                : item
            )
          );
        },
        (error) => {
          console.error("Error loading group membership:", error);
        }
      );
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // Listen for live member counts in every study group
  useEffect(() => {
    const unsubscribers = groups.map((group) => {
      const membersRef = collection(
        db,
        "groups",
        String(group.id),
        "members"
      );

      return onSnapshot(
        membersRef,
        (snapshot) => {
          setGroups((currentGroups) =>
            currentGroups.map((item) =>
              item.id === group.id
                ? { ...item, members: snapshot.size }
                : item
            )
          );
        },
        (error) => {
          console.error(
            `Error loading member count for ${group.name}:`,
            error
          );
        }
      );
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // Join or leave a study group
  async function toggleJoin(id) {
    const user = auth.currentUser;

    if (!user) {
      alert("Please sign in before joining a study group.");
      return;
    }

    const membershipRef = doc(
      db,
      "groups",
      String(id),
      "members",
      user.uid
    );

    const group = groups.find((item) => item.id === id);

    if (!group) {
      alert("Study group not found.");
      return;
    }

    try {
      if (group.joined) {
        await deleteDoc(membershipRef);
        alert("You have left the study group.");
      } else {
        await setDoc(membershipRef, {
          uid: user.uid,
          joinedAt: serverTimestamp(),
        });

        alert("Membership saved successfully!");
      }
    } catch (error) {
      console.error("Membership error:", error);
      alert(
        `Could not update membership: ${
          error.code || error.message
        }`
      );
    }
  }

  // Send a chat message
  async function sendMessage() {
    const text = messageInput.trim();
    const user = auth.currentUser;

    if (!text || !activeChat) return;

    if (!user) {
      alert("Please sign in to send study-group messages.");
      return;
    }

    try {
      await addDoc(
        collection(
          db,
          "groups",
          String(activeChat.id),
          "messages"
        ),
        {
          text,
          sender: user.displayName || user.email || "Student",
          uid: user.uid,
          createdAt: serverTimestamp(),
        }
      );

      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Message could not be sent. Please try again.");
    }
  }

  return (
    <div className="study-groups-page">
      <h2>Study Groups</h2>

      <p>
        Learn together, share ideas, and prepare for exams as a team.
      </p>

      <div className="study-groups-list">
        {groups.map((group) => (
          <div className="study-group-card" key={group.id}>
            <h3>{group.name}</h3>

            <p className="group-subject">{group.subject}</p>

            <p>{group.description}</p>

            <p>👥 {group.members} members</p>

            <div className="group-card-actions">
              <button
                type="button"
                onClick={() => toggleJoin(group.id)}
              >
                {group.joined ? "Leave Group" : "Join Group"}
              </button>

              <button
                type="button"
                className="open-chat-button"
                onClick={() => {
                  setActiveChat(group);
                  setMessageInput("");
                }}
              >
                💬 Open Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeChat && (
        <div className="group-chat">
          <div className="group-chat-header">
            <div>
              <h3>{activeChat.name}</h3>
              <p>Study group chat</p>
            </div>

            <button
              type="button"
              className="chat-close-button"
              onClick={() => {
                setActiveChat(null);
                setMessageInput("");
              }}
            >
              Close
            </button>
          </div>

          <div className="chat-messages">
            {(messages[activeChat.id] || []).length === 0 ? (
              <p className="chat-empty">
                No messages yet. Start the conversation!
              </p>
            ) : (
              (messages[activeChat.id] || []).map((message) => (
                <div
                  className={`chat-message ${
                    message.uid === auth.currentUser?.uid
                      ? "sent-message"
                      : "received-message"
                  }`}
                  key={message.id}
                >
                  <strong>{message.sender}</strong>

                  <p>{message.text}</p>

                  <span>
                    {message.createdAt?.toDate
                      ? message.createdAt
                          .toDate()
                          .toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                      : message.time || ""}
                  </span>
                </div>
              ))
            )}
          </div>

          <form
            className="chat-input-area"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(event) =>
                setMessageInput(event.target.value)
              }
            />

            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default StudyGroups;
