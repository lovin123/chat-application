// Home.js
import { useEffect, useState } from "react";
import {
  auth,
  provider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "../firebaseConfig";
import ChatRoom from "../Components/ChatRoom";

export default function Home() {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const socketInstance = new WebSocket("ws://localhost:8080");
        setSocket(socketInstance);

        return () => {
          socketInstance.close();
        };
      } else {
        setSocket(null);
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during sign in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <div className="container">
      <main>
        {user ? (
          <>
            <nav id="sign_out">
              <h2>Chat With Friends</h2>
              <button onClick={handleSignOut}>Sign Out</button>
            </nav>
            {socket && <ChatRoom user={user} socket={socket} />}
          </>
        ) : (
          <section id="sign_in">
            <h1>Welcome to Chat Room</h1>
            <button onClick={signInWithGoogle}>Sign In With Google</button>
          </section>
        )}
      </main>
    </div>
  );
}
