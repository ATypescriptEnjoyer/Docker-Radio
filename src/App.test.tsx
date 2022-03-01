import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders learn react link', (): void => {
  render(<App />);
  const linkElement = screen.getAllByText(/phonk.live/i);
  expect(linkElement.length).toBeGreaterThanOrEqual(1);
});
