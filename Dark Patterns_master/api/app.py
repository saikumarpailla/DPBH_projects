from flask import Flask, jsonify, request
from flask_cors import CORS
from joblib import load
import pyttsx3

presence_classifier = load('presence_classifier.joblib')
presence_vect = load('presence_vectorizer.joblib')
category_classifier = load('category_classifier.joblib')
category_vect = load('category_vectorizer.joblib')

app = Flask(__name__)
CORS(app)

def read_out_loud(text):
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()

@app.route('/', methods=['POST'])
def main():
    if request.method == 'POST':
        output = []
        highlighted_tokens = []  # Store highlighted tokens

        data = request.get_json().get('tokens')

        for token in data:
            result = presence_classifier.predict(presence_vect.transform([token]))
            if result == 'Dark':
                cat = category_classifier.predict(category_vect.transform([token]))
                output.append(cat[0])
                highlighted_tokens.append(f'<span style="color:red">{token}</span>')  # Highlight dark patterns
                read_out_loud(f'Dark pattern detected: {token}')
            else:
                output.append(result[0])
                highlighted_tokens.append(token)

        message = {'result': output, 'highlighted_tokens': highlighted_tokens}
        json_response = jsonify(message)

        return json_response

if __name__ == '__main__':
    app.run(threaded=True, debug=True)
