import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveAttack, startAttack } from '../../data/attackRepository';

/** Target of the "Start migraine" app shortcut: starts an attack unless one is running, then shows Home. */
export function StartShortcut() {
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    // Effects run twice in development; the attack must start only once.
    if (started.current) return;
    started.current = true;
    void (async () => {
      if (!(await getActiveAttack())) await startAttack();
      void navigate('/', { replace: true });
    })();
  }, [navigate]);

  return null;
}
