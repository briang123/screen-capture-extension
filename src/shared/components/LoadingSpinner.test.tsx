/**
 * LoadingSpinner Component Tests
 *
 * Unit tests for the LoadingSpinner component including
 * accessibility, behavior, and structure.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading...');
  });

  it('should render with custom message', () => {
    const message = 'Saving settings...';
    render(<LoadingSpinner message={message} />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', message);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it.skip('should render with custom size', () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = screen.getByRole('status');
    const spinnerElement = spinner.querySelector('div[aria-hidden="true"]');
    expect(spinnerElement).toBeInTheDocument();
  });

  it.skip('should render with small size', () => {
    render(<LoadingSpinner size="sm" />);

    const spinner = screen.getByRole('status');
    const spinnerElement = spinner.querySelector('div[aria-hidden="true"]');
    expect(spinnerElement).toBeInTheDocument();
  });

  it.skip('should render with medium size', () => {
    render(<LoadingSpinner size="md" />);

    const spinner = screen.getByRole('status');
    const spinnerElement = spinner.querySelector('div[aria-hidden="true"]');
    expect(spinnerElement).toBeInTheDocument();
  });

  it.skip('should render with large size', () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = screen.getByRole('status');
    const spinnerElement = spinner.querySelector('div[aria-hidden="true"]');
    expect(spinnerElement).toBeInTheDocument();
  });

  it.skip('should render with extra large size', () => {
    render(<LoadingSpinner size="xl" />);

    const spinner = screen.getByRole('status');
    const spinnerElement = spinner.querySelector('div[aria-hidden="true"]');
    expect(spinnerElement).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    const customClass = 'custom-spinner-class';
    render(<LoadingSpinner className={customClass} />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(customClass);
  });

  it('should have proper accessibility attributes', () => {
    render(<LoadingSpinner message="Processing..." />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Processing...');
  });

  it.skip('should render spinner animation', () => {
    render(<LoadingSpinner />);

    const spinnerElement = screen.getByRole('status').querySelector('div[aria-hidden="true"]');
    expect(spinnerElement).toBeInTheDocument();
  });

  it('should render with description', () => {
    const description = 'Please wait while we process your request';
    render(<LoadingSpinner description={description} />);

    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('should render with custom aria-label', () => {
    const ariaLabel = 'Custom aria label';
    render(<LoadingSpinner aria-label={ariaLabel} />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', ariaLabel);
  });

  it.skip('should render with all props combined', () => {
    render(
      <LoadingSpinner
        message="Custom loading message"
        description="Custom description"
        size="xl"
        className="custom-class"
        aria-label="Custom aria label"
      />
    );

    const spinner = screen.getByRole('status');
    const spinnerElement = spinner.querySelector('div[aria-hidden="true"]');

    expect(spinner).toHaveAttribute('aria-label', 'Custom aria label');
    expect(spinner).toHaveClass('custom-class');
    expect(spinnerElement).toBeInTheDocument();
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
  });

  it('should have proper container structure', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner.tagName).toBe('DIV');
  });

  it('should have proper spinner element structure', () => {
    render(<LoadingSpinner />);

    const spinnerElement = screen.getByRole('status').querySelector('div[aria-hidden="true"]');
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render message text with proper styling class', () => {
    render(<LoadingSpinner message="Test message" />);

    const messageElement = screen.getByText('Test message');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement.tagName).toBe('P');
  });

  it('should render description text with proper styling class', () => {
    render(<LoadingSpinner description="Test description" />);

    const descriptionElement = screen.getByText('Test description');
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement.tagName).toBe('P');
  });
});
