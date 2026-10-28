const express = require("express");
const supabase = require("../supabase");
const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from("destinations")
      .select("id, name, slug, country, category, description, long_description, price_from, duration_days")
      .eq("is_active", true).order("display_order", { ascending: true }).order("name");
    if (error) throw error;
    res.json({ destinations: data });
  } catch (error) { next(error); }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("destinations")
      .select("id, name, slug, country, category, description, long_description, price_from, duration_days")
      .eq("slug", req.params.slug).eq("is_active", true).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Destination not found." });
    res.json({ destination: data });
  } catch (error) { next(error); }
});

module.exports = { router };
