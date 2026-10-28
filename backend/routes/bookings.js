const express = require("express");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const supabase = require("../supabase");
const router = express.Router();

const bookingLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 8, message: { error: "Too many trip requests. Please try again later." }, standardHeaders: "draft-7", legacyHeaders: false });
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/", bookingLimiter, async (req, res, next) => {
  try {
    const { name, email, destination_id, travel_date, travellers, notes = "" } = req.body || {};
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100)
      return res.status(400).json({ error: "Enter a name between 2 and 100 characters." });
    if (typeof email !== "string" || email.length > 254 || !emailPattern.test(email.trim()))
      return res.status(400).json({ error: "Enter a valid email address." });
    if (typeof destination_id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(destination_id))
      return res.status(400).json({ error: "Choose a valid destination." });
    if (typeof travel_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(travel_date) || !Number.isFinite(Date.parse(`${travel_date}T00:00:00Z`)) || travel_date < new Date().toISOString().slice(0,10))
      return res.status(400).json({ error: "Choose a valid future departure date." });
    if (!Number.isInteger(Number(travellers)) || Number(travellers) < 1 || Number(travellers) > 10)
      return res.status(400).json({ error: "Travellers must be between 1 and 10." });
    if (typeof notes !== "string" || notes.length > 1000)
      return res.status(400).json({ error: "Notes must be 1,000 characters or fewer." });

    const { data: destination, error: destinationError } = await supabase.from("destinations")
      .select("id").eq("id", destination_id).eq("is_active", true).maybeSingle();
    if (destinationError) throw destinationError;
    if (!destination) return res.status(400).json({ error: "That destination is currently unavailable." });

    const reference = `TT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const { data, error } = await supabase.from("bookings").insert({
      reference, customer_name: name.trim(), customer_email: email.trim().toLowerCase(),
      destination_id, travel_date, travellers: Number(travellers), notes: notes.trim() || null
    }).select("reference, status, created_at").single();
    if (error) throw error;
    res.status(201).json({ booking: data, message: "Trip request received." });
  } catch (error) { next(error); }
});

module.exports = { router };
