import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  TextField,
  IconButton,
  Chip,
  Badge,
} from "@mui/material";
import {
  ArrowBack,
  Send,
  CheckCircle,
  Cancel,
  ChatBubbleOutline,
} from "@mui/icons-material";
import { supabase } from "@/src/supabase";
import {
  LFGPost,
  LFGApplication,
  LFGChatMessage,
  Profile,
} from "@/types";

interface LFGApplicationManagementProps {
  post: LFGPost;
  onBack: () => void;
  currentUser: any;
  onUpdate?: () => void;
  isAdmin?: boolean;
}

const LFGApplicationManagement: React.FC<LFGApplicationManagementProps> = ({
  post,
  onBack,
  currentUser,
  onUpdate,
  isAdmin,
}) => {
  const [applications, setApplications] = useState<LFGApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<LFGApplication | null>(null);
  const [messages, setMessages] = useState<LFGChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [post.id]);

  useEffect(() => {
    if (selectedApp) {
      fetchMessages(selectedApp.id);
      // Subscribe to new messages would go here
      const channel = supabase
        .channel(`chat:${selectedApp.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "lfg_chat_messages",
            filter: `application_id=eq.${selectedApp.id}`,
          },
          (payload) => {
            const newMessage = payload.new as LFGChatMessage;
            setMessages((prev) => {
              if (prev.some((msg) => msg.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedApp]);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("lfg_applications")
      .select("*, applicant_profile:profiles(*)")
      .eq("post_id", post.id);

    if (error) {
      console.error("Error fetching applications:", error);
    } else {
      setApplications(data as unknown as LFGApplication[]);
      // Auto-select first application if available and none selected
      if (data && data.length > 0 && !selectedApp) {
        setSelectedApp(data[0] as unknown as LFGApplication);
      }
    }
  };

  const fetchMessages = async (appId: string) => {
    const { data, error } = await supabase
      .from("lfg_chat_messages")
      .select("*, sender_profile:profiles(*)")
      .eq("application_id", appId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data as unknown as LFGChatMessage[]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedApp) return;

    const { data, error } = await supabase
      .from("lfg_chat_messages")
      .insert([
        {
          application_id: selectedApp.id,
          sender_id: currentUser.id,
          content: newMessage,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setNewMessage("");
      setMessages((prev) => [...prev, data as LFGChatMessage]);
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar esta postulación? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("lfg_applications")
      .delete()
      .eq("id", appId);

    if (!error) {
      setApplications((prev) => prev.filter((app) => app.id !== appId));
      if (selectedApp?.id === appId) {
        setSelectedApp(null);
      }
      onUpdate?.();
    } else {
      console.error("Error deleting application:", error);
      alert("Error al eliminar la postulación");
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("lfg_chat_messages")
      .delete()
      .eq("id", msgId);

    if (!error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== msgId));
    } else {
      console.error("Error deleting message:", error);
      alert("Error al eliminar el mensaje");
    }
  };

  const updateStatus = async (status: "approved" | "rejected") => {
    if (!selectedApp) return;

    const { error } = await supabase
      .from("lfg_applications")
      .update({ status })
      .eq("id", selectedApp.id);

    if (!error) {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApp.id ? { ...app, status } : app,
        ),
      );
      setSelectedApp({ ...selectedApp, status });

      // Notify parent to refresh post details (slots)
      onUpdate?.();
    }
  };

  // Create ref for auto-scrolling
  const messagesEndRef = React.useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      sx={{
        color: "#e0e0e0",
        p: 0,
        height: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {onBack && (
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{
            mb: 2,
            color: "#c5a059",
            alignSelf: "flex-start",
            ml: 2,
            mt: 2,
          }}
        >
          Volver a la Publicación
        </Button>
      )}

      <Grid
        container
        spacing={0}
        sx={{ flexGrow: 1, height: "100%", overflow: "hidden" }}
      >
        {/* Left: Applications List */}
        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{
            height: "100%",
            borderRight: "2px solid #5d4037",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "1px",
              boxShadow: "0 0 10px rgba(0,0,0,0.8)",
              zIndex: 1,
            }}
          />
          <Paper
            square
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "rgba(0,0,0,0.4)",
              height: "100%",
              color: "#e0e0e0",
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-track": { bgcolor: "rgba(0,0,0,0.2)" },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "#5d4037",
                borderRadius: "3px",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontFamily: "Cinzel, serif",
                color: "#c5a059",
                fontWeight: "bold",
                borderBottom: "1px solid rgba(197, 160, 89, 0.3)",
                pb: 1,
                letterSpacing: "0.05em",
              }}
            >
              Postulaciones ({applications.length})
            </Typography>
            <List sx={{ p: 0 }}>
              {applications.map((app) => (
                <ListItemButton
                  key={app.id}
                  selected={selectedApp?.id === app.id}
                  onClick={() => setSelectedApp(app)}
                  sx={{
                    mb: 1,
                    transition: "all 0.2s",
                    borderLeft:
                      selectedApp?.id === app.id
                        ? "3px solid #c5a059"
                        : "3px solid transparent",
                    background:
                      selectedApp?.id === app.id
                        ? "linear-gradient(90deg, rgba(197, 160, 89, 0.2), transparent)"
                        : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.05)",
                      borderLeft: "3px solid rgba(197, 160, 89, 0.5)",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={app.applicant_profile?.avatar_url}
                      sx={{
                        border: "1px solid #c5a059",
                        boxShadow: "0 0 5px rgba(0,0,0,0.5)",
                      }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={app.applicant_profile?.username || "Desconocido"}
                    secondaryTypographyProps={{ component: "div" }}
                    secondary={
                      <Chip
                        label={app.status}
                        size="small"
                        sx={{
                          mt: 0.5,
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          bgcolor:
                            app.status === "approved"
                              ? "rgba(46, 125, 50, 0.2)"
                              : app.status === "rejected"
                                ? "rgba(211, 47, 47, 0.2)"
                                : "rgba(255,255,255,0.05)",
                          color:
                            app.status === "approved"
                              ? "#81c784"
                              : app.status === "rejected"
                                ? "#e57373"
                                : "#bdbdbd",
                          border:
                            app.status === "approved"
                              ? "1px solid #2e7d32"
                              : app.status === "rejected"
                                ? "1px solid #c62828"
                                : "1px solid #424242",
                        }}
                      />
                    }
                    primaryTypographyProps={{
                      style: {
                        color: "#ffecb3",
                        fontWeight: "bold",
                        fontFamily: "Cinzel, serif",
                      },
                    }}
                  />
                  {/* Allow deletion if Admin OR if current user is the GM */}
                  {(isAdmin || currentUser?.id === post.gm_id) && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteApplication(app.id);
                      }}
                      sx={{
                        color: "#c62828",
                        ml: 1,
                        "&:hover": { bgcolor: "rgba(198, 40, 40, 0.1)" },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontSize: 14, fontWeight: "bold" }}
                      >
                        ×
                      </Typography>
                    </IconButton>
                  )}
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Right: Chat & Details */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: "100%" }}>
          <Paper
            square
            elevation={0}
            sx={{
              p: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: "transparent",
              backgroundImage: "none",
            }}
          >
            {selectedApp ? (
              <>
                {/* Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: "1px solid #5d4037",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "rgba(0,0,0,0.2)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                    zIndex: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={selectedApp.applicant_profile?.avatar_url}
                      sx={{ border: "2px solid #c5a059" }}
                    />
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#c5a059",
                          fontFamily: "Cinzel, serif",
                          lineHeight: 1,
                        }}
                      >
                        {selectedApp.applicant_profile?.username}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9e9e9e" }}>
                        Postulante
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => updateStatus("approved")}
                      disabled={selectedApp.status === "approved"}
                      sx={{
                        mr: 1,
                        fontWeight: "bold",
                        fontFamily: "Cinzel, serif",
                        bgcolor: "#2e7d32",
                        "&:hover": { bgcolor: "#1b5e20" },
                      }}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => updateStatus("rejected")}
                      disabled={selectedApp.status === "rejected"}
                      sx={{
                        fontWeight: "bold",
                        fontFamily: "Cinzel, serif",
                        bgcolor: "#c62828",
                        "&:hover": { bgcolor: "#b71c1c" },
                      }}
                    >
                      Rechazar
                    </Button>
                  </Box>
                </Box>

                {/* Initial Message */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "rgba(0,0,0,0.2)",
                    borderBottom: "1px solid #5d4037",
                    boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#c5a059",
                      fontFamily: "Cinzel, serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    PERGAMINO ORIGINAL:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mt: 0.5,
                      fontStyle: "italic",
                      color: "#bdbdbd",
                      fontFamily: '"Newsreader", serif',
                    }}
                  >
                    "{selectedApp.message}"
                  </Typography>
                </Box>

                {/* Chat Area */}
                <Box
                  sx={{
                    flexGrow: 1,
                    p: 2,
                    overflowY: "auto",
                    bgcolor: "rgba(0,0,0,0.1)",
                    "&::-webkit-scrollbar": { width: "8px" },
                    "&::-webkit-scrollbar-track": {
                      bgcolor: "rgba(0,0,0,0.1)",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: "#5d4037",
                      borderRadius: "4px",
                      border: "1px solid #2d2d2d",
                    },
                  }}
                >
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser.id;
                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          display: "flex",
                          justifyContent: isMe ? "flex-end" : "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: isMe ? "#3e2723" : "#1a1a1a",
                            p: 2,
                            borderRadius: isMe
                              ? "12px 12px 0 12px"
                              : "12px 12px 12px 0",
                            maxWidth: "70%",
                            border: isMe
                              ? "1px solid #c5a059"
                              : "1px solid #5d4037",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.5)",
                            position: "relative",
                          }}
                        >
                          {isAdmin && (
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteMessage(msg.id)}
                              sx={{
                                position: "absolute",
                                top: -8,
                                right: -8,
                                bgcolor: "rgba(198, 40, 40, 0.9)",
                                color: "white",
                                width: 20,
                                height: 20,
                                "&:hover": { bgcolor: "#b71c1c" },
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontSize: 14, fontWeight: "bold" }}
                              >
                                ×
                              </Typography>
                            </IconButton>
                          )}
                          <Typography
                            variant="body2"
                            sx={{ color: "#e0e0e0", fontSize: "0.95rem" }}
                          >
                            {msg.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mt: 0.5,
                              textAlign: "right",
                              color: "rgba(255,255,255,0.4)",
                              fontSize: "0.7rem",
                            }}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box
                  sx={{
                    p: 2,
                    borderTop: "1px solid #5d4037",
                    display: "flex",
                    gap: 1,
                    bgcolor: "rgba(0,0,0,0.3)",
                    zIndex: 2,
                    boxShadow: "0 -2px 10px rgba(0,0,0,0.3)",
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    sx={{
                      bgcolor: "rgba(0, 0, 0, 0.2)",
                      input: { color: "#e0e0e0", fontFamily: "inherit" },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(93, 64, 55, 0.5)",
                        },
                        "&:hover fieldset": { borderColor: "#c5a059" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#c5a059",
                          boxShadow: "0 0 5px rgba(197, 160, 89, 0.3)",
                        },
                      },
                    }}
                  />
                  <IconButton
                    onClick={handleSendMessage}
                    sx={{
                      color: "#c5a059",
                      bgcolor: "rgba(197, 160, 89, 0.1)",
                      border: "1px solid rgba(197, 160, 89, 0.3)",
                      "&:hover": {
                        bgcolor: "rgba(197, 160, 89, 0.2)",
                        boxShadow: "0 0 10px rgba(197, 160, 89, 0.3)",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s",
                    }}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#5d4037",
                  flexDirection: "column",
                  gap: 2,
                  opacity: 0.7,
                }}
              >
                <ChatBubbleOutline sx={{ fontSize: 60, opacity: 0.5 }} />
                <Typography
                  sx={{ fontFamily: "Cinzel, serif", fontSize: "1.2rem" }}
                >
                  Selecciona un pergamino para leer...
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LFGApplicationManagement;
