import { ApolloLink, Operation, FetchResult, Observable } from 'apollo-link';
import { print, GraphQLError } from 'graphql';
import { Client } from 'graphql-ws';

export class WebSocketLink extends ApolloLink {

    constructor(private client: Client) {
        super();
    }

    public request(operation: Operation): Observable<FetchResult> {
        return new Observable((sink) => {
            return this.client.subscribe<FetchResult>(
                { ...operation, query: print(operation.query) },
                {
                    next: sink.next.bind(sink),
                    complete: sink.complete.bind(sink),
                    error: (err) => {
                        if (err instanceof Error) {
                            sink.error(err);
                        } else if (err instanceof CloseEvent) {
                            sink.error(
                                new Error(
                                    `Socket closed with event ${err.code}` + err.reason
                                        ? `: ${err.reason}` // reason will be available on clean closes
                                        : '',
                                ),
                            );
                        } else {
                            sink.error(
                                new Error(
                                    (err as GraphQLError[])
                                        .map(({ message }) => message)
                                        .join(', '),
                                ),
                            );
                        }
                    },
                },
            );
        });
    }
} 
