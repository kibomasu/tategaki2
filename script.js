document.getElementById('generate').addEventListener('click', () => {
    const text = document.getElementById('input-text').value;
    const title = document.getElementById('title-input').value;
    const bgColor = document.getElementById('bg-color').value;
    const textColor = document.getElementById('text-color').value;
    const titleColor = document.getElementById('title-color').value;
    const font = document.getElementById('font-select').value;
  
    const canvasWidth = 480;
    const canvasHeight = 878;
    const lineHeight = 16 * 1.2; // 16px文字サイズに1.2の行間
    const charsPerLine = 44;
    const titleFontSize = 16 / 2;
    const indent = '　'; // 全角スペースでインデントを追加
  
    const convertSpecialCharacters = (text) => {
      return text.replace(/（/g, '﹁').replace(/「/g, '﹁')
                 .replace(/）/g, '﹂').replace(/」/g, '﹂')
                 .replace(/、/g, '、').replace(/。/g, '。');
    };
  
    const parseRubyText = (line) => {
      const parts = [];
      const rubyRegex = /｜(.*?)《(.*?)》/g;
      let lastIndex = 0;
      let match;
  
      while ((match = rubyRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ text: line.slice(lastIndex, match.index), ruby: null });
        }
        parts.push({ text: match[1], ruby: match[2] });
        lastIndex = rubyRegex.lastIndex;
      }
  
      if (lastIndex < line.length) {
        parts.push({ text: line.slice(lastIndex), ruby: null });
      }
  
      return parts;
    };
  
    // 改行コードを正規化
    const normalizeNewlines = (text) => {
      return text.replace(/\r\n|\r/g, '\n').replace(/<br\s*\/?>/g, '\n');
    };

    const normalizedText = normalizeNewlines(text);

    // 改行を考慮してテキストを分割
    const lines = normalizedText.split('\n').reduce((acc, line, index) => {
      const rubyParsedLine = parseRubyText(convertSpecialCharacters(line));
      rubyParsedLine.forEach((part, partIndex) => {
        const isIndented = index > 0 && partIndex === 0; // 改行後の最初の行をインデント
        const textParts = part.text.match(new RegExp(`.{1,${charsPerLine}}`, 'g')) || [''];
        textParts.forEach((tp, tpIndex) => {
          acc.push({
            text: isIndented && tpIndex === 0 ? indent + tp : tp,
            ruby: part.ruby,
          });
        });
      });
      return acc;
    }, []);

    let currentPage = 1;
    while (lines.length > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');
  
      // 背景色
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
      // タイトル
      ctx.font = `${titleFontSize}px ${font}`;
      ctx.fillStyle = titleColor;
      ctx.textBaseline = 'top';
      ctx.fillText(`${currentPage}p ${title}`, 10, 10);
  
      // テキスト
      ctx.font = `16px ${font}`;
      ctx.fillStyle = textColor;
      ctx.textBaseline = 'top';
      const startX = canvasWidth - 20; // 縦書きの開始位置
      const startY = 50;
      let y = startY;
      let x = startX;
      const maxLines = Math.floor((canvasHeight - startY) / lineHeight);
  
      for (let i = 0; i < maxLines && lines.length > 0; i++) {
        const { text, ruby } = lines.shift();
        if (ruby) {
          // ルビの描画（右側に配置）
          ctx.font = `12px ${font}`; // ルビ用の小さいフォント
          ctx.fillText(ruby, x + 20, y); // 右に描画
        }
  
        // 本文の描画
        ctx.font = `16px ${font}`;
        for (let char of text) {
          // 「、」と「。」を右上に3px寄せる
          if (char === '、' || char === '。') {
            y -= 10; // 3px上に移動
          }
          ctx.fillText(char, x, y);
          y += lineHeight;

          // 改行があった場合、新しい行に移動する処理
          if (y + lineHeight > canvasHeight) {
            y = startY; // 新しい行に移動
            x -= 20; // 次の列に移動
          }
        }
      }
  
      // 画像として出力
      const container = document.createElement('div');
      container.className = 'canvas-container';
      container.appendChild(canvas);
      document.getElementById('output-area').appendChild(container);
  
      currentPage++;
    }
});
