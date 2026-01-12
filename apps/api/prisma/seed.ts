import { PrismaClient, User, Task, TaskEvent, KnowledgeCategory } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as pg from "pg";
import * as bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Create roles
  console.log("Creating roles...");
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "Admin" },
      update: {},
      create: { name: "Admin" },
    }),
    prisma.role.upsert({
      where: { name: "Manager" },
      update: {},
      create: { name: "Manager" },
    }),
    prisma.role.upsert({
      where: { name: "User" },
      update: {},
      create: { name: "User" },
    }),
  ]);

  const adminRole = roles[0];
  const managerRole = roles[1];
  const userRole = roles[2];

  // Create 100+ users
  console.log("Creating users...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  const users: User[] = [];

  for (let i = 1; i <= 100; i++) {
    const roleId =
      i === 1
        ? adminRole.id
        : i <= 10
          ? managerRole.id
          : userRole.id;

    const user = await prisma.user.create({
      data: {
        email: `user${i}@test.com`,
        name: `User ${i}`,
        password: hashedPassword,
        roleId: roleId,
      },
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users`);

  // Create 5k tasks
  console.log("Creating tasks...");
  const tasks: Task[] = [];
  const statuses = ["new", "in_progress", "done", "cancelled"];

  for (let i = 1; i <= 5000; i++) {
    const task = await prisma.task.create({
      data: {
        title: `Task ${i}`,
        description: `Description for task ${i}. This is a detailed description that provides context about the task requirements and objectives.`,
        status: statuses[i % statuses.length],
        assigneeId: users[i % users.length].id,
      },
    });
    tasks.push(task);

    if (i % 500 === 0) {
      console.log(`  Created ${i} tasks...`);
    }
  }

  console.log(`✅ Created ${tasks.length} tasks`);

  // Create 30k task events
  console.log("Creating task events...");
  const eventTypes = ["created", "updated", "commented", "assigned", "completed"];
  let eventCount = 0;

  for (let i = 1; i <= 30000; i++) {
    const task = tasks[i % tasks.length];
    const user = users[i % users.length];

    await prisma.taskEvent.create({
      data: {
        taskId: task.id,
        userId: user.id,
        type: eventTypes[i % eventTypes.length],
        message: `Event ${i}: ${eventTypes[i % eventTypes.length]} by ${user.name}`,
      },
    });

    eventCount++;

    if (i % 5000 === 0) {
      console.log(`  Created ${i} events...`);
    }
  }

  console.log(`✅ Created ${eventCount} task events`);

  // Create knowledge categories and documents
  console.log("Creating knowledge base...");
  const categories: KnowledgeCategory[] = [];
  const categoryTitles = [
    "Getting Started",
    "API Documentation",
    "User Guides",
    "Troubleshooting",
    "Best Practices",
    "Architecture",
    "Deployment",
    "Security",
    "Performance",
    "Integration",
  ];

  for (let i = 0; i < categoryTitles.length; i++) {
    const category = await prisma.knowledgeCategory.create({
      data: {
        title: categoryTitles[i],
        slug: categoryTitles[i].toLowerCase().replace(/\s+/g, "-"),
      },
    });
    categories.push(category);
  }

  console.log(`✅ Created ${categories.length} categories`);

  // Create 100+ documents (10 per category = 100 total)
  console.log("Creating knowledge documents...");
  let docCount = 0;

  for (const category of categories) {
    for (let j = 1; j <= 10; j++) {
      const doc = await prisma.knowledgeDocument.create({
        data: {
          title: `${category.title} - Document ${j}`,
          slug: `${category.slug}-document-${j}`,
          content: `This is the content for ${category.title} Document ${j}. It contains detailed information, examples, and best practices related to this topic. The content is comprehensive and provides valuable insights for users.`,
          categoryId: category.id,
        },
      });

      // Create initial version
      await prisma.documentVersion.create({
        data: {
          documentId: doc.id,
          content: doc.content,
          version: 1,
        },
      });

      docCount++;
    }
  }

  console.log(`✅ Created ${docCount} knowledge documents`);

  // Create some system events
  console.log("Creating system events...");
  const systemEventTypes = [
    "system_start",
    "user_login",
    "user_logout",
    "task_created",
    "task_completed",
    "document_updated",
  ];

  for (let i = 1; i <= 100; i++) {
    await prisma.systemEvent.create({
      data: {
        type: systemEventTypes[i % systemEventTypes.length],
        message: `System event ${i}: ${systemEventTypes[i % systemEventTypes.length]}`,
        metadata: {
          timestamp: new Date().toISOString(),
          source: "seed_script",
          index: i,
        },
      },
    });
  }

  console.log("✅ Created 100 system events");

  console.log("\n🎉 Seed completed successfully!");
  console.log(`📊 Summary:`);
  console.log(`   - Roles: ${roles.length}`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Tasks: ${tasks.length}`);
  console.log(`   - Task Events: ${eventCount}`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Documents: ${docCount}`);
  console.log(`   - System Events: 100`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
