// Utility functions for ticket operations

/**
 * Format ticket ObjectId to readable ticket code
 * Example: 694838562b95a23e438402e4 -> TIC-6948-3856-402E
 */
export const formatTicketCode = (ticketId: string): string => {
    if (!ticketId || ticketId.length < 24) {
        return 'TIC-INVALID';
    }
    
    // Take first 8 chars and last 4 chars, format as TIC-XXXX-XXXX-XXXX
    const first8 = ticketId.slice(0, 8).toUpperCase();
    const last4 = ticketId.slice(-4).toUpperCase();
    const middle4 = ticketId.slice(8, 12).toUpperCase();
    
    return `TIC-${first8}-${middle4}-${last4}`;
};

/**
 * Short format ticket code (only show last 4 chars)
 * Example: 694838562b95a23e438402e4 -> TIC-****-****-402E
 */
export const formatTicketCodeShort = (ticketId: string): string => {
    if (!ticketId || ticketId.length < 4) {
        return 'TIC-INVALID';
    }
    
    const last4 = ticketId.slice(-4).toUpperCase();
    return `TIC-****-****-${last4}`;
};

