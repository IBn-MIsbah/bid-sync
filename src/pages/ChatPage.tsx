/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import {
  getMessages,
  getUserConversations,
  sendMessage,
} from "../services/api/chat-api";

export const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const { user } = useAuth();
  const socket = useSocket();

  // Ref for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Fetch Inbox on Mount
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await getUserConversations();
        setConversations(res.data);
      } catch (err) {
        console.error("Failed to load conversations", err);
      }
    };
    fetchInbox();
  }, []);

  // 2. Handle Joining/Switching Chats
  useEffect(() => {
    if (!activeChat || !socket) return;

    const loadMessages = async () => {
      try {
        const res = await getMessages(activeChat.id);
        setMessages(res.data);
        // CRITICAL: Join the room so the server knows where to send emissions
        if (socket.connected) {
          console.log("Emitting join for:", activeChat.id);
          socket.emit("join_conversation", activeChat.id);
        } else {
          socket.once("connect", () => {
            socket.emit("join_conversation", activeChat.id);
          });
        }
      } catch (err) {
        console.error("Error loading chat context", err);
      }
    };

    loadMessages();

    // Listen for real-time messages
    const handleNewMessage = (msg: any) => {
      if (msg.conversationId === activeChat.id) {
        setMessages((prev) => {
          // Prevent duplicates if already added optimistically
          const exists = prev.some((m) => m.id === msg.id);
          return exists ? prev : [...prev, msg];
        });
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.emit("leave_conversation", activeChat.id);
    };
  }, [activeChat, socket]);

  // 3. Send Message Logic
  const handleSend = async () => {
    if (!input.trim() || !activeChat) return;

    const tempInput = input;
    setInput(""); // Clear immediately for UX

    try {
      const res = await sendMessage({
        conversationId: activeChat.id,
        content: tempInput,
      });

      const savedMsg = res;
      console.log("savedMsg: ", savedMsg);
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === savedMsg.id);
        return exists ? prev : [...prev, savedMsg];
      });
    } catch (err) {
      console.error("Failed to execute send", err);
      // Optional: restore input if it failed
      setInput(tempInput);
    }
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR: INBOX */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>COMM_CHANNELS</div>
        <div style={styles.inboxList}>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveChat(conv)}
              style={{
                ...styles.inboxItem,
                backgroundColor:
                  activeChat?.id === conv.id ? "#3182ce" : "transparent",
                color: activeChat?.id === conv.id ? "#fff" : "#1E293B",
                borderLeft:
                  activeChat?.id === conv.id
                    ? "6px solid #0F172A"
                    : "6px solid transparent",
              }}
            >
              <div style={styles.convTitle}>
                {user?.role === "BUYER"
                  ? conv.supplier?.businessName || "Unknown Supplier"
                  : conv.buyer?.companyName || "Unknown Buyer"}
              </div>
              <div style={styles.convSub}>
                {conv.rfp?.title || "Direct Message"}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN: CHAT WINDOW */}
      <main style={styles.chatMain}>
        {activeChat ? (
          <>
            <header style={styles.chatHeader}>
              <div>
                <span style={{ color: "#3182ce", fontWeight: "900" }}># </span>
                {activeChat.rfp?.title || "GENERAL_CHANNEL"}
              </div>
            </header>

            <div style={styles.messageArea}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    ...styles.bubble,
                    alignSelf:
                      m.senderId === user?.id ? "flex-end" : "flex-start",
                    backgroundColor:
                      m.senderId === user?.id ? "#1E293B" : "#fff",
                    color: m.senderId === user?.id ? "#fff" : "#1E293B",
                    boxShadow:
                      m.senderId === user?.id
                        ? "-4px 4px 0px #3182ce"
                        : "4px 4px 0px #0F172A",
                  }}
                >
                  <div
                    style={{
                      ...styles.sender,
                      color: m.senderId === user?.id ? "#A0AEC0" : "#3182ce",
                    }}
                  >
                    {m.sender?.firstName || "System"}
                  </div>
                  {m.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputBar}>
              <input
                style={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="TYPE_MESSAGE_AND_EXECUTE_SEND..."
              />
              <button onClick={handleSend} style={styles.sendBtn}>
                SEND_DATA
              </button>
            </div>
          </>
        ) : (
          <div style={styles.emptyState}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>📡</div>
              SELECT_A_CHANNEL_TO_INITIALIZE_COMMS
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    height: "calc(100vh - 160px)",
    border: "3px solid #0F172A",
    backgroundColor: "#fff",
    boxShadow: "12px 12px 0px #0F172A",
    fontFamily: "'JetBrains Mono', monospace",
  },
  sidebar: {
    width: "320px",
    borderRight: "3px solid #0F172A",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  sidebarHeader: {
    padding: "20px",
    backgroundColor: "#0F172A",
    color: "#fff",
    fontWeight: "900",
    fontSize: "11px",
    letterSpacing: "2px",
  },
  inboxList: { flex: 1, overflowY: "auto" },
  inboxItem: {
    padding: "15px 20px",
    borderBottom: "1px solid #E2E8F0",
    cursor: "pointer",
    transition: "all 0.1s",
  },
  convTitle: {
    fontWeight: "900",
    fontSize: "13px",
    textTransform: "uppercase",
  },
  convSub: {
    fontSize: "9px",
    opacity: 0.6,
    marginTop: "6px",
    letterSpacing: "0.5px",
  },
  chatMain: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#F7FAFC",
  },
  chatHeader: {
    padding: "15px 25px",
    borderBottom: "3px solid #0F172A",
    backgroundColor: "#fff",
    fontWeight: "900",
    fontSize: "14px",
    letterSpacing: "1px",
  },
  messageArea: {
    flex: 1,
    padding: "30px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  bubble: {
    padding: "14px 20px",
    maxWidth: "70%",
    fontSize: "13px",
    border: "2px solid #0F172A",
    position: "relative",
    fontWeight: "600",
  },
  sender: {
    fontSize: "8px",
    fontWeight: "900",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  inputBar: {
    display: "flex",
    padding: "25px",
    backgroundColor: "#fff",
    borderTop: "3px solid #0F172A",
  },
  input: {
    flex: 1,
    padding: "15px",
    border: "2px solid #0F172A",
    outline: "none",
    fontFamily: "inherit",
    fontWeight: "800",
    fontSize: "12px",
  },
  sendBtn: {
    marginLeft: "15px",
    padding: "0 30px",
    backgroundColor: "#3182ce",
    color: "#fff",
    border: "2px solid #0F172A",
    fontWeight: "900",
    fontSize: "12px",
    cursor: "pointer",
    boxShadow: "4px 4px 0px #0F172A",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#CBD5E0",
    fontWeight: "900",
    fontSize: "11px",
    letterSpacing: "2px",
  },
};
