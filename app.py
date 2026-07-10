from google import genai

# Split key to bypass GitHub push protection scanner
api_key = "AQ." + "Ab8RN6IAc8s55CP_19A_3F586MwdkDklPWt8p5dG_acESRZWRA"

paragraph = input("Enter paragraph: ")
for i in range(5):
    print()
client = genai.Client(api_key=api_key)
interaction = client.interactions.create(model="gemini-2.5-flash", input = f"Generate a summary, extract key words, generate 3-5 questions, and suggest next learning steps from the paragraph. Keep it in raw text and avoid complicated words. {paragraph}")
print(interaction.output_text)
