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
  Button,
  ListItemButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MessageIcon from "@mui/icons-material/Message";
import { useTheme } from "@mui/material/styles";
import {
  getOrCreateChat,
  fetchChatById,
  resetUnreadCount,
  fetchStudentChats,
  addMessage,
  fetchAdminId,
  // fetchAdminId,
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

const StudentChat = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [socketConnected, setSocketConnected] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const { user, token } = useSelector((state: RootState) => state.user);
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
    if (!user?._id || !token) return;

    if (!isSocketConnected()) {
      const socket = initializeChatSocket(user._id.toString(), token, false);
      if (socket) {
        setSocketConnected(socket.connected);
        socket.on("connect", () => {
          setSocketConnected(true);
          dispatch(fetchStudentChats());
          if (currentChat && currentChat._id) {
            joinChat(currentChat._id);
          }
        });

        socket.on("disconnect", () => {
          setSocketConnected(false);
        });
      }
    } else {
      setSocketConnected(true);
    }
  }, [user?._id, token, dispatch, currentChat]);

  useEffect(() => {
    if (user && socketConnected) {
      dispatch(fetchStudentChats());
    }
  }, [dispatch, user, socketConnected]);

  const handleStartNewChat = async () => {
    if (!socketConnected || !user._id) {
      return;
    }
    try {
      const response = await dispatch(fetchAdminId()).unwrap();
      const adminId = response.adminId;
      if (!adminId) {
        throw new Error("Admin ID not found in response");
      }
      const result = await dispatch(getOrCreateChat(adminId)).unwrap();
      if (result && result._id) {
        joinChat(result._id);
        await dispatch(
          fetchChatById({
            chatId: result._id,
            role: "student",
          })
        ).unwrap();
      }
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (!currentChat || !socketConnected) return;

    const unreadMessageIds = messages
      .filter((msg) => msg.sender === "admin" && !msg.read)
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
  const handleChatSelect = (chatId: string) => {
    dispatch(fetchChatById({ chatId, role: "student" })).unwrap();

    if (socketConnected) {
      joinChat(chatId);
    }
  };

  // Handle sending messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentChat || !socketConnected) return;

    sendSocketMessage(
      currentChat._id,
      message.trim(),
      user._id.toString(),
      currentChat.admin._id
    );

    const messageData = {
      content: message.trim(),
      sender: "student",
      senderId: user._id,
      timestamp: new Date(),
      read: false,
    };

    dispatch(
      addMessage({
        chatId: currentChat._id,
        message: messageData,
      })
    );

    // Clear message input
    setMessage("");
  };

  // Format timestamp
  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isAdminOnline =
    currentChat && userStatuses[currentChat.admin._id] === "online";

  return (
    <Container maxWidth="lg">
      <Box sx={{ flexGrow: 1, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Messages
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleStartNewChat}
            disabled={!socketConnected}
            startIcon={<MessageIcon />}
          >
            Start New Chat
          </Button>
        </Box>

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
          {/* Chat List */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{ height: "70vh", overflow: "auto", p: 2 }}
            >
              <Typography variant="h6" gutterBottom>
                Your Conversations
              </Typography>

              {loading === true ? (
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
              ) : chats.length === 0 ? (
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
                    No conversations yet
                  </Typography>
                </Box>
              ) : (
                <List>
                  {chats.map((chat) => (
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
                                src={chat.admin?.profileImg}
                                alt={chat.admin?.name}
                                sx={{
                                  border:
                                    userStatuses[chat.admin._id] === "online"
                                      ? "2px solid #4caf50"
                                      : "none",
                                }}
                              >
                                {chat.admin?.name || "A"}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={chat.admin?.name || "Instructor"}
                            secondary={
                              chat.messages?.length > 0
                                ? chat.messages[
                                    chat.messages.length - 1
                                  ]?.content?.substring(0, 25) + "..."
                                : "Start a conversation"
                            }
                            primaryTypographyProps={{
                              fontWeight:
                                chat.unreadCount && chat.unreadCount > 0
                                  ? "bold"
                                  : "normal",
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontWeight:
                                chat.unreadCount && chat.unreadCount > 0
                                  ? "bold"
                                  : "normal",
                            }}
                          >
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

          {/* Chat Messages */}
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
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                    }}
                  >
                    <Typography variant="h6">
                      {currentChat.admin?.name || "Instructor"}
                    </Typography>
                    {isAdminOnline && (
                      <Typography variant="caption" sx={{ color: "#8bef93" }}>
                        Online
                      </Typography>
                    )}
                  </Box>

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
                      messages.map((msg, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            justifyContent:
                              msg.sender === "student"
                                ? "flex-end"
                                : "flex-start",
                            mb: 2,
                          }}
                        >
                          {msg.sender === "admin" && (
                            <Avatar
                              sx={{ mr: 1 }}
                              src={currentChat.admin?.profileImg}
                              alt={currentChat.admin?.name}
                            ></Avatar>
                          )}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems:
                                msg.sender === "student"
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
                                  msg.sender === "student"
                                    ? theme.palette.secondary.main
                                    : theme.palette.grey[100],
                                color:
                                  msg.sender === "student"
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
                                ml: msg.sender === "student" ? 0 : 1,
                                mr: msg.sender === "student" ? 1 : 0,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatTime(msg.timestamp)}
                              </Typography>
                              {msg.sender === "student" && (
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

                          {msg.sender === "student" && (
                            <Avatar
                              sx={{ ml: 1 }}
                              src={user?.profileImg}
                              alt={user?.firstName}
                            ></Avatar>
                          )}
                        </Box>
                      ))
                    )}

                    {/* Typing indicator */}
                    {somebodyTyping && typingUser?.type === "admin" && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Avatar
                          sx={{ mr: 1 }}
                          src={currentChat.admin?.profileImg}
                          alt={currentChat.admin?.name}
                        >
                          {currentChat.admin?.name?.charAt(0) || "A"}
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

                    {/* Auto scroll to bottom */}
                    <div ref={messageEndRef} />
                  </Box>

                  {/* Message Input */}
                  <Box
                    component="form"
                    onSubmit={handleSendMessage}
                    sx={{
                      mt: 5,
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

export default StudentChat;
