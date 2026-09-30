import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("=== CHECKING ALL SUBJECTS IN DATABASE ===");
  const subjects = await prisma.subject.findMany({
    include: {
      topics: {
        include: {
          _count: {
            select: { questions: true },
          },
        },
      },
    },
  });

  for (const s of subjects) {
    console.log(`\nSubject: ${s.name} (id: ${s.id}, active: ${s.isActive})`);
    console.log(`Topics count: ${s.topics.length}`);
    for (const t of s.topics) {
      console.log(`  - Topic: "${t.name}" (id: ${t.id}, questions: ${t._count.questions})`);
    }
  }

  console.log("\n=== TOTALS ===");
  console.log(`Total subjects: ${subjects.length}`);
  const totalQuestions = await prisma.question.count();
  console.log(`Total questions in DB: ${totalQuestions}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
