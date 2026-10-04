import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EvidenceBadge } from '../components/EvidenceBadge.jsx';

describe('EvidenceBadge Component', () => {
  it('renders direct evidence with text and circle shape', () => {
    const { container } = render(<EvidenceBadge status="direct" />);
    expect(screen.getByText('Direct evidence')).toBeInTheDocument();
    const circle = container.querySelector('circle');
    expect(circle).toBeInTheDocument();
  });

  it('renders indirect evidence with text and triangle shape', () => {
    const { container } = render(<EvidenceBadge status="indirect" />);
    expect(screen.getByText('Indirect evidence')).toBeInTheDocument();
    const polygon = container.querySelector('polygon');
    expect(polygon).toBeInTheDocument();
  });

  it('renders no evidence with text and square shape', () => {
    const { container } = render(<EvidenceBadge status="none" />);
    expect(screen.getByText('No evidence found')).toBeInTheDocument();
    const rect = container.querySelector('rect');
    expect(rect).toBeInTheDocument();
  });
});
