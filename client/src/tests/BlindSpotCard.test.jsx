import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BlindSpotCard } from '../components/BlindSpotCard.jsx';

describe('BlindSpotCard Component', () => {
  const verifiedSpot = {
    id: 'bs-1',
    title: 'Schedule Inflexibility',
    type: 'Assumption',
    why_flagged: 'Have you verified if reduced hours are possible?',
    evidence_quote: "don't have enough time to study",
    evidence_status: 'direct',
    quote_verified: true,
    confidence: 'high',
    status: 'open',
  };

  const unverifiedSpot = {
    id: 'bs-2',
    title: 'Market Risk',
    type: 'Risk',
    why_flagged: 'Uncertain market conditions',
    evidence_quote: null,
    evidence_status: 'none',
    quote_verified: false,
    confidence: 'medium',
    status: 'open',
  };

  it('renders verified stamp and quote when quote_verified is true', () => {
    render(<BlindSpotCard spot={verifiedSpot} index={0} />);
    expect(screen.getByText('Schedule Inflexibility')).toBeInTheDocument();
    expect(screen.getByText('★ QUOTE VERIFIED')).toBeInTheDocument();
    expect(screen.getByText("don't have enough time to study")).toBeInTheDocument();
  });

  it('hides verified stamp when quote_verified is false', () => {
    render(<BlindSpotCard spot={unverifiedSpot} index={1} />);
    expect(screen.getByText('Market Risk')).toBeInTheDocument();
    expect(screen.queryByText('★ QUOTE VERIFIED')).not.toBeInTheDocument();
  });

  it('renders status stamp when resolved', () => {
    const resolvedSpot = { ...verifiedSpot, status: 'resolved' };
    render(<BlindSpotCard spot={resolvedSpot} index={0} />);
    expect(screen.getByText('✓ RESOLVED')).toBeInTheDocument();
  });

  it('expands why flagged section on toggle click', () => {
    render(<BlindSpotCard spot={verifiedSpot} index={0} />);
    const toggleBtn = screen.getByRole('button', { name: /Why we flagged this/i });
    expect(
      screen.queryByText('Have you verified if reduced hours are possible?'),
    ).not.toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(
      screen.getByText('Have you verified if reduced hours are possible?'),
    ).toBeInTheDocument();
  });

  it('triggers onHoverQuote on mouse enter when quote is verified', () => {
    const onHoverMock = vi.fn();
    render(<BlindSpotCard spot={verifiedSpot} index={0} onHoverQuote={onHoverMock} />);
    const card = screen.getByRole('article');
    fireEvent.mouseEnter(card);
    expect(onHoverMock).toHaveBeenCalledWith("don't have enough time to study");
  });
});
