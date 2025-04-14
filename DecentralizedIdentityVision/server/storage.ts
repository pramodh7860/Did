import { identities, type Identity, type InsertIdentity, type UpdateIdentity } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getIdentityByWalletAddress(walletAddress: string): Promise<Identity | undefined>;
  createIdentity(identity: InsertIdentity): Promise<Identity>;
  updateIdentity(walletAddress: string, identity: UpdateIdentity): Promise<Identity | undefined>;
  listIdentities(): Promise<Identity[]>;
}

export class DatabaseStorage implements IStorage {
  async getIdentityByWalletAddress(walletAddress: string): Promise<Identity | undefined> {
    // First try exact match
    let [identity] = await db.select()
      .from(identities)
      .where(eq(identities.walletAddress, walletAddress));
    
    // If not found, try case-insensitive match
    if (!identity) {
      const results = await db.select().from(identities);
      const matchedIdentity = results.find(
        record => record.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );
      if (matchedIdentity) {
        identity = matchedIdentity;
      }
    }
    
    return identity;
  }

  async createIdentity(insertIdentity: InsertIdentity): Promise<Identity> {
    const now = new Date();
    
    const [identity] = await db.insert(identities)
      .values({
        ...insertIdentity,
        createdAt: now,
        updatedAt: now,
        version: 1,
        previousVersions: []
      })
      .returning();
    
    return identity;
  }

  async updateIdentity(walletAddress: string, updateData: UpdateIdentity): Promise<Identity | undefined> {
    // First get the existing identity
    const existing = await this.getIdentityByWalletAddress(walletAddress);
    
    if (!existing) {
      return undefined;
    }
    
    const now = new Date();
    const previousVersions = existing.previousVersions || [];
    
    // Store the current CID in the version history
    if (existing.ipfsCid) {
      previousVersions.push(existing.ipfsCid);
    }
    
    // Update the identity in the database
    const [updated] = await db.update(identities)
      .set({
        ...updateData,
        updatedAt: now,
        version: existing.version + 1,
        previousVersions
      })
      .where(eq(identities.walletAddress, walletAddress))
      .returning();
    
    return updated;
  }

  async listIdentities(): Promise<Identity[]> {
    return db.select().from(identities);
  }
}

export const storage = new DatabaseStorage();
