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
            let left = rect.left + window.scrollX + rect.width + 20; // 弹窗位于textBox的右侧
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

            fetchAndPlayAudio(text); // 添加的代码行，用于播放文本对应的音频

            fetch(`${url}/parse?text=${encodeURIComponent(text)}`)
                .then(response => response.json())
                .then(data => {
                    // 将分词结果显示在句子框中
                    displayMecabResult(data.output, document.getElementById('sentence'));
                    // 使用翻译API翻译文本并显示结果
                    googleTranslation(text);
                    chatgptTranslation(text);
                });
        } else if (!event.target.closest('#analysisModal')) {
            document.getElementById('analysisModal').style.display = 'none';
        }
    
    });
});

let currentAudio = null; // 用于跟踪当前播放的音频
function fetchAndPlayAudio(text) {
    // 停止当前播放的音频（如果有的话）
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // 将音频播放重置到开始位置
    }

    // 构建请求URL
    const url = `http://127.0.0.1:23456/voice/vits?text=${encodeURIComponent(text)}&id=342&format=wav&lang=ja&max=200`;

    // 发起fetch请求获取音频
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const audioUrl = URL.createObjectURL(blob);
            currentAudio = new Audio(audioUrl); // 创建新的Audio对象
            currentAudio.play().catch(error => console.error('Error playing audio:', error)); // 尝试播放音频
        })
        .catch(error => console.error('Error fetching audio:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    const analysisModal = document.getElementById('analysisModal');
    const resizeHandle = document.getElementById('resizeHandle');

    let isResizing = false;

    resizeHandle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isResizing = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResize);
    });

    function handleMouseMove(e) {
        if (isResizing) {
            const width = e.clientX - analysisModal.offsetLeft;
            const height = e.clientY - analysisModal.offsetTop;
            analysisModal.style.width = `${width}px`;
            analysisModal.style.height = `${height}px`;
        }
    }

    function stopResize(e) {
        if (isResizing) {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            // 存储新的尺寸
            localStorage.setItem('modalWidth', analysisModal.style.width);
            localStorage.setItem('modalHeight', analysisModal.style.height);
        }
    }

    // 页面加载时应用存储的尺寸
    const storedWidth = localStorage.getItem('modalWidth');
    const storedHeight = localStorage.getItem('modalHeight');
    if (storedWidth && storedHeight) {
        analysisModal.style.width = storedWidth;
        analysisModal.style.height = storedHeight;
    }
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

// Google翻译器
function googleTranslation(text) {
    const container = document.getElementById('google-translation-container');
    container.innerHTML = ''; // 清空旧的翻译结果

    fetch(`${url}/google?text=${encodeURIComponent(text)}`)
        .then(response => response.json())
        .then(data => {
            if (data.output) {
                displayTranslation(data.output, 'google', 'google-translation-container');
            }
        })
        .catch(error => {
            console.error('Error fetching traditional translation:', error);
            displayTranslation('Google翻译失败', 'google', 'google-translation-container');
        });
}

// ChatGPT翻译器的翻译和显示逻辑
function chatgptTranslation(text) {
    const container = document.getElementById('chatgpt-translation-container');
    container.innerHTML = ''; // 清空旧的翻译结果

    fetch(`${url}/chatgpt?text=${encodeURIComponent(text)}`)
        .then(response => response.json())
        .then(data => {
            if (data.output) {
                displayTranslation(data.output, 'chatgpt', 'chatgpt-translation-container');
            }
        })
        .catch(error => {
            console.error('Error fetching ChatGPT translation:', error);
            displayTranslation('ChatGPT翻译失败', 'chatgpt', 'chatgpt-translation-container');
        });
}

// 显示翻译结果的函数
function displayTranslation(translation, source, containerId) {
    const container = document.getElementById(containerId);
    const p = document.createElement('p');
    p.textContent = `${translation}`;
    p.className = `translation translation-${source}`;
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

document.body.addEventListener('click', function(event) {
    let target = event.target.closest('.mecabSpan'); // 尝试找到最近的包含`mecabSpan`类的祖先元素

    // 如果找到包含`mecabSpan`类的元素
    if (target) {
        document.querySelectorAll('.mecabSpan').forEach(el => el.classList.remove('active-span')); // 先移除其他的.active-span类
        target.classList.add('active-span'); // 然后为当前点击的元素添加.active-span类

        document.querySelectorAll('.dictionary-tab').forEach(tab => {tab.classList.remove('active-tab');}); // 刷新按钮 移除.active-tap类

        const ruby = target.querySelector('ruby');
        if (ruby) {
            console.log('点击了含有ruby的mecabSpan元素');
            const word = Array.from(ruby.childNodes).filter(node => node.nodeType === Node.TEXT_NODE || node.nodeName.toLowerCase() !== 'rt').map(node => node.textContent).join('').trim();
            console.log('查询的单词：', word);
            fetchDictionaryResults(word);
        } else {
            console.log('点击了不含ruby的mecabSpan元素');
            const wordWithoutFurigana = target.textContent.trim();
            console.log('查询的单词：', wordWithoutFurigana);
            fetchDictionaryResults(wordWithoutFurigana);
        }
    }
});

function fetchDictionaryResults(word) {
    // 按顺序查询所有词典
    fetchDictionaryResult(word, 'moji', 'moji-container');
    fetchDictionaryResult(word, 'youdao', 'youdao-container');
    fetchDictionaryResult(word, 'weblio', 'weblio-container');
}

function fetchDictionaryResult(word, dictionary, containerId) {
    fetch(`${url}/${dictionary}?text=${encodeURIComponent(word)}`)
        .then(response => response.json())
        .then(data => {
            displayDictionaryResult(data.output, containerId);
        })
        .catch(error => {
            console.error(`Error fetching ${dictionary} dictionary:`, error);
            displayDictionaryResult(`${dictionary}查询失败`, containerId);
        });
}       

function displayDictionaryResult(result, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = result;
    container.style.display = 'block'; // 总是显示容器
}

// 为每个词典切换标签添加点击事件监听器
document.querySelectorAll('.dictionary-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const dictionary = this.getAttribute('data-dictionary');
        
        // 移除其他标签的激活状态，并隐藏所有词典结果，但是不在点击非词典区域时执行
        document.querySelectorAll('.dictionary-content').forEach(container => {
            container.style.display = 'none';
        });
        
        // 激活点击的标签，并显示对应的词典结果
        document.querySelectorAll('.dictionary-tab').forEach(tab => {
            tab.classList.remove('active-tab');
        });
        this.classList.add('active-tab');
        document.getElementById(`${dictionary}-container`).style.display = 'block';
    });
});

document.getElementById('scrollToTopButton').addEventListener('click', function() {
    document.getElementById('textBox').scrollTop = 0; // 滚动到顶部
});

document.addEventListener("DOMContentLoaded", function() {
    // 获取滚动容器和返回顶部按钮的元素
    var textBox = document.getElementById('textBox');
    var scrollToTopButton = document.getElementById('scrollToTopButton');

    // 默认隐藏返回顶部按钮
    scrollToTopButton.style.display = 'none';

    // 为滚动容器添加滚动事件监听器
    textBox.addEventListener('scroll', function() {
        // 检查滚动位置
        if (textBox.scrollTop > 0) {
            // 如果已经滚动，显示返回顶部按钮
            scrollToTopButton.style.display = 'block';
        } else {
            // 如果在顶部，隐藏返回顶部按钮
            scrollToTopButton.style.display = 'none';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const analysisModal = document.getElementById('analysisModal');
    const header = analysisModal.querySelector('#textBox'); // 假设你的标题栏有这个类名
    let isDragging = false;
    let dragStartX, dragStartY;

    // 监听关闭按钮的点击事件来隐藏弹窗
    closeBtn.addEventListener('click', function() {
        analysisModal.style.display = 'none';
    });
    

    header.addEventListener('mousedown', function(e) {
        // 在这里检查是否按下了Ctrl键
        if (e.ctrlKey) {
            // 如果按下了Ctrl键，则不启动拖动
            return;
        }
        isDragging = true;
        dragStartX = e.clientX - analysisModal.offsetLeft;
        dragStartY = e.clientY - analysisModal.offsetTop;
        document.addEventListener('mousemove', handleDragging);
        document.addEventListener('mouseup', stopDragging);
        e.preventDefault(); // 防止拖动时选中文本
    });

    function handleDragging(e) {
        // 在拖动过程中再次检查是否按下了Ctrl键
        if (e.ctrlKey) {
            // 如果按下了Ctrl键，停止拖动
            stopDragging();
            return;
        }
        if (isDragging) {
            const newX = e.clientX - dragStartX;
            const newY = e.clientY - dragStartY;
            analysisModal.style.left = `${newX}px`;
            analysisModal.style.top = `${newY}px`;
        }
    }

    function stopDragging() {
        isDragging = false;
        document.removeEventListener('mousemove', handleDragging);
        document.removeEventListener('mouseup', stopDragging);
    }
});

