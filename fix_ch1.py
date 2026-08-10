import re

with open('data/chapter_01.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace first principles
old_fp = r'statement: "The Core Law of Exchange.*?\n\s+explanation: "First-principles thinking.*?"'
new_fp = '''statement: "The Core Law of Exchange: Value must be created and delivered to the customer before value can be captured from the customer.",
    explanation: "First-principles thinking reveals that marketing is not selling or advertising; it is a system of value creation. You cannot sustainably extract profits (capture value) from a market without first establishing a positive value delta—where the customer perceives the benefit of your offering as higher than the cost of exchange. According to Philip Kotler, marketing is defined as 'the process by which companies create value for customers and build strong customer relationships in order to capture value from customers in return.' This twofold goal underscores that modern marketing is a matching process between what the firm can produce and what the market demands, guided by an understanding of customer needs. When a firm obsesses over product creation rather than customer creation, it falls victim to marketing myopia, eventually losing relevance as the market evolves beyond its static offering. True value creation requires a deep empathy for the customer's world, an ability to translate that empathy into superior market offerings, and the discipline to consistently deliver on those promises."'''
text = re.sub(old_fp, new_fp, text, flags=re.DOTALL)

# Expand Intuition
old_int = r'analogy: "Marketing is not hunting.*?\n\s+story: "Red Bull does not simply.*?"'
new_int = '''analogy: "Marketing is not hunting; it is farming. A hunter seeks a one-time transaction (the kill), focusing only on the short-term conversion with no regard for the ecosystem's future sustainability. A farmer, conversely, prepares the soil (market research), selects high-yielding seeds (product development), nurtures the plants daily (relationship building), protects them from pests (competitor defense), and is rewarded with a perpetual harvest year after year (customer lifetime value). The farmer understands that the harvest is the *result* of the process, not the starting point.",
    story: "Red Bull does not simply market energy drinks. They sell extreme lifestyles, energy, and human potential. By sponsoring the Stratos space-jump where Felix Baumgartner jumped from the stratosphere, hosting extreme sports events like the Air Race, and creating their own massive media house, they create an engaging universe of value for their young, active audience. They build relationships and community first, allowing them to charge a premium of + per can for what is fundamentally carbonated sugar water. This illustrates the transition from a 'make and sell' philosophy to a 'sense and respond' philosophy, fundamentally embedding the brand into the cultural fabric of their target market."'''
text = re.sub(old_int, new_int, text, flags=re.DOTALL)

# Expand definitions and add visuals
old_def = r'definitions:\s*\[(.*?)\]'
new_def = '''definitions: [
    { term: "Marketing", definition: "The process by which companies engage customers, build strong customer relationships, and create customer value in order to capture value from customers in return. It is a social and managerial process by which individuals and organizations obtain what they need and want through creating and exchanging value with others.", source: "Principles of Marketing, 17th Ed.", visual: "<i class='fas fa-chart-line'></i>" },
    { term: "Needs", definition: "States of felt deprivation. They include basic physical needs for food, clothing, warmth, and safety; social needs for belonging and affection; and individual needs for knowledge and self-expression. Marketers did not create these needs; they are a basic part of the human makeup.", source: "Principles of Marketing, 17th Ed.", visual: "<i class='fas fa-brain'></i>" },
    { term: "Wants", definition: "The form human needs take as they are shaped by culture and individual personality. An American needs food but wants a Big Mac, french fries, and a soft drink. Wants are described in terms of objects that will satisfy those needs.", source: "Principles of Marketing, 17th Ed.", visual: "<i class='fas fa-hamburger'></i>" },
    { term: "Demands", definition: "Human wants that are backed by buying power. Given their wants and resources, people demand products and services with benefits that add up to the most value and satisfaction.", source: "Principles of Marketing, 17th Ed.", visual: "<i class='fas fa-wallet'></i>" },
    { term: "Customer Lifetime Value (CLV)", definition: "The value of the entire stream of purchases a customer makes over a lifetime of patronage. Losing a customer means losing more than a single sale; it means losing the entire stream of purchases that the customer would make over a lifetime.", source: "Principles of Marketing, 17th Ed.", visual: "<i class='fas fa-infinity'></i>" },
    { term: "Marketing Myopia", definition: "The mistake of paying more attention to the specific products a company offers than to the benefits and experiences produced by these products. They are so taken with their products that they focus only on existing wants and lose sight of underlying customer needs.", source: "Principles of Marketing, 17th Ed.", visual: "<i class='fas fa-eye-slash'></i>" }
  ]'''
text = re.sub(old_def, new_def, text, flags=re.DOTALL)

# Update Frameworks
old_fw = r'frameworks:\s*\[(.*?)\]'
new_fw = '''frameworks: [
    {
      name: "The Five-Step Marketing Process",
      visual: "../marketing_process_diagram_1786363443108.jpg",
      explanation: "A holistic framework mapping how firms create customer value to subsequently extract equity. The first four steps create value for customers and build customer relationships. In the final step, the company reaps the rewards of creating superior customer value. By creating value for consumers, they in turn capture value from consumers in the form of sales, profits, and long-term customer equity.",
      components: [
        "1. Understand the marketplace and customer needs, wants, and demands.",
        "2. Design a customer value-driven marketing strategy (STP: Segment, Target, Position).",
        "3. Construct an integrated marketing program that delivers superior value (4Ps Mix).",
        "4. Engage customers, build profitable relationships, and create customer delight.",
        "5. Capture value from customers to create profits and customer equity."
      ]
    },
    {
      name: "Marketing Management Orientations",
      visual: "<i class='fas fa-compass'></i>",
      explanation: "Five alternative concepts under which organizations design and carry out their marketing strategies. These represent the fundamental philosophy that guides the organization's approach to the market, ranging from an inward-focus on production capabilities to an outward-focus on societal well-being.",
      components: [
        "Production Concept: Focus on high production efficiency, mass distribution, and low costs. Consumers will favor products that are available and highly affordable.",
        "Product Concept: Focus on making continuous product improvements. Consumers will favor products that offer the most in quality, performance, and innovative features.",
        "Selling Concept: Focus on aggressive large-scale selling and promotion efforts. Consumers will not buy enough of the firm's products unless it undertakes a large-scale selling and promotion effort.",
        "Marketing Concept: Focus on understanding customer needs and delivering satisfaction better than competitors. Achieving organizational goals depends on knowing the needs and wants of target markets.",
        "Societal Marketing Concept: Focus on customer needs, company requirements, and long-term societal well-being. Marketing decisions should consider consumers' wants, the company's requirements, consumers' long-run interests, and society's long-run interests."
      ]
    }
  ]'''
text = re.sub(old_fw, new_fw, text, flags=re.DOTALL)

with open('data/chapter_01.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Chapter 1 updated successfully")
