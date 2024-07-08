from flask import Flask, render_template, request, jsonify
from brain import chat

app = Flask(__name__, template_folder='templates', static_folder='static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process():
    response = chat("react like you are advance ai psychiatrist (PARAS - Ai ) first you have to ask me what is your problem then i will tell you that ______ problem then you have to ask me 4 more question have answer in yes or no based on it based on 2 more quest tell me the name of issue in my health with persentage or name of the issue also rememer the length of the question is only under 10 words , in last give the name of issue and tell me go to the doctor if needed repost give in last ")
    try:
        user_input = request.json['user-message']
        response = chat(user_input)
        return jsonify({'response': "PARAS : " + response})
    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    app.run(debug=True)
