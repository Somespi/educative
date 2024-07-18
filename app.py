from flask import Flask, render_template, request
from requests import post
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from string import punctuation
from dotenv import load_dotenv
import os

load_dotenv()
nltk.download('stopwords')


def preprocess(text):
    stemmer = PorterStemmer()
    text = text.lower()
    text = [stemmer.stem(word) for word in text.split()]
    text = [word for word in text if word not in stopwords.words('english') and word not in punctuation]
    return ' '.join(text)

def gemini_prompt(prompt):
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + api_key
    feedback = post(url, json={
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }, headers={'Content-Type': 'application/json'})
    if feedback.status_code != 200:
        print(feedback.json())
    return feedback.json()['candidates'][0]['content']['parts'][0]['text']

def lesson_generator(topic, grade_level, notes):
    solution = gemini_prompt(
        f"""Generate a detailed lesson plan for a class aimed at {grade_level} students. The lesson should cover the topic of {topic}. The lesson plan should include the following elements:
            Lesson Title: A concise and a short title for the lesson.
            Duration: The estimated duration of the lesson.
            Learning Objectives: Clear objectives that define what students should know or be able to do by the end of the lesson.
            Materials Needed: List of materials required for the lesson, including textbooks, worksheets, and any multimedia resources.
            Introduction: An engaging introduction to the topic to capture students' interest.
            Instructional Activities: A step-by-step guide to the main instructional activities, including explanations, examples, and any interactive elements.
            Assessment: Methods for assessing student understanding during and after the lesson, such as quizzes, discussions, or hands-on activities.
            Differentiation Strategies: Suggestions for adapting the lesson to meet the diverse needs of learners, including advanced students and those needing additional support.
            Conclusion: A summary of the lesson, including key takeaways and a brief review.
            Homework Activities: Additional activities or assignments to reinforce learning.
            Make sure to seperate every one of these elements by a hyphen and start a new line.
            Here is other notes to consider, please follow them up: {notes}
        """)
    return solution



api_key = os.getenv('GEMINI_API')

app = Flask(__name__, template_folder='static')

inquerier = TfidfVectorizer()
original_statements = open("./data.txt").readlines()
proccessed_statements = [preprocess(info) for info in original_statements]
X = inquerier.fit_transform(proccessed_statements)


@app.route("/generate", methods=['POST'])
def generate():
    data = request.get_json()
    return lesson_generator(data['topic'], data['grade_level'], data['notes'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/message", methods=['POST'])
def message():
    data = request.get_json()
    inquery = inquerier.transform([preprocess(data['message'])])
    similarity = cosine_similarity(inquery, X)[0]
    return original_statements[max(range(len(similarity)), key=lambda i: similarity[i])]

if __name__ == "__main__":
    app.run(debug=True)
