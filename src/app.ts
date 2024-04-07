import { CallDetailsDefinition } from './domain/definitions/calldetails.definition';
import { Api } from './infrastructure/api/server';
import { HealthRoute } from './routes/health/health.route';

const api = new Api({
  plugins: [],
  routes: [HealthRoute],
  definitions: [CallDetailsDefinition],
});

api.listen();
