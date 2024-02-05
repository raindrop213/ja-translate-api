import json
import requests
import os


def chatgpt(text):

    # 设置请求的 URL 和头部信息
    url = "https://api.ohmygpt.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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",  # 请替换 $OPENAI_API_KEY 为你的 API 密钥
    }

    # 设置请求的数据
    data = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "system", "content": "You are a translator"},
                        {"role": "user", "content": f"{text}\nTranslate this passage into Chinese"}],
        "temperature": 0.3
    }

    json_str = requests.post(url, headers=headers, data=json.dumps(data)).text
    data = json.loads(json_str)

    return data['choices'][0]['message']['content']

if __name__=='__main__':
    print(chatgpt("所属する店が違っても"))

