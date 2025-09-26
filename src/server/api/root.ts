import { router } from './trpc';
import { formRouter } from '../routers/form';

export const appRouter = router({
  form: formRouter,
});

export type AppRouter = typeof appRouter;