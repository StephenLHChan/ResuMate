import { type User } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const getCurrentUser = async (): Promise<User | null> => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!currentUser) {
      return null;
    }

    return currentUser;
  } catch {
    return null;
  }
};

export default getCurrentUser;
