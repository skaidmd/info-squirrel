import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';

// セレクター定義の型
export type SelectorDefinition = {
  [key: string]: string; // キー名: CSSセレクター文字列
};

export type ScrapeResult = {
  success: boolean;
  data?: string | Record<string, string>; // 文字列または構造化データ
  error?: string;
};

/**
 * 指定されたURLのWEBページをスクレイピングする
 * @param url スクレイピング対象のURL
 * @param selectors 取得したい要素のセレクター定義（オプション）
 * @returns スクレイピング結果
 */
export async function scrapeUrl(url: string, selectors?: SelectorDefinition): Promise<ScrapeResult> {
  try {
    // URLの形式をチェック
    if (!url.match(/^https?:\/\/.+/)) {
      return {
        success: false,
        error: '有効なURLを入力してください。URLはhttp://またはhttps://で始まる必要があります。'
      };
    }

    console.log(`スクレイピング開始: ${url}`);

    // リクエストを送信
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      timeout: 20000, // 20秒でタイムアウト
      maxRedirects: 5,
      validateStatus: (status) => status < 500, // 500以上のステータスコードのみエラーとする
    });

    // ステータスコードをチェック
    if (response.status >= 400) {
      return {
        success: false,
        error: `HTTPエラー: ${response.status} - ${response.statusText}`
      };
    }

    console.log(`スクレイピングレスポンス取得: ${response.status}`);

    // HTMLのパース
    const $ = cheerio.load(response.data);
    
    // 不要なタグを削除（スクリプト、スタイル、メタ情報など）
    $('script, style, meta, link, noscript').remove();
    
    // 自然言語テキストと要素を抽出する関数
    const extractTextWithTags = (elements: cheerio.Cheerio<Element>) => {
      const results: string[] = [];
      
      elements.each(function(this: cheerio.Element) {
        // 要素のタグ名を取得
        const tagName = this.tagName?.toLowerCase() || 'span';
        
        // 子要素を含まない、自分自身のテキストノードだけを取得
        const ownText = $(this).clone().children().remove().end().text().trim();
        
        // テキストが存在する場合のみ追加
        if (ownText && ownText.length > 0) {
          results.push(`<${tagName}>${ownText}`);
        }
        
        // 子要素も再帰的に処理
        $(this).children().each(function(this: cheerio.Element) {
          const childTagName = this.tagName?.toLowerCase() || 'span';
          const childOwnText = $(this).clone().children().remove().end().text().trim();
          
          if (childOwnText && childOwnText.length > 0) {
            results.push(`<${childTagName}>${childOwnText}`);
          }
        });
      });
      
      return results;
    };
    
    // セレクターが指定されている場合は特定要素を抽出
    if (selectors && Object.keys(selectors).length > 0) {
      console.log(`セレクターに基づいてデータを抽出: ${Object.keys(selectors).length}個のセレクター`);
      
      const extractedData: Record<string, string> = {};
      
      // 各セレクターに対して要素を取得
      for (const [key, selector] of Object.entries(selectors)) {
        try {

          const elements = $(selector);
          
          if (elements.length > 0) {
            const extractedTexts = extractTextWithTags(elements);
            
            // 結果をマージして重複を排除
            const uniqueTexts = [...new Set(extractedTexts)].join('\n');
            extractedData[key] = uniqueTexts;
            
            console.log(`セレクター「${key}」: ${extractedData[key].substring(0, 50)}${extractedData[key].length > 50 ? '...' : ''}`);
          } else {
            extractedData[key] = '';
          }


        } catch (error) {
          console.error(`セレクター「${key}」の抽出中にエラー:`, error);
          extractedData[key] = '';
        }
      }
      
      return {
        success: true,
        data: extractedData
      };
    } else {
      // セレクターが指定されていない場合は自然言語テキストを抽出
      const extractedTexts = extractTextWithTags($('body *'));
      
      // 重複を除去し、結果をマージ
      const uniqueTexts = [...new Set(extractedTexts)].join('\n');
      
      return {
        success: true,
        data: uniqueTexts
      };
    }
  } catch (error) {
    console.error('スクレイピングエラー詳細:', error);
    
    // エラーハンドリング
    if (error instanceof AxiosError) {
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          error: 'リクエストがタイムアウトしました。URLが正しいか確認してください。'
        };
      }
      
      if (error.response) {
        // サーバーからのレスポンスがあるがエラーの場合
        return {
          success: false,
          error: `HTTPエラー: ${error.response.status} - ${error.response.statusText}`
        };
      } else if (error.request) {
        // リクエストは送信されたがレスポンスがない
        return {
          success: false,
          error: 'サーバーからの応答がありませんでした。URLが正しいか、サーバーが稼働しているか確認してください。'
        };
      }
    }
    
    // その他のエラー
    return {
      success: false,
      error: `スクレイピングエラー: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 