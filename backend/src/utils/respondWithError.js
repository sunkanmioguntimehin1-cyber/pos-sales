/**
 * Every controller's catch block funnels through here so that client-caused
 * errors are reported with an accurate status code instead of a blanket 500.
 * Without this, a malformed :id in the URL surfaces as "Internal server error".
 */
export function respondWithError(res, error, { context, message }) {
  // Malformed ObjectId in a path param or body.
  if (error?.name === 'CastError') {
    res.status(400).json({ error: `Invalid value for "${error.path}": ${error.value}` });
    return;
  }

  // Schema constraint failed (required field, bad enum, negative min, ...).
  if (error?.name === 'ValidationError') {
    res.status(400).json({ error: error.message });
    return;
  }

  // Unique index violation (e.g. duplicate email / order number).
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern ?? {})[0] ?? 'field';
    res.status(409).json({ error: `A record with that ${field} already exists` });
    return;
  }

  if (error?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Payload too large' });
    return;
  }

  console.error(`${context}:`, error);
  res.status(500).json({ error: message });
}
