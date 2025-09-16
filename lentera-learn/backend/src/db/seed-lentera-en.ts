import { db } from "./connection.js";
import { subjects, topics, lessons, lessonExamples, practiceQuestions, questionOptions, achievements, users, userStats, audioFiles, userAchievements, userPracticeResults, userProgress } from "./schema.js";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function seedLenteraData() {
  console.log("🌱 Starting Lentera data seeding...");

  try {
    // Clear existing data first (in correct order to avoid foreign key constraints)
    console.log("🧹 Clearing existing data...");
    await db.delete(audioFiles);
    await db.delete(userAchievements);
    await db.delete(userPracticeResults);
    await db.delete(userProgress);
    await db.delete(userStats);
    await db.delete(questionOptions);
    await db.delete(practiceQuestions);
    await db.delete(lessonExamples);
    await db.delete(lessons);
    await db.delete(topics);
    await db.delete(subjects);
    await db.delete(achievements);
    await db.delete(users);
    console.log("✅ Existing data cleared");

    // 1. Create demo user
    const demoUserId = nanoid();
    const hashedPassword = await bcrypt.hash("demo123", 10);

    await db.insert(users).values({
      id: demoUserId,
      email: "demo@lentera.app",
      passwordHash: hashedPassword,
      name: "Demo User",
      avatarUrl: null,
    });

    // 2. Create subjects
    const subjectsData = [
      {
        id: 1,
        name: "Basic Mathematics",
        description: "Mathematics learning for beginners",
        icon: "📊",
        color: "#3B82F6",
        orderIndex: 1,
        isActive: true,
      },
      {
        id: 2,
        name: "Introduction to Science",
        description: "Basic concepts of natural science",
        icon: "🔬",
        color: "#10B981",
        orderIndex: 2,
        isActive: true,
      },
      {
        id: 3,
        name: "Indonesian Language",
        description: "Learning proper Indonesian language",
        icon: "📚",
        color: "#F59E0B",
        orderIndex: 3,
        isActive: true,
      },
      {
        id: 4,
        name: "Al-Qur'an & Arabic Language",
        description: "Learning Al-Qur'an and Arabic language",
        icon: "🕌",
        color: "#8B5CF6",
        orderIndex: 4,
        isActive: true,
      },
    ];

    await db.insert(subjects).values(subjectsData);
    console.log("✅ Subjects created");

    // 3. Create topics for each subject
    const topicsData = [
      // Basic Mathematics
      {
        id: 1,
        subjectId: 1,
        name: "Number Recognition",
        description: "Learning to recognize numbers 1-10",
        orderIndex: 1,
        estimatedDuration: 30,
        difficultyLevel: "beginner",
        isActive: true,
      },
      {
        id: 2,
        subjectId: 1,
        name: "Basic Addition",
        description: "Simple addition operations",
        orderIndex: 2,
        estimatedDuration: 45,
        difficultyLevel: "beginner",
        isActive: true,
      },
      {
        id: 3,
        subjectId: 1,
        name: "Basic Subtraction",
        description: "Simple subtraction operations",
        orderIndex: 3,
        estimatedDuration: 45,
        difficultyLevel: "beginner",
        isActive: true,
      },
      // Introduction to Science
      {
        id: 4,
        subjectId: 2,
        name: "The Universe",
        description: "Learning about planets and stars",
        orderIndex: 1,
        estimatedDuration: 60,
        difficultyLevel: "beginner",
        isActive: true,
      },
      {
        id: 5,
        subjectId: 2,
        name: "Living Things",
        description: "Classification of living things",
        orderIndex: 2,
        estimatedDuration: 50,
        difficultyLevel: "beginner",
        isActive: true,
      },
      // Indonesian Language
      {
        id: 6,
        subjectId: 3,
        name: "Letters and Words",
        description: "Introduction to letters and word formation",
        orderIndex: 1,
        estimatedDuration: 40,
        difficultyLevel: "beginner",
        isActive: true,
      },
      {
        id: 7,
        subjectId: 3,
        name: "Simple Sentences",
        description: "Creating correct sentences",
        orderIndex: 2,
        estimatedDuration: 50,
        difficultyLevel: "intermediate",
        isActive: true,
      },
      // Al-Qur'an & Arabic Language
      {
        id: 8,
        subjectId: 4,
        name: "Hijaiyah Letters",
        description: "Learning and reading Arabic letters",
        orderIndex: 1,
        estimatedDuration: 60,
        difficultyLevel: "beginner",
        isActive: true,
      },
    ];

    await db.insert(topics).values(topicsData);
    console.log("✅ Topics created");

    // 4. Create lessons
    const lessonsData = [
      // Number Recognition - Topic 1
      {
        id: 1,
        topicId: 1,
        title: "Numbers 1-5: Foundation of Mathematics",
        content:
          "Welcome to the world of mathematics! Numbers are a universal language used to count, measure, and understand the world around us. In this lesson, we will learn numbers 1 to 5 as the basic foundation of mathematics.\n\nWhat are Numbers?\nNumbers are symbols that represent quantity or amount. Each number has a different value and can be used to count objects around us. Numbers 1-5 are the first numbers that need to be mastered because they become the basis for understanding more complex mathematical concepts.\n\nWhy are Numbers 1-5 Important?\n1. Number 1 (one) - Represents unity, one object\n2. Number 2 (two) - Represents a pair, two objects\n3. Number 3 (three) - Represents a small group, three objects\n4. Number 4 (four) - Represents a medium group, four objects\n5. Number 5 (five) - Represents one full hand, five objects\n\nApplication in Daily Life:\n- Counting fingers (1-5)\n- Counting toys or objects at home\n- Understanding order (first, second, third, fourth, fifth)\n- Foundation for learning addition and subtraction\n\nBy understanding numbers 1-5, you have built a strong foundation for your next mathematical adventure!",
        summary: "Understanding the basic concept of numbers 1-5 as a mathematical foundation with application in daily life",
        learningObjectives: JSON.stringify([
          "Recognize and understand numbers 1 to 5",
          "Understand the concept of quantity represented by each number",
          "Apply counting numbers 1-5 in daily life",
          "Build foundation for advanced mathematics learning",
        ]),
        prerequisites: JSON.stringify(["Ability to recognize basic shapes", "Understanding of 'many' and 'few' concepts"]),
        keyConcepts: JSON.stringify(["Numbers as quantity symbols", "Order of numbers 1-5", "Relationship between numbers and real objects", "Concept of unity and groups"]),
        practicalApplications: JSON.stringify(["Counting fingers", "Counting toys or objects at home", "Understanding order in queues", "Foundation for simple mathematical operations"]),
        mediaContent: JSON.stringify({
          images: ["/images/lessons/numbers-1-5-visual.png", "/images/lessons/counting-fingers.png"],
          diagrams: ["/images/lessons/number-quantity-diagram.png"],
        }),
        orderIndex: 1,
        estimatedDuration: 25,
        difficultyLevel: "beginner",
        difficultySubLevel: 1,
        isActive: true,
      },
      {
        id: 2,
        topicId: 1,
        title: "Numbers 6-10: Continuing the Number Adventure",
        content:
          "After mastering numbers 1-5, now it's time to continue the adventure with numbers 6-10! These numbers will expand your understanding of quantity and open the door to more interesting mathematical concepts.\n\nGetting to Know Numbers 6-10:\n6. Number 6 (six) - More than one hand, like six sides of a dice\n7. Number 7 (seven) - Number of days in a week\n8. Number 8 (eight) - Like an infinity symbol standing up\n9. Number 9 (nine) - Almost reaching ten\n10. Number 10 (ten) - The first round number with two digits\n\nPatterns and Relationships:\nNumbers 6-10 have a special relationship with numbers 1-5:\n- 6 = 5 + 1 (five plus one)\n- 7 = 5 + 2 (five plus two)\n- 8 = 5 + 3 (five plus three)\n- 9 = 5 + 4 (five plus four)\n- 10 = 5 + 5 (five plus five)\n\nImportant Concepts:\n- Number 10 is the base of our number system (decimal system)\n- With 10 fingers, we can count up to 10\n- Number 10 becomes the basis for understanding tens, hundreds, and so on\n\nApplication in Life:\n- Counting with both hands (10 fingers)\n- Understanding time system (7 days a week)\n- Recognizing money (coins and bills with values 1-10)\n- Playing games involving numbers\n\nBy mastering numbers 1-10, you now have the basic tools to explore the wider world of mathematics!",
        summary: "Learning numbers 6-10 by understanding patterns, relationships with previous numbers, and practical applications",
        learningObjectives: JSON.stringify([
          "Recognize and understand numbers 6 to 10",
          "Understand the relationship between numbers 6-10 and numbers 1-5",
          "Learn the concept of decimal number system",
          "Apply counting 1-10 in daily activities",
        ]),
        prerequisites: JSON.stringify(["Mastery of numbers 1-5", "Understanding of simple addition concepts"]),
        keyConcepts: JSON.stringify(["Numbers 6-10 as continuation of 1-5", "Decimal number system concept", "Pattern relationships in numbers", "Number 10 as counting base"]),
        practicalApplications: JSON.stringify(["Counting with 10 fingers", "Understanding days in a week", "Recognizing simple money values", "Playing educational number games"]),
        mediaContent: JSON.stringify({
          images: ["/images/lessons/numbers-6-10-visual.png", "/images/lessons/ten-fingers-counting.png"],
          diagrams: ["/images/lessons/decimal-system-intro.png"],
        }),
        orderIndex: 2,
        estimatedDuration: 25,
        difficultyLevel: "beginner",
        difficultySubLevel: 2,
        isActive: true,
      },
      // Basic Addition
      {
        id: 3,
        topicId: 2,
        title: "Addition 1-5: Combining Numbers",
        content:
          "Welcome to the world of mathematical operations! Addition is one of the most important basic operations in mathematics. In this lesson, we will learn how to combine numbers 1-5 to get larger results.\n\nWhat is Addition?\nAddition is a mathematical operation that combines two or more numbers to get a total sum. The addition symbol is '+' (plus), and the result is called 'sum' or 'addition result'.\n\nBasic Addition Concepts:\n- Addition means 'adding' or 'combining'\n- The order of numbers does not affect the result (2 + 3 = 3 + 2)\n- Adding 0 does not change the number (3 + 0 = 3)\n- Addition always produces a number that is greater than or equal\n\nExamples of Addition with Numbers 1-5:\n1 + 1 = 2 (one plus one equals two)\n1 + 2 = 3 (one plus two equals three)\n2 + 2 = 4 (two plus two equals four)\n2 + 3 = 5 (two plus three equals five)\n3 + 2 = 5 (three plus two equals five)\n\nCounting Strategies:\n1. Counting with fingers - use fingers to help count\n2. Counting forward - start from the larger number, then add\n3. Using real objects - use toys or objects to help\n4. Memorizing simple combinations - remember frequently occurring addition results\n\nApplication in Daily Life:\n- Counting total toys owned\n- Adding the number of fruits in a basket\n- Counting total pocket money\n- Understanding the concept of 'more' in various situations\n\nBy mastering addition 1-5, you have built a foundation for more complex mathematical operations!",
        summary: "Learning basic addition concepts with numbers 1-5, counting strategies, and practical applications",
        learningObjectives: JSON.stringify([
          "Understand the concept of addition as a combining operation",
          "Master addition of numbers 1-5",
          "Use various strategies to calculate addition",
          "Apply addition in daily life situations",
        ]),
        prerequisites: JSON.stringify(["Mastery of numbers 1-5", "Understanding of 'more' and 'adding' concepts"]),
        keyConcepts: JSON.stringify(["Addition as a combining operation", "Symbols '+' and '=' in mathematics", "Commutative property of addition", "Addition counting strategies"]),
        practicalApplications: JSON.stringify(["Counting total objects or toys", "Adding quantities in games", "Understanding the concept of 'adding' in life", "Foundation for advanced mathematical operations"]),
        mediaContent: JSON.stringify({
          images: ["/images/lessons/addition-visual-1-5.png", "/images/lessons/finger-counting-addition.png"],
          diagrams: ["/images/lessons/addition-concept-diagram.png"],
        }),
        orderIndex: 1,
        estimatedDuration: 30,
        difficultyLevel: "beginner",
        difficultySubLevel: 2,
        isActive: true,
      },
      // Hijaiyah Letters
      {
        id: 4,
        topicId: 8,
        title: "Alif, Ba, Ta: Gateway to Arabic Language",
        content:
          "Assalamu'alaikum! Welcome to the journey of learning Arabic through Hijaiyah letters. The letters Alif (ا), Ba (ب), and Ta (ت) are the first three letters that will open the door to your understanding of the language of the Qur'an.\n\nIntroduction to Hijaiyah Letters:\nHijaiyah letters are the Arabic writing system consisting of 28 letters. Each letter has a unique shape, sound, and meaning. These letters are not only used for writing everyday Arabic but also for reading the Qur'an.\n\nLetter Alif (ا):\n- Shape: Like a straight vertical line\n- Sound: Long or short 'A'\n- Position: Can be at the beginning, middle, or end of a word\n- Uniqueness: First letter in the Arabic alphabet\n- Example words: أب (ab = father), أم (umm = mother)\n\nLetter Ba (ب):\n- Shape: Like a bowl with one dot below\n- Sound: 'B' as in English\n- Position: Can be connected with other letters\n- Uniqueness: Has a shape that changes according to its position in the word\n- Example words: بيت (bait = house), كتاب (kitab = book)\n\nLetter Ta (ت):\n- Shape: Like the letter Ba but with two dots above\n- Sound: 'T' as in English\n- Position: Can be connected with other letters\n- Uniqueness: Often used in everyday words\n- Example words: تفاح (tuffah = apple), بنت (bint = girl)\n\nHow to Write and Read:\n1. Arabic is written from right to left\n2. Letters can change shape according to their position in the word\n3. Each letter has a consistent sound\n4. Writing practice begins with the basic form of each letter\n\nApplication in Life:\n- Reading names in Arabic\n- Understanding basic words in the Qur'an\n- Writing your own name in Arabic letters\n- Foundation for learning other Hijaiyah letters\n\nBy mastering Alif, Ba, and Ta, you have taken the first step in the spiritual and intellectual journey of learning Arabic!",
        summary: "Learning the first three Hijaiyah letters (Alif, Ba, Ta) with understanding of shapes, sounds, and practical applications",
        learningObjectives: JSON.stringify([
          "Recognize and write the letters Alif, Ba, and Ta",
          "Understand the sound and how to read each letter",
          "Learn the position of letters in Arabic words",
          "Build foundation for learning other Hijaiyah letters",
        ]),
        prerequisites: JSON.stringify(["Ability to recognize shapes and patterns", "Basic understanding of writing systems"]),
        keyConcepts: JSON.stringify(["Hijaiyah letters as Arabic writing system", "Shapes and sounds of Alif, Ba, Ta letters", "Writing direction from right to left", "Letter shape changes according to position"]),
        practicalApplications: JSON.stringify(["Writing and reading simple words", "Recognizing letters in Arabic names", "Foundation for reading the Qur'an", "Understanding Arabic writing in daily life"]),
        mediaContent: JSON.stringify({
          images: ["/images/lessons/hijaiyah-alif-ba-ta.png", "/images/lessons/arabic-writing-direction.png"],
          diagrams: ["/images/lessons/letter-positions-diagram.png"],
        }),
        orderIndex: 1,
        estimatedDuration: 35,
        difficultyLevel: "beginner",
        difficultySubLevel: 1,
        isActive: true,
      },
      // Additional lessons for Topic 1 (Number Recognition)
      {
        id: 5,
        topicId: 1,
        title: "Ordering Numbers 1-10",
        content:
          "After learning numbers 1-10, now it's time to learn how to order numbers from smallest to largest or vice versa. Ordering numbers is an important skill that will help in various aspects of mathematics.\n\nWhat is Ordering Numbers?\nOrdering numbers is arranging numbers in a certain sequence, usually from smallest to largest (ascending order) or from largest to smallest (descending order).\n\nAscending Order: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10\nDescending Order: 10, 9, 8, 7, 6, 5, 4, 3, 2, 1\n\nWhy is Ordering Important?\n- Helps understand the concept of 'greater than' and 'less than'\n- Foundation for comparison operations\n- Builds mathematical logic\n- Useful in daily life\n\nOrdering Strategies:\n1. Start with the smallest number you know\n2. Find the next larger number\n3. Continue until all numbers are arranged\n4. Check the order again\n\nApplication in Life:\n- Ordering house numbers on a street\n- Arranging rankings in games\n- Organizing schedules based on time\n- Understanding queue systems",
        summary: "Learning how to order numbers 1-10 from smallest to largest and vice versa",
        learningObjectives: JSON.stringify(["Understand the concept of ascending and descending order", "Order numbers 1-10 correctly", "Use number comparison concepts", "Apply ordering in practical situations"]),
        prerequisites: JSON.stringify(["Mastery of numbers 1-10", "Understanding of 'greater than' and 'less than' concepts"]),
        keyConcepts: JSON.stringify(["Ascending order", "Descending order", "Number comparison concept", "Ordering logic"]),
        practicalApplications: JSON.stringify(["Ordering house numbers", "Arranging game rankings", "Organizing time schedules", "Understanding queue systems"]),
        mediaContent: JSON.stringify({
          images: ["/images/lessons/number-ordering.png", "/images/lessons/ascending-descending.png"],
          diagrams: ["/images/lessons/ordering-strategy.png"],
        }),
        orderIndex: 3,
        estimatedDuration: 20,
        difficultyLevel: "beginner",
        difficultySubLevel: 2,
        isActive: true,
      },
      // Additional lessons for Topic 2 (Basic Addition)
      {
        id: 6,
        topicId: 2,
        title: "Addition 6-10: Advanced Operations",
        content:
          "After mastering addition 1-5, now it's time to move to the next level with addition involving numbers 6-10. This will expand mathematical abilities and prepare for more complex concepts.\n\nAddition with Larger Numbers:\nAddition with numbers 6-10 requires slightly different strategies because the results can exceed 10. This is an important step towards understanding a broader number system.\n\nExamples of Addition 6-10:\n- 6 + 1 = 7\n- 6 + 2 = 8\n- 6 + 3 = 9\n- 6 + 4 = 10\n- 7 + 3 = 10\n- 5 + 5 = 10\n- 4 + 6 = 10\n\nImportant Concept - Number 10:\nNumber 10 is special because:\n- It is the result of various addition combinations\n- Foundation of the decimal number system\n- Gateway to two-digit numbers\n\nAdvanced Counting Strategies:\n1. Use both hands (10 fingers)\n2. Count backwards from the larger number\n3. Break numbers into easier parts\n4. Use known patterns\n\nAddition Resulting in More than 10:\nWhen addition results exceed 10, we begin to recognize two-digit numbers:\n- 6 + 5 = 11 (ten plus one)\n- 7 + 4 = 11\n- 8 + 3 = 11\n- 9 + 2 = 11\n\nPractical Applications:\n- Counting accumulated pocket money\n- Adding scores in games\n- Counting total objects in groups\n- Understanding the concept of 'more than ten'",
        summary: "Learning addition with numbers 6-10 and introduction to results exceeding 10",
        learningObjectives: JSON.stringify(["Master addition with numbers 6-10", "Understand various ways to reach number 10", "Learn the concept of numbers greater than 10", "Use effective counting strategies"]),
        prerequisites: JSON.stringify(["Mastery of addition 1-5", "Understanding of numbers 6-10", "Ability to count with fingers"]),
        keyConcepts: JSON.stringify(["Addition with result 10", "Introduction to two-digit numbers", "Advanced counting strategies", "Decimal number system"]),
        practicalApplications: JSON.stringify(["Counting pocket money", "Adding game scores", "Counting total objects", "Understanding the concept of 'tens'"]),
        mediaContent: JSON.stringify({
          images: ["/images/lessons/addition-6-10.png", "/images/lessons/ways-to-make-10.png"],
          diagrams: ["/images/lessons/two-digit-introduction.png"],
        }),
        orderIndex: 2,
        estimatedDuration: 35,
        difficultyLevel: "beginner",
        difficultySubLevel: 3,
        isActive: true,
      },
      // Additional lessons for Topic 3 (Basic Subtraction)
      {
        id: 7,
        topicId: 3,
        title: "Subtraction 1-10: Inverse Operations",
        content:
          "Welcome to the world of subtraction! If addition is about combining, then subtraction is about taking away or reducing. Subtraction is a mathematical operation that is equally important as addition.\n\nWhat is Subtraction?\nSubtraction is a mathematical operation that reduces one number from another number. The subtraction symbol is '-' (minus), and the result is called 'difference' or 'subtraction result'.\n\nBasic Subtraction Concepts:\n- Subtraction means 'taking away' or 'reducing'\n- The first number (minuend) must be greater than or equal to the second number\n- The subtraction result is always smaller than the first number\n- Subtraction is the inverse of addition\n\nSimple Subtraction Examples:\n- 5 - 1 = 4 (five minus one equals four)\n- 5 - 2 = 3 (five minus two equals three)\n- 10 - 3 = 7 (ten minus three equals seven)\n- 8 - 4 = 4 (eight minus four equals four)\n- 6 - 6 = 0 (six minus six equals zero)\n\nRelationship with Addition:\nSubtraction and addition are related:\n- If 3 + 2 = 5, then 5 - 2 = 3\n- If 4 + 3 = 7, then 7 - 3 = 4\n- This is called 'inverse operations'\n\nSubtraction Counting Strategies:\n1. Counting backwards - start from the large number, count backwards\n2. Using fingers - fold fingers according to the number being subtracted\n3. Using real objects - take objects according to subtraction\n4. Using number line - move to the left\n\nConcept of Zero in Subtraction:\n- Subtracting by 0 does not change the number (5 - 0 = 5)\n- Subtracting a number by itself results in 0 (7 - 7 = 0)\n- 0 is the neutral point in mathematics\n\nApplication in Life:\n- Calculating remaining money after shopping\n- Calculating remaining food after eating\n- Understanding the concept of 'decreasing' in various situations\n- Foundation for division and advanced operations",
        summary: "Learning the concept of subtraction as the inverse operation of addition with numbers 1-10",
        learningObjectives: JSON.stringify([
          "Understand the concept of subtraction as a taking away operation",
          "Master subtraction with numbers 1-10",
          "Understand the relationship between addition and subtraction",
          "Use various strategies to calculate subtraction",
        ]),
        prerequisites: JSON.stringify(["Mastery of numbers 1-10", "Understanding of basic addition", "Concept of 'greater than' and 'less than'"]),
        keyConcepts: JSON.stringify(["Subtraction as inverse operation of addition", "Symbol '-' and difference concept", "Inverse relationship with addition", "Role of number 0 in subtraction"]),
        practicalApplications: JSON.stringify(["Calculating remaining money", "Calculating remaining food", "Understanding the concept of 'decreasing'", "Foundation for advanced mathematical operations"]),
        mediaContent: JSON.stringify({
          images: ["/images/lessons/subtraction-visual.png", "/images/lessons/subtraction-strategies.png"],
          diagrams: ["/images/lessons/addition-subtraction-relationship.png"],
        }),
        orderIndex: 1,
        estimatedDuration: 30,
        difficultyLevel: "beginner",
        difficultySubLevel: 2,
        isActive: true,
      },
      // Additional lessons for Topic 4 (Hijaiyah Letters)
      {
        id: 8,
        topicId: 4,
        title: "Jim, Ha, Kho: Advanced Hijaiyah Letters",
        content:
          "After learning Alif, Ba, and Ta, now it's time to learn the next three Hijaiyah letters: Jim (ج), Ha (ح), and Kho (خ). These three letters have their own uniqueness in shape and pronunciation.\n\nLetter Jim (ج):\nJim is the 5th letter in the Hijaiyah alphabet. This letter has a distinctive feature of a dot below its basic shape.\n- Shape: ج (separate form)\n- Sound: 'jim' like 'j' in the word 'jump'\n- Writing: Start from top, go down, then curve\n- Dot: One dot below\n\nLetter Ha (ح):\nHa is the 6th letter in the Hijaiyah alphabet. This letter has no dot and is shaped like an incomplete circle.\n- Shape: ح (separate form)\n- Sound: 'ha' with gentle breath from throat\n- Writing: Shaped like letter 'o' that is open at the top\n- Dot: No dot\n\nLetter Kho (خ):\nKho is the 7th letter in the Hijaiyah alphabet. Its shape is similar to Ha, but has one dot above.\n- Shape: خ (separate form)\n- Sound: 'kho' with strong breath from throat\n- Writing: Same as Ha, but with a dot above\n- Dot: One dot above\n\nImportant Differences:\n- Jim has a dot below, Ha has no dot, Kho has a dot above\n- Jim sound is harder, Ha and Kho are softer with breath\n- Basic shape of Ha and Kho are the same, only different in dots\n\nMemory Tips:\n1. Jim = Jump (easy to remember because of similar sound)\n2. Ha = Gentle breath without dot\n3. Kho = Like Ha but with a 'hat' (dot above)\n\nWriting Practice:\n- Start with the basic shape of each letter\n- Pay attention to the correct writing direction\n- Add dots according to the letter\n- Practice repeatedly until fluent\n\nApplication in Words:\nThese three letters often appear in Arabic words:\n- جميل (jamil) = beautiful\n- حسن (hasan) = good\n- خير (khoir) = goodness",
        summary: "Learning Hijaiyah letters Jim, Ha, and Kho with their shapes, sounds, and writing methods",
        learningObjectives: JSON.stringify(["Recognize the shapes of letters Jim, Ha, and Kho", "Understand the sound of each letter", "Master the correct writing method", "Distinguish letters based on dots and shapes"]),
        prerequisites: JSON.stringify(["Mastery of letters Alif, Ba, Ta", "Understanding of dot concept in Arabic letters", "Ability to write basic Arabic letters"]),
        keyConcepts: JSON.stringify(["Letter Jim with dot below", "Letter Ha without dot", "Letter Kho with dot above", "Differences in sound and shape"]),
        practicalApplications: JSON.stringify(["Reading simple Arabic words", "Writing names in Arabic letters", "Understanding basic Quranic text", "Introduction to Arabic vocabulary"]),
        mediaContent: JSON.stringify({
          images: ["/images/lessons/jim-ha-kho.png", "/images/lessons/arabic-dots-guide.png"],
          diagrams: ["/images/lessons/writing-direction-arabic.png"],
          audio: ["/audio/lessons/jim-pronunciation.mp3", "/audio/lessons/ha-pronunciation.mp3", "/audio/lessons/kho-pronunciation.mp3"],
        }),
        orderIndex: 2,
        estimatedDuration: 40,
        difficultyLevel: "beginner",
        difficultySubLevel: 2,
        isActive: true,
      },
      // Additional lessons for Topic 5 (Prayer)
      {
        id: 9,
        topicId: 5,
        title: "Prayer Movements: Pillars and Procedures",
        content:
          "Prayer (Salah) is a very important worship in Islam. After understanding the importance of prayer, now it's time to learn the movements in prayer and the correct procedures according to Islamic teachings.\n\nWhat are Prayer Movements?\nPrayer movements are a series of body positions performed sequentially in the worship of prayer. Each movement has deep spiritual meaning and purpose.\n\nPillars of Prayer (Obligatory Movements):\n1. Takbiratul Ihram - raising both hands while saying 'Allahu Akbar'\n2. Standing (Qiyam) - standing upright facing the Qibla\n3. Reciting Al-Fatihah - reading the opening chapter of the Quran\n4. Bowing (Rukuk) - bowing with hands on knees\n5. Standing upright (I'tidal) - standing back up after bowing\n6. Prostration (Sujud) - placing forehead, nose, both palms, knees, and toes on the floor\n7. Sitting between two prostrations\n8. Second prostration\n9. Tashahhud - sitting while reciting the tashahhud prayer\n10. Salutation (Salam) - saying greetings to the right and left\n\nProcedures for Each Movement:\n\nTakbiratul Ihram:\n- Raise both hands to ear level\n- Say 'Allahu Akbar' with devotion\n- Place right hand over left hand on chest\n\nQiyam (Standing):\n- Stand upright facing the Qibla\n- Look towards the place of prostration\n- Recite Al-Fatihah and a short chapter\n\nRukuk (Bowing):\n- Bow until hands touch knees\n- Keep back straight parallel to the floor\n- Say 'Subhana Rabbiyal Adhim' (3x)\n\nSujud (Prostration):\n- Place forehead and nose on the floor\n- Both palms beside the head\n- Knees and toes touching the floor\n- Say 'Subhana Rabbiyal A'la' (3x)\n\nEtiquette in Prayer:\n- Perform ablution (wudhu) first\n- Face the Qibla\n- Cover the awrah (private parts)\n- Be humble and focused\n- Avoid unnecessary movements\n\nWisdom of Prayer Movements:\n- Train discipline of body and soul\n- Show humility before Allah\n- Maintain physical health through movements\n- Train concentration and focus\n- Build spiritual relationship with Allah\n\nTips for Beginners:\n1. Learn one movement at a time\n2. Practice movements without recitation first\n3. Pay attention to correct body positions\n4. Ask for help from those who are experienced\n5. Be patient in learning, consistency is key",
        summary: "Learning prayer movements, pillars of prayer, and correct procedures",
        learningObjectives: JSON.stringify(["Know the pillars of prayer", "Understand the procedures of each prayer movement", "Master correct body positions in prayer", "Understand the wisdom behind each movement"]),
        prerequisites: JSON.stringify(["Basic understanding of prayer", "Ability to perform ablution", "Knowledge of Qibla direction"]),
        keyConcepts: JSON.stringify(["Pillars of prayer and their movements", "From Takbiratul Ihram to Salam", "Correct body positions", "Etiquette and ethics in prayer"]),
        practicalApplications: JSON.stringify(["Performing the 5 daily prayers", "Teaching prayer to others", "Leading congregational prayer", "Improving quality of worship"]),
        mediaContent: JSON.stringify({
          images: ["/images/lessons/prayer-positions.png", "/images/lessons/rukun-sholat.png"],
          diagrams: ["/images/lessons/prayer-sequence.png"],
          videos: ["/videos/lessons/prayer-demonstration.mp4"],
        }),
        orderIndex: 2,
        estimatedDuration: 45,
        difficultyLevel: "beginner",
        difficultySubLevel: 3,
        isActive: true,
      },
    ];

    await db.insert(lessons).values(lessonsData);
    console.log("✅ Lessons created");

    // 5. Create lesson examples
    const examplesData = [
      // Examples for Lesson 1 (Numbers 1-5)
      {
        id: 1,
        lessonId: 1,
        title: "Number 1 Example",
        content: "1 - One",
        explanation: "Number 1 represents one object",
        orderIndex: 1,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 2,
        lessonId: 1,
        title: "Number 2 Example",
        content: "2 - Two",
        explanation: "Number 2 represents two objects",
        orderIndex: 2,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 3,
        lessonId: 1,
        title: "Number 3 Example",
        content: "3 - Three",
        explanation: "Number 3 represents three objects",
        orderIndex: 3,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 4,
        lessonId: 1,
        title: "Number 4 Example",
        content: "4 - Four",
        explanation: "Number 4 represents four objects",
        orderIndex: 4,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 5,
        lessonId: 1,
        title: "Number 5 Example",
        content: "5 - Five",
        explanation: "Number 5 represents five objects",
        orderIndex: 5,
        exampleType: "text",
        mediaUrl: null,
      },
      // Examples for Lesson 2 (Numbers 6-10)
      {
        id: 6,
        lessonId: 2,
        title: "Number 6 Example",
        content: "6 - Six",
        explanation: "Number 6 represents six objects",
        orderIndex: 1,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 7,
        lessonId: 2,
        title: "Number 7 Example",
        content: "7 - Seven",
        explanation: "Number 7 represents seven objects",
        orderIndex: 2,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 8,
        lessonId: 2,
        title: "Number 8 Example",
        content: "8 - Eight",
        explanation: "Number 8 represents eight objects",
        orderIndex: 3,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 9,
        lessonId: 2,
        title: "Number 9 Example",
        content: "9 - Nine",
        explanation: "Number 9 represents nine objects",
        orderIndex: 4,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 10,
        lessonId: 2,
        title: "Number 10 Example",
        content: "10 - Ten",
        explanation: "Number 10 represents ten objects",
        orderIndex: 5,
        exampleType: "text",
        mediaUrl: null,
      },
      // Examples for Lesson 3 (Addition 1-5: Combining Numbers)
      {
        id: 31,
        lessonId: 3,
        title: "Basic Addition Concept",
        content: "Addition is an operation that combines two or more numbers. Examples: 1+1=2, 2+1=3, 2+2=4. The '+' symbol means 'plus' and '=' means 'equals'.",
        explanation: "Addition is a fundamental mathematical operation that teaches the concept of 'adding' or 'combining'. This is the foundation for all advanced mathematical operations.",
        orderIndex: 1,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/addition-concept.png",
      },
      {
        id: 32,
        lessonId: 3,
        title: "Addition with Fingers",
        content: "Use fingers to help with addition. For 2+3: show 2 fingers on the left hand, then 3 fingers on the right hand. Count all the fingers shown: 1, 2, 3, 4, 5. So 2+3=5.",
        explanation: "Using fingers as a visual aid helps children understand the concept of addition concretely. This is an effective method for beginners.",
        orderIndex: 2,
        exampleType: "interactive",
        mediaUrl: "/images/lessons/finger-addition.png",
      },
      {
        id: 33,
        lessonId: 3,
        title: "Commutative Property of Addition",
        content: "The order of numbers in addition does not affect the result. Example: 2+3=5 and 3+2=5. This is called the commutative property of addition.",
        explanation: "The commutative property is an important concept that shows addition can be done in any order. This helps flexibility in calculating.",
        orderIndex: 3,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/commutative-property.png",
      },
      {
        id: 34,
        lessonId: 3,
        title: "Addition with Real Objects",
        content: "Use real objects to understand addition. For example: 2 apples + 3 apples = 5 apples. Or 1 toy + 4 toys = 5 toys. This helps visualize the concept of addition.",
        explanation: "Using real objects makes abstract concepts concrete. Children can see and touch objects, making it easier to understand the concept of addition.",
        orderIndex: 4,
        exampleType: "interactive",
        mediaUrl: "/images/lessons/real-objects-addition.png",
      },
      // Examples for Lesson 4 (Alif, Ba, Ta)
      {
        id: 11,
        lessonId: 4,
        title: "Letter Alif",
        content: "ا - Alif",
        explanation: "Letter Alif is the first letter in the Arabic alphabet",
        orderIndex: 1,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 12,
        lessonId: 4,
        title: "Letter Ba",
        content: "ب - Ba",
        explanation: "Letter Ba is shaped like a bowl with one dot below",
        orderIndex: 2,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 13,
        lessonId: 4,
        title: "Letter Ta",
        content: "ت - Ta",
        explanation: "Letter Ta is like Ba but with two dots above",
        orderIndex: 3,
        exampleType: "text",
        mediaUrl: null,
      },
      // Examples for Lesson 5 (Ordering Numbers 1-10)
      {
        id: 14,
        lessonId: 5,
        title: "Ascending Order",
        content: "Ascending order is arranging numbers from smallest to largest. Example of ascending order for numbers 1-10 is: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.",
        explanation: "Ascending order helps us understand the concept of 'greater than' and see patterns of increasing values. This is the foundation for many advanced mathematical operations.",
        orderIndex: 1,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/ascending-order.png",
      },
      {
        id: 15,
        lessonId: 5,
        title: "Descending Order",
        content: "Descending order is arranging numbers from largest to smallest. Example of descending order for numbers 1-10 is: 10, 9, 8, 7, 6, 5, 4, 3, 2, 1.",
        explanation: "Descending order helps us understand the concept of 'less than' and see patterns of decreasing values. This is also important for mathematical operations like subtraction.",
        orderIndex: 2,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/descending-order.png",
      },
      {
        id: 16,
        lessonId: 5,
        title: "Ordering Random Numbers",
        content: "When numbers are presented randomly, we need to order them. For example, if we have numbers 3, 1, 5, 2, 4, the ascending order is 1, 2, 3, 4, 5.",
        explanation: "The ability to order random numbers is very important in daily life, such as when arranging items by number, organizing schedules, or understanding rankings.",
        orderIndex: 3,
        exampleType: "interactive",
        mediaUrl: "/images/lessons/ordering-exercise.png",
      },

      // Lesson 6 Examples (Addition 6-10: Advanced Operations)
      {
        id: 17,
        lessonId: 6,
        title: "Various Ways to Reach 10",
        content: "There are many ways to reach number 10 through addition: 1+9=10, 2+8=10, 3+7=10, 4+6=10, 5+5=10. Each of these combinations is important to understand.",
        explanation: "Understanding various ways to reach 10 is an important foundation for advanced mathematics. Number 10 is the base of the decimal number system we use.",
        orderIndex: 1,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/ways-to-ten.png",
      },
      {
        id: 18,
        lessonId: 6,
        title: "Addition with Results Greater than 10",
        content: "When addition results exceed 10, we begin to recognize two-digit numbers. Examples: 6+5=11, 7+4=11, 8+3=11, 9+2=11. Number 11 consists of 1 ten and 1 unit.",
        explanation: "The concept of two-digit numbers is an important step towards understanding more complex number systems. This introduces the concept of place value (tens and units).",
        orderIndex: 2,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/two-digit-numbers.png",
      },
      {
        id: 19,
        lessonId: 6,
        title: "Finger Counting Strategy",
        content: "Use both hands to count addition 6-10. For example for 7+3: show 7 fingers on the left hand, then add 3 fingers on the right hand. Total: 10 fingers.",
        explanation: "Using fingers as a visual aid helps children understand addition concepts concretely before moving to abstract thinking.",
        orderIndex: 3,
        exampleType: "interactive",
        mediaUrl: "/images/lessons/finger-counting-advanced.png",
      },

      // Lesson 7 Examples (Subtraction 1-10: Inverse Operations)
      {
        id: 20,
        lessonId: 7,
        title: "Simple Subtraction",
        content: "Subtraction is the inverse of addition. Simple examples: 5-2=3, 8-3=5, 10-4=6. We 'take away' or 'subtract' a number of objects from the initial group.",
        explanation: "Subtraction helps us understand the concepts of 'decreasing' and 'remainder'. This is a fundamental operation used in many daily life situations.",
        orderIndex: 1,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/subtraction-basics.png",
      },
      {
        id: 21,
        lessonId: 7,
        title: "Relationship Between Addition and Subtraction",
        content: "Addition and subtraction are related. If 3+4=7, then 7-4=3 and 7-3=4. This is called inverse operations.",
        explanation: "Understanding the inverse relationship between addition and subtraction helps in problem solving and answer verification. This also builds deeper understanding of mathematical operations.",
        orderIndex: 2,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/inverse-operations.png",
      },
      {
        id: 22,
        lessonId: 7,
        title: "Subtraction with Zero",
        content: "Subtraction with zero has special rules: subtracting by 0 does not change the number (5-0=5), while subtracting a number by itself results in 0 (5-5=0).",
        explanation: "The concept of zero in subtraction is important to understand because zero is the neutral element in mathematics. This also introduces the concept of identity in mathematical operations.",
        orderIndex: 3,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/subtraction-with-zero.png",
      },

      // Lesson 8 Examples (Jim, Ha, Kho: Advanced Hijaiyah Letters)
      {
        id: 23,
        lessonId: 8,
        title: "Letter Jim (ج)",
        content: "Jim is the 5th letter in the Hijaiyah alphabet. Its shape is like a bowl with one dot below. In separate form, Jim is written as ج.",
        explanation: "Jim is a consonant letter in Arabic that has one dot below. Its pronunciation is similar to 'j' in the word 'jump' in English.",
        orderIndex: 1,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/jim.png",
      },
      {
        id: 24,
        lessonId: 8,
        title: "Letter Ha (ح)",
        content: "Ha is the 6th letter in the Hijaiyah alphabet. Its shape is like an incomplete circle and has no dot. In separate form, Ha is written as ح.",
        explanation: "Ha is a consonant letter in Arabic that has no dot. Its pronunciation is with gentle breath from the throat.",
        orderIndex: 2,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/ha.png",
      },
      {
        id: 25,
        lessonId: 8,
        title: "Letter Kho (خ)",
        content: "Kho is the 7th letter in the Hijaiyah alphabet. Its shape is similar to Ha but has one dot above. In separate form, Kho is written as خ.",
        explanation: "Kho is a consonant letter in Arabic that has one dot above. Its pronunciation is with strong breath from the throat.",
        orderIndex: 3,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/kho.png",
      },
      {
        id: 26,
        lessonId: 8,
        title: "Differences Between Jim, Ha, and Kho",
        content: "These three letters have similar basic shapes, but are distinguished by dots: Jim has a dot below, Ha has no dot, and Kho has a dot above.",
        explanation: "Understanding the differences in dots on Arabic letters is very important because it can change the sound and meaning of words. This is the foundation for reading and writing Arabic correctly.",
        orderIndex: 4,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/jim-ha-kho-comparison.png",
      },

      // Lesson 9 Examples (Prayer Movements: Pillars and Procedures)
      {
        id: 27,
        lessonId: 9,
        title: "Takbiratul Ihram",
        content: "Takbiratul Ihram is the opening movement of prayer by raising both hands to ear level while saying 'Allahu Akbar'. After that, place the right hand over the left hand on the chest.",
        explanation: "Takbiratul Ihram marks the beginning of prayer and is the first pillar of prayer. This movement symbolizes the glorification of Allah and leaving all worldly affairs during prayer.",
        orderIndex: 1,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/takbiratul-ihram.png",
      },
      {
        id: 28,
        lessonId: 9,
        title: "Rukuk and I'tidal",
        content: "Rukuk is the movement of bowing the body with hands touching the knees and back parallel to the floor. After rukuk, continue with I'tidal which is standing back up with hands at the sides.",
        explanation: "Rukuk symbolizes human humility before Allah. I'tidal is the movement of standing upright again which symbolizes firmness of faith and respect to Allah.",
        orderIndex: 2,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/rukuk-itidal.png",
      },
      {
        id: 29,
        lessonId: 9,
        title: "Sujud and Sitting Between Two Sujud",
        content: "Sujud is performed by placing the forehead, nose, both palms, knees, and toes on the floor. After the first sujud, sit between two sujud with the right foot upright and the left foot sat upon.",
        explanation: "Sujud is the peak of human humility before Allah. This position shows complete surrender. Sitting between two sujud is time to ask for Allah's forgiveness and mercy.",
        orderIndex: 3,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/sujud-duduk.png",
      },
      {
        id: 30,
        lessonId: 9,
        title: "Tashahhud and Salam",
        content: "Tashahhud is sitting at the end of prayer while reciting the tashahhud prayer. Salam is the movement that ends prayer by turning to the right and left while saying 'Assalamu'alaikum warahmatullah'.",
        explanation: "Tashahhud contains the acknowledgment of Allah's oneness and testimony of Prophet Muhammad's prophethood. Salam ends the prayer and symbolizes peace spread to all directions.",
        orderIndex: 4,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/tasyahud-salam.png",
      },
    ];

    await db.insert(lessonExamples).values(examplesData);
    console.log("✅ Lesson examples created");

    // 6. Create practice questions
    const questionsData = [
      // Questions for Lesson 1 (Numbers 1-5)
      {
        id: 1,
        lessonId: 1,
        type: "multiple_choice",
        question: "What number is shown: 3?",
        explanation: "Number 3 is read as 'three'",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 2,
        lessonId: 1,
        type: "true_false",
        question: "Number 5 is greater than number 3. True or false?",
        explanation: "True. Number 5 is indeed greater than number 3.",
        difficultyLevel: "beginner",
        points: 8,
        orderIndex: 2,
      },
      {
        id: 3,
        lessonId: 1,
        type: "fill_blank",
        question: "The number after 4 is ___",
        explanation: "The number after 4 is 5.",
        difficultyLevel: "beginner",
        points: 12,
        orderIndex: 3,
      },
      // Questions for Lesson 2 (Numbers 6-10)
      {
        id: 4,
        lessonId: 2,
        type: "multiple_choice",
        question: "What number is shown: 8?",
        explanation: "Number 8 is read as 'eight'",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 5,
        lessonId: 2,
        type: "true_false",
        question: "Number 10 is the largest number we learn. True or false?",
        explanation: "True. In this lesson, number 10 is the largest.",
        difficultyLevel: "beginner",
        points: 8,
        orderIndex: 2,
      },
      {
        id: 6,
        lessonId: 2,
        type: "fill_blank",
        question: "The number before 10 is ___",
        explanation: "The number before 10 is 9.",
        difficultyLevel: "beginner",
        points: 12,
        orderIndex: 3,
      },
      // Questions for Lesson 3 (Addition 1-5)
      {
        id: 7,
        lessonId: 3,
        type: "multiple_choice",
        question: "What is the result of 2 + 3?",
        explanation: "2 + 3 = 5. Addition is combining two numbers.",
        difficultyLevel: "beginner",
        points: 15,
        orderIndex: 1,
      },
      {
        id: 8,
        lessonId: 3,
        type: "true_false",
        question: "1 + 4 equals 5. True or false?",
        explanation: "True. 1 + 4 = 5.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 2,
      },
      // Questions for Lesson 4 (Alif, Ba, Ta)
      {
        id: 9,
        lessonId: 4,
        type: "multiple_choice",
        question: "Which Arabic letter is shaped like a straight line?",
        explanation: "Letter Alif (ا) is shaped like a vertical straight line.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 10,
        lessonId: 4,
        type: "true_false",
        question: "Arabic is written from left to right. True or false?",
        explanation: "False. Arabic is written from right to left.",
        difficultyLevel: "beginner",
        points: 12,
        orderIndex: 2,
      },
      {
        id: 11,
        lessonId: 4,
        type: "fill_blank",
        question: "Letter Ba has ___ dot(s) below it.",
        explanation: "Letter Ba has one dot below it.",
        difficultyLevel: "beginner",
        points: 8,
        orderIndex: 3,
      },

      // Questions for Lesson 5 (Ordering Numbers 1-10)
      {
        id: 13,
        lessonId: 5,
        type: "multiple_choice",
        question: "Order the following numbers from smallest to largest: 5, 2, 8, 1, 6",
        explanation: "Ascending order starts from the smallest number which is 1, then 2, 5, 6, and finally 8.",
        difficultyLevel: "beginner",
        points: 15,
        orderIndex: 1,
      },
      {
        id: 14,
        lessonId: 5,
        type: "true_false",
        question: "The descending order from 10 to 6 is: 10, 9, 8, 7, 6. True or false?",
        explanation: "True. The descending order from 10 to 6 is: 10, 9, 8, 7, 6.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 2,
      },
      {
        id: 15,
        lessonId: 5,
        type: "fill_blank",
        question: "The number that is between 4 and 6 in ascending order is ___",
        explanation: "In ascending order, number 5 is between 4 and 6.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 3,
      },

      // Questions for Lesson 6 (Addition 6-10)
      {
        id: 16,
        lessonId: 6,
        type: "multiple_choice",
        question: "What is the result of 7 + 3?",
        explanation: "7 + 3 = 10. This is one way to reach number 10 through addition.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 17,
        lessonId: 6,
        type: "true_false",
        question: "The result of 6 + 5 is 11. True or false?",
        explanation: "True. 6 + 5 = 11. This is an example of addition that results in more than 10 and produces a two-digit number.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 2,
      },
      {
        id: 18,
        lessonId: 6,
        type: "fill_blank",
        question: "How many ways are there to reach number 10 with addition of two numbers? ___",
        explanation: "There are 5 ways: 1+9, 2+8, 3+7, 4+6, and 5+5.",
        difficultyLevel: "beginner",
        points: 15,
        orderIndex: 3,
      },

      // Questions for Lesson 7 (Subtraction 1-10)
      {
        id: 19,
        lessonId: 7,
        type: "multiple_choice",
        question: "What is the result of 8 - 3?",
        explanation: "8 - 3 = 5. Subtraction is an operation of taking away or reducing a number of objects from the initial group.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 20,
        lessonId: 7,
        type: "true_false",
        question: "If 4 + 3 = 7, then 7 - 3 = 4. True or false?",
        explanation: "True. This shows the inverse relationship between addition and subtraction. These operations are opposite to each other.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 2,
      },
      {
        id: 21,
        lessonId: 7,
        type: "fill_blank",
        question: "The result of 9 - 9 is ___",
        explanation: "When a number is subtracted by itself, the result is 0 (zero).",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 3,
      },

      // Questions for Lesson 8 (Jim, Ha, Kho)
      {
        id: 22,
        lessonId: 8,
        type: "multiple_choice",
        question: "The Hijaiyah letter that has a dot below is...",
        explanation: "Letter Jim (ج) has one dot below, different from Ha which has no dot and Kho which has a dot above.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 23,
        lessonId: 8,
        type: "true_false",
        question: "Letters Ha and Kho have the same basic shape. True or false?",
        explanation: "True. Letters Ha (ح) and Kho (خ) have the same basic shape, only different in dots. Ha has no dot, while Kho has one dot above.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 2,
      },
      {
        id: 24,
        lessonId: 8,
        type: "fill_blank",
        question: "The letter that sounds similar to 'j' in the word 'jump' is ___",
        explanation: "Letter Jim (ج) pronunciation is similar to 'j' in the word 'jump' in English.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 3,
      },

      // Questions for Lesson 9 (Prayer Movements)
      {
        id: 25,
        lessonId: 9,
        type: "multiple_choice",
        question: "The opening movement of prayer performed by raising both hands is...",
        explanation: "Takbiratul Ihram is the opening movement of prayer by raising both hands to ear level while saying 'Allahu Akbar'.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 26,
        lessonId: 9,
        type: "true_false",
        question: "Sujud is the peak of human humility before Allah. True or false?",
        explanation: "True. Sujud is indeed the peak of human humility before Allah, where the entire body touches the floor as a form of surrender.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 2,
      },
      {
        id: 27,
        lessonId: 9,
        type: "fill_blank",
        question: "The movement that ends prayer by turning to the right and left is called ___",
        explanation: "Salam is the movement that ends prayer by turning to the right and left while saying 'Assalamu'alaikum warahmatullah'.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 3,
      },
    ];

    await db.insert(practiceQuestions).values(questionsData);
    console.log("✅ Practice questions created");

    // 7. Create question options
    const optionsData = [
      // Options for question 1 (Number 3)
      {
        id: 1,
        questionId: 1,
        optionText: "Three",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 2,
        questionId: 1,
        optionText: "Four",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 3,
        questionId: 1,
        optionText: "Five",
        isCorrect: false,
        orderIndex: 3,
      },
      // Options for question 2 (True/False)
      {
        id: 100,
        questionId: 2,
        optionText: "True",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 101,
        questionId: 2,
        optionText: "False",
        isCorrect: false,
        orderIndex: 2,
      },
      // Options for question 3 (Fill blank)
      {
        id: 102,
        questionId: 3,
        optionText: "4",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 103,
        questionId: 3,
        optionText: "3",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 104,
        questionId: 3,
        optionText: "5",
        isCorrect: false,
        orderIndex: 3,
      },

      // Options for question 4 (Number 8)
      {
        id: 4,
        questionId: 4,
        optionText: "Eight",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 5,
        questionId: 4,
        optionText: "Seven",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 6,
        questionId: 4,
        optionText: "Nine",
        isCorrect: false,
        orderIndex: 3,
      },
      // Options for question 5 (True/False)
      {
        id: 105,
        questionId: 5,
        optionText: "True",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 106,
        questionId: 5,
        optionText: "False",
        isCorrect: false,
        orderIndex: 2,
      },
      // Options for question 6 (Fill blank)
      {
        id: 107,
        questionId: 6,
        optionText: "7",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 108,
        questionId: 6,
        optionText: "6",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 109,
        questionId: 6,
        optionText: "8",
        isCorrect: false,
        orderIndex: 3,
      },

      // Options for question 7 (Addition 2 + 3)
      {
        id: 7,
        questionId: 7,
        optionText: "5",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 8,
        questionId: 7,
        optionText: "4",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 9,
        questionId: 7,
        optionText: "6",
        isCorrect: false,
        orderIndex: 3,
      },
      // Options for question 8 (True/False)
      {
        id: 110,
        questionId: 8,
        optionText: "True",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 111,
        questionId: 8,
        optionText: "False",
        isCorrect: false,
        orderIndex: 2,
      },

      // Options for question 9 (Straight line letter)
      {
        id: 10,
        questionId: 9,
        optionText: "Alif (ا)",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 11,
        questionId: 9,
        optionText: "Ba (ب)",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 12,
        questionId: 9,
        optionText: "Ta (ت)",
        isCorrect: false,
        orderIndex: 3,
      },
      // Options for question 10 (True/False)
      {
        id: 112,
        questionId: 10,
        optionText: "True",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 113,
        questionId: 10,
        optionText: "False",
        isCorrect: false,
        orderIndex: 2,
      },
      // Options for question 11 (Fill blank)
      {
        id: 114,
        questionId: 11,
        optionText: "ب",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 115,
        questionId: 11,
        optionText: "ا",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 116,
        questionId: 11,
        optionText: "ت",
        isCorrect: false,
        orderIndex: 3,
      },

      // Options for question 13 (Ordering numbers)
      {
        id: 13,
        questionId: 13,
        optionText: "1, 2, 5, 6, 8",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 14,
        questionId: 13,
        optionText: "2, 1, 5, 6, 8",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 15,
        questionId: 13,
        optionText: "8, 6, 5, 2, 1",
        isCorrect: false,
        orderIndex: 3,
      },
      {
        id: 16,
        questionId: 13,
        optionText: "5, 2, 8, 1, 6",
        isCorrect: false,
        orderIndex: 4,
      },
      // Options for question 14 (True/False)
      {
        id: 117,
        questionId: 14,
        optionText: "True",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 118,
        questionId: 14,
        optionText: "False",
        isCorrect: false,
        orderIndex: 2,
      },
      // Options for question 15 (Fill blank)
      {
        id: 119,
        questionId: 15,
        optionText: "5",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 120,
        questionId: 15,
        optionText: "4.5",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 121,
        questionId: 15,
        optionText: "5.5",
        isCorrect: false,
        orderIndex: 3,
      },

      // Options for question 16 (7 + 3)
      {
        id: 17,
        questionId: 16,
        optionText: "10",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 18,
        questionId: 16,
        optionText: "9",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 19,
        questionId: 16,
        optionText: "11",
        isCorrect: false,
        orderIndex: 3,
      },
      {
        id: 20,
        questionId: 16,
        optionText: "8",
        isCorrect: false,
        orderIndex: 4,
      },
      // Options for question 17 (True/False)
      {
        id: 122,
        questionId: 17,
        optionText: "True",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 123,
        questionId: 17,
        optionText: "False",
        isCorrect: false,
        orderIndex: 2,
      },
      // Options for question 18 (Fill blank)
      {
        id: 124,
        questionId: 18,
        optionText: "5",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 125,
        questionId: 18,
        optionText: "4",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 126,
        questionId: 18,
        optionText: "6",
        isCorrect: false,
        orderIndex: 3,
      },

      // Options for question 19 (8 - 3)
      {
        id: 21,
        questionId: 19,
        optionText: "5",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 22,
        questionId: 19,
        optionText: "4",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 23,
        questionId: 19,
        optionText: "6",
        isCorrect: false,
        orderIndex: 3,
      },
      {
        id: 24,
        questionId: 19,
        optionText: "3",
        isCorrect: false,
        orderIndex: 4,
      },
      // Options for question 20 (True/False)
      {
        id: 127,
        questionId: 20,
        optionText: "True",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 128,
        questionId: 20,
        optionText: "False",
        isCorrect: false,
        orderIndex: 2,
      },
      // Options for question 21 (Fill blank)
      {
        id: 129,
        questionId: 21,
        optionText: "3",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 130,
        questionId: 21,
        optionText: "2",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 131,
        questionId: 21,
        optionText: "4",
        isCorrect: false,
        orderIndex: 3,
      },

      // Options for question 22 (Letter with dot below)
      {
        id: 25,
        questionId: 22,
        optionText: "Jim (ج)",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 26,
        questionId: 22,
        optionText: "Ha (ح)",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 27,
        questionId: 22,
        optionText: "Kho (خ)",
        isCorrect: false,
        orderIndex: 3,
      },
      {
        id: 28,
        questionId: 22,
        optionText: "Alif (ا)",
        isCorrect: false,
        orderIndex: 4,
      },
      // Options for question 23 (True/False)
      {
        id: 137,
        questionId: 23,
        optionText: "True",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 138,
        questionId: 23,
        optionText: "False",
        isCorrect: false,
        orderIndex: 2,
      },
      // Options for question 24 (Fill blank)
      {
        id: 139,
        questionId: 24,
        optionText: "Jim (ج)",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 140,
        questionId: 24,
        optionText: "Ha (ح)",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 141,
        questionId: 24,
        optionText: "Kho (خ)",
        isCorrect: false,
        orderIndex: 3,
      },
      {
        id: 142,
        questionId: 24,
        optionText: "Alif (ا)",
        isCorrect: false,
        orderIndex: 4,
      },

      // Options for question 25 (Opening prayer movement)
      {
        id: 29,
        questionId: 25,
        optionText: "Takbiratul Ihram",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 30,
        questionId: 25,
        optionText: "Rukuk",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 31,
        questionId: 25,
        optionText: "Sujud",
        isCorrect: false,
        orderIndex: 3,
      },
      {
        id: 32,
        questionId: 25,
        optionText: "Tashahhud",
        isCorrect: false,
        orderIndex: 4,
      },
      // Options for question 26 (True/False)
      {
        id: 132,
        questionId: 26,
        optionText: "True",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 133,
        questionId: 26,
        optionText: "False",
        isCorrect: false,
        orderIndex: 2,
      },
      // Options for question 27 (Fill blank)
      {
        id: 134,
        questionId: 27,
        optionText: "5",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 135,
        questionId: 27,
        optionText: "4",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 136,
        questionId: 27,
        optionText: "6",
        isCorrect: false,
        orderIndex: 3,
      },
    ];

    await db.insert(questionOptions).values(optionsData);
    console.log("✅ Question options created");

    // 8. Create achievements
    const achievementsData = [
      {
        id: 1,
        name: "Beginner",
        description: "Complete the first lesson",
        icon: "🌟",
        conditionType: "lessons_completed",
        conditionValue: 1,
        points: 50,
        isActive: true,
      },
      {
        id: 2,
        name: "Diligent Learner",
        description: "Study for 3 consecutive days",
        icon: "🔥",
        conditionType: "streak",
        conditionValue: 3,
        points: 100,
        isActive: true,
      },
      {
        id: 3,
        name: "Point Collector",
        description: "Collect 500 points",
        icon: "💎",
        conditionType: "points",
        conditionValue: 500,
        points: 200,
        isActive: true,
      },
    ];

    await db.insert(achievements).values(achievementsData);
    console.log("✅ Achievements created");

    // 9. Create user stats for demo user
    await db.insert(userStats).values({
      userId: demoUserId,
      totalStudyTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalPoints: 0,
      lessonsCompleted: 0,
      practiceQuestionsAnswered: 0,
      correctAnswers: 0,
      lastStudyDate: null,
    });
    console.log("✅ User stats created");

    console.log("🎉 Lentera data seeding completed successfully!");
    console.log("📧 Demo user: demo@lentera.app");
    console.log("🔑 Demo password: demo123");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedLenteraData()
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
