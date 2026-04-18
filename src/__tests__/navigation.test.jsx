import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { NavigationProvider, useNavigation } from '../contexts/NavigationContext';
import { SCREENS } from '../constants/screens';

function wrapper({ children }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}

describe('NavigationContext', () => {
  it('starts on NOW_PLAYING with MAIN_MENU underneath', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });
    expect(result.current.current.screen).toBe(SCREENS.NOW_PLAYING);
    expect(result.current.stack).toHaveLength(2);
    expect(result.current.stack[0].screen).toBe(SCREENS.MAIN_MENU);
  });

  it('push adds a screen to the stack', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });
    act(() => {
      result.current.push(SCREENS.SETTINGS, { foo: 'bar' });
    });
    expect(result.current.stack).toHaveLength(3);
    expect(result.current.current.screen).toBe(SCREENS.SETTINGS);
    expect(result.current.current.props).toEqual({ foo: 'bar' });
  });

  it('pop removes the top screen', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });
    act(() => {
      result.current.push(SCREENS.SETTINGS);
      result.current.push(SCREENS.BRIGHTNESS_CONTROL);
    });
    expect(result.current.stack).toHaveLength(4);
    act(() => {
      result.current.pop();
    });
    expect(result.current.stack).toHaveLength(3);
    expect(result.current.current.screen).toBe(SCREENS.SETTINGS);
  });

  it('pop does not go below one screen', () => {
    const { result } = renderHook(() => useNavigation(), { wrapper });
    act(() => {
      result.current.pop();
      result.current.pop();
      result.current.pop();
    });
    expect(result.current.stack).toHaveLength(1);
    expect(result.current.current.screen).toBe(SCREENS.MAIN_MENU);
  });
});
