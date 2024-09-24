import dedent from 'dedent'
import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'

import { TicketClassificationCategory } from '../entities/ticket'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const stepsSchema = z.object({
    explanation: z.string(),
    output: z.string(),
})

const schema = z.object({
    steps: z.array(stepsSchema),
    category: z.nativeEnum(TicketClassificationCategory),
})

function buildPrompt() {
    return dedent`
    You are a ticket classification system. You are given a ticket content and you need to classify the ticket into a category.
    The categories are:

    ${Object.values(TicketClassificationCategory).map(category => `- ${category.toUpperCase()}`).join('\n')}
    `
}

// TODO: Add few shot examples based on the user feedback changes in the classification service
export async function classify(content: string): Promise<TicketClassificationCategory> {
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
            response_format: zodResponseFormat(schema, 'ticketCategory'),
            temperature: 0,
        })

        const category = completion.choices[0].message.content as string
        const categoryJSON = JSON.parse(category)
        const parsedCategory = schema.parse(categoryJSON)

        return parsedCategory.category
    }
    catch (error) {
        console.error('Error classifying ticket', error)
        return TicketClassificationCategory.UNCATEGORIZED
    }
}
