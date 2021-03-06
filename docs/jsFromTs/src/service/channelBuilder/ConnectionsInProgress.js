import { log } from '../../misc/util';
import { ConnectionError } from './ConnectionError';
export class ConnectionsInProgress {
    constructor() {
        this.connections = new Map();
    }
    create(id, connectionTimeout, responseTimeout, onConnectionTimeoutCallback) {
        const connection = {};
        connection.promise = new Promise((resolveResponse, rejectResponse) => {
            const responseTimer = setTimeout(() => connection.reject(new Error(ConnectionError.RESPONSE_TIMEOUT)), responseTimeout);
            connection.resolve = () => {
                clearTimeout(responseTimer);
                resolveResponse();
                connection.promise = new Promise((resolveConnection, rejectConnection) => {
                    const connectionTimer = setTimeout(() => {
                        log.channelBuilder('on Connection timeout callback');
                        onConnectionTimeoutCallback();
                        connection.reject(new Error(ConnectionError.CONNECTION_TIMEOUT));
                    }, connectionTimeout);
                    connection.resolve = () => {
                        clearTimeout(connectionTimer);
                        this.connections.delete(id);
                        resolveConnection();
                    };
                    connection.reject = (err) => {
                        // This is necessary for some scenarios in order to rid of UnhandledPromiseRejectionWarning errors in NodeJS and similar errors/warnings in browsers
                        connection.promise.catch(() => { });
                        clearTimeout(connectionTimer);
                        this.connections.delete(id);
                        rejectConnection(err);
                    };
                });
            };
            connection.reject = (err) => {
                // This is necessary for some scenarios in order to rid of UnhandledPromiseRejectionWarning errors in NodeJS and similar errors/warnings in browsers
                connection.promise.catch(() => { });
                clearTimeout(responseTimer);
                this.connections.delete(id);
                rejectResponse(err);
            };
            this.connections.set(id, connection);
        });
        return connection;
    }
    get(id) {
        return this.connections.get(id);
    }
    has(streamId, id) {
        return this.connections.has(id);
    }
    clean() {
        this.connections.forEach((c) => c.reject(new Error(ConnectionError.CLEAN)));
        this.connections.clear();
    }
}
