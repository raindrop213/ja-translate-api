from flask import Flask, request, jsonify
import MeCab
import google
import webilo
import moji
import youdao
import chatgpt


from flask_cors import CORS
app = Flask(__name__)
CORS(app)

# 初始化MeCab
tagger = MeCab.Tagger()

@app.route("/parse", methods=["GET"])
def get_parse():
    """返回词性标注结果"""
    text = request.args.get("text")
    if text:
        return jsonify({"text": text, "parse": tagger.parse(text)})
    else:
        return jsonify({"error": "No text provided"}), 400


@app.route("/google", methods=["GET"])
def get_google():
    """返回词性标注结果"""
    text = request.args.get("text")
    if text:
        return jsonify({"text": text, "google": google.google(text)})
    else:
        return jsonify({"error": "errer google"}), 400
    
@app.route("/chatgpt", methods=["GET"])
def get_chatgpt():
    """返回词性标注结果"""
    text = request.args.get("text")
    if text:
        return jsonify({"text": text, "chatgpt": chatgpt.chatgpt(text)})
    else:
        return jsonify({"error": "errer chatgpt"}), 400

@app.route("/webilo", methods=["GET"])
def get_webilo():
    """返回词性标注结果"""
    text = request.args.get("text")
    if text:
        return jsonify({"text": text, "cishu": webilo.search(text)})
    else:
        return jsonify({"error": "errer cishu"}), 400

@app.route("/moji", methods=["GET"])
def get_moji():
    """返回词性标注结果"""
    text = request.args.get("text")
    if text:
        return jsonify({"text": text, "cishu": moji.search(text)})
    else:
        return jsonify({"error": "errer cishu"}), 400

@app.route("/youdao", methods=["GET"])
def get_youdao():
    """返回词性标注结果"""
    text = request.args.get("text")
    if text:
        return jsonify({"text": text, "cishu": youdao.search(text)})
    else:
        return jsonify({"error": "errer cishu"}), 400

if __name__ == "__main__":
    app.run(debug=True, port=8777)
