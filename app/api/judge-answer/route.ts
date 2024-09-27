// app/api/judge-answer/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const requestSchema = z.object({
    answer: z.string().min(1).max(2000),
    question: z.string().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { answer, question } = requestSchema.parse(body);

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = `
請評分以下前端面試問題的回答，並給予詳細的反饋。

問題：${question}

答案：${answer}

評分標準：
- 理解問題的核心概念
- 回答的完整性和準確性
- 提供實際的代碼示例（如適用）
- 清晰的結構和語言表達

請返回一個 JSON 對象，包含 "score"（0-100 分）和 "feedback"（詳細反饋）和 "perfectAnswer"(正確回答)。
    `;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500,
            temperature: 0.7,
        });

        const aiText = response.choices[0].message.content?.trim() ?? '';

        let aiResponse: { score: number; feedback: string };

        try {
            aiResponse = JSON.parse(aiText);
        } catch (error) {
            console.error('Failed to parse AI response:', error);
            aiResponse = {
                score: Math.floor(Math.random() * 100),
                feedback: aiText,
            };
        }

        return NextResponse.json(aiResponse, { status: 200 });
    } catch (error) {
        console.error('Error processing request:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: '輸入驗證失敗', details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { message: '內部伺服器錯誤' },
            { status: 500 }
        );
    }
}