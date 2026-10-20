import React, { useState } from "react";
import { styled } from "@mui/system";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import axios from "axios";
import { useEffect } from "react";
const MainContainer = styled(Box)({
  display: "flex",
  height: "90vh",
});

const ClientListContainer = styled(Box)({
  width: "30%",
  borderRight: "1px solid rgba(0, 0, 0, 0.08)",
  backgroundColor: "#ffffff",
  overflowY: "auto",
});

const ChatContainer = styled(Box)({
  width: "70%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  backgroundColor: "#f9fafc",
});

const MessagesContainer = styled(Box)({
  flexGrow: 1,
  overflowY: "auto",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
});

const Message = ({ isUser, children }) => {
  return (
    <Box
      sx={{
        maxWidth: "65%",
        borderRadius: isUser ? "16px 16px 0 16px" : "16px 16px 16px 0",
        padding: "10px 14px",
        marginBottom: "12px",
        alignSelf: isUser ? "flex-end" : "flex-start",
        backgroundColor: isUser ? "primary.main" : "#ffffff",
        color: isUser ? "primary.contrastText" : "text.primary",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        wordBreak: "break-word",
      }}
    >
      {children}
    </Box>
  );
};

const MessageInputContainer = styled(Box)({
  display: "flex",
  padding: "16px 24px",
  backgroundColor: "#ffffff",
  borderTop: "1px solid rgba(0, 0, 0, 0.08)",
  alignItems: "flex-end",
});

const MessageInput = styled(TextField)({
  flexGrow: 1,
  marginRight: "12px",
  "& .MuiOutlinedInput-root": {
    borderRadius: "20px",
    backgroundColor: "#f4f6f8",
  },
});

const WhatsApp = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [vendorInfo] = useState(
    JSON.parse(localStorage.getItem("vendorInfo"))
  );
  const [message, setMessage] = useState("");
  const [allData, setallData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);
  const vendorId = vendorInfo?.id || vendorInfo?._id;

  const getConversation = async () => {
    if (!vendorId) return;
    try {
      const { data } = await axios.get(`/api/messages/vendor/${vendorId}/t`);
      setallData(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  useEffect(() => {
    getConversation();
    const interval = setInterval(getConversation, 5000); // refresh every 5s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const handleSendMessage = async () => {
    if (message) {
      setMessages([...messages, { content: message, isUser: true }]);
      await axios.post("/api/messages/send", {
        message: message,
        sender: vendorId,
        receiver: currentClient,
      });
      setMessage("");
      getConversation();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleClientSelect = (clientId, clientNo) => {
    setSelectedClient(clientNo + 1);
    setCurrentClient(clientId);
  };

  return (
    <MainContainer sx={{ m: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", borderRadius: "16px", overflow: "hidden", height: "85vh" }}>
      <ClientListContainer>
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(0, 0, 0, 0.08)", bgcolor: "#fafafa" }}>
          <Typography variant="h6" fontWeight="bold" color="textPrimary">
            Messages
          </Typography>
        </Box>
        <List disablePadding>
          {allData.map((client, index) => (
            <ListItem disablePadding key={client.client}>
              <ListItemButton
                selected={selectedClient === index + 1}
                onClick={() => handleClientSelect(client.client, index)}
                sx={{
                  borderBottom: "1px solid rgba(0,0,0,0.04)",
                  "&.Mui-selected": {
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    borderLeft: "4px solid #1976d2",
                  },
                  py: 1.5,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: selectedClient === index + 1 ? "primary.main" : "grey.400" }}>
                    {client.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={client.name}
                  primaryTypographyProps={{ fontWeight: selectedClient === index + 1 ? "bold" : "medium" }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          {allData.length === 0 && (
            <Box p={3} textAlign="center">
              <Typography color="textSecondary" variant="body2">No conversations yet</Typography>
            </Box>
          )}
        </List>
      </ClientListContainer>
      <ChatContainer>
        <MessagesContainer>
          {selectedClient ? (
            allData[selectedClient - 1].messages.map((msg, index) => (
              <Message isUser={msg.isUser} key={index}>
                <Typography variant="body1">{msg.message}</Typography>
              </Message>
            ))
          ) : (
            <Box display="flex" height="100%" alignItems="center" justifyContent="center">
              <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.6 }}>
                Select a conversation to start messaging
              </Typography>
            </Box>
          )}
        </MessagesContainer>
        <MessageInputContainer>
          <MessageInput
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={4}
            variant="outlined"
            size="small"
            disabled={!selectedClient}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!message.trim() || !selectedClient}
            sx={{
              backgroundColor: message.trim() ? "primary.main" : "grey.300",
              color: message.trim() ? "white" : "grey.500",
              "&:hover": { backgroundColor: "primary.dark" },
              mb: 0.5,
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </MessageInputContainer>
      </ChatContainer>
    </MainContainer>
  );
};

export default WhatsApp;
