import { Api } from './infrastructure/api/server';

const api = new Api({
  plugins: [],
  routes: [],
  definitions: [],
});

api.listen();
