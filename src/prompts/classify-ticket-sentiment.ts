import dedent from 'dedent'
import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

import { TicketClassificationSentiment } from '../entities/ticket'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const stepsSchema = z.object({
    explanation: z.string(),
    output: z.string(),
})

const schema = z.object({
    steps: z.array(stepsSchema),
    sentiment: z.nativeEnum(TicketClassificationSentiment),
})

function buildPrompt() {
    return dedent`
    You are a ticket sentiment analysis system. You are given a ticket content and you need to classify the sentiment of the ticket.
    The sentiment categories are:

    ${Object.values(TicketClassificationSentiment).map(sentiment => `- ${sentiment.toUpperCase()}`).join('\n')}
    `
}

// TODO: Add few shot examples based on the user feedback changes in the classification service
export async function classify(content: string): Promise<TicketClassificationSentiment> {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: buildPrompt(),
                },
                {
                    role: 'user',
                    content,
                },
            ],
            response_format: zodResponseFormat(schema, 'ticketSentiment'),
            temperature: 0,
        })

        const sentiment = completion.choices[0].message.content as string
        const sentimentJSON = JSON.parse(sentiment)
        const parsedSentiment = schema.parse(sentimentJSON)

        return parsedSentiment.sentiment
    }
    catch (error) {
        console.error('Error classifying ticket sentiment', error)
        return TicketClassificationSentiment.NEUTRAL
    }
}
