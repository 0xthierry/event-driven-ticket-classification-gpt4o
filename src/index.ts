/* eslint-disable perfectionist/sort-imports */
import 'dotenv/config'
import type { TicketClassificationCreatedEvent, TicketCreatedEvent, TicketUpdatedEvent } from './entities/ticket'
import ClassificationService from './services/classification-service'
import TicketService from './services/ticket-service'
import eventBus from './utils/event-bus'
/* eslint-disable no-console */

const ticketService = new TicketService()

const classificationService = new ClassificationService()

// Event listeners
eventBus.on('ticket:on-created', async (event: TicketCreatedEvent) => {
    console.log('Ticket Created:', event)
    await classificationService.onTicketCreated(event.ticket)
})

eventBus.on('ticket:on-updated', (event: TicketUpdatedEvent) => {
    console.log('Ticket Updated:', event)
    classificationService.onTicketUpdated(event.ticket, event.changes.changedBy, event.changes.reason, event.changes.feedback)
})

eventBus.on('classification:on-completed', (event: TicketClassificationCreatedEvent) => {
    console.log('Classification Completed:', event)
    ticketService.onClassificationCompleted(event.ticketClassification)
})

const ticket = ticketService.createTicket({
    costumerId: 'cust123',
    description: 'My order is late for delivery, what fuck are you doing?',
})

console.log('Ticket:', ticket)
