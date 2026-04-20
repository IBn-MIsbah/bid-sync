/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { getMessages } from "../../services/api/chat-api";
import { getAllConversationsForAdmin } from "../../services/api/admin-api";

const AuditPage: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllChats = async () => {
      // You'll need a new API endpoint: GET /chat/admin/all
      const res = await getAllConversationsForAdmin();
      setConversations(res.data);
    };
    fetchAllChats();
  }, []);

  const handleSelectChat = async (conv: any) => {
    setActiveChat(conv);
    setLoading(true);
    try {
      const res = await getMessages(conv.id);
      setMessages(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={auditStyles.container}>
      {/* LIST OF ALL CONVERSATIONS */}
      <aside style={auditStyles.listSide}>
        <div style={auditStyles.header}>GLOBAL_TRAFFIC_LOGS</div>
        <div style={auditStyles.scrollArea}>
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => handleSelectChat(c)}
              style={{
                ...auditStyles.chatRow,
                borderLeft:
                  activeChat?.id === c.id
                    ? "4px solid #F87171"
                    : "4px solid transparent",
                backgroundColor: activeChat?.id === c.id ? "#FEF2F2" : "#fff",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: "11px" }}>
                {c.rfp.title}
              </div>
              <div style={{ fontSize: "9px", color: "#64748b" }}>
                {c.buyer.companyName} vs {c.supplier.businessName}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* READ-ONLY CHAT VIEW */}
      <main style={auditStyles.viewSide}>
        {activeChat ? (
          <>
            <div style={auditStyles.auditBanner}>
              ⚠️ AUDIT_MODE: READ_ONLY_ACCESS_ENABLED
            </div>
            <div style={auditStyles.msgArea}>
              {loading ? (
                <p>DECRYPTING_LOGS...</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} style={auditStyles.msgLine}>
                    <span style={auditStyles.timestamp}>
                      [{new Date(m.createdAt).toLocaleString()}]
                    </span>
                    <span style={auditStyles.senderName}>
                      {" "}
                      {m.sender.firstName}:{" "}
                    </span>
                    <span style={auditStyles.content}>{m.content}</span>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div style={auditStyles.empty}>
            SELECT_SESSION_FOR_FORENSIC_REVIEW
          </div>
        )}
      </main>
    </div>
  );
};

const auditStyles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    height: "70vh",
    border: "2px solid #0F172A",
    boxShadow: "10px 10px 0px #0F172A",
  },
  listSide: {
    width: "300px",
    borderRight: "2px solid #0F172A",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "12px",
    backgroundColor: "#0F172A",
    color: "#fff",
    fontSize: "10px",
    fontWeight: 900,
  },
  scrollArea: { flex: 1, overflowY: "auto" },
  chatRow: {
    padding: "15px",
    borderBottom: "1px solid #e2e8f0",
    cursor: "pointer",
  },
  viewSide: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  auditBanner: {
    padding: "10px",
    backgroundColor: "#F87171",
    color: "#fff",
    fontWeight: 900,
    fontSize: "10px",
    textAlign: "center",
  },
  msgArea: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    fontFamily: "monospace",
  },
  msgLine: { marginBottom: "8px", fontSize: "12px" },
  timestamp: { color: "#94a3b8" },
  senderName: { color: "#3182ce", fontWeight: 900 },
  content: { color: "#1e293b" },
  empty: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#cbd5e0",
    fontWeight: 900,
  },
};

export default AuditPage;
