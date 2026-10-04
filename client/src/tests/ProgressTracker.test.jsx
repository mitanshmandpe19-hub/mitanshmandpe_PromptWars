import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressTracker } from '../components/ProgressTracker.jsx';

describe('ProgressTracker Component', () => {
  it('counts resolved, partial, and open blind spots correctly with distinct values', () => {
    const spots = [
      { id: '1', status: 'resolved' },
      { id: '2', status: 'resolved' },
      { id: '3', status: 'resolved' },
      { id: '4', status: 'partial' },
      { id: '5', status: 'partial' },
      { id: '6', status: 'open' },
    ];

    render(<ProgressTracker blindSpots={spots} />);
    expect(screen.getByText('3')).toBeInTheDocument(); // 3 resolved
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 partial
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 open
  });
});
