import { CallDetailsDefinition } from './domain/definitions/calldetails.definition';
import { Api } from './infrastructure/api/server';
import { CallsRoute } from './routes/calls/calls.route';
import { HealthRoute } from './routes/health/health.route';

const api = new Api({
  plugins: [],
  routes: [HealthRoute, CallsRoute],
  definitions: [CallDetailsDefinition],
});

api.listen();
