import type { Ticket, TicketClassification, TicketClassificationChangeReason, TicketCreatedEvent, TicketUpdatedEvent } from '../entities/ticket'
import { TicketStatus } from '../entities/ticket'
import eventBus from '../utils/event-bus'

const tickets: Map<string, Ticket> = new Map()

class TicketService {
    createTicket(data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'classificationId'>): Ticket {
        const newTicket: Ticket = {
            id: this.generateId(),
            status: TicketStatus.OPEN,
            classificationId: null,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        tickets.set(newTicket.id, newTicket)

        const ticketCreatedEvent: TicketCreatedEvent = {
            ticket: newTicket,
        }

        eventBus.emit('ticket:on-created', ticketCreatedEvent)

        return newTicket
    }

    updateTicket(id: string, updates: Partial<Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>>, user: string, reason: TicketClassificationChangeReason, feedback: string): Ticket | null {
        const ticket = tickets.get(id)
        if (!ticket)
            return null

        const updatedTicket: Ticket = {
            ...ticket,
            ...updates,
            updatedAt: new Date(),
        }
        tickets.set(id, updatedTicket)

        const ticketUpdatedEvent: TicketUpdatedEvent = {
            ticket: updatedTicket,
            changes: {
                changedBy: user,
                reason,
                feedback,
            },
        }
        eventBus.emit('ticket:on-updated', ticketUpdatedEvent)

        return updatedTicket
    }

    getTicket(id: string): Ticket | null {
        return tickets.get(id) || null
    }

    onClassificationCompleted(classification: TicketClassification) {
        const ticket = this.getTicket(classification.ticketId)

        if (!ticket)
            return

        ticket.classificationId = classification.id
        tickets.set(ticket.id, ticket)
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 15)
    }
}

export default TicketService
