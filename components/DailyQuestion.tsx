import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import questionsData from '@/data/questions.json';

interface Questions {
    [category: string]: string[];
}

// 獲取所有問題的函數
export function getQuestion(): string {
    const questionsDataTyped = questionsData as Questions;

    // 合併所有分類下的問題到一個陣列
    const allQuestions: string[] = Object.values(questionsDataTyped).flat();

    const today = new Date();
    const startOfYear: Date = new Date(today.getFullYear(), 0, 0);

    const dayOfYear: number = Math.floor(
        (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    );

    return allQuestions[dayOfYear % allQuestions.length];
}

interface DailyQuestionProps {
    question: string;
}

export function DailyQuestion({ question }: DailyQuestionProps) {
    const today = new Date();

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>每日前端面試題</CardTitle>
                <CardDescription>{today.toLocaleDateString('zh-TW')}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-lg font-semibold mb-2">問題：</p>
                <p>{question}</p>
            </CardContent>
        </Card>
    );
}
