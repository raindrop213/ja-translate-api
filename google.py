import requests
import re

globalconfig = {'https': '127.0.0.1:7890', 'http': '127.0.0.1:7890'}

def google(content): 
            
    headers = {
        'authority': 'translate.google.com',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'cache-control': 'no-cache',
            'pragma': 'no-cache',
        'referer': 'https://translate.google.com/m',
        'sec-ch-ua': '"Microsoft Edge";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        'sec-ch-ua-arch': '"x86"',
        'sec-ch-ua-bitness': '"64"',
        'sec-ch-ua-full-version': '"105.0.1343.53"',
        'sec-ch-ua-full-version-list': '"Microsoft Edge";v="105.0.1343.53", "Not)A;Brand";v="8.0.0.0", "Chromium";v="105.0.5195.127"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-model': '""',
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua-platform-version': '"10.0.0"',
        'sec-ch-ua-wow64': '?0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 Edg/105.0.1343.53',
    }
    params = {
        'sl': 0,
        'tl': 1,
        'hl': 'zh-CN',
        'q': content,
    }
    
    response = requests.get('https://translate.google.com/m', params=params,verify=False, headers=headers,proxies=globalconfig)
    
    res=re.search('<div class="result-container">([\\s\\S]*?)</div>',response.text).groups() 
    return res[0]
   
if __name__=='__main__':
    print(google('あずきさんからアサリのスパゲティの作り方を学んだりもした。'))