import bcrypt from 'bcryptjs';
import User from '@/models/User';
import SystemSetting, { DEFAULT_AI_LIMITS } from '@/models/SystemSetting';

let isInitialized = false;

/**
 * Seeds the admin account (from ADMIN_EMAIL / ADMIN_PASSWORD) and default AI limits.
 * No credentials are hardcoded: if the env vars are missing, no admin is created.
 * An existing admin's password is never overwritten.
 */
export async function initAdminAndSettings() {
  if (isInitialized) return;

  try {
    // 1. Seed / ensure admin user
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail) {
      const adminUser = await User.findOne({ email: adminEmail });

      if (!adminUser) {
        if (adminPassword && adminPassword.length >= 12) {
          await User.create({
            name: 'Admin',
            email: adminEmail,
            password: await bcrypt.hash(adminPassword, 12),
            role: 'admin',
          });
          console.log(`✅ Admin user created for ${adminEmail}`);
        } else {
          console.warn('⚠️ ADMIN_EMAIL is set but ADMIN_PASSWORD is missing or shorter than 12 characters — admin not created.');
        }
      } else if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
        console.log(`✅ Existing user ${adminEmail} promoted to admin.`);
      }
    }

    // 2. Seed / ensure default system setting
    const existingSetting = await SystemSetting.findOne({ key: 'global_ai_limits' });
    if (!existingSetting) {
      await SystemSetting.create({
        key: 'global_ai_limits',
        limits: { ...DEFAULT_AI_LIMITS },
        updatedBy: 'system_init',
      });
      console.log('✅ Global AI limits initialized with defaults:', DEFAULT_AI_LIMITS);
    } else if (!existingSetting.limits || typeof existingSetting.limits.aiGenerator !== 'number') {
      existingSetting.limits = {
        lldReview: existingSetting.limits?.lldReview ?? DEFAULT_AI_LIMITS.lldReview,
        lldChat: existingSetting.limits?.lldChat ?? DEFAULT_AI_LIMITS.lldChat,
        hldReview: existingSetting.limits?.hldReview ?? DEFAULT_AI_LIMITS.hldReview,
        hldChat: existingSetting.limits?.hldChat ?? DEFAULT_AI_LIMITS.hldChat,
        aiGenerator: existingSetting.limits?.aiGenerator ?? DEFAULT_AI_LIMITS.aiGenerator,
        mentorChat: existingSetting.limits?.mentorChat ?? DEFAULT_AI_LIMITS.mentorChat,
      };
      await existingSetting.save();
    }

    isInitialized = true;
  } catch (error) {
    console.error('Error in initAdminAndSettings:', error);
  }
}
