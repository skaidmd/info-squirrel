import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { db } from '@/db';
import { scrapedData, scrapingHistory } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    // URLパラメータの取得
    const searchParams = request.nextUrl.searchParams;
    const urlParam = searchParams.get('url');

    if (!urlParam) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // URLのバリデーション
    let url: string;
    try {
      url = decodeURIComponent(urlParam);
      new URL(url); // URLの形式を検証
    } catch (error) {
      // エラーをDBに記録
      await db.insert(scrapingHistory).values({
        url: urlParam,
        status: 'error',
        errorMessage: 'Invalid URL format',
      });

      return NextResponse.json(
        {
          error: 'Invalid URL',
          details: 'URLの形式が正しくありません',
        },
        { status: 400 }
      );
    }

    try {
      // Webページの取得
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 10000, // 10秒でタイムアウト
        validateStatus: (status) => status < 400 // 400未満のステータスコードを許可
      });

      const $ = cheerio.load(data);

      // 基本情報の取得
      const title = $('title').text().trim();
      const description = $('meta[name="description"]').attr('content') || '';
      
      // メインコンテンツの取得（例：articleタグまたはmainタグ内のテキスト）
      const content = $('article, main').text().trim() || $('body').text().trim();

      // DBに結果を保存
      await db.insert(scrapedData).values({
        url,
        title,
        description,
        content,
      });

      // スクレイピング履歴に成功を記録
      await db.insert(scrapingHistory).values({
        url,
        status: 'success',
      });

      // レスポンスの送信
      return NextResponse.json({
        title,
        description,
        content,
        url
      });
    } catch (error) {
      console.error('Scraping error:', error);
      
      // エラーメッセージの整形
      let statusCode = 500;
      let errorMessage = 'Unknown error occurred';
      let details = error instanceof Error ? error.message : 'Unknown error';
      
      // Axiosエラーの処理
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          statusCode = 504;
          errorMessage = 'Request timeout';
          details = 'スクレイピングがタイムアウトしました';
        } else if (error.response) {
          statusCode = error.response.status;
          errorMessage = 'Failed to fetch URL';
          details = error.response.statusText;
        } else if (error.request) {
          statusCode = 503;
          errorMessage = 'No response received';
          details = 'サーバーからの応答がありませんでした';
        }
      }

      // スクレイピング履歴にエラーを記録
      await db.insert(scrapingHistory).values({
        url,
        status: 'error',
        errorMessage: details,
      });

      return NextResponse.json(
        { error: errorMessage, details },
        { status: statusCode }
      );
    }
  } catch (e) {
    // 予期せぬエラーの処理
    console.error('Unexpected error:', e);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 