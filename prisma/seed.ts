import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create DBMS Subject
  const dbms = await prisma.subject.upsert({
    where: { name: "Database Management Systems" },
    update: {},
    create: {
      name: "Database Management Systems",
      description: "Study of database design, SQL, normalization, transactions, and more.",
      icon: "🗄️",
    },
  });

  console.log(`✅ Subject: ${dbms.name}`);

  // Create Topics
  const topicsData = [
    { name: "ER Model", description: "Entity-Relationship modeling and diagram design", order: 1, difficulty: "beginner" },
    { name: "Relational Model", description: "Relational algebra, keys, and constraints", order: 2, difficulty: "beginner" },
    { name: "SQL Fundamentals", description: "SELECT, INSERT, UPDATE, DELETE, JOINs, and subqueries", order: 3, difficulty: "intermediate" },
    { name: "Normalization", description: "Functional dependencies, 1NF through BCNF", order: 4, difficulty: "intermediate" },
    { name: "Transactions", description: "ACID properties, isolation levels, and anomalies", order: 5, difficulty: "intermediate" },
    { name: "Indexing", description: "B-tree, hash indexing, and query optimization", order: 6, difficulty: "advanced" },
    { name: "Concurrency Control", description: "Lock-based and timestamp-based protocols, deadlocks", order: 7, difficulty: "advanced" },
  ];

  const topics: Record<string, string> = {};

  for (const t of topicsData) {
    const topic = await prisma.topic.upsert({
      where: { subjectId_name: { subjectId: dbms.id, name: t.name } },
      update: {},
      create: { ...t, subjectId: dbms.id },
    });
    topics[t.name] = topic.id;
    console.log(`  ✅ Topic: ${t.name}`);
  }

  // Create Questions
  const questionsData = [
    // ER Model (5)
    { topicName: "ER Model", text: "Which of the following is NOT a component of an ER diagram?", options: ["Entity", "Attribute", "Relationship", "Tuple"], correctAnswer: 3, explanation: "A tuple is a row in a relational table, not a component of an ER diagram. ER diagrams use entities, attributes, and relationships.", difficulty: "easy" },
    { topicName: "ER Model", text: "In an ER diagram, a double rectangle represents:", options: ["Strong entity", "Weak entity", "Relationship", "Attribute"], correctAnswer: 1, explanation: "A double rectangle represents a weak entity — an entity that cannot be uniquely identified by its own attributes alone.", difficulty: "easy" },
    { topicName: "ER Model", text: "A multivalued attribute in an ER diagram is represented by:", options: ["Single oval", "Double oval", "Dashed oval", "Rectangle"], correctAnswer: 1, explanation: "A double oval represents a multivalued attribute — an attribute that can hold multiple values for a single entity.", difficulty: "medium" },
    { topicName: "ER Model", text: "Total participation of an entity in a relationship is shown by:", options: ["Single line", "Double line", "Dashed line", "Arrow"], correctAnswer: 1, explanation: "Total participation means every instance of the entity must participate in the relationship, shown by a double line.", difficulty: "medium" },
    { topicName: "ER Model", text: "Which cardinality means one entity in A is related to at most one entity in B?", options: ["1:N", "M:N", "1:1", "N:1"], correctAnswer: 2, explanation: "A 1:1 cardinality means each entity in A maps to at most one entity in B, and vice versa.", difficulty: "easy" },

    // Relational Model (4)
    { topicName: "Relational Model", text: "A superkey is:", options: ["A minimal set of attributes that uniquely identifies a tuple", "Any set of attributes that uniquely identifies a tuple", "The primary key of a relation", "A foreign key reference"], correctAnswer: 1, explanation: "A superkey is any set of attributes that uniquely identifies a tuple. A candidate key is the minimal superkey.", difficulty: "medium" },
    { topicName: "Relational Model", text: "Which integrity constraint ensures that a foreign key value must exist in the referenced table?", options: ["Domain constraint", "Key constraint", "Referential integrity", "Entity integrity"], correctAnswer: 2, explanation: "Referential integrity ensures that a foreign key value in one relation must match a primary key value in the referenced relation.", difficulty: "medium" },
    { topicName: "Relational Model", text: "The relational algebra operation that selects rows satisfying a condition is:", options: ["Project (π)", "Select (σ)", "Join (⋈)", "Union (∪)"], correctAnswer: 1, explanation: "The Select operation (σ) filters rows based on a given condition, similar to WHERE in SQL.", difficulty: "easy" },
    { topicName: "Relational Model", text: "Entity integrity states that:", options: ["Foreign keys cannot be null", "Primary keys cannot be null", "All attributes must have values", "No duplicate rows allowed"], correctAnswer: 1, explanation: "Entity integrity requires that primary key attributes cannot have NULL values, ensuring every tuple is uniquely identifiable.", difficulty: "easy" },

    // SQL Fundamentals (5)
    { topicName: "SQL Fundamentals", text: "Which SQL clause is used to filter groups?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], correctAnswer: 1, explanation: "HAVING filters groups after GROUP BY, while WHERE filters individual rows before grouping.", difficulty: "easy" },
    { topicName: "SQL Fundamentals", text: "What does a LEFT JOIN return?", options: ["Only matching rows from both tables", "All rows from the left table and matching rows from the right", "All rows from both tables", "Rows that don't match"], correctAnswer: 1, explanation: "LEFT JOIN returns all rows from the left table and the matching rows from the right table. Non-matching right rows appear as NULL.", difficulty: "medium" },
    { topicName: "SQL Fundamentals", text: "Which aggregate function counts non-NULL values?", options: ["COUNT(*)", "COUNT(column)", "SUM(column)", "AVG(column)"], correctAnswer: 1, explanation: "COUNT(column) counts non-NULL values in that column, while COUNT(*) counts all rows including NULLs.", difficulty: "medium" },
    { topicName: "SQL Fundamentals", text: "A correlated subquery is one that:", options: ["Runs only once", "References the outer query", "Uses UNION", "Returns multiple rows"], correctAnswer: 1, explanation: "A correlated subquery references a column from the outer query and is re-evaluated for each row of the outer query.", difficulty: "hard" },
    { topicName: "SQL Fundamentals", text: "Which statement is used to remove a table from the database?", options: ["DELETE TABLE", "DROP TABLE", "REMOVE TABLE", "TRUNCATE TABLE"], correctAnswer: 1, explanation: "DROP TABLE removes the table structure and all its data. DELETE removes rows, and TRUNCATE removes all rows but keeps the structure.", difficulty: "easy" },

    // Normalization (5)
    { topicName: "Normalization", text: "A relation is in 1NF if:", options: ["It has no partial dependencies", "All attributes are atomic", "It has no transitive dependencies", "It has a primary key"], correctAnswer: 1, explanation: "1NF requires that all attributes contain only atomic (indivisible) values — no repeating groups or arrays.", difficulty: "easy" },
    { topicName: "Normalization", text: "A partial dependency exists when:", options: ["A non-key attribute depends on the entire primary key", "A non-key attribute depends on part of the primary key", "A non-key attribute depends on another non-key attribute", "A key attribute depends on a non-key attribute"], correctAnswer: 1, explanation: "A partial dependency occurs when a non-prime attribute is functionally dependent on only part of a composite primary key.", difficulty: "medium" },
    { topicName: "Normalization", text: "Which normal form eliminates transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correctAnswer: 2, explanation: "3NF eliminates transitive dependencies — where a non-key attribute depends on another non-key attribute.", difficulty: "medium" },
    { topicName: "Normalization", text: "Given R(A,B,C) with FDs {A→B, B→C}, the relation is in:", options: ["1NF only", "2NF but not 3NF", "3NF", "BCNF"], correctAnswer: 1, explanation: "A→B is fine, but B→C creates a transitive dependency (A→B→C). This violates 3NF, so the relation is in 2NF but not 3NF.", difficulty: "hard" },
    { topicName: "Normalization", text: "BCNF is stricter than 3NF because:", options: ["It requires atomic attributes", "Every determinant must be a candidate key", "It eliminates all redundancy", "It requires foreign keys"], correctAnswer: 1, explanation: "BCNF requires that for every functional dependency X→Y, X must be a superkey. 3NF allows some exceptions for candidate keys.", difficulty: "hard" },

    // Transactions (5)
    { topicName: "Transactions", text: "Which ACID property ensures that a transaction is an all-or-nothing operation?", options: ["Atomicity", "Consistency", "Isolation", "Durability"], correctAnswer: 0, explanation: "Atomicity ensures that either all operations in a transaction are completed, or none of them are.", difficulty: "easy" },
    { topicName: "Transactions", text: "A dirty read occurs when:", options: ["A transaction reads committed data", "A transaction reads data written by an uncommitted transaction", "Two transactions write to the same data", "A transaction reads the same data twice with different results"], correctAnswer: 1, explanation: "A dirty read happens when one transaction reads data that has been modified but not yet committed by another transaction.", difficulty: "medium" },
    { topicName: "Transactions", text: "Which isolation level prevents dirty reads but allows non-repeatable reads?", options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"], correctAnswer: 1, explanation: "Read Committed prevents dirty reads by only allowing a transaction to read committed data, but non-repeatable reads can still occur.", difficulty: "medium" },
    { topicName: "Transactions", text: "The ACID property that ensures changes survive system failures is:", options: ["Atomicity", "Consistency", "Isolation", "Durability"], correctAnswer: 3, explanation: "Durability ensures that once a transaction is committed, its changes persist even if the system crashes.", difficulty: "easy" },
    { topicName: "Transactions", text: "A phantom read occurs when:", options: ["A transaction reads uncommitted data", "New rows appear in a repeated query within the same transaction", "A transaction reads old data", "Two transactions deadlock"], correctAnswer: 1, explanation: "A phantom read occurs when a transaction re-executes a query and finds new rows that were inserted by another committed transaction.", difficulty: "hard" },

    // Indexing (4)
    { topicName: "Indexing", text: "A B+ tree index stores data pointers at:", options: ["Internal nodes only", "Leaf nodes only", "Both internal and leaf nodes", "Root node only"], correctAnswer: 1, explanation: "In a B+ tree, actual data pointers are stored only at leaf nodes. Internal nodes contain only keys for navigation.", difficulty: "medium" },
    { topicName: "Indexing", text: "A clustered index determines:", options: ["Which columns are indexed", "The physical order of data in the table", "The logical order of queries", "The number of indexes allowed"], correctAnswer: 1, explanation: "A clustered index determines the physical storage order of rows in the table. A table can have only one clustered index.", difficulty: "medium" },
    { topicName: "Indexing", text: "Hash indexing is best for:", options: ["Range queries", "Exact match queries", "Pattern matching", "Sorting"], correctAnswer: 1, explanation: "Hash indexes are optimized for exact match lookups (equality conditions) but cannot efficiently support range queries.", difficulty: "easy" },
    { topicName: "Indexing", text: "Which is NOT an advantage of indexing?", options: ["Faster data retrieval", "Faster writes and inserts", "Efficient sorting", "Quick lookups"], correctAnswer: 1, explanation: "Indexes speed up reads but slow down writes because the index must be updated every time data is inserted, updated, or deleted.", difficulty: "easy" },

    // Concurrency Control (4)
    { topicName: "Concurrency Control", text: "Two-phase locking (2PL) ensures:", options: ["Deadlock prevention", "Serializability", "No starvation", "Faster transactions"], correctAnswer: 1, explanation: "Two-phase locking guarantees serializability by dividing a transaction into a growing phase (acquiring locks) and a shrinking phase (releasing locks).", difficulty: "medium" },
    { topicName: "Concurrency Control", text: "A deadlock occurs when:", options: ["A transaction takes too long", "Two or more transactions wait for each other indefinitely", "A transaction fails to commit", "A lock is never released"], correctAnswer: 1, explanation: "A deadlock occurs when two or more transactions are each waiting for a lock held by the other, creating a circular wait.", difficulty: "easy" },
    { topicName: "Concurrency Control", text: "In timestamp-based concurrency control, if T1 has an earlier timestamp than T2:", options: ["T1 must wait for T2", "T2 must wait for T1", "T1 should access data before T2", "Either can go first"], correctAnswer: 2, explanation: "Timestamp ordering ensures that transactions execute in timestamp order. If T1 is older, it should logically access data before T2.", difficulty: "hard" },
    { topicName: "Concurrency Control", text: "Which deadlock handling technique rolls back one of the deadlocked transactions?", options: ["Deadlock prevention", "Deadlock avoidance", "Deadlock detection and recovery", "Timeout"], correctAnswer: 2, explanation: "Deadlock detection and recovery allows deadlocks to occur, then detects them (usually via a wait-for graph) and recovers by rolling back a victim transaction.", difficulty: "medium" },
  ];

  for (const q of questionsData) {
    const topicId = topics[q.topicName];
    if (!topicId) {
      console.error(`  ❌ Topic not found: ${q.topicName}`);
      continue;
    }
    await prisma.question.create({
      data: {
        topicId,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        type: "assessment",
      },
    });
  }

  console.log(`✅ Created ${questionsData.length} questions`);
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
