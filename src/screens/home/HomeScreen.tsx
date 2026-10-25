import { findActiveAttack } from '../../domain/attacks';
import { ActiveAttack } from './ActiveAttack';
import { IdleHome } from './IdleHome';
import { useHomeData, useNow } from './useHomeData';

export function HomeScreen() {
  const data = useHomeData();
  const now = useNow();
  if (!data) return null;

  const activeAttack = findActiveAttack(data.attacks);
  return activeAttack ? (
    <ActiveAttack {...data} attack={activeAttack} now={now} />
  ) : (
    <IdleHome {...data} now={now} />
  );
}
