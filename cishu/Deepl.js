// 翻译器
const supportedLanguages = [
    ["auto", "auto"],
    ["de", "DE"],
    ["en", "EN"],
    ["es", "ES"],
    ["fr", "FR"],
    ["it", "IT"],
    ["ja", "JA"],
    ["ko", "KO"],
    ["nl", "NL"],
    ["pl", "PL"],
    ["pt", "PT"],
    ["ru", "RU"],
    ["zh", "ZH"],
    ["zh", "ZH"],
    ["bg", "BG"],
    ["cs", "CS"],
    ["da", "DA"],
    ["el", "EL"],
    ["et", "ET"],
    ["fi", "FI"],
    ["hu", "HU"],
    ["lt", "LT"],
    ["lv", "LV"],
    ["ro", "RO"],
    ["sk", "SK"],
    ["sl", "SL"],
    ["sv", "SV"],
  ];
  const langMap = new Map(supportedLanguages);
  
function getTimeStamp(iCount) {
const ts = Date.now();
if (iCount !== 0) {
    iCount = iCount + 1;
    return ts - (ts % iCount) + iCount;
} else {
    return ts;
}
}
  
// from可以填ja，to可填zh
function deeplTranslate(text, from, to) {
  return new Promise((resolve, reject) => {
    const sourceLanguage = langMap.get(from);
    const targetLanguage = langMap.get(to);
    if (!targetLanguage) {
      reject("不支持该语种");
      return;
    }

    const source_lang = sourceLanguage || "ja";
    const target_lang = targetLanguage || "zh";
    const translate_text = text || "";

    if (translate_text !== "") {
      const url = "https://www2.deepl.com/jsonrpc";
      let id = (Math.floor(Math.random() * 99999) + 100000) * 1000;
      const post_data = {
        jsonrpc: "2.0",
        method: "LMT_handle_texts",
        params: {
          splitting: "newlines",
          lang: {
            source_lang_user_selected: source_lang,
            target_lang: target_lang,
          },
          texts: [{ text: translate_text, requestAlternatives: 3 }],
          timestamp: getTimeStamp(translate_text.split("i").length - 1),
        },
        id: id,
      };
      let post_str = JSON.stringify(post_data);
      if ((id + 5) % 29 === 0 || (id + 3) % 13 === 0) {
        post_str = post_str.replace('"method":"', '"method" : "');
      } else {
        post_str = post_str.replace('"method":"', '"method": "');
      }

      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: post_str,
      })
        .then((response) => response.json())
        .then((data) => resolve(data.result.texts[0].text))
        .catch((error) => {
          reject("接口请求错误 - " + JSON.stringify(error));
        });
    } else {
      reject("没有提供翻译文本");
    }
  });
}