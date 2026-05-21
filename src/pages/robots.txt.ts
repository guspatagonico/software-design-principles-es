import type { APIRoute } from 'astro';

const rules = `# ===== AI Crawlers — OpenAI =====
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: OAI-SearchBot
Allow: /

# ===== AI Crawlers — Anthropic =====
User-agent: Claude-Web
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: Claude-SearchBot
Allow: /

# ===== AI Crawlers — Perplexity =====
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-Http-Client
Allow: /

# ===== AI Crawlers — Google =====
User-agent: Google-Extended
Allow: /
User-agent: GoogleOther
Allow: /
User-agent: GoogleOther-Image
Allow: /
User-agent: GoogleOther-Video
Allow: /
User-agent: Google-Safety
Allow: /

# ===== AI Crawlers — Microsoft =====
User-agent: BingPreview
Allow: /

# ===== AI Crawlers — Apple =====
User-agent: Applebot
Allow: /

# ===== AI Crawlers — Meta =====
User-agent: meta-externalagent
Allow: /

# ===== AI Crawlers — Mistral =====
User-agent: MistralAI-User
Allow: /
User-agent: MistralBot
Allow: /

# ===== AI Crawlers — DeepSeek =====
User-agent: DeepSeekBot
Allow: /
User-agent: DeepSeek-Chat
Allow: /

# ===== AI Crawlers — Kimi / Moonshot =====
User-agent: MoonshotBot
Allow: /

# ===== AI Crawlers — MiniMax =====
User-agent: MiniMaxBot
Allow: /

# ===== AI Crawlers — ByteDance =====
User-agent: Bytespider
Allow: /

# ===== AI Crawlers — DuckDuckGo =====
User-agent: DuckAssistBot
Allow: /

# ===== AI Crawlers — Cohere =====
User-agent: cohere-training-data-web
Allow: /

# ===== AI Crawlers — Amazon =====
User-agent: Amazonbot
Allow: /

# ===== AI Crawlers — Common Crawl =====
User-agent: CCBot
Allow: /

# ===== Search Crawlers — Baidu / China =====
User-agent: Baiduspider
Allow: /
User-agent: Sogou
Allow: /
User-agent: YisouSpider
Allow: /
User-agent: 360Spider
Allow: /
User-agent: HaosouSpider
Allow: /
User-agent: YoudaoBot
Allow: /

# ===== Search Crawlers — General =====
User-agent: TencentTraveler
Allow: /
User-agent: QihooBot
Allow: /
User-agent: SeznamBot
Allow: /
User-agent: Naverbot
Allow: /

# ===== Todos los demás crawlers =====
User-agent: *
Allow: /
`;

export const GET: APIRoute = ({ site }) => {
	const sitemapUrl = site ? `${site}sitemap-index.xml` : '';
	const body = rules + `Sitemap: ${sitemapUrl}\n`;
	return new Response(body, {
		headers: { 'Content-Type': 'text/plain' },
	});
};
