import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

interface ISuggestDescriptionBody {
    title: string;
    description?: string;
}

// POST /admin/ai/suggest-description - AI ile açıklama önerisi oluştur
export const suggestDescription = async (
    req: Request<{}, {}, ISuggestDescriptionBody>,
    res: Response,
    next: NextFunction
) => {
    const { title, description } = req.body;

    if (!title || title.trim().length === 0) {
        return res.status(400).json({
            message: 'Başlık gereklidir.'
        });
    }

    // OpenAI API key kontrolü
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
            message: 'OpenAI API anahtarı yapılandırılmamış. Lütfen OPENAI_API_KEY ortam değişkenini ayarlayın.'
        });
    }

    try {
        const systemPrompt = `Verilen başlık ile ilgili 500 karakteri geçmeyecek türkçe bir açıklama yaz.`;

        const userPrompt = description && description.trim().length > 0
            ? `Aşağıdaki başlık için mevcut açıklamayı geliştir ve daha çekici hale getir. Maksimum 500 karakter olmalı.\n\nBaşlık: ${title}\nMevcut Açıklama: ${description}\n\nYeni ve geliştirilmiş açıklamayı sadece metin olarak döndür, başka açıklama ekleme.`
            : `Aşağıdaki başlık için çekici ve profesyonel bir açıklama yaz. Maksimum 500 karakter olmalı.\n\nBaşlık: ${title}\n\nAçıklamayı sadece metin olarak döndür, başka açıklama ekleme.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 200,
            temperature: 0.7
        });

        const suggestedDescription = completion.choices[0]?.message?.content?.trim() || '';

        if (!suggestedDescription) {
            return res.status(500).json({
                message: 'AI açıklama önerisi oluşturulamadı.'
            });
        }

        // 500 karakter sınırını kontrol et ve kes
        const finalDescription = suggestedDescription.length > 500 
            ? suggestedDescription.substring(0, 497) + '...'
            : suggestedDescription;

        res.status(200).json({
            message: 'Açıklama önerisi başarıyla oluşturuldu.',
            description: finalDescription
        });
    } catch (error: any) {     
        if (error.status === 401) {
            return res.status(500).json({
                message: 'OpenAI API anahtarı geçersiz. Lütfen OPENAI_API_KEY değerini kontrol edin.'
            });
        }
        
        if (error.status === 429) {
            return res.status(500).json({
                message: 'OpenAI API rate limit aşıldı. Lütfen daha sonra tekrar deneyin.'
            });
        }

        next({
            status: 500,
            message: 'AI açıklama önerisi oluşturulurken bir hata oluştu.',
            stack: error.stack
        });
    }
};