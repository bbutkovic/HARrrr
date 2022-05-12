export class ResourceUnreachableException extends Error {
    constructor(resource?: string) {
        super(resource ? `Resource ${resource} is unreachable.` : undefined);

        this.name = 'ResourceUnreachableException';
    }
}