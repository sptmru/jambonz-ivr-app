import { RouteOptions } from 'fastify';

export type RouteOptionsWithoutHandler = Omit<RouteOptions, 'handler'>;
