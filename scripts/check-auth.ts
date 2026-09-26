import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("==========================================");
  console.log("       SKILLSYNC AUTH ACTIVITY REPORT      ");
  console.log("==========================================\n");

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          assessments: true,
          learningProfile: true,
          learningPlans: true,
          tutorSessions: true,
          quizzes: true,
          progressRecords: true,
        },
      },
      assessments: {
        select: {
          id: true,
          status: true,
          correctAnswers: true,
          totalQuestions: true,
          overallScore: true,
          startedAt: true,
          completedAt: true,
          subject: { select: { name: true } },
        },
        orderBy: { startedAt: "desc" },
        take: 5,
      },
      tutorSessions: {
        select: {
          id: true,
          topicName: true,
          status: true,
          messageCount: true,
          startedAt: true,
        },
        orderBy: { startedAt: "desc" },
        take: 5,
      },
      quizzes: {
        select: {
          id: true,
          status: true,
          score: true,
          totalQuestions: true,
          correctAnswers: true,
          startedAt: true,
        },
        orderBy: { startedAt: "desc" },
        take: 5,
      },
      learningPlans: {
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`📊 Total Users Registered: ${users.length}\n`);

  if (users.length === 0) {
    console.log("No registered users found in PostgreSQL database.");
  } else {
    for (const u of users) {
      console.log(`------------------------------------------`);
      console.log(`👤 User: ${u.name} (${u.email})`);
      console.log(`   ID: ${u.id}`);
      console.log(`   Registered At: ${u.createdAt.toISOString()}`);
      console.log(`   Last Updated: ${u.updatedAt.toISOString()}`);
      console.log(`   Education Level: ${u.educationLevel || "Not set"}`);
      console.log(`   Learning Goals: ${u.learningGoals || "Not set"}`);
      console.log(`   Preferred Style: ${u.preferredStyle || "Not set"}`);
      console.log(`   Onboarding Completed: ${u.onboardingCompleted}`);
      console.log(`   Total Activity Counts:`);
      console.log(`     - Assessments: ${u._count.assessments}`);
      console.log(`     - Tutor Sessions: ${u._count.tutorSessions}`);
      console.log(`     - Quizzes: ${u._count.quizzes}`);
      console.log(`     - Learning Profiles: ${u._count.learningProfile}`);
      console.log(`     - Learning Plans: ${u._count.learningPlans}`);
      console.log(`     - Progress Records: ${u._count.progressRecords}`);

      if (u.assessments.length > 0) {
        console.log(`\n   Recent Assessments:`);
        for (const a of u.assessments) {
          console.log(`     • [${a.status}] ${a.subject.name}: Score ${a.overallScore}% (${a.correctAnswers}/${a.totalQuestions}) at ${a.startedAt.toISOString()}`);
        }
      }

      if (u.tutorSessions.length > 0) {
        console.log(`\n   Recent Tutor Sessions:`);
        for (const t of u.tutorSessions) {
          console.log(`     • [${t.status}] Topic: ${t.topicName} (${t.messageCount} msgs) at ${t.startedAt.toISOString()}`);
        }
      }

      if (u.quizzes.length > 0) {
        console.log(`\n   Recent Quizzes:`);
        for (const q of u.quizzes) {
          console.log(`     • [${q.status}] Score: ${q.score}% (${q.correctAnswers}/${q.totalQuestions}) at ${q.startedAt.toISOString()}`);
        }
      }

      if (u.learningPlans.length > 0) {
        console.log(`\n   Learning Plans:`);
        for (const lp of u.learningPlans) {
          console.log(`     • [${lp.status}] ${lp.title} created ${lp.createdAt.toISOString()}`);
        }
      }
      console.log("");
    }
  }

  // Also check if any answers or messages exist orphaned
  const answerCount = await prisma.answer.count();
  const tutorMsgCount = await prisma.tutorMessage.count();
  const topicScoreCount = await prisma.topicScore.count();
  const questionCount = await prisma.question.count();
  const subjectCount = await prisma.subject.count();

  console.log("==========================================");
  console.log("           OVERALL DATABASE STATS         ");
  console.log("==========================================");
  console.log(`Subjects: ${subjectCount}`);
  console.log(`Questions: ${questionCount}`);
  console.log(`Submitted Answers: ${answerCount}`);
  console.log(`Topic Scores Recorded: ${topicScoreCount}`);
  console.log(`Tutor Messages Exchanged: ${tutorMsgCount}`);
  console.log("==========================================\n");
}

main()
  .catch((e) => {
    console.error("Error checking auth activity:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
