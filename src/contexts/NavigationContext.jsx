import { createContext, useContext, useReducer, useCallback } from 'react';
import { SCREENS } from '../constants/screens';

const NavigationContext = createContext(null);

function reducer(stack, action) {
  switch (action.type) {
    case 'PUSH':
      return [...stack, { screen: action.screen, props: action.props || {} }];
    case 'POP':
      return stack.length > 1 ? stack.slice(0, -1) : stack;
    case 'RESET':
      return [{ screen: SCREENS.MAIN_MENU, props: {} }];
    default:
      return stack;
  }
}

export function NavigationProvider({ children }) {
  const [stack, dispatch] = useReducer(reducer, [
    { screen: SCREENS.MAIN_MENU, props: {} },
    { screen: SCREENS.NOW_PLAYING, props: {} },
  ]);

  const push = useCallback((screen, props) => {
    dispatch({ type: 'PUSH', screen, props });
  }, []);

  const pop = useCallback(() => {
    dispatch({ type: 'POP' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const current = stack[stack.length - 1];

  return (
    <NavigationContext.Provider value={{ stack, current, push, pop, reset }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
