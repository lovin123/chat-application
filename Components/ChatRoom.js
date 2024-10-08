// ChatRoom.js
import { useEffect, useRef, useState } from "react";
import { formatRelative } from "date-fns";
import {
  db,
  serverTimestamp,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
} from "../firebaseConfig";

export default function ChatRoom({ user, socket }) {
  const dummySpace = useRef();
  const { uid, displayName, photoURL } = user;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const messagesRef = collection(db, "messages");
      const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"));
      const snapshot = await getDocs(messagesQuery);

      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(fetchedMessages);
      dummySpace.current.scrollIntoView({ behavior: "smooth" });
    };

    fetchMessages();

    if (socket) {
      socket.onmessage = async (event) => {
        const messageText = await event.data.text();
        const messageData = JSON.parse(messageText);

        setMessages((prevMessages) => [...prevMessages, messageData]);
        dummySpace.current.scrollIntoView({ behavior: "smooth" });
      };

      return () => {
        socket.onmessage = null;
      };
    }
  }, [socket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid,
      displayName,
      photoURL,
    };

    try {
      await addDoc(collection(db, "messages"), message);
      socket.send(JSON.stringify(message));
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <main id="chat_room">
      <ul>
        {messages.map((message) => (
          <li
            key={`${message.id}-${message.createdAt}`}
            className={message.uid === uid ? "sent" : "received"}
          >
            <section>
              {message.photoURL && (
                <img
                  src={message.photoURL}
                  alt="Avatar"
                  width={45}
                  height={45}
                />
              )}
            </section>
            <section>
              <p>{message.text}</p>
              {message.displayName && <span>{message.displayName}</span>}
              <br />
              {message.createdAt?.seconds && (
                <span>
                  {formatRelative(
                    new Date(message.createdAt.seconds * 1000),
                    new Date()
                  )}
                </span>
              )}
            </section>
          </li>
        ))}
      </ul>

      <section ref={dummySpace}></section>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <button type="submit" disabled={!newMessage}>
          Send
        </button>
      </form>
    </main>
  );
}
