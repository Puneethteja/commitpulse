import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GithubWrapped from './GithubWrapped';
import type { WrappedStats, UserProfile } from '@/types/dashboard';

const profile: UserProfile = {
  username: 'riddhima',
  name: 'Riddhima Gupta',
  avatarUrl: 'https://example.com/avatar.png',
  bio: null,
  followers: 10,
  following: 5,
  publicRepos: 20,
  developerScore: 85,
};

const wrappedData: WrappedStats = {
  totalContributions: 1200,
  topLanguage: 'TypeScript',
  highestDailyCount: 42,
  mostActiveDate: '2026-06-04',
  busiestMonth: '2026-06',
  weekendRatio: 30,
};

const renderWrapped = () => render(<GithubWrapped profile={profile} wrappedData={wrappedData} />);

describe('GithubWrapped mouse interactivity', () => {
  it('renders interactive wrapped container safely', () => {
    const { container } = renderWrapped();

    const wrappedContainer = container.firstElementChild as HTMLElement;

    expect(wrappedContainer).toBeInTheDocument();
    expect(wrappedContainer.className).toContain('overflow-hidden');
  });

  it('supports mouse enter on stats card areas without crashing', () => {
    renderWrapped();

    const topLanguageCard = screen.getByText('Top Language').closest('div') as HTMLElement;

    fireEvent.mouseEnter(topLanguageCard);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('supports mouse leave on stats card areas without hiding persistent content', () => {
    renderWrapped();

    const weekendCard = screen.getByText('The Weekend Grind').closest('div') as HTMLElement;

    fireEvent.mouseEnter(weekendCard);
    fireEvent.mouseLeave(weekendCard);

    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText(/Take a break/i)).toBeInTheDocument();
  });

  it('supports click propagation on wrapped stat cards without runtime errors', () => {
    renderWrapped();

    const highestDailyCard = screen.getByText('Highest Daily Push').closest('div') as HTMLElement;

    fireEvent.click(highestDailyCard);

    expect(screen.getByText('42 Commits')).toBeInTheDocument();
  });

  it('supports touch gesture events on mobile-like interaction targets', () => {
    renderWrapped();

    const busiestMonthCard = screen.getByText('Busiest Month').closest('div') as HTMLElement;

    fireEvent.touchStart(busiestMonthCard);
    fireEvent.touchEnd(busiestMonthCard);

    expect(screen.getByText('June 2026')).toBeInTheDocument();
  });
});
