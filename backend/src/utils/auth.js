// backend/src/utils/auth.js
class SimpleAuth {
    constructor() {
        this.sessions = new Map();
    }

    createSession(userId) {
        const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        this.sessions.set(sessionId, {
            userId: userId,
            createdAt: Date.now(),
            lastActive: Date.now()
        });
        
        // Cleanup old sessions (24 hours)
        this.cleanup();
        
        return sessionId;
    }

    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastActive = Date.now();
            return session;
        }
        return null;
    }

    destroySession(sessionId) {
        this.sessions.delete(sessionId);
    }

    cleanup() {
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastActive > twentyFourHours) {
                this.sessions.delete(sessionId);
            }
        }
    }
}

module.exports = new SimpleAuth();