Remaining Features Tier 1: High-Impact / Low Effort | Feature | Description | |---------|-------------| | Competitor Profiles | Create
persistent competitor entities with name, website, category. Tag scrapes to competitors for organized tracking. | | Topic/Category Tagging |
Add tags like "pricing changes", "product launches", "partnerships", "hiring signals" to categorize insights. | | Export Options | PDF
export, PowerPoint-ready bullet points, or CSV for importing into internal tools/presentations. | Tier 2: Medium Effort / High Value |
Feature | Description | |---------|-------------| | Scheduled Monitoring | Set up recurring scrapes (daily/weekly) for specific competitor
URLs. Uses Convex cron jobs. | | Change Detection | Compare new scrape vs. previous scrape of same URL. Highlight what's new/different. | |
Digest/Newsletter Generation | Aggregate multiple scrapes into a weekly "Competitive Intelligence Brief" for stakeholders. | | Search &
Filter | Full-text search across all past summaries. Filter by date, competitor, topic. | Tier 3: Advanced / Higher Effort | Feature |
Description | |---------|-------------| | Trend Analysis Dashboard | Track mentions of topics over time. Visualize with charts: "Product X
mentioned 5x more in Q4". | | Alert System | Set up keyword triggers (e.g., "FDA approval", "acquisition") and get email/Slack
notifications. | | Team Collaboration | Share insights with team members, add comments, assign action items. | | Competitive Matrix View |
Side-by-side comparison of competitors on specific dimensions (pricing, features, etc.). | | RSS/News Feed Integration | Auto-ingest from
industry RSS feeds, news APIs (e.g., NewsAPI, Google Alerts). | | Custom Analysis Prompts | Save reusable prompt templates: "SWOT analysis",
"pricing comparison", "regulatory impact". |

---

Previously Discussed but Deferred | Feature | Description | |---------|-------------| | Team Sharing (Basic) | Generate shareable link to a
completed analysis. You mentioned "shareable link" as the preferred approach. | | Analysis Templates / Prompt Presets | You chose "preset
prompts only" (not custom). Would include: SWOT, Market Trend Summary, Executive Brief, etc. |

---

I want to talk through a variation of some of these combined into 1 - the ability to define "Competitors" as a group of Company titles (i.e.
"Veeva", "Medpace", etc...) and from there users can schedule daily/weekly scans that use web search to bring back relevant info for all the
combined companies. this scan can also comb through the data and create visualizations of trends, etc... does that sound useful?

---

Feature Concept: Competitor Monitoring & Trends Core Components

1. Competitor Profiles
   - Define companies by name (e.g., "Veeva", "IQVIA", "PPD")
   - Optional metadata: website, category, notes
   - Group competitors into watchlists (e.g., "Top 5 CROs", "Tech Disruptors")
2. Scheduled Scans
   - Daily/weekly automated web searches for each competitor
   - Uses OpenAI web search or a news API to find recent mentions
   - Aggregates results into a single analysis per scan
3. Trend Visualization
   - Track topics/themes over time across scans
   - Charts showing: mention frequency, sentiment shifts, topic emergence
   - Compare competitors side-by-side

---

Clarifying Questions

1. Data Source for Scans Currently you provide URLs manually. For automated scans, where should the data come from? (a) OpenAI web search
   only (let the LLM find relevant news/articles)  
   (b) Predefined RSS feeds or news sources per competitor  
   (c) Both - web search + optional curated sources  
   (d) Integration with a news API (e.g., NewsAPI, Google News)
2. Scan Scope When running a scheduled scan, should it: (a) Search for all competitors in a single combined analysis ("What's happening
   across these 5 companies?")  
   (b) Generate separate analyses per competitor, then aggregate  
   (c) User chooses per scan
3. Trend Data Points What should the system track over time for visualization?

- Sentiment (already extracted) - track positive/negative/neutral shifts
- Topic frequency (already extracted) - track which topics appear more/less
- Mention volume - how often each competitor appears in news
- Specific keywords - user-defined terms to watch (e.g., "FDA", "acquisition", "layoffs") Any others you'd want to see?

4. Visualization Needs What kind of charts/visualizations would be most useful?

- Line charts (sentiment over time, mention frequency)
- Bar charts (topic comparison across competitors)
- Heat maps (competitor vs. topic matrix)
- Simple tables with trend indicators (↑ ↓ →)

5. Alert Triggers Should certain conditions trigger notifications?

- Competitor sentiment drops significantly
- Specific keyword detected (e.g., "merger", "FDA approval")
- Unusual spike in mentions

---

Technical Considerations | Aspect | Consideration | |--------|---------------| | Convex Cron Jobs | Convex supports scheduled functions -
perfect for daily/weekly scans | | Data Storage | Need new tables: competitors, competitorGroups, scheduledScans, scanResults, trendData | |
Cost | Each scan = web search + LLM calls. Daily scans for 10 competitors = ~300 API calls/month | | Historical Data | How far back should
trend data be retained? 30 days? 90 days? Unlimited? |

---

Initial Reaction Yes, this sounds very useful - it transforms the tool from a "point-in-time analysis" tool into a continuous monitoring
system. The key value adds:

1. Proactive vs. Reactive - You don't have to remember to check; the system tells you when something matters
2. Trend Detection - Spot patterns humans miss (e.g., "Competitor X has been mentioned with 'AI' 3x more this month")
3. Executive-Ready Output - Weekly digests ready to share with leadership
