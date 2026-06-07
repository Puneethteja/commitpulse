import { describe, expect, it } from 'vitest';
import { SOCIALS, SOCIAL_CATEGORIES, getSocialById } from './socials';

describe('socials theme contrast metadata', () => {
  it('ensures every social entry contains required visual metadata', () => {
    SOCIALS.forEach((social) => {
      expect(social.id).toBeTruthy();
      expect(social.name).toBeTruthy();
      expect(social.iconUrl).toBeTruthy();
      expect(social.category).toBeTruthy();
      expect(social.baseUrl).toBeTruthy();
      expect(social.placeholder).toBeTruthy();
    });
  });

  it('uses supported icon providers consistently for visual rendering', () => {
    SOCIALS.forEach((social) => {
      expect(social.iconUrl.includes('simpleicons.org') || social.iconUrl.includes('devicon')).toBe(
        true
      );
    });
  });

  it('maps every social entry to a valid category', () => {
    SOCIALS.forEach((social) => {
      expect(SOCIAL_CATEGORIES).toContain(social.category);
    });
  });

  it('retrieves social metadata correctly by id', () => {
    const github = getSocialById('github');

    expect(github).toBeDefined();
    expect(github?.name).toBe('GitHub');
    expect(github?.category).toBe('Developer');
    expect(github?.baseUrl).toBe('https://github.com/');
  });

  it('returns undefined for unknown social ids', () => {
    expect(getSocialById('non-existent-social')).toBeUndefined();
  });
});
