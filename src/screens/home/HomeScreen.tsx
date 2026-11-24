import { findActiveAttack } from '../../domain/attacks';
import { ActiveAttack } from './ActiveAttack';
import { IdleHome } from './IdleHome';
import { useHomeData, useNow, useSettings } from './useHomeData';

export function HomeScreen() {
  const data = useHomeData();
  const settings = useSettings();
  const now = useNow();
  if (!data || !settings) return null;

  const activeAttack = findActiveAttack(data.attacks);
  return activeAttack ? (
    <ActiveAttack
      {...data}
      attack={activeAttack}
      now={now}
      trackOtherHeadaches={settings.trackOtherHeadaches}
    />
  ) : (
    <IdleHome {...data} now={now} trackOtherHeadaches={settings.trackOtherHeadaches} />
  );
}
