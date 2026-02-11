import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyANQZdCQdcGY9272s1wlzfAM3zeP11z_t4",
  authDomain: "writing-lab-c8466.firebaseapp.com",
  projectId: "writing-lab-c8466",
  storageBucket: "writing-lab-c8466.firebasestorage.app",
  messagingSenderId: "131962227456",
  appId: "1:131962227456:web:078dcfbd6c630cafbac1e5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const TEACHER_UID = "9MUEhiL15fb72FUbbTNBiSrldL73";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<"student" | "teacher">("student");

  const [studentName, setStudentName] = useState("");
  const [response, setResponse] = useState("");

  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");

  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    signInAnonymously(auth);

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "submissions");

    const unsub = onSnapshot(
      ref,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSubmissions(list);
      },
      () => {}
    );

    return () => unsub();
  }, [user]);

  const saveWork = async () => {
    if (!user || !studentName) return;

    await setDoc(doc(db, "submissions", user.uid), {
      studentName,
      response,
      updated: new Date().toISOString()
    });
  };

  const teacherLogin = async () => {
    await signInWithEmailAndPassword(auth, teacherEmail, teacherPassword);
  };

  const logout = async () => {
    await signOut(auth);
    await signInAnonymously(auth);
    setMode("student");
  };

  if (!user) return <div>Connecting...</div>;

  if (mode === "teacher" && user.uid !== TEACHER_UID) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Teacher Login</h2>
        <input
          placeholder="Email"
          value={teacherEmail}
          onChange={(e) => setTeacherEmail(e.target.value)}
        />
        <br /><br />
        <input
          placeholder="Password"
          type="password"
          value={teacherPassword}
          onChange={(e) => setTeacherPassword(e.target.value)}
        />
        <br /><br />
        <button onClick={teacherLogin}>Log In</button>
        <br /><br />
        <button onClick={() => setMode("student")}>Back</button>
      </div>
    );
  }

  if (mode === "teacher" && user.uid === TEACHER_UID) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Submissions</h2>
        <button onClick={logout}>Log Out</button>
        {submissions.map((s) => (
          <div key={s.id} style={{ border: "1px solid gray", margin: 10, padding: 10 }}>
            <strong>{s.studentName}</strong>
            <p>{s.response}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Writing Lab</h1>

      <button onClick={() => setMode("teacher")}>Teacher</button>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Your name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <textarea
          placeholder="Write your response..."
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          rows={8}
          cols={60}
        />
      </div>

      <br />
      <button onClick={saveWork}>Save</button>
    </div>
  );
}
