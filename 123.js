let url = 'http://127.0.0.1:8777'

document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(event) {
        const target = event.target;
        const textBox = target.closest('.textBox');
        
        if (textBox) {
            const analysisModal = document.getElementById('analysisModal');
            // 获取textBox的位置和尺寸
            const rect = textBox.getBoundingClientRect();
            // 计算弹窗的最佳位置
            let top = rect.top + window.scrollY;
            let left = rect.left + window.scrollX + rect.width; // 弹窗位于textBox的右侧
            // 确保弹窗不会超出浏览器窗口
            if (left + analysisModal.offsetWidth > window.innerWidth) {
                left = rect.left + window.scrollX - analysisModal.offsetWidth; // 如果右侧放不下，则尝试放到左侧
            }
            if (top + analysisModal.offsetHeight > window.innerHeight) {
                top = window.innerHeight - analysisModal.offsetHeight; // 如果底部放不下，则上移
            }
            // 更新弹窗位置
            analysisModal.style.top = `${top}px`;
            analysisModal.style.left = `${left}px`;
            analysisModal.style.display = 'block';

            document.getElementById('analysisModal').style.display = 'block';
            
            // 假定获取的文本就是textBox内的文本
            let text = textBox.textContent;
            fetch(`${url}/parse?text=${encodeURIComponent(text)}`)
                .then(response => response.json())
                .then(data => {
                    // 将分词结果显示在句子框中
                    displayMecabResult(data.parse, document.getElementById('sentence'));
                    // 使用翻译API翻译文本并显示结果
                    googleTranslation(text);
                    chatgptTranslation(text);
                });
        } else if (!event.target.closest('#analysisModal')) {
            document.getElementById('analysisModal').style.display = 'none';
        }
    
    });
});

function displayMecabResult(parseResult, sentenceBox) {
    // 清空句子框以显示新的结果
    sentenceBox.innerHTML = '';

    // 解析结果并为每个词添加注音（如果需要）
    parseResult.split('\n').forEach(line => {
        if (line && !line.startsWith('EOS')) {
            const parts = line.split('\t');
            if (parts.length > 1) {
                const word = parts[0];
                const details = parts[1].split(',');
                const pos = details[0]; // 词性
                const kana = details[6]; // 正确获取假名注音
                const furigana = convertToHiragana(kana);

                const span = document.createElement('span');
                span.className = 'mecabSpan ' + pos;
                
                if (word !== furigana) {
                    const rubyElement = document.createElement('ruby');
                    rubyElement.id = `ruby-sentence`;
                    rubyElement.appendChild(document.createTextNode(word));
                    const rtElement = document.createElement('rt');
                    rtElement.textContent = furigana;
                    rubyElement.appendChild(rtElement);
                    span.appendChild(rubyElement);
                } else {
                    span.textContent = word + ' ';
                }
                sentenceBox.appendChild(span);
            }
        }
    });
}

// 传统翻译器的翻译和显示逻辑
function googleTranslation(text) {
    const container = document.getElementById('google-translation-container');
    container.innerHTML = ''; // 清空旧的翻译结果

    fetch(`${url}/google?text=${encodeURIComponent(text)}`)
        .then(response => response.json())
        .then(data => {
            if (data.google) {
                displayTranslation(data.google, 'goo', 'google-translation-container');
            }
        })
        .catch(error => {
            console.error('Error fetching traditional translation:', error);
            displayTranslation('Google翻译失败', 'goo', 'google-translation-container');
        });
}

// ChatGPT翻译器的翻译和显示逻辑
function chatgptTranslation(text) {
    const container = document.getElementById('chatgpt-translation-container');
    container.innerHTML = ''; // 清空旧的翻译结果

    fetch(`${url}/chatgpt?text=${encodeURIComponent(text)}`)
        .then(response => response.json())
        .then(data => {
            if (data.chatgpt) {
                displayTranslation(data.chatgpt, 'ChatGPT', 'chatgpt-translation-container');
            }
        })
        .catch(error => {
            console.error('Error fetching ChatGPT translation:', error);
            displayTranslation('ChatGPT翻译失败', 'ChatGPT', 'chatgpt-translation-container');
        });
}

// 显示翻译结果的函数
function displayTranslation(translation, source, containerId) {
    const container = document.getElementById(containerId);
    const p = document.createElement('p');
    p.textContent = `${source}: ${translation}`;
    container.appendChild(p);
}

function convertToHiragana(katakana) {
    const katakanaToHiraganaMap = {
        'ァ': 'ぁ', 'ア': 'あ', 'ィ': 'ぃ', 'イ': 'い', 'ゥ': 'ぅ', 'ウ': 'う', 'ェ': 'ぇ', 'エ': 'え', 'ォ': 'ぉ', 'オ': 'お',
        'カ': 'か', 'ガ': 'が', 'キ': 'き', 'ギ': 'ぎ', 'ク': 'く', 'グ': 'ぐ', 'ケ': 'け', 'ゲ': 'げ', 'コ': 'こ', 'ゴ': 'ご',
        'サ': 'さ', 'ザ': 'ざ', 'シ': 'し', 'ジ': 'じ', 'ス': 'す', 'ズ': 'ず', 'セ': 'せ', 'ゼ': 'ぜ', 'ソ': 'そ', 'ゾ': 'ぞ',
        'タ': 'た', 'ダ': 'だ', 'チ': 'ち', 'ヂ': 'ぢ', 'ッ': 'っ', 'ツ': 'つ', 'ヅ': 'づ', 'テ': 'て', 'デ': 'で', 'ト': 'と', 'ド': 'ど',
        'ナ': 'な', 'ニ': 'に', 'ヌ': 'ぬ', 'ネ': 'ね', 'ノ': 'の', 'ハ': 'は', 'バ': 'ば', 'パ': 'ぱ', 'ヒ': 'ひ', 'ビ': 'び', 'ピ': 'ぴ',
        'フ': 'ふ', 'ブ': 'ぶ', 'プ': 'ぷ', 'ヘ': 'へ', 'ベ': 'べ', 'ペ': 'ぺ', 'ホ': 'ほ', 'ボ': 'ぼ', 'ポ': 'ぽ',
        'マ': 'ま', 'ミ': 'み', 'ム': 'む', 'メ': 'め', 'モ': 'も', 'ャ': 'ゃ', 'ヤ': 'や', 'ュ': 'ゅ', 'ユ': 'ゆ', 'ョ': 'ょ', 'ヨ': 'よ',
        'ラ': 'ら', 'リ': 'り', 'ル': 'る', 'レ': 'れ', 'ロ': 'ろ', 'ヮ': 'ゎ', 'ワ': 'わ', 'ヰ': 'ゐ', 'ヱ': 'ゑ', 'ヲ': 'を', 'ン': 'ん',
        'ヴ': 'ゔ', 'ヵ': 'ゕ', 'ヶ': 'ゖ', 'ヽ': 'ゝ', 'ヾ': 'ゞ'
    };

    let hiragana = '';
    for (let char of katakana) {
        hiragana += katakanaToHiraganaMap[char] || char;
    }
    return hiragana;
}



// api服务 词典：webilo：`${url}/webilo?text=${encodeURIComponent(text)}`
// api服务 词典：moji：`${url}/moji?text=${encodeURIComponent(text)}`
// api服务 词典：youdao：`${url}/youdao?text=${encodeURIComponent(text)}`