import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Stack,
    Collapse,
    Grid,
    Chip,
    Button,
    IconButton,
    CircularProgress,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    FormControl,
    Select,
    MenuItem,
    TextField,
    alpha,
    useTheme,
} from "@mui/material";
import {
    KeyboardArrowDown,
    KeyboardArrowUp,
    DeleteForever,
    WhatsApp,
    Print,
    HourglassEmpty,
    Handyman,
    CleaningServices,
    LocalShipping,
    Close,
} from "@mui/icons-material";
import { supabase } from "@/src/supabase";
import { formatCurrencyDecimal } from "@/src/utils/currency";

export const AdminOrders: React.FC = () => {
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const fetchOrders = async () => {
        setOrdersLoading(true);
        const { data, error } = await supabase
            .from("orders")
            .select("*, order_items(*)")
            .order("created_at", { ascending: false });

        if (error) console.error("Error fetching orders:", error);
        else setAllOrders(data || []);
        setOrdersLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", orderId);

        if (error) {
            alert("Error al actualizar estado: " + error.message);
        } else {
            setAllOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
            );
        }
    };

    const handleUpdateAdminNotes = async (orderId: string, notes: string) => {
        const { error } = await supabase
            .from("orders")
            .update({ admin_notes: notes })
            .eq("id", orderId);

        if (error) {
            alert("Error al guardar notas: " + error.message);
        } else {
            setAllOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, admin_notes: notes } : o)),
            );
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (
            !confirm(
                "¿Estás seguro de romper este pacto? Esta acción es irreversible y eliminará todos los registros asociados.",
            )
        )
            return;

        // 1. Delete order items first (manual cascade)
        const { error: itemsError } = await supabase
            .from("order_items")
            .delete()
            .eq("order_id", orderId);

        if (itemsError) {
            console.error("Error deleting order items:", itemsError);
            alert("Error al eliminar los ítems del pedido: " + itemsError.message);
            return;
        }

        // 2. Delete the order itself
        const { error, count } = await supabase
            .from("orders")
            .delete({ count: "exact" })
            .eq("id", orderId);

        if (error) {
            console.error("Error deleting order:", error);
            alert("Error al romper el pacto: " + error.message);
        } else if (count === 0) {
            console.warn("Order delete returned 0 rows");
            // Optimistically remove from UI to handle "ghost" orders
            setAllOrders((prev) => prev.filter((o) => o.id !== orderId));
            alert(
                "El pedido no se encontró en la base de datos (quizás ya fue eliminado). Se ha quitado de la lista local.\n\nSi el problema persiste con nuevos pedidos, verifica las políticas RLS en Supabase."
            );
        } else {
            console.log("Order deleted successfully");
            setAllOrders((prev) => prev.filter((o) => o.id !== orderId));
        }
    };

    const handleSendWhatsApp = (order: any) => {
        const itemsList = order.order_items
            ?.map((item: any) => `${item.quantity}x ${item.name}`)
            .join("\n");

        const message =
            `*Pedido #${order.contract_number || order.id.slice(0, 8)}*\n\n` +
            `*Cliente:* ${order.customer_name}\n` +
            `*Total:* ${formatCurrencyDecimal(order.total_gp)}\n` +
            `*Estado:* ${order.status}\n\n` +
            `*Items:*\n${itemsList}\n\n` +
            `*Dirección:* ${order.shipping_address}`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${order.customer_phone?.replace(/\D/g, "")}?text=${encodedMessage}`;
        window.open(whatsappUrl, "_blank");
    };

    const handlePrintOrder = (order: any) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const itemsHtml = order.order_items
            ?.map(
                (item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">
          <img src="${item.image_url || "https://via.placeholder.com/50"}" style="width: 50px; height: 50px; object-fit: cover;" />
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrencyDecimal(item.unit_price || 0)}</td>
      </tr>
    `,
            )
            .join("");

        printWindow.document.write(`
      <html>
        <head>
          <title>Pedido #${order.contract_number || order.id.slice(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #f5f5f5; padding: 10px; text-align: left; }
            .total { font-size: 1.2em; font-weight: bold; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Pedido #${order.contract_number || order.id.slice(0, 8)}</h1>

          <div class="section">
            <p><span class="label">Cliente:</span> ${order.customer_name}</p>
            <p><span class="label">Email:</span> ${order.customer_email}</p>
            <p><span class="label">Teléfono:</span> ${order.customer_phone}</p>
            <p><span class="label">DNI:</span> ${order.customer_dni || "N/A"}</p>
          </div>

          <div class="section">
            <p><span class="label">Dirección de envío:</span></p>
            <p>${order.shipping_address}</p>
          </div>

          <div class="section">
            <p><span class="label">Fecha:</span> ${new Date(order.created_at).toLocaleString()}</p>
            <p><span class="label">Estado:</span> ${order.status}</p>
          </div>

          <div class="section">
            <p><span class="label">Items:</span></p>
            <table>
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th style="text-align: center;">Cantidad</th>
                  <th style="text-align: right;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="total">
            Total: ${formatCurrencyDecimal(order.total_gp)}
          </div>

          ${order.admin_notes
                ? `
            <div class="section" style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd;">
              <p><span class="label">Notas Admin:</span></p>
              <p>${order.admin_notes}</p>
            </div>
          `
                : ""
            }
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.print();
    };

    return (
        <Box>
            {ordersLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress color="secondary" />
                </Box>
            ) : (
                <TableContainer
                    component={Paper}
                    sx={{
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        border: 1,
                        borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
                        boxShadow: 6,
                    }}
                >
                    <Table>
                        <TableHead
                            sx={{
                                bgcolor: (t) => alpha(t.palette.common.black, 0.3),
                            }}
                        >
                            <TableRow>
                                <TableCell sx={{ color: "secondary.main", fontWeight: "bold" }}>
                                    Pacto
                                </TableCell>
                                <TableCell sx={{ color: "secondary.main", fontWeight: "bold" }}>
                                    Fecha del Pacto
                                </TableCell>
                                <TableCell sx={{ color: "secondary.main", fontWeight: "bold" }}>
                                    Aventurero
                                </TableCell>
                                <TableCell sx={{ color: "secondary.main", fontWeight: "bold" }}>
                                    Items
                                </TableCell>
                                <TableCell sx={{ color: "secondary.main", fontWeight: "bold" }}>
                                    Total
                                </TableCell>
                                <TableCell sx={{ color: "secondary.main", fontWeight: "bold" }}>
                                    Estado de la Forja
                                </TableCell>
                                <TableCell sx={{ color: "secondary.main", fontWeight: "bold" }}></TableCell>
                                <TableCell sx={{ color: "secondary.main", fontWeight: "bold" }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allOrders.map((order) => (
                                <React.Fragment key={order.id}>
                                    <TableRow
                                        onClick={() =>
                                            setExpandedOrderId(
                                                expandedOrderId === order.id ? null : order.id,
                                            )
                                        }
                                        sx={{
                                            cursor: "pointer",
                                            "&:hover": {
                                                bgcolor: (t) => alpha(t.palette.common.white, 0.05),
                                            },
                                            bgcolor:
                                                expandedOrderId === order.id
                                                    ? (t) => alpha(t.palette.secondary.main, 0.05)
                                                    : "inherit",
                                        }}
                                    >
                                        <TableCell
                                            sx={{
                                                color: "grey.300",
                                                fontFamily: "monospace",
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                                #{order.contract_number || order.id.slice(0, 8)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ color: "grey.400" }}>
                                            <Typography variant="body2">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "grey.600" }}>
                                                {new Date(order.created_at).toLocaleTimeString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ color: "grey.400" }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: "bold",
                                                    color: "common.white",
                                                }}
                                            >
                                                {order.customer_name || order.phone}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "grey.600" }}>
                                                {order.customer_phone}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack spacing={0.5}>
                                                {order.order_items
                                                    ?.slice(0, 2)
                                                    .map((item: any, i: number) => (
                                                        <Typography
                                                            key={i}
                                                            variant="caption"
                                                            sx={{
                                                                color: "grey.500",
                                                                display: "block",
                                                            }}
                                                        >
                                                            • {item.quantity}x {item.name}
                                                        </Typography>
                                                    ))}
                                                {order.order_items?.length > 2 && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "grey.600",
                                                            fontStyle: "italic",
                                                        }}
                                                    >
                                                        +{order.order_items.length - 2} más...
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                color: "secondary.main",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {formatCurrencyDecimal(order.total_gp)}
                                        </TableCell>
                                        <TableCell>
                                            <FormControl size="small" fullWidth>
                                                <Select
                                                    value={order.status}
                                                    onChange={(e) =>
                                                        handleUpdateStatus(order.id, e.target.value)
                                                    }
                                                    onClick={(e) => e.stopPropagation()}
                                                    sx={{
                                                        height: 32,
                                                        fontSize: "0.75rem",
                                                        bgcolor: (theme) => {
                                                            switch (order.status) {
                                                                case "Enviado":
                                                                    return alpha(theme.palette.success.main, 0.1);
                                                                case "En la Forja":
                                                                    return alpha(theme.palette.warning.main, 0.1);
                                                                case "Limpieza y Curado":
                                                                    return alpha(theme.palette.info.main, 0.1);
                                                                case "Recibido":
                                                                    return alpha(theme.palette.grey[500], 0.1);
                                                                case "Cancelado":
                                                                    return alpha(theme.palette.error.main, 0.1);
                                                                default:
                                                                    return "transparent";
                                                            }
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="Recibido">
                                                        <HourglassEmpty sx={{ fontSize: 16, mr: 1 }} /> Recibido
                                                    </MenuItem>
                                                    <MenuItem value="En la Forja">
                                                        <Handyman sx={{ fontSize: 16, mr: 1 }} /> En la Forja
                                                    </MenuItem>
                                                    <MenuItem value="Limpieza y Curado">
                                                        <CleaningServices sx={{ fontSize: 16, mr: 1 }} />{" "}
                                                        Limpieza y Curado
                                                    </MenuItem>
                                                    <MenuItem value="Enviado">
                                                        <LocalShipping sx={{ fontSize: 16, mr: 1 }} /> Enviado
                                                    </MenuItem>
                                                    <MenuItem value="Cancelado">
                                                        <Close sx={{ fontSize: 16, mr: 1 }} /> Cancelado
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setExpandedOrderId(
                                                        expandedOrderId === order.id ? null : order.id,
                                                    );
                                                }}
                                                sx={{ color: "secondary.main" }}
                                            >
                                                {expandedOrderId === order.id ? (
                                                    <KeyboardArrowUp />
                                                ) : (
                                                    <KeyboardArrowDown />
                                                )}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteOrder(order.id);
                                                }}
                                                sx={{
                                                    color: "error.main",
                                                    "&:hover": {
                                                        bgcolor: (t) => alpha(t.palette.error.main, 0.1),
                                                    },
                                                }}
                                                title="Romper Pacto (Eliminar)"
                                            >
                                                <DeleteForever />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={8} sx={{ p: 0, border: 0 }}>
                                            <Collapse
                                                in={expandedOrderId === order.id}
                                                timeout="auto"
                                                unmountOnExit
                                            >
                                                <Paper
                                                    sx={{
                                                        m: 2,
                                                        p: 3,
                                                        bgcolor: (t) => alpha(t.palette.background.default, 0.8),
                                                        border: 1,
                                                        borderColor: (t) => alpha(t.palette.secondary.main, 0.2),
                                                        borderRadius: 2,
                                                    }}
                                                >
                                                    <Grid container spacing={3}>
                                                        {/* Customer Info */}
                                                        <Grid size={{ xs: 12, md: 6 }}>
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    color: "secondary.main",
                                                                    fontWeight: "bold",
                                                                    mb: 2,
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: 1,
                                                                }}
                                                            >
                                                                Información del Aventurero
                                                            </Typography>
                                                            <Stack spacing={2}>
                                                                <Box>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: "grey.500",
                                                                            textTransform: "uppercase",
                                                                            letterSpacing: 1,
                                                                        }}
                                                                    >
                                                                        Número de Pacto
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body1"
                                                                        sx={{
                                                                            color: "common.white",
                                                                            fontWeight: "bold",
                                                                            fontFamily: "monospace",
                                                                        }}
                                                                    >
                                                                        #{order.contract_number || order.id.slice(0, 8)}
                                                                    </Typography>
                                                                </Box>
                                                                <Box>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: "grey.500",
                                                                            textTransform: "uppercase",
                                                                            letterSpacing: 1,
                                                                        }}
                                                                    >
                                                                        Nombre
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body1"
                                                                        sx={{ color: "common.white" }}
                                                                    >
                                                                        {order.customer_name || "N/A"}
                                                                    </Typography>
                                                                </Box>
                                                                <Box>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: "grey.500",
                                                                            textTransform: "uppercase",
                                                                            letterSpacing: 1,
                                                                        }}
                                                                    >
                                                                        Email
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body1"
                                                                        sx={{ color: "common.white" }}
                                                                    >
                                                                        {order.customer_email || "N/A"}
                                                                    </Typography>
                                                                </Box>
                                                                <Box>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: "grey.500",
                                                                            textTransform: "uppercase",
                                                                            letterSpacing: 1,
                                                                        }}
                                                                    >
                                                                        Teléfono
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body1"
                                                                        sx={{ color: "common.white" }}
                                                                    >
                                                                        {order.customer_phone || order.phone || "N/A"}
                                                                    </Typography>
                                                                </Box>
                                                                <Box>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: "grey.500",
                                                                            textTransform: "uppercase",
                                                                            letterSpacing: 1,
                                                                        }}
                                                                    >
                                                                        DNI
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body1"
                                                                        sx={{ color: "common.white" }}
                                                                    >
                                                                        {order.customer_dni || "N/A"}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                        </Grid>

                                                        {/* Shipping Info */}
                                                        <Grid size={{ xs: 12, md: 6 }}>
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    color: "secondary.main",
                                                                    fontWeight: "bold",
                                                                    mb: 2,
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: 1,
                                                                }}
                                                            >
                                                                Dirección de Envío
                                                            </Typography>
                                                            <Paper
                                                                sx={{
                                                                    p: 2,
                                                                    bgcolor: (t) => alpha(t.palette.common.black, 0.3),
                                                                    border: 1,
                                                                    borderColor: (t) =>
                                                                        alpha(t.palette.secondary.main, 0.1),
                                                                    borderRadius: 1,
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="body1"
                                                                    sx={{
                                                                        color: "common.white",
                                                                        whiteSpace: "pre-wrap",
                                                                    }}
                                                                >
                                                                    {order.shipping_address ||
                                                                        "Sin dirección registrada"}
                                                                </Typography>
                                                            </Paper>

                                                            <Box sx={{ mt: 3 }}>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: "grey.500",
                                                                        textTransform: "uppercase",
                                                                        letterSpacing: 1,
                                                                    }}
                                                                >
                                                                    Fecha del Pedido
                                                                </Typography>
                                                                <Typography
                                                                    variant="body1"
                                                                    sx={{ color: "common.white" }}
                                                                >
                                                                    {new Date(order.created_at).toLocaleString(
                                                                        "es-ES",
                                                                        {
                                                                            dateStyle: "full",
                                                                            timeStyle: "short",
                                                                        },
                                                                    )}
                                                                </Typography>
                                                            </Box>

                                                            <Box sx={{ mt: 2 }}>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: "grey.500",
                                                                        textTransform: "uppercase",
                                                                        letterSpacing: 1,
                                                                    }}
                                                                >
                                                                    Total
                                                                </Typography>
                                                                <Typography
                                                                    variant="h5"
                                                                    sx={{
                                                                        color: "secondary.main",
                                                                        fontWeight: "bold",
                                                                    }}
                                                                >
                                                                    {formatCurrencyDecimal(order.total_gp)}
                                                                </Typography>
                                                            </Box>

                                                            <Box sx={{ mt: 2 }}>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: "grey.500",
                                                                        textTransform: "uppercase",
                                                                        letterSpacing: 1,
                                                                    }}
                                                                >
                                                                    Estado Actual
                                                                </Typography>
                                                                <Chip
                                                                    label={order.status}
                                                                    size="small"
                                                                    sx={{
                                                                        ml: 1,
                                                                        bgcolor: (theme) => {
                                                                            switch (order.status) {
                                                                                case "Enviado":
                                                                                    return alpha(
                                                                                        theme.palette.success.main,
                                                                                        0.2,
                                                                                    );
                                                                                case "En la Forja":
                                                                                    return alpha(
                                                                                        theme.palette.warning.main,
                                                                                        0.2,
                                                                                    );
                                                                                case "Limpieza y Curado":
                                                                                    return alpha(
                                                                                        theme.palette.info.main,
                                                                                        0.2,
                                                                                    );
                                                                                case "Recibido":
                                                                                    return alpha(
                                                                                        theme.palette.grey[500],
                                                                                        0.2,
                                                                                    );
                                                                                case "Cancelado":
                                                                                    return alpha(
                                                                                        theme.palette.error.main,
                                                                                        0.2,
                                                                                    );
                                                                                default:
                                                                                    return "transparent";
                                                                            }
                                                                        },
                                                                        color: (theme) => {
                                                                            switch (order.status) {
                                                                                case "Enviado":
                                                                                    return theme.palette.success.main;
                                                                                case "En la Forja":
                                                                                    return theme.palette.warning.main;
                                                                                case "Limpieza y Curado":
                                                                                    return theme.palette.info.main;
                                                                                case "Recibido":
                                                                                    return theme.palette.grey[400];
                                                                                case "Cancelado":
                                                                                    return theme.palette.error.main;
                                                                                default:
                                                                                    return "inherit";
                                                                            }
                                                                        },
                                                                        fontWeight: "bold",
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Grid>

                                                        {/* Items List */}
                                                        <Grid size={{ xs: 12 }}>
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    color: "secondary.main",
                                                                    fontWeight: "bold",
                                                                    mb: 2,
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: 1,
                                                                }}
                                                            >
                                                                Items del Pedido
                                                            </Typography>
                                                            <Stack spacing={2}>
                                                                {order.order_items?.map((item: any, i: number) => (
                                                                    <Paper
                                                                        key={i}
                                                                        sx={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: 2,
                                                                            p: 2,
                                                                            bgcolor: (t) =>
                                                                                alpha(t.palette.common.black, 0.2),
                                                                            border: 1,
                                                                            borderColor: (t) =>
                                                                                alpha(t.palette.secondary.main, 0.1),
                                                                            borderRadius: 1,
                                                                        }}
                                                                    >
                                                                        <Box
                                                                            component="img"
                                                                            src={
                                                                                item.image_url ||
                                                                                "https://via.placeholder.com/80?text=No+Img"
                                                                            }
                                                                            alt={item.name}
                                                                            sx={{
                                                                                width: 80,
                                                                                height: 80,
                                                                                objectFit: "cover",
                                                                                borderRadius: 1,
                                                                                border: 1,
                                                                                borderColor: (t) =>
                                                                                    alpha(t.palette.secondary.main, 0.2),
                                                                            }}
                                                                        />
                                                                        <Box sx={{ flex: 1 }}>
                                                                            <Typography
                                                                                variant="body1"
                                                                                sx={{
                                                                                    color: "common.white",
                                                                                    fontWeight: "bold",
                                                                                }}
                                                                            >
                                                                                {item.name}
                                                                            </Typography>
                                                                            <Typography
                                                                                variant="caption"
                                                                                sx={{ color: "grey.500" }}
                                                                            >
                                                                                Cantidad: {item.quantity}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography
                                                                            variant="body1"
                                                                            sx={{
                                                                                color: "secondary.main",
                                                                                fontWeight: "bold",
                                                                            }}
                                                                        >
                                                                            {formatCurrencyDecimal(
                                                                                (item.unit_price || 0) * item.quantity,
                                                                            )}
                                                                        </Typography>
                                                                    </Paper>
                                                                ))}
                                                            </Stack>
                                                        </Grid>

                                                        {/* Admin Notes */}
                                                        <Grid size={{ xs: 12 }}>
                                                            <Typography
                                                                variant="h6"
                                                                sx={{
                                                                    color: "secondary.main",
                                                                    fontWeight: "bold",
                                                                    mb: 2,
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: 1,
                                                                }}
                                                            >
                                                                Notas del Administrador
                                                            </Typography>
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                rows={3}
                                                                placeholder="Añade notas internas sobre este pedido..."
                                                                defaultValue={order.admin_notes || ""}
                                                                onBlur={(e) =>
                                                                    handleUpdateAdminNotes(order.id, e.target.value)
                                                                }
                                                                sx={{
                                                                    "& .MuiOutlinedInput-root": {
                                                                        bgcolor: (t) =>
                                                                            alpha(t.palette.common.black, 0.2),
                                                                        "& fieldset": {
                                                                            borderColor: (t) =>
                                                                                alpha(t.palette.secondary.main, 0.2),
                                                                        },
                                                                        "&:hover fieldset": {
                                                                            borderColor: "secondary.main",
                                                                        },
                                                                    },
                                                                }}
                                                            />
                                                        </Grid>

                                                        {/* Action Buttons */}
                                                        <Grid size={{ xs: 12 }}>
                                                            <Stack
                                                                direction="row"
                                                                spacing={2}
                                                                justifyContent="flex-end"
                                                            >
                                                                <Button
                                                                    variant="outlined"
                                                                    color="success"
                                                                    startIcon={<WhatsApp />}
                                                                    onClick={() => handleSendWhatsApp(order)}
                                                                    sx={{
                                                                        borderColor: (t) =>
                                                                            alpha(t.palette.success.main, 0.4),
                                                                        "&:hover": {
                                                                            bgcolor: (t) =>
                                                                                alpha(t.palette.success.main, 0.1),
                                                                        },
                                                                    }}
                                                                >
                                                                    Enviar WhatsApp
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    color="secondary"
                                                                    startIcon={<Print />}
                                                                    onClick={() => handlePrintOrder(order)}
                                                                >
                                                                    Imprimir
                                                                </Button>
                                                            </Stack>
                                                        </Grid>
                                                    </Grid>
                                                </Paper>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                            {allOrders.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        sx={{
                                            textAlign: "center",
                                            py: 6,
                                            color: "grey.600",
                                            fontStyle: "italic",
                                        }}
                                    >
                                        No hay requisiciones inscritas en el libro.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};
