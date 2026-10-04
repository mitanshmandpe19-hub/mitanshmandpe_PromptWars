import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HighlightedText } from '../components/HighlightedText.jsx';

describe('HighlightedText Component', () => {
  const sampleText =
    "I am thinking of quitting my internship because I don't have enough time to study.";

  const blindSpots = [
    {
      id: 'bs-1',
      evidence_quote: "don't have enough time to study",
      quote_verified: true,
    },
    {
      id: 'bs-2',
      evidence_quote: 'quitting my internship',
      quote_verified: false, // Unverified quote should NOT be highlighted
    },
  ];

  it('highlights ONLY verified quotes with mark tags', () => {
    render(<HighlightedText text={sampleText} blindSpots={blindSpots} />);

    const marks = screen.getAllByRole('button');
    expect(marks.length).toBe(1);
    expect(marks[0]).toHaveTextContent("don't have enough time to study");
  });

  it('applies active class when activeQuote matches', () => {
    render(
      <HighlightedText
        text={sampleText}
        blindSpots={blindSpots}
        activeQuote="don't have enough time to study"
      />,
    );

    const mark = screen.getByRole('button');
    expect(mark).toHaveClass('active');
  });

  it('triggers onHoverQuote on mouse enter of highlighted mark', () => {
    const onHoverMock = vi.fn();
    render(
      <HighlightedText text={sampleText} blindSpots={blindSpots} onHoverQuote={onHoverMock} />,
    );

    const mark = screen.getByRole('button');
    fireEvent.mouseEnter(mark);
    expect(onHoverMock).toHaveBeenCalledWith("don't have enough time to study");
  });
});
