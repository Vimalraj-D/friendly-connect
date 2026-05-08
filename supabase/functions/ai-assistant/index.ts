import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Pull catalog snapshot to ground recommendations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: products } = await supabase
      .from("products")
      .select("id, name, price, original_price, stock, featured, description, category:categories(name)")
      .eq("is_active", true)
      .limit(60);

    const catalog = (products || []).map((p: any) =>
      `- [${p.id}] ${p.name} | ${p.category?.name ?? "Uncategorized"} | ₹${p.price}${p.original_price ? ` (was ₹${p.original_price})` : ""} | stock:${p.stock}${p.featured ? " | FEATURED" : ""}${p.description ? ` — ${String(p.description).slice(0, 120)}` : ""}`,
    ).join("\n");

    const systemPrompt = `You are GIGI, the AI shopping assistant for Garnish & Giggles — a futuristic store selling kids wear, chef wearables, and kitchen essentials.

Your tone: warm, concise, slightly playful, futuristic. Use short paragraphs and bullet lists. Use markdown.

When recommending, ALWAYS pick from the live catalog below and reference products by their exact name. If asked for a link, format as: [Product Name](/products/PRODUCT_ID). Never invent products. If nothing matches, say so and suggest a category to browse.

LIVE CATALOG:
${catalog || "(catalog empty)"}
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});