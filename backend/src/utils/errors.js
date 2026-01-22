export class BadRequestError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "BadRequestError";
    }
}

export class NotFoundError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "NotFoundError";
    }
}

export class InternalServerError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "InternalServerError";
    }
}

export class ConflictError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "ConflictError";
    }
}

export class ForbiddenError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "ForbiddenError";
    }
}

export class UnauthorizedError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "UnauthorizedError";
    }
}
