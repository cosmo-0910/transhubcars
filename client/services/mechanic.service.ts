import { db } from '../../shared/lib/db';
import type { Mechanic } from '../../shared/lib/db';

export const mechanicService = {
  async getMechanics(options?: { onlyApproved?: boolean }): Promise<Mechanic[]> {
    try {
      return await db.getMechanics(options);
    } catch (error) {
      console.error('Web: Error fetching mechanics:', error);
      throw error;
    }
  }
};
