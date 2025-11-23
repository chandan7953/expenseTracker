const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const categories = [
  "Food",
  "Transport",
  "Groceries",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Health",
  "Rent",
  "Income",
  "Other",
];

const suggestCategory = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }

    const prompt = `You are an AI assistant that assigns exactly one category to an expense description.
Choose only from the following list: ${categories.join(", ")}.
Do not add any extra text, explanation, or punctuation.
Expense description: "${description}"
Answer with only the category name.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let category = response?.text?.trim() || "Other";

    if (!categories.includes(category)) {
      category = "Other";
    }

    res.json({ category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { suggestCategory };
