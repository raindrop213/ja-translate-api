from flask import Flask, request, jsonify
import MeCab
from translator.google import google
from translator.chatgpt import chatgpt
from cishu.moji import moji
from cishu.webilo import webilo
from cishu.youdao import youdao

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


# 翻译器
@app.route("/google", methods=["GET"])
def get_google():
    """返回词性标注结果"""
    text = request.args.get("text")
    if text:
        return jsonify({"text": text, "google": google(text)})
    else:
        return jsonify({"error": "errer google"}), 400
    
@app.route("/chatgpt", methods=["GET"])
def get_chatgpt():
    """返回词性标注结果"""
    text = request.args.get("text")
    if text:
        return jsonify({"text": text, "chatgpt": chatgpt(text)})
    else:
        return jsonify({"error": "errer chatgpt"}), 400


# 辞书
@app.route("/webilo", methods=["GET"])
def get_webilo():
    """返回词性标注结果"""
    text = request.args.get("text")
    if text:
        return jsonify({"text": text, "webilo": webilo(text)})
    else:
        return jsonify({"error": "errer webilo"}), 400

@app.route("/moji", methods=["GET"])
def get_moji():
    """返回词性标注结果"""
    text = request.args.get("text")
    if text:
        return jsonify({"text": text, "moji": moji(text)})
    else:
        return jsonify({"error": "errer moji"}), 400

@app.route("/youdao", methods=["GET"])
def get_youdao():
    """返回词性标注结果"""
    text = request.args.get("text")
    if text:
        return jsonify({"text": text, "youdao": youdao(text)})
    else:
        return jsonify({"error": "errer youdao"}), 400




if __name__ == "__main__":
    app.run(debug=True, port=8777)
