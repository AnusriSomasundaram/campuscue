
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore"; 

import { auth, db } from "./firebase";
import "./Login.css";

export default function Login({ onLogin, onGuest }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (mode === "signup" && !name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      let userCredential;

      if (mode === "signup") {
        console.log("SIGNUP BRANCH RUNNING");
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

        await updateProfile(userCredential.user, {
          displayName: name.trim(),
        });
console.log("Saving student profile...");
await setDoc(doc(db, "users", userCredential.user.uid), {
  uid: userCredential.user.uid,
  name: name.trim(),
  email: userCredential.user.email.toLowerCase(),
  createdAt: serverTimestamp(),
});
console.log("Student profile saved successfully!");

      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
      }

      const user = userCredential.user;

      onLogin({
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        uid: user.uid,
        mode,
      });
    } catch (error) {
      const messages = {
        "auth/email-already-in-use": "This email already has an account. Please log in.",
        "auth/invalid-credential": "Email or password is incorrect.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Please choose a stronger password.",
        "auth/network-request-failed": "Network error. Check your internet connection.",
      };

      alert(messages[error.code] || `Authentication failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <a className="login-brand" href="#welcome">
          <span className="login-brand-icon">C</span>
          CampusCue
        </a>

        <div className="login-message">
          <span className="login-eyebrow">YOUR SEMESTER, IN SYNC</span>
          <h1>Make room for what matters.</h1>
          <p>
            Your deadlines, study plans, and academic goals — all in one
            thoughtful workspace.
          </p>

          <div className="login-feature">
            <span>✓</span>
            <div>
              <strong>Stay ahead of deadlines</strong>
              <p>Know what needs your attention next.</p>
            </div>
          </div>

          <div className="login-feature">
            <span>✦</span>
            <div>
              <strong>Study with a plan</strong>
              <p>Turn overwhelming work into manageable steps.</p>
            </div>
          </div>
        </div>

        <p className="login-footer-note">
          Small steps add up. Keep moving forward.
        </p>
      </section>

      <section className="login-panel" id="welcome">
        <div className="login-form-wrap">
          <div className="login-mobile-brand">
            <span className="login-brand-icon">C</span>
            CampusCue
          </div>

          <span className="login-form-eyebrow">WELCOME TO YOUR WORKSPACE</span>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="login-subtitle">
            {mode === "login"
              ? "Pick up where your academic journey left off."
              : "Start organizing your semester today."}
          </p>

          <div className="login-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Log in
            </button>
            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {mode === "signup" && (
              <label>
                Your name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Log in to CampusCue"
                  : "Create account"}
              <span>→</span>
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button type="button" className="guest-button" onClick={onGuest}>
            Continue as a guest
            <span>→</span>
          </button>

          <p className="login-privacy-note">
            {mode === "login"
              ? "New here? Choose Sign up to create an account."
              : "Already have an account? Choose Log in."}
          </p>

          <p className="login-demo-note">
            Your account is secured by Firebase Authentication. Guest mode
            remains available for exploring the demo.
          </p>
        </div>
      </section>
    </main>
  );
}
