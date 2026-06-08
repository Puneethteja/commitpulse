import mongoose from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Notification error resilience', () => {
  
  // TARGETED FIX: Helper function to force V8 to re-evaluate the file on every call
  async function importFreshModel() {
    const cacheBuster = Date.now() + Math.random();
    return await import(`./Notification?update=${cacheBuster}`);
  }

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should safely reuse existing Notification model during hydration', async () => {
    vi.resetModules();

    const existingModel = { mocked: true };
    mongoose.models.Notification = existingModel as never;

    // Fixed: Uses the fresh loader instead of standard cached static import
    const { Notification } = await importFreshModel();

    expect(Notification).toBe(existingModel);
  });

  it('should recover cleanly when mongoose.model throws unexpectedly', async () => {
    vi.resetModules();

    delete mongoose.models.Notification;

    vi.spyOn(mongoose, 'model').mockImplementation(() => {
      throw new Error('Database connectivity error');
    });

    let caughtError: Error | null = null;

    try {
      // Fixed: Cache-busting forces execution to reach your mongoose.model mock
      await importFreshModel();
    } catch (error) {
      caughtError = error as Error;
    }

    expect(caughtError).toBeTruthy();
    expect(caughtError?.message).toContain('Database connectivity error');
  });

  it('should expose safe default values for recovery stability', async () => {
    vi.resetModules();

    delete mongoose.models.Notification;

    // Fixed
    const { Notification } = await importFreshModel();

    const doc = new Notification({
      username: 'pari',
      email: 'pari@example.com',
    });

    expect(doc.frequency).toBe('daily');
    expect(doc.notifyOnCommit).toBe(true);
    expect(doc.notifyOnStreak).toBe(true);
    expect(doc.notifyOnMilestone).toBe(true);
    expect(doc.isActive).toBe(true);
  });

  it('should prevent invalid frequency values from crashing validation', async () => {
    vi.resetModules();

    delete mongoose.models.Notification;

    // Fixed
    const { Notification } = await importFreshModel();

    const doc = new Notification({
      username: 'pari',
      email: 'pari@example.com',
      frequency: 'invalid-value',
    });

    const validationError = doc.validateSync();

    expect(validationError).toBeTruthy();
    expect(validationError?.errors.frequency).toBeDefined();
  });

  it('should keep required validation failures localized', async () => {
    vi.resetModules();

    delete mongoose.models.Notification;

    // Fixed
    const { Notification } = await importFreshModel();

    const doc = new Notification({});

    const validationError = doc.validateSync();

    expect(validationError).toBeTruthy();
    expect(validationError?.errors.username).toBeDefined();
    expect(validationError?.errors.email).toBeDefined();
  });
});
