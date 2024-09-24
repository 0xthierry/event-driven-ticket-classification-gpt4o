import type { Ticket, TicketClassification, TicketClassificationChangeReason, TicketClassificationCreatedEvent, TicketClassificationHistory } from '../entities/ticket'
import { TicketClassificationCategory, TicketClassificationPriority, TicketClassificationSentiment, TicketClassificationType } from '../entities/ticket'
import { classify as classifyTicketCategory } from '../prompts/classify-ticket-category'
import { classify as classifyTicketSentiment } from '../prompts/classify-ticket-sentiment'
import { classify as classifyTicketPriority } from '../prompts/classitify-ticket-priority'
import eventBus from '../utils/event-bus'

const classifications: Map<string, TicketClassification> = new Map()
const classificationHistories: TicketClassificationHistory[] = []

class ClassificationService {
    async onTicketCreated(ticket: Ticket): Promise<TicketClassification> {
        // TODO: Build a pipeline abstraction to add multiple steps to the classification process
        const [category, sentiment] = await Promise.all([
            classifyTicketCategory(ticket.description),
            classifyTicketSentiment(ticket.description),
        ])
        const priority = await classifyTicketPriority(ticket.description, sentiment, category)

        const newClassification: TicketClassification = {
            id: this.generateId(),
            ticketId: ticket.id,
            category,
            sentiment,
            priority,
            classificationType: TicketClassificationType.AUTO,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        classifications.set(newClassification.id, newClassification)

        this.recordHistory(newClassification, TicketClassificationType.AUTO, null, null)

        const classificationCreatedEvent: TicketClassificationCreatedEvent = {
            ticketClassification: newClassification,
        }

        eventBus.emit('classification:on-completed', classificationCreatedEvent)

        return newClassification
    }

    onTicketUpdated(ticket: Ticket, changedBy: string, reason: TicketClassificationChangeReason, feedback: string): TicketClassification | null {
        const classification = classifications.get(ticket.classificationId!)

        if (!classification)
            return null

        const updatedClassification = {
            ...classification,
            changedBy,
            reason,
            feedback,
            classificationType: TicketClassificationType.MANUAL,
            updatedAt: new Date(),
        }
        classifications.set(updatedClassification.id, updatedClassification)

        this.recordHistory(updatedClassification, TicketClassificationType.MANUAL, reason, feedback)

        return updatedClassification
    }

    getClassification(id: string): TicketClassification | null {
        return classifications.get(id) || null
    }

    getClassificationHistory(ticketId: string): TicketClassificationHistory[] {
        return classificationHistories.filter(history => history.ticketId === ticketId)
    }

    private recordHistory(classification: TicketClassification, classificationType: TicketClassificationType, reason: TicketClassificationChangeReason | null, feedback: string | null) {
        const history: TicketClassificationHistory = {
            id: this.generateId(),
            ticketId: classification.ticketId,
            classificationId: classification.id,
            classificationType,
            changedBy: classificationType === TicketClassificationType.MANUAL ? 'johndoe@example.com' : null,
            reason,
            feedback,
            timestamp: new Date(),
        }
        classificationHistories.push(history)
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 9)
    }
}

export default ClassificationService
