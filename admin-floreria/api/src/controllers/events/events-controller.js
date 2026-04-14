const { orderEvents } = require('../../events/orderEvents');

exports.EventsOrderStream = (req, res) => {
  // Seguridad básica: podría agregarse auth si la ruta padre ya la aplica
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // Desactivar compresión si algún middleware la habilitó (por si acaso)
  if (res.flushHeaders) {
    res.flushHeaders();
  }
  // CORS para credenciales ya lo maneja el middleware global

  // Enviar un evento inicial opcional
  res.write(`event: ready\n`);
  res.write(`data: {"ok":true}\n\n`);

  const onCreated = (order) => {
    res.write(`event: order.created\n`);
    res.write(`data: ${JSON.stringify(order)}\n\n`);
  };
  const onStatusUpdated = (payload) => {
    res.write(`event: order.status.updated\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };
  const onDeleted = (payload) => {
    res.write(`event: order.deleted\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  orderEvents.on("order.created", onCreated);
  orderEvents.on("order.status.updated", onStatusUpdated);
  orderEvents.on("order.deleted", onDeleted);

  // Heartbeat para mantener viva la conexión (cada 25s)
  const heartbeat = setInterval(() => {
    res.write(`:ping\n\n`); // Comentario SSE (no visible para cliente)
  }, 25000);

  const cleanup = () => {
    clearInterval(heartbeat);
    orderEvents.removeListener("order.created", onCreated);
    orderEvents.removeListener("order.status.updated", onStatusUpdated);
    orderEvents.removeListener("order.deleted", onDeleted);
    try { res.end(); } catch {}
  };

  req.on("close", cleanup);
  req.on("error", cleanup);
};
