import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Divider,
  Grid,
  Container,
  ListItemButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MessageIcon from "@mui/icons-material/Message";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";
import {
  addMessage,
  fetchAdminChats,
  fetchChatById,
  resetUnreadCount,
  setUserStatus,
} from "../Features/chatSlice";
import { AppDispatch, RootState } from "../Store/store";
import {
  initializeChatSocket,
  joinChat,
  sendSocketMessage,
  emitTyping,
  markSocketMessagesAsRead,
  isSocketConnected,
} from "../Services/chatSocketService";

import { Check, DoneAll } from "@mui/icons-material";

const AdminChat = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const { admin, token } = useSelector((state: RootState) => state.admin);
  const {
    chats,
    currentChat,
    messages,
    isTyping: somebodyTyping,
    typingUser,
    loading,
    userStatuses,
  } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    if (!admin || !token) return;

    if (!isSocketConnected()) {
      const socket = initializeChatSocket(admin, token, true);
      if (socket) {
        setSocketConnected(socket.connected);
        socket.on("connect", () => {
          setSocketConnected(true);
          dispatch(fetchAdminChats());
          if (currentChat && currentChat._id) {
            joinChat(currentChat._id);
          }
        });

        socket.on("disconnect", () => {
          setSocketConnected(false);
        });

        socket.on("user_status_change", (data) => {
          dispatch(
            setUserStatus({
              userId: data.userId,
              status: data.status,
              chatId: data.chatId,
            })
          );
        });
      }
    } else {
      setSocketConnected(true);
    }
  }, [admin, token, dispatch, currentChat]);

  useEffect(() => {
    if (admin && socketConnected) {
      dispatch(fetchAdminChats());
    }
  }, [dispatch, admin, socketConnected]);

  // Auto-scroll to bottom of messages

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle message as read

  useEffect(() => {
    if (!currentChat || !socketConnected) return;
    const unreadMessageIds = messages
      .filter((msg) => msg.sender === "student" && !msg.read)
      .map((msg) => msg._id);

    if (unreadMessageIds.length > 0) {
      markSocketMessagesAsRead(currentChat._id, unreadMessageIds);
      dispatch(resetUnreadCount(currentChat._id));
    }
  }, [currentChat, messages, socketConnected, dispatch]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!socketConnected || !currentChat) return;
    if (typingTimeout) clearTimeout(typingTimeout);
    if (!isTyping) {
      setIsTyping(true);
      emitTyping(currentChat._id, true);
    }
    const timeout = setTimeout(() => {
      setIsTyping(false);
      emitTyping(currentChat._id, false);
    }, 2000);
    setTypingTimeout(timeout);
  };

  // Handle chat selection

  const handleChatSelect = async (chatId: string) => {
    try {
      await dispatch(fetchChatById({ chatId, role: "admin" })).unwrap();

      if (socketConnected) {
        joinChat(chatId);
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  };

  // Handle sending messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentChat || !socketConnected) return;

    sendSocketMessage(
      currentChat._id,
      message.trim(),
      currentChat.admin._id,
      currentChat.student._id
    );
    const messageData = {
      content: message.trim(),
      sender: "admin",
      senderId: admin?._id,
      timestamp: new Date().toISOString(),
      read: false,
    };

    dispatch(
      addMessage({
        chatId: currentChat._id,
        message: messageData,
      })
    );

    setMessage("");
  };

  // Format timestamp
  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.student?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      chat.student?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      chat.student?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isCurrentStudentOnline =
    currentChat && userStatuses[currentChat.student?._id] === "online";

  return (
    <Container maxWidth="lg">
      <Box sx={{ flexGrow: 1, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Student Messages
        </Typography>

        {!socketConnected && (
          <Box
            sx={{
              p: 1,
              mb: 2,
              backgroundColor: "warning.light",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2">
              Connecting to chat server...
            </Typography>
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{ height: "70vh", overflow: "auto", p: 2 }}
            >
              <Typography variant="h6" gutterBottom>
                All Conversations
              </Typography>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                />
              </Box>

              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "50vh",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : filteredChats.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "50vh",
                    flexDirection: "column",
                  }}
                >
                  <MessageIcon
                    sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm
                      ? "No matching conversations"
                      : "No conversations yet"}
                  </Typography>
                </Box>
              ) : (
                <List>
                  {filteredChats.map((chat) => (
                    <React.Fragment key={chat._id}>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={currentChat?._id === chat._id}
                          onClick={() => handleChatSelect(chat._id)}
                        >
                          <ListItemAvatar>
                            <Badge
                              color="secondary"
                              badgeContent={chat.unreadCount || 0}
                              overlap="circular"
                              invisible={
                                chat.unreadCount! <= 0 ||
                                currentChat?._id === chat._id
                              }
                              sx={{
                                "& .MuiBadge-badge": {
                                  backgroundColor: "#3BB7F4",
                                  color: "white",
                                  fontWeight: "bold",
                                },
                              }}
                            >
                              <Avatar
                                src={chat.student?.profileImg}
                                alt={`${chat.student?.firstName} ${chat.student?.lastName}`}
                                sx={{
                                  border:
                                    userStatuses[chat.student._id] === "online"
                                      ? "2px solid #4caf50"
                                      : "none",
                                }}
                              >
                                {chat.student?.firstName.charAt(0) || "S"}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${chat.student?.firstName || ""} ${
                              chat.student?.lastName || ""
                            }`}
                            secondary={
                              chat.messages?.length > 0
                                ? chat.messages[
                                    chat.messages.length - 1
                                  ]?.content?.substring(0, 25) + "..."
                                : "Start a conversation"
                            }
                            primaryTypographyProps={{
                              fontWeight:
                                chat.unreadCount > 0 ? "bold" : "normal",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {chat.lastUpdated &&
                              new Date(chat.lastUpdated).toLocaleDateString()}
                          </Typography>
                        </ListItemButton>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper
              elevation={3}
              sx={{ height: "70vh", display: "flex", flexDirection: "column" }}
            >
              {!currentChat ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    flexDirection: "column",
                  }}
                >
                  <MessageIcon
                    sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    Select a conversation to start chatting
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Chat Header */}
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      sx={{ mr: 2 }}
                      src={currentChat.student?.profileImg}
                      alt={`${currentChat.student?.firstName} ${currentChat.student?.lastName}`}
                    >
                      {currentChat.student?.firstName?.charAt(0) || "S"}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {`${currentChat.student?.firstName || ""} ${
                          currentChat.student?.lastName || ""
                        }`}
                      </Typography>
                      {isCurrentStudentOnline && (
                        <Typography variant="caption" sx={{ color: "#8bef93" }}>
                          Online
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Messages Area */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      overflow: "auto",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {messages.length === 0 ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <Typography variant="body1" color="text.secondary">
                          No messages yet. Start the conversation!
                        </Typography>
                      </Box>
                    ) : (
                      messages.map((msg) => (
                        <Box
                          key={msg._id}
                          sx={{
                            display: "flex ",
                            justifyContent:
                              msg.sender === "admin"
                                ? "flex-end"
                                : "flex-start",
                            mb: 2,
                          }}
                        >
                          {msg.sender === "student" && (
                            <Avatar
                              sx={{ mr: 1 }}
                              src={currentChat.student?.profileImg}
                              alt={`${currentChat.student?.firstName} ${currentChat.student?.lastName}`}
                            ></Avatar>
                          )}

                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems:
                                msg.sender === "admin"
                                  ? "flex-end"
                                  : "flex-start",
                              mb: 2,
                              width: "100%",
                            }}
                          >
                            <Paper
                              sx={{
                                p: 1,

                                display: "inline-block",
                                maxWidth: "70%",
                                backgroundColor:
                                  msg.sender === "admin"
                                    ? theme.palette.secondary.main
                                    : theme.palette.grey[100],
                                color:
                                  msg.sender === "admin"
                                    ? theme.palette.primary.contrastText
                                    : theme.palette.text.primary,
                                borderRadius: 2,
                              }}
                            >
                              <Typography
                                variant="body1"
                                component="span"
                                sx={{
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                  display: "inline",
                                }}
                              >
                                {msg.content}
                              </Typography>
                            </Paper>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 0.5,
                                ml: msg.sender === "admin" ? 0 : 1,
                                mr: msg.sender === "admin" ? 1 : 0,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatTime(msg.timestamp)}
                              </Typography>
                              {msg.sender === "admin" &&
                                msg.read !== undefined && (
                                  <Box sx={{ ml: 1 }}>
                                    {msg.read ? (
                                      <DoneAll
                                        fontSize="small"
                                        sx={{ color: "primary.main" }}
                                      />
                                    ) : (
                                      <Check
                                        fontSize="small"
                                        sx={{ color: "text.secondary" }}
                                      />
                                    )}
                                  </Box>
                                )}
                            </Box>
                          </Box>

                          {msg.sender === "admin" && (
                            <Avatar
                              sx={{ ml: 1 }}
                              src={currentChat.admin?.profileImg}
                              alt={admin?.name}
                            ></Avatar>
                          )}
                        </Box>
                      ))
                    )}

                    {somebodyTyping && typingUser?.type === "student" && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Avatar
                          sx={{ mr: 1 }}
                          src={currentChat.student?.profileImg}
                          alt={`${currentChat.student?.firstName} ${currentChat.student?.lastName}`}
                        >
                          {currentChat.student?.firstName?.charAt(0) || "S"}
                        </Avatar>
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1,
                            backgroundColor: theme.palette.grey[100],
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Typing...
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                    <div ref={messageEndRef} />
                  </Box>

                  <Box
                    component="form"
                    onSubmit={handleSendMessage}
                    sx={{
                      p: 2,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      display: "flex",
                    }}
                  >
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      variant="outlined"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyUp={handleTyping}
                      disabled={!socketConnected}
                      size="small"
                    />
                    <IconButton
                      color="primary"
                      type="submit"
                      disabled={!message.trim() || !socketConnected}
                      sx={{ ml: 1 }}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminChat;
