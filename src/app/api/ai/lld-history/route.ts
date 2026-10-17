import LLDHistory from '@/models/LLDHistory';
import { createHistoryHandlers } from '@/lib/history-route';

const handlers = createHistoryHandlers(LLDHistory, 'LLD');

export const GET = handlers.GET;
export const POST = handlers.POST;
