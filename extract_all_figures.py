"""
Extract actual page images (full page renders) from the Kotler PDF
for all 49 identified figure pages, saving them as high-quality JPEGs.
"""
from pypdf import PdfReader
from PIL import Image
import io, os, re

OUTPUT_DIR = r"d:\marketing masterclass\images\textbook"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Figure map: key -> (page_index_0based, filename, chapter, description)
FIGURES = [
    (29,  "fig_1_1_marketing_process",        1, "A Simple Model of the Marketing Process"),
    (72,  "fig_2_1_company_strategy",          2, "Company-Wide Strategic Planning"),
    (75,  "fig_2_2_bcg_matrix",                2, "BCG Growth-Share Matrix"),
    (77,  "fig_2_3_ansoff_grid",               2, "Product/Market Expansion Grid"),
    (82,  "fig_2_4_marketing_mix",             2, "The Marketing Mix: The 4Ps"),
    (107, "fig_3_1_micromacroenvironment",     3, "Micro and Macro Marketing Environment"),
    (120, "fig_3_2_demographic_trends",        3, "Demographic and Trend Forces"),
    (147, "fig_4_1_marketing_information",     4, "Marketing Information System"),
    (154, "fig_4_2_research_approaches",       4, "Marketing Research Approaches"),
    (182, "fig_5_1_buyer_behavior_model",      5, "Model of Consumer Buyer Behavior"),
    (185, "fig_5_2_consumer_factors",          5, "Factors Influencing Consumer Behavior"),
    (202, "fig_5_3_buyer_decision_process",    5, "Buyer Decision Process 5 Steps"),
    (209, "fig_5_4_new_product_adoption",      5, "Buyer Decision Process for New Products"),
    (217, "fig_5_5_business_buyer_behavior",   5, "Business Buyer Behavior"),
    (235, "fig_6_1_stp_steps",                 6, "Steps in Segmentation Targeting Positioning"),
    (249, "fig_6_2_targeting_strategies",      6, "Market Targeting Coverage Strategies"),
    (253, "fig_6_3_perceptual_map",            6, "Perceptual Positioning Map"),
    (276, "fig_7_1_product_classification",    7, "Product and Service Classifications"),
    (285, "fig_7_2_product_levels",            7, "Three Levels of Product"),
    (289, "fig_7_3_brand_equity",              7, "Brand Equity Model"),
    (296, "fig_7_4_packaging_decisions",       7, "Packaging and Labeling Decisions"),
    (319, "fig_8_1_npd_stages",                8, "Major Stages in New Product Development"),
    (336, "fig_8_2_product_life_cycle",        8, "Product Life Cycle Stages"),
    (336, "fig_8_3_plc_sales_profits",         8, "Sales and Profits Over Product Life Cycle"),
    (360, "fig_9_1_pricing_factors",           9, "Factors to Consider When Setting Prices"),
    (362, "fig_9_2_three_cs_pricing",          9, "The Three Cs Model for Price Setting"),
    (363, "fig_9_3_cost_types",                9, "Major Types of Costs at Different Production Levels"),
    (370, "fig_9_4_demand_curve",              9, "The Demand Curve and Price-Demand Relationship"),
    (375, "fig_9_5_demand_costs_supply",       9, "Demand, Costs, and Supply Pricing Decisions"),
    (407, "fig_10_1_price_adjustments",       10, "Price-Adjustment Strategies"),
    (420, "fig_10_2_product_mix_pricing",     10, "Product Mix Pricing Strategies"),
    (437, "fig_11_1_channel_transactions",    11, "How a Distributor Reduces Channel Transactions"),
    (439, "fig_11_2_marketing_channels",      11, "Consumer and Business Marketing Channels"),
    (451, "fig_11_3_channel_organization",    11, "Channel Behavior and Organization"),
    (478, "fig_12_1_retailer_decisions",      12, "Retailer Marketing Decisions"),
    (489, "fig_12_2_wholesaling_types",       12, "Types of Wholesalers"),
    (509, "fig_13_1_communication_process",   13, "Elements in the Communication Process"),
    (513, "fig_13_2_communication_steps",     13, "Steps in Developing Effective Marketing Communication"),
    (527, "fig_13_3_promotion_mix",           13, "The Promotion Mix"),
    (546, "fig_14_1_advertising_decisions",   14, "Major Advertising Decisions"),
    (553, "fig_14_2_promotion_budget",        14, "Setting the Total Promotion Budget"),
    (557, "fig_14_3_pr_tools",               14, "Public Relations Tools"),
    (587, "fig_15_1_sales_force_management", 15, "Managing the Sales Force"),
    (599, "fig_15_2_sales_process",          15, "Personal Selling Process"),
    (606, "fig_15_3_sales_promotion",        15, "Sales Promotion Objectives"),
    (628, "fig_16_1_digital_tools",          16, "Digital and Social Media Marketing Tools"),
    (655, "fig_17_1_international_system",   17, "International Marketing System"),
    (659, "fig_17_2_market_entry",           17, "Global Market Entry Strategies"),
    (666, "fig_17_3_global_programs",        17, "Global Marketing Program Decisions"),
    (702, "fig_18_1_sustainable_marketing",  18, "Sustainable Marketing: Social Criticisms"),
]

reader = PdfReader(r'D:\mktg books\Kotler-and-Armstrong-Principles-of-Marketing.pdf')
total = len(reader.pages)

print(f"PDF has {total} pages. Extracting images from {len(FIGURES)} figure pages...\n")

results = []
for (page_idx, fname, chapter, desc) in FIGURES:
    if page_idx >= total:
        print(f"  [SKIP] Page {page_idx+1} exceeds PDF length.")
        continue
    
    page = reader.pages[page_idx]
    images = page.images
    
    if not images:
        print(f"  [NONE] Page {page_idx+1} - No embedded images for: {fname}")
        results.append({'fname': fname, 'chapter': chapter, 'desc': desc, 'status': 'no_image', 'count': 0})
        continue
    
    # Pick the largest image by byte size (most likely to be the main figure)
    best = max(images, key=lambda img: len(img.data))
    
    ext = 'jpg'
    if best.name.lower().endswith('.png'):
        ext = 'png'
    
    out_path = os.path.join(OUTPUT_DIR, f"{fname}.{ext}")
    with open(out_path, 'wb') as f:
        f.write(best.data)
    
    print(f"  [OK] Ch{chapter} | Page {page_idx+1} | {fname}.{ext} ({len(best.data)//1024}KB) - {len(images)} images on page")
    results.append({'fname': fname, 'chapter': chapter, 'desc': desc, 'status': 'saved', 'count': len(images), 'ext': ext})

print(f"\n=== EXTRACTION COMPLETE ===")
saved = sum(1 for r in results if r['status'] == 'saved')
print(f"Saved: {saved}/{len(FIGURES)} figures")

# Print JS database snippet
print("\n\n=== PASTE THIS INTO app.js textbookVisualsMap ===")
by_chapter = {}
for r in results:
    if r['status'] == 'saved':
        ch = r['chapter']
        if ch not in by_chapter:
            by_chapter[ch] = []
        by_chapter[ch].append(r)

for ch in sorted(by_chapter.keys()):
    print(f"  {ch}: [")
    for r in by_chapter[ch]:
        ext = r.get('ext', 'jpg')
        print(f"    {{ file: 'textbook/{r[\"fname\"]}.{ext}', title: 'Figure: {r[\"desc\"]}', caption: '{r[\"desc\"]}' }},")
    print(f"  ],")
