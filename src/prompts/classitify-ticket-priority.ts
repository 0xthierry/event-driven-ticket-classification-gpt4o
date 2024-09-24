import type { TicketClassificationCategory, TicketClassificationSentiment } from '../entities/ticket'
import dedent from 'dedent'
import { OpenAI } from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'

import { z } from 'zod'
import { TicketClassificationPriority } from '../entities/ticket'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const stepsSchema = z.object({
    explanation: z.string(),
    output: z.string(),
})

const schema = z.object({
    steps: z.array(stepsSchema),
    priority: z.nativeEnum(TicketClassificationPriority),
})

function buildPrompt(customerSentiment: TicketClassificationSentiment, category: TicketClassificationCategory) {
    return dedent`
    You are a ticket priority analysis system. You are given a ticket content and you need to classify the priority of the ticket.

    The customer sentiment is ${customerSentiment}.
    The ticket category is ${category}.

    The priority categories are:

    ${Object.values(TicketClassificationPriority).map(priority => `- ${priority.toUpperCase()}`).join('\n')}
    `
}

// TODO: Add few shot examples based on the user feedback changes in the classification service
export async function classify(content: string, customerSentiment: TicketClassificationSentiment, category: TicketClassificationCategory): Promise<TicketClassificationPriority> {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: buildPrompt(customerSentiment, category),
                },
                {
                    role: 'user',
                    content,
                },
            ],
            response_format: zodResponseFormat(schema, 'ticketPriority'),
            temperature: 0,
        })

        const priority = completion.choices[0].message.content as string
        const priorityJSON = JSON.parse(priority)
        const parsedPriority = schema.parse(priorityJSON)

        return parsedPriority.priority
    }
    catch (error) {
        console.error('Error classifying ticket priority', error)
        return TicketClassificationPriority.UNPRIORITIZED
    }
}
