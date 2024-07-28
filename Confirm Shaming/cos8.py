from flask import Flask, request, jsonify, send_file
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from bs4 import BeautifulSoup
import requests
import pandas as pd
import os

app = Flask(__name__)


HTML_FILE_PATH = 'in.html'

with open('confirmshaming.txt', 'r') as file:
    lines = file.readlines()

data = [line.strip().split(';') for line in lines]
df = pd.DataFrame(data, columns=['input', 'label'])


# with open('cons.txt', 'r') as file:
#     lines = file.readlines()

# data = [line.strip().split(';') for line in lines]
# df1 = pd.DataFrame(data, columns=['input', 'label','extra'])
# df1 = df1.drop('extra', axis=1)

# t=[df,df1]
da=df

da = da.dropna()

# Separating input and labels
X = da['input'].values
y = da['label'].values

# Training the model
vectorizer = TfidfVectorizer()
X_vectorized = vectorizer.fit_transform(X)

classifier = SVC(kernel='linear')
classifier.fit(X_vectorized, y)

# Function to predict sentiment using the trained model
def predict_sentiment(input_text):
    input_vectorized = vectorizer.transform([input_text])
    prediction = classifier.predict(input_vectorized)
    return prediction[0]

# Function to detect confirm shaming sentences
def detect_confirm_shaming(text):
    return [sentence.strip() for sentence in text.split('.') if predict_sentiment(sentence) == 'negative']

# Function to scrape the webpage and find confirm shaming sentences
def scrape_and_analyze(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        text = soup.get_text()  # Extract text from the webpage
        negative_sentences = detect_confirm_shaming(text)
        # Highlight negative sentences in HTML
        for negative_sentence in negative_sentences:
            text = text.replace(negative_sentence, f"<mark>{negative_sentence}</mark>")
        return text, negative_sentences
    except Exception as e:
        print("Error:", e)
        return "", []

@app.route('/')
def index():
    # Serve the HTML file
    return send_file(HTML_FILE_PATH)

@app.route('/analyze', methods=['POST'])
def analyze_url():
    data = request.get_json()
    url = data.get('url')

    # Scrape webpage and analyze content
    text, negative_sentences = scrape_and_analyze(url)

    # Create a response with marked negative sentences
    response = {
        'url': url,
        'highlightedText': text,
        'markedSentences': [{'sentence': sentence, 'isNegative': True} for sentence in negative_sentences]
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run(port=5000)
