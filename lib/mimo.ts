import OpenAI from "openai";

export type Platform = "instagram" | "twitter" | "tiktok";
export type Tone = "casual" | "professional" | "funny" | "motivational" | "storytelling" | "genz" | "poetic" | "educational" | "promo";

export interface GenerateRequest {
  topic: string;
  platform: Platform;
  tone: Tone;
}

export interface GenerateResponse {
  caption: string;
  charCount: number;
  platform: Platform;
  tone: Tone;
}

if (!process.env.MIMO_API_KEY) {
  console.error("[MiMo] MIMO_API_KEY environment variable is not set");
}

const mimo = new OpenAI({
  apiKey: process.env.MIMO_API_KEY,
  baseURL: "https://token-plan-sgp.xiaomimimo.com/v1",
  timeout: 25000,
});

// Step 1: Expand short input into brief (concise, fast)
async function expandTopic(topic: string, platform: Platform, tone: Tone): Promise<string> {
  const platformLabel = PLATFORM_RULES[platform].label;

  const completion = await mimo.chat.completions.create({
    model: "mimo-v2.5",
    messages: [
      {
        role: "system",
        content: `Ubah input jadi brief caption ${platformLabel} singkat. Isi: topik, audience, hook, 2-3 poin kunci. Maksimal 150 kata. Bahasa Indonesia. Langsung brief, tanpa pembuka.`
      },
      {
        role: "user",
        content: topic,
      },
    ],
    max_completion_tokens: 3000,
    temperature: 0.7,
    top_p: 0.9,
    stream: false,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    console.warn("[MiMo] Empty expansion, using raw topic", { platform, tone, finishReason: completion.choices[0]?.finish_reason });
    return topic;
  }
  return content;
}

// Step 2: Generate caption from brief
async function generateFromBrief(brief: string, platform: Platform, tone: Tone): Promise<string> {
  const systemPrompt = getSystemPrompt(platform, tone);

  const completion = await mimo.chat.completions.create({
    model: "mimo-v2.5",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: brief },
    ],
    max_completion_tokens: 4000,
    temperature: 0.9,
    top_p: 0.95,
    stream: false,
  });

  const content = completion.choices[0]?.message?.content?.trim() || "";
  if (!content) {
    console.warn("[MiMo] Empty caption", { platform, tone, finishReason: completion.choices[0]?.finish_reason });
  }
  return content;
}

// Platform character limits
const CHAR_LIMITS: Record<Platform, number> = {
  instagram: 2200,
  twitter: 280,
  tiktok: 2200,
};

// Count grapheme clusters (handles emoji correctly)
function countGraphemes(text: string): number {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return [...segmenter.segment(text)].length;
  }
  return text.length;
}

// Truncate caption at grapheme boundary (handles emoji, ZWJ sequences correctly)
function truncateAtGrapheme(text: string, limit: number): string {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const segments = [...segmenter.segment(text)];
    if (segments.length <= limit) return text;
    return segments.slice(0, limit).map(s => s.segment).join("");
  }
  return text.substring(0, limit);
}

// Truncate caption at natural break point (grapheme-aware)
function truncateCaption(text: string, limit: number): string {
  if (countGraphemes(text) <= limit) return text;

  const truncated = truncateAtGrapheme(text, limit);
  const lastPeriod = Math.max(
    truncated.lastIndexOf(". "),
    truncated.lastIndexOf("! "),
    truncated.lastIndexOf("? "),
    truncated.lastIndexOf("\n")
  );

  if (lastPeriod > limit * 0.5) {
    return truncated.substring(0, lastPeriod + 1).trim();
  }

  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > limit * 0.5) {
    return truncated.substring(0, lastSpace).trim() + "...";
  }

  return truncated.trim() + "...";
}

// Check if input is already detailed enough to skip prompt chaining
function isDetailedInput(topic: string): boolean {
  const wordCount = topic.trim().split(/\s+/).length;
  const charCount = topic.trim().length;
  const hasMultipleSentences = topic.includes("\n") && /[.!?]/.test(topic);
  return charCount > 100 || wordCount > 15 || hasMultipleSentences;
}

// Main function: smart prompt chaining (skip if input is detailed)
export async function generateCaption(req: GenerateRequest): Promise<GenerateResponse> {
  let brief: string;
  const needsExpansion = !isDetailedInput(req.topic);

  if (needsExpansion) {
    brief = await expandTopic(req.topic, req.platform, req.tone);
  } else {
    brief = req.topic;
  }

  let caption = await generateFromBrief(brief, req.platform, req.tone);

  // Retry only if caption is empty (not for short captions — model may have refused)
  if (!caption) {
    caption = await generateFromBrief(brief, req.platform, req.tone);
  }

  const limit = CHAR_LIMITS[req.platform];
  caption = truncateCaption(caption, limit);

  return {
    caption,
    charCount: countGraphemes(caption),
    platform: req.platform,
    tone: req.tone,
  };
}

// Streaming version: yields caption chunks as they arrive
export async function* generateCaptionStream(
  req: GenerateRequest
): AsyncGenerator<{ type: "brief" | "chunk" | "done"; content: string; charCount?: number }> {
  let brief: string;
  const needsExpansion = !isDetailedInput(req.topic);

  if (needsExpansion) {
    brief = await expandTopic(req.topic, req.platform, req.tone);
  } else {
    brief = req.topic;
  }

  yield { type: "brief", content: needsExpansion ? brief : "" };

  // Stream the caption generation
  const systemPrompt = getSystemPrompt(req.platform, req.tone);
  const stream = await mimo.chat.completions.create({
    model: "mimo-v2.5",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: brief },
    ],
    max_completion_tokens: 4000,
    temperature: 0.9,
    top_p: 0.95,
    stream: true,
  });

  let fullCaption = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      fullCaption += delta;
      yield { type: "chunk", content: delta };
    }
  }

  // Fallback: if streaming returned empty caption, retry with non-streaming
  if (!fullCaption.trim()) {
    console.warn("[MiMo] Streaming empty, retrying non-streaming", { platform: req.platform, tone: req.tone });
    const retryCaption = await generateFromBrief(brief, req.platform, req.tone);
    if (retryCaption.trim()) {
      fullCaption = retryCaption;
    }
  }

  // Post-process: enforce character limit
  const limit = CHAR_LIMITS[req.platform];
  const finalCaption = truncateCaption(fullCaption.trim(), limit);

  yield {
    type: "done",
    content: finalCaption,
    charCount: countGraphemes(finalCaption),
  };
}

function getSystemPrompt(platform: Platform, tone: Tone): string {
  const platformRules = PLATFORM_RULES[platform];
  const toneGuide = TONE_GUIDES[tone];

  return `Bikin caption ${platformRules.label} dari brief. Bahasa Indonesia natural.

${platformRules.rules}

Gaya: ${toneGuide}

Langsung caption aja. Jangan pake penjelasan atau "Berikut caption:".`
}

const PLATFORM_RULES: Record<Platform, { label: string; rules: string }> = {
  instagram: {
    label: "Instagram",
    rules: `Maks 2200 karakter. 3-5 hashtag di akhir. Line breaks untuk readability. CTA (comment/share/save).`,
  },
  twitter: {
    label: "Twitter/X",
    rules: `MAKS 280 KARAKTER. 1-3 kalimat. 1-2 hashtag. 1 emoji max. Singkat dan impactful.`,
  },
  tiktok: {
    label: "TikTok",
    rules: `Maks 2200 karakter. Hook kuat di kalimat pertama. Bahasa gaul. 3-5 hashtag. Ajak comment/follow.`,
  },
};

const TONE_GUIDES: Record<Tone, string> = {
  casual: "Santai, friendly, bahasa sehari-hari.",
  professional: "Formal tapi approachable. Cocok untuk brand/bisnis.",
  funny: "Lucu, kocak, bikin senyum. Boleh punchline/wordplay.",
  motivational: "Inspiratif, memotivasi, mengangkat semangat.",
  storytelling: "Naratif, bikin penasaran dari awal sampai akhir.",
  genz: "Bahasa gaul Indonesia. Singkatan (gk, bgt), slang tren. Santai dan relatable.",
  poetic: "Puitis, diksi indah, metafora. Cocok untuk konten emosional.",
  educational: "Informatif, terstruktur, mudah dipahami. Boleh numbering/bullet.",
  promo: "CTA kuat, urgency, highlight benefit. Untuk diskon/promo/launch.",
};
