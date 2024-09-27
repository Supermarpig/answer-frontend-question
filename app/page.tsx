'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { DailyQuestion, getQuestion } from '@/components/DailyQuestion';

interface AiResponse {
  score: number;
  feedback: string;
}

export default function FrontendQuizApp() {
  const [answer, setAnswer] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>(getQuestion());

  const MAX_ANSWER_LENGTH = 2000;

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError('請輸入你的答案。');
      return;
    }

    if (answer.length > MAX_ANSWER_LENGTH) {
      setError(`答案過長，請限制在 ${MAX_ANSWER_LENGTH} 個字以內。`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      const res = await fetch('/api/judge-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer, question: currentQuestion }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'API 錯誤');
      }

      const data: AiResponse = await res.json();
      setAiResponse(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error:', err.message);
        setError(err.message || '未知錯誤');
      } else {
        console.error('Unexpected error:', err);
        setError('未知錯誤');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <DailyQuestion question={currentQuestion} />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>你的回答</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="在這裡輸入你的答案..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            className="mb-2"
          />
          <p className="text-sm text-gray-500">
            字數：{answer.length} / {MAX_ANSWER_LENGTH}
          </p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在評判...
              </>
            ) : (
              '提交答案'
            )}
          </Button>
        </CardFooter>
      </Card>

      {aiResponse && (
        <Card>
          <CardHeader>
            <CardTitle>AI 評判結果</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">得分：{aiResponse.score}/100</p>
            <p className="mb-2">反饋：</p>
            <p className="whitespace-pre-wrap">{aiResponse.feedback}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}