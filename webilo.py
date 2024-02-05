import requests
from urllib.parse import quote
import re


globalconfig = {'https': '127.0.0.1:7890', 'http': '127.0.0.1:7890'}


     
def search(word):
    url='https://www.weblio.jp/content/'+ quote(word)
    x=(requests.get(url,proxies=globalconfig).text)
    x=re.sub('<img(.*?)>','',x)
    _all=[]
    _xx=re.findall('<div class="kijiWrp">([\\s\\S]*?)<br class=clr>',x)
    
    for xx in _xx:
        
        xx=re.sub('<a(.*?)>','',xx)
        
        xx=re.sub('</a>','',xx)
        
        xx=re.sub('class="(.*?)"','',xx) 
        _all.append(xx) 
    
    join='<br>'.join(_all)
        
    return join
    

if __name__=='__main__':
    w = search('豪華')
    print(w)