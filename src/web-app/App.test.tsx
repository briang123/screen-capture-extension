import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Chrome Extension Boilerplate Generator/i)).toBeInTheDocument();
  });

  it('renders the configuration form', () => {
    render(<App />);
    expect(screen.getByText(/Extension Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Extension Description/i)).toBeInTheDocument();
  });
});
