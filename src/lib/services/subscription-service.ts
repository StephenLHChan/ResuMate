import { prisma } from "@/lib/prisma";

export class SubscriptionService {
  static async initializeUserSubscription(userId: string): Promise<void> {
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        status: "active",
        plan: "free",
        startDate: new Date(),
      },
      update: {},
    });
  }

  static async getUserSubscription(userId: string): Promise<{
    status: string;
    plan: string;
    endDate: Date | null;
  } | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: {
        status: true,
        plan: true,
        endDate: true,
      },
    });

    return subscription;
  }

  static async isPremiumUser(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    return (
      subscription?.plan === "premium" && subscription?.status === "active"
    );
  }

  static async upgradeToPremium(
    userId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    endDate: Date
  ): Promise<void> {
    await prisma.$transaction(async tx => {
      const currentSubscription = await tx.subscription.findUnique({
        where: { userId },
      });

      if (currentSubscription) {
        // Record current subscription in history
        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: currentSubscription.id,
            status: currentSubscription.status,
            plan: currentSubscription.plan,
            startDate: currentSubscription.startDate,
            endDate: new Date(),
          },
        });

        // Update to premium
        await tx.subscription.update({
          where: { userId },
          data: {
            status: "active",
            plan: "premium",
            startDate: new Date(),
            endDate,
            stripeCustomerId,
            stripeSubscriptionId,
          },
        });
      } else {
        // Create new premium subscription
        await tx.subscription.create({
          data: {
            userId,
            status: "active",
            plan: "premium",
            startDate: new Date(),
            endDate,
            stripeCustomerId,
            stripeSubscriptionId,
          },
        });
      }
    });
  }

  static async cancelSubscription(userId: string): Promise<void> {
    await prisma.$transaction(async tx => {
      const subscription = await tx.subscription.findUnique({
        where: { userId },
      });

      if (subscription) {
        // Record current subscription in history
        await tx.subscriptionHistory.create({
          data: {
            subscriptionId: subscription.id,
            status: subscription.status,
            plan: subscription.plan,
            startDate: subscription.startDate,
            endDate: new Date(),
          },
        });

        // Update subscription status
        await tx.subscription.update({
          where: { userId },
          data: {
            status: "canceled",
            endDate: new Date(),
          },
        });
      }
    });
  }
}
