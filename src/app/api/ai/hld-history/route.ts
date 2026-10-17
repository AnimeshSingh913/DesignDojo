import HLDHistory from '@/models/HLDHistory';
import { createHistoryHandlers } from '@/lib/history-route';

const handlers = createHistoryHandlers(HLDHistory, 'HLD');

export const GET = handlers.GET;
export const POST = handlers.POST;
