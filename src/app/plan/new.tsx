import { router, useLocalSearchParams } from 'expo-router';

import { Planner } from '@/components/agent/planner';
import { actions } from '@/data/store';

/** Route wrapper for the planner (deep links, ideas → "Plan this with S2S"). */
export default function PlanNew() {
  const { idea, prompt } = useLocalSearchParams<{ idea?: string; prompt?: string }>();
  return (
    <Planner
      idea={idea}
      prompt={prompt}
      onClose={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
      onSubmit={(draft) => {
        const id = actions.createDraft(draft);
        router.replace({ pathname: '/plan/run', params: { id } });
      }}
    />
  );
}
