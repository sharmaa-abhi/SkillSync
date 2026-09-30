import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Seeding Python Programming and Multi-Subject Tracks into SkillSync Database...");

  // 1. Python Programming
  const python = await prisma.subject.upsert({
    where: { name: "Python Programming" },
    update: { isActive: true },
    create: {
      name: "Python Programming",
      description: "Modern Python fundamentals from variables, conditionals, loops, functions to OOP and error handling.",
      icon: "🐍",
      isActive: true,
    },
  });
  console.log(`✅ Subject: ${python.name} (${python.id})`);

  const pythonTopics = [
    {
      name: "Variables & Data Types",
      description: "Dynamic typing, immutable vs mutable types, strings, numbers, lists, tuples, dictionaries.",
      order: 1,
      difficulty: "beginner",
      questions: [
        {
          text: "Which of the following Python data types is immutable?",
          options: JSON.stringify(["Tuple", "List", "Dictionary", "Set"]),
          correctAnswer: 0,
          explanation: "Tuples (like strings and integers) are immutable in Python; elements cannot be modified or reassigned after creation.",
          difficulty: "easy",
        },
        {
          text: "What will type(5 / 2) evaluate to in Python 3?",
          options: JSON.stringify(["<class 'float'>", "<class 'int'>", "<class 'decimal'>", "SyntaxError"]),
          correctAnswer: 0,
          explanation: "In Python 3, the single forward slash `/` operator always performs true float division, returning 2.5.",
          difficulty: "easy",
        },
      ],
    },
    {
      name: "Conditions & Branching",
      description: "Boolean logic, if-elif-else branching, truthy and falsy values, match-case statements.",
      order: 2,
      difficulty: "beginner",
      questions: [
        {
          text: "Which of the following values evaluates to False in a Python Boolean context (truthiness)?",
          options: JSON.stringify(["[] (empty list)", "[0]", "'False'", "1"]),
          correctAnswer: 0,
          explanation: "Empty sequences and collections ([], '', (), {}, set()) evaluate to False in Python truth testing.",
          difficulty: "easy",
        },
        {
          text: "What is the result of `True or (1 / 0 == 0)` in Python?",
          options: JSON.stringify(["True (due to short-circuit evaluation)", "ZeroDivisionError", "False", "None"]),
          correctAnswer: 0,
          explanation: "Python's `or` operator short-circuits: because the first operand is True, the second operand is never evaluated.",
          difficulty: "medium",
        },
      ],
    },
    {
      name: "Loops & Iteration",
      description: "for loops, while loops, range(), break, continue, and list comprehensions.",
      order: 3,
      difficulty: "beginner",
      questions: [
        {
          text: "What does `range(2, 10, 3)` generate when converted to a list in Python?",
          options: JSON.stringify(["[2, 5, 8]", "[2, 5, 8, 11]", "[2, 3, 4, 5, 6, 7, 8, 9]", "[5, 8]"]),
          correctAnswer: 0,
          explanation: "range(start, stop, step) starts at 2, increments by 3: 2, 5, 8. The next value 11 >= 10, so loop stops.",
          difficulty: "easy",
        },
        {
          text: "What does the `else` clause attached to a Python `for` loop do?",
          options: JSON.stringify([
            "Executes only if the loop completes without encountering a `break`",
            "Executes on every iteration if condition is false",
            "Executes only if the loop iterable was empty",
            "Catches unhandled runtime exceptions inside the loop",
          ]),
          correctAnswer: 0,
          explanation: "A loop `else` clause executes when the loop naturally terminates, but is skipped if terminated via `break`.",
          difficulty: "medium",
        },
      ],
    },
    {
      name: "Functions & Scope",
      description: "def, positional & keyword arguments, *args, **kwargs, return values, and LEGB variable scope.",
      order: 4,
      difficulty: "intermediate",
      questions: [
        {
          text: "What will be printed by the following Python code?\n\ndef func(a, b=[]):\n    b.append(a)\n    return b\n\nprint(func(1))\nprint(func(2))",
          options: JSON.stringify(["[1] and [1, 2]", "[1] and [2]", "[1, 2] and [1, 2]", "TypeError"]),
          correctAnswer: 0,
          explanation: "Default parameter values in Python are evaluated once when the function is defined, making mutable default arguments like lists persistent across calls.",
          difficulty: "medium",
        },
        {
          text: "Which keyword is used inside a nested function to modify a variable in the enclosing (outer non-global) scope?",
          options: JSON.stringify(["nonlocal", "global", "outer", "super"]),
          correctAnswer: 0,
          explanation: "The `nonlocal` keyword declares that a variable refers to a previously bound variable in the nearest enclosing scope.",
          difficulty: "medium",
        },
      ],
    },
    {
      name: "Lambda Functions",
      description: "Anonymous functions, higher-order functions: map, filter, sorted key functions.",
      order: 5,
      difficulty: "intermediate",
      questions: [
        {
          text: "Which of the following correctly describes a Python lambda expression?",
          options: JSON.stringify([
            "An anonymous function restricted to a single expression whose result is implicitly returned",
            "A generator function capable of yielding multiple values",
            "A multi-statement function block defined without a return statement",
            "A decorator syntax applied to class methods",
          ]),
          correctAnswer: 0,
          explanation: "Python lambda functions are syntactically restricted to a single expression and automatically return that expression's evaluated value.",
          difficulty: "easy",
        },
        {
          text: "Given `data = [('a', 3), ('b', 1), ('c', 2)]`, which lambda sorts items by their second numerical element?",
          options: JSON.stringify([
            "sorted(data, key=lambda x: x[1])",
            "sorted(data, key=lambda x: x[0])",
            "data.sort(lambda x: x[1])",
            "filter(lambda x: x[1], data)",
          ]),
          correctAnswer: 0,
          explanation: "`key=lambda x: x[1]` projects each tuple to its second element to establish sort comparison order.",
          difficulty: "medium",
        },
      ],
    },
    {
      name: "Object-Oriented Programming",
      description: "Classes, instances, __init__, self, inheritance, encapsulation, and dunder methods.",
      order: 6,
      difficulty: "advanced",
      questions: [
        {
          text: "In Python classes, what purpose does the `self` parameter serve in method definitions?",
          options: JSON.stringify([
            "Explicit reference to the instance of the class upon which the method is invoked",
            "Reference to the parent superclass",
            "A reserved keyword that allocates memory dynamically",
            "A global pointer to the module containing the class",
          ]),
          correctAnswer: 0,
          explanation: "`self` represents the specific instance object being acted upon and must be the first parameter in instance methods.",
          difficulty: "easy",
        },
      ],
    },
    {
      name: "Error & Exception Handling",
      description: "try-except-else-finally blocks, raising exceptions, and custom Exception classes.",
      order: 7,
      difficulty: "intermediate",
      questions: [
        {
          text: "In Python, which keyword combination guarantees that a cleanup block executes whether an exception was raised or not?",
          options: JSON.stringify(["finally", "except Exception", "else", "ensure"]),
          correctAnswer: 0,
          explanation: "The 'finally' clause is always executed prior to leaving the try statement, ensuring guaranteed resource cleanup.",
          difficulty: "easy",
        },
      ],
    },
  ];

  for (const t of pythonTopics) {
    const topic = await prisma.topic.upsert({
      where: { subjectId_name: { subjectId: python.id, name: t.name } },
      update: { description: t.description, order: t.order, difficulty: t.difficulty },
      create: { name: t.name, description: t.description, order: t.order, difficulty: t.difficulty, subjectId: python.id },
    });

    for (const q of t.questions) {
      const existingQ = await prisma.question.findFirst({
        where: { topicId: topic.id, text: q.text },
      });
      if (!existingQ) {
        await prisma.question.create({
          data: {
            topicId: topic.id,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            type: "assessment",
          },
        });
      }
    }
    console.log(`  ✅ Python Topic: ${topic.name}`);
  }

  // 2. Also ensure Alex Rivera demo profile has a Python profile seeded
  const demoUser = await prisma.user.findUnique({ where: { email: "alex@skillsync.ai" } });
  if (demoUser) {
    await prisma.learningProfile.upsert({
      where: { userId_subjectId: { userId: demoUser.id, subjectId: python.id } },
      update: {},
      create: {
        userId: demoUser.id,
        subjectId: python.id,
        overallMastery: 64,
        strengths: JSON.stringify(["Variables & Data Types", "Conditions & Branching"]),
        weaknesses: JSON.stringify(["Functions & Scope", "Lambda Functions"]),
        topicMastery: JSON.stringify([
          { topicName: "Variables & Data Types", score: 92, masteryLevel: "strong" },
          { topicName: "Conditions & Branching", score: 85, masteryLevel: "strong" },
          { topicName: "Loops & Iteration", score: 78, masteryLevel: "medium" },
          { topicName: "Functions & Scope", score: 58, masteryLevel: "medium" },
          { topicName: "Lambda Functions", score: 30, masteryLevel: "weak" },
          { topicName: "Object-Oriented Programming", score: 20, masteryLevel: "weak" },
          { topicName: "Error & Exception Handling", score: 15, masteryLevel: "weak" },
        ]),
        aiAnalysis: JSON.stringify({
          summary: "Current diagnostic indicates solid foundational mastery in Python Programming (64%), with targeted prerequisite remediation prioritized for Functions & Scope and Lambda Functions.",
          nextBestAction: {
            title: "Practice Functions & Scope",
            topicName: "Functions & Scope",
            durationMinutes: 15,
            difficulty: "intermediate",
            reason: "Mastering mutable default arguments and LEGB scope is a necessary prerequisite before object-oriented closures.",
          },
        }),
      },
    });
    console.log("✅ Seeded Python Demo Profile for Alex Rivera");
  }

  console.log("✨ Python and Curriculum seeded successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
