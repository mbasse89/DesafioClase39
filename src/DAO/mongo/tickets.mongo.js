import ticketModels from "./models/ticket.models.js"
export default class Tickets {
  constructor() { }

  createTicket = async (ticket) => {
    const result = await ticketModel.create(ticket)
    return result
  }
}