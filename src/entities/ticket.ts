import { z } from 'zod'

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

export const ticket = z.object({
    id: z.string(),
    costumerId: z.string(),
    classificationId: z.string().optional().nullable(),
    description: z.string(),
    status: z.nativeEnum(TicketStatus).default(TicketStatus.OPEN),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
})

export type Ticket = z.infer<typeof ticket>
export type CreateTicket = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'classificationId'>
export type TicketCreatedEvent = {
    ticket: Ticket
}
export type TicketUpdatedEvent = {
    ticket: Ticket
    changes: {
        changedBy: string
        reason: TicketClassificationChangeReason
        feedback: string
    }
}

export enum TicketClassificationCategory {
    UNCATEGORIZED = 'UNCATEGORIZED',
    ORDER_ISSUE = 'ORDER_ISSUE',
    PAYMENT_ISSUE = 'PAYMENT_ISSUE',
    DELIVERY_ISSUE = 'DELIVERY_ISSUE',
    PRODUCT_ISSUE = 'PRODUCT_ISSUE',
    ACCOUNT_ISSUE = 'ACCOUNT_ISSUE',
    OTHER = 'OTHER',
}

export enum TicketClassificationType {
    AUTO = 'AUTO',
    MANUAL = 'MANUAL',
}

export enum TicketClassificationPriority {
    UNPRIORITIZED = 'UNPRIORITIZED',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export enum TicketClassificationSentiment {
    ANGRY = 'ANGRY',
    HAPPY = 'HAPPY',
    SAD = 'SAD',
    NEUTRAL = 'NEUTRAL',
}

export enum TicketClassificationChangeReason {
    INCORRECT_CLASSIFICATION = 'INCORRECT_CLASSIFICATION',
}

export const ticketClassification = z.object({
    id: z.string(),
    ticketId: z.string(),
    priority: z.nativeEnum(TicketClassificationPriority).default(TicketClassificationPriority.LOW),
    category: z.nativeEnum(TicketClassificationCategory).default(TicketClassificationCategory.UNCATEGORIZED),
    sentiment: z.nativeEnum(TicketClassificationSentiment).default(TicketClassificationSentiment.NEUTRAL),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
    classificationType: z.nativeEnum(TicketClassificationType).default(TicketClassificationType.AUTO),
})

export type TicketClassification = z.infer<typeof ticketClassification>
export type TicketClassificationCreatedEvent = {
    ticketClassification: TicketClassification
}
export type TicketClassificationUpdatedEvent = {
    ticketClassification: TicketClassification
}

export const ticketClassificationHistory = z.object({
    id: z.string(),
    ticketId: z.string(),
    classificationId: z.string(),
    classificationType: z.nativeEnum(TicketClassificationType),
    changedBy: z.string().optional().nullable(), // ID of the user who changed the classification
    reason: z.nativeEnum(TicketClassificationChangeReason).default(TicketClassificationChangeReason.INCORRECT_CLASSIFICATION).nullable(), // Reason for manual change
    feedback: z.string().optional().nullable(), // Feedback provided when changing classification
    timestamp: z.date().default(() => new Date()),
})

export type TicketClassificationHistory = z.infer<typeof ticketClassificationHistory>

export const customer = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
})

export type Customer = z.infer<typeof customer>
