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

    // 2. Create subjects (mata pelajaran)
    const subjectsData = [
      {
        id: 1,
        name: "Matematika Dasar",
        description: "Pembelajaran matematika untuk pemula",
        icon: "📊",
        color: "#3B82F6",
        orderIndex: 1,
        isActive: true,
      },
      {
        id: 2,
        name: "Pengantar Sains",
        description: "Konsep dasar ilmu pengetahuan alam",
        icon: "🔬",
        color: "#10B981",
        orderIndex: 2,
        isActive: true,
      },
      {
        id: 3,
        name: "Bahasa Indonesia",
        description: "Pembelajaran bahasa Indonesia yang baik dan benar",
        icon: "📚",
        color: "#F59E0B",
        orderIndex: 3,
        isActive: true,
      },
      {
        id: 4,
        name: "Al-Qur'an & Bahasa Arab",
        description: "Pembelajaran Al-Qur'an dan bahasa Arab",
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
      // Matematika Dasar
      {
        id: 1,
        subjectId: 1,
        name: "Pengenalan Angka",
        description: "Belajar mengenal angka 1-10",
        orderIndex: 1,
        estimatedDuration: 30,
        difficultyLevel: "beginner",
        isActive: true,
      },
      {
        id: 2,
        subjectId: 1,
        name: "Penjumlahan Dasar",
        description: "Operasi penjumlahan sederhana",
        orderIndex: 2,
        estimatedDuration: 45,
        difficultyLevel: "beginner",
        isActive: true,
      },
      {
        id: 3,
        subjectId: 1,
        name: "Pengurangan Dasar",
        description: "Operasi pengurangan sederhana",
        orderIndex: 3,
        estimatedDuration: 45,
        difficultyLevel: "beginner",
        isActive: true,
      },
      // Pengantar Sains
      {
        id: 4,
        subjectId: 2,
        name: "Alam Semesta",
        description: "Mengenal planet dan bintang",
        orderIndex: 1,
        estimatedDuration: 60,
        difficultyLevel: "beginner",
        isActive: true,
      },
      {
        id: 5,
        subjectId: 2,
        name: "Makhluk Hidup",
        description: "Klasifikasi makhluk hidup",
        orderIndex: 2,
        estimatedDuration: 50,
        difficultyLevel: "beginner",
        isActive: true,
      },
      // Bahasa Indonesia
      {
        id: 6,
        subjectId: 3,
        name: "Huruf dan Kata",
        description: "Pengenalan huruf dan pembentukan kata",
        orderIndex: 1,
        estimatedDuration: 40,
        difficultyLevel: "beginner",
        isActive: true,
      },
      {
        id: 7,
        subjectId: 3,
        name: "Kalimat Sederhana",
        description: "Membuat kalimat yang benar",
        orderIndex: 2,
        estimatedDuration: 50,
        difficultyLevel: "intermediate",
        isActive: true,
      },
      // Al-Qur'an & Bahasa Arab
      {
        id: 8,
        subjectId: 4,
        name: "Huruf Hijaiyah",
        description: "Mengenal dan membaca huruf Arab",
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
      // Pengenalan Angka - Topic 1
      {
        id: 1,
        topicId: 1,
        title: "Angka 1-5: Fondasi Matematika",
        content:
          "Selamat datang di dunia matematika! Angka adalah bahasa universal yang digunakan untuk menghitung, mengukur, dan memahami dunia di sekitar kita. Dalam pelajaran ini, kita akan mempelajari angka 1 sampai 5 sebagai fondasi dasar matematika.\n\nApa itu Angka?\nAngka adalah simbol yang mewakili jumlah atau kuantitas. Setiap angka memiliki nilai yang berbeda dan dapat digunakan untuk menghitung benda-benda di sekitar kita. Angka 1-5 adalah angka pertama yang perlu dikuasai karena menjadi dasar untuk memahami konsep matematika yang lebih kompleks.\n\nMengapa Angka 1-5 Penting?\n1. Angka 1 (satu) - Mewakili kesatuan, satu buah benda\n2. Angka 2 (dua) - Mewakili pasangan, dua buah benda\n3. Angka 3 (tiga) - Mewakili kelompok kecil, tiga buah benda\n4. Angka 4 (empat) - Mewakili kelompok sedang, empat buah benda\n5. Angka 5 (lima) - Mewakili satu tangan penuh, lima buah benda\n\nPenerapan dalam Kehidupan Sehari-hari:\n- Menghitung jari tangan (1-5)\n- Menghitung mainan atau benda di rumah\n- Memahami urutan (pertama, kedua, ketiga, keempat, kelima)\n- Dasar untuk belajar penjumlahan dan pengurangan\n\nDengan memahami angka 1-5, kamu telah membangun fondasi yang kuat untuk petualangan matematika selanjutnya!",
        summary: "Memahami konsep dasar angka 1-5 sebagai fondasi matematika dengan penerapan dalam kehidupan sehari-hari",
        learningObjectives: JSON.stringify([
          "Mengenal dan memahami angka 1 sampai 5",
          "Memahami konsep kuantitas yang diwakili setiap angka",
          "Menerapkan penghitungan angka 1-5 dalam kehidupan sehari-hari",
          "Membangun fondasi untuk pembelajaran matematika lanjutan",
        ]),
        prerequisites: JSON.stringify(["Kemampuan mengenali bentuk dasar", "Pemahaman konsep 'banyak' dan 'sedikit'"]),
        keyConcepts: JSON.stringify(["Angka sebagai simbol kuantitas", "Urutan angka 1-5", "Hubungan angka dengan benda nyata", "Konsep kesatuan dan kelompok"]),
        practicalApplications: JSON.stringify(["Menghitung jari tangan", "Menghitung mainan atau benda di rumah", "Memahami urutan dalam antrian", "Dasar untuk operasi matematika sederhana"]),
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
        title: "Angka 6-10: Melanjutkan Petualangan Angka",
        content:
          "Setelah menguasai angka 1-5, sekarang saatnya melanjutkan petualangan dengan angka 6-10! Angka-angka ini akan memperluas pemahaman kamu tentang kuantitas dan membuka pintu untuk konsep matematika yang lebih menarik.\n\nMengenal Angka 6-10:\n6. Angka 6 (enam) - Lebih dari satu tangan, seperti enam sisi dadu\n7. Angka 7 (tujuh) - Jumlah hari dalam seminggu\n8. Angka 8 (delapan) - Seperti bentuk infinity yang berdiri\n9. Angka 9 (sembilan) - Hampir mencapai sepuluh\n10. Angka 10 (sepuluh) - Angka bulat pertama dengan dua digit\n\nPola dan Hubungan:\nAngka 6-10 memiliki hubungan khusus dengan angka 1-5:\n- 6 = 5 + 1 (lima ditambah satu)\n- 7 = 5 + 2 (lima ditambah dua)\n- 8 = 5 + 3 (lima ditambah tiga)\n- 9 = 5 + 4 (lima ditambah empat)\n- 10 = 5 + 5 (lima ditambah lima)\n\nKonsep Penting:\n- Angka 10 adalah dasar sistem bilangan kita (sistem desimal)\n- Dengan 10 jari tangan, kita dapat menghitung hingga 10\n- Angka 10 menjadi dasar untuk memahami puluhan, ratusan, dan seterusnya\n\nPenerapan dalam Kehidupan:\n- Menghitung dengan kedua tangan (10 jari)\n- Memahami sistem waktu (7 hari seminggu)\n- Mengenal uang (koin dan kertas dengan nilai 1-10)\n- Bermain permainan yang melibatkan angka\n\nDengan menguasai angka 1-10, kamu telah memiliki alat dasar untuk menjelajahi dunia matematika yang lebih luas!",
        summary: "Mempelajari angka 6-10 dengan memahami pola, hubungan dengan angka sebelumnya, dan penerapan praktis",
        learningObjectives: JSON.stringify([
          "Mengenal dan memahami angka 6 sampai 10",
          "Memahami hubungan antara angka 6-10 dengan angka 1-5",
          "Mengenal konsep sistem bilangan desimal",
          "Menerapkan penghitungan 1-10 dalam aktivitas sehari-hari",
        ]),
        prerequisites: JSON.stringify(["Penguasaan angka 1-5", "Pemahaman konsep penjumlahan sederhana"]),
        keyConcepts: JSON.stringify(["Angka 6-10 sebagai kelanjutan dari 1-5", "Konsep sistem bilangan desimal", "Hubungan pola dalam angka", "Angka 10 sebagai dasar penghitungan"]),
        practicalApplications: JSON.stringify(["Menghitung dengan 10 jari tangan", "Memahami hari dalam seminggu", "Mengenal nilai uang sederhana", "Bermain permainan edukatif dengan angka"]),
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
      // Penjumlahan Dasar
      {
        id: 3,
        topicId: 2,
        title: "Penjumlahan 1-5: Menggabungkan Angka",
        content:
          "Selamat datang di dunia operasi matematika! Penjumlahan adalah salah satu operasi dasar yang paling penting dalam matematika. Dalam pelajaran ini, kita akan belajar cara menggabungkan angka 1-5 untuk mendapatkan hasil yang lebih besar.\n\nApa itu Penjumlahan?\nPenjumlahan adalah operasi matematika yang menggabungkan dua atau lebih angka untuk mendapatkan jumlah total. Simbol penjumlahan adalah '+' (plus), dan hasilnya disebut 'jumlah' atau 'hasil penjumlahan'.\n\nKonsep Dasar Penjumlahan:\n- Penjumlahan berarti 'menambahkan' atau 'menggabungkan'\n- Urutan angka tidak mempengaruhi hasil (2 + 3 = 3 + 2)\n- Menambahkan 0 tidak mengubah angka (3 + 0 = 3)\n- Penjumlahan selalu menghasilkan angka yang lebih besar atau sama\n\nContoh Penjumlahan dengan Angka 1-5:\n1 + 1 = 2 (satu ditambah satu sama dengan dua)\n1 + 2 = 3 (satu ditambah dua sama dengan tiga)\n2 + 2 = 4 (dua ditambah dua sama dengan empat)\n2 + 3 = 5 (dua ditambah tiga sama dengan lima)\n3 + 2 = 5 (tiga ditambah dua sama dengan lima)\n\nStrategi Menghitung:\n1. Menghitung dengan jari - gunakan jari untuk membantu menghitung\n2. Menghitung maju - mulai dari angka yang lebih besar, lalu tambahkan\n3. Menggunakan benda nyata - gunakan mainan atau benda untuk membantu\n4. Menghafal kombinasi sederhana - ingat hasil penjumlahan yang sering muncul\n\nPenerapan dalam Kehidupan Sehari-hari:\n- Menghitung total mainan yang dimiliki\n- Menambahkan jumlah buah di keranjang\n- Menghitung total uang saku\n- Memahami konsep 'lebih banyak' dalam berbagai situasi\n\nDengan menguasai penjumlahan 1-5, kamu telah membangun fondasi untuk operasi matematika yang lebih kompleks!",
        summary: "Mempelajari konsep penjumlahan dasar dengan angka 1-5, strategi menghitung, dan penerapan praktis",
        learningObjectives: JSON.stringify([
          "Memahami konsep penjumlahan sebagai operasi menggabungkan",
          "Menguasai penjumlahan angka 1-5",
          "Menggunakan berbagai strategi untuk menghitung penjumlahan",
          "Menerapkan penjumlahan dalam situasi kehidupan sehari-hari",
        ]),
        prerequisites: JSON.stringify(["Penguasaan angka 1-5", "Pemahaman konsep 'lebih banyak' dan 'menambah'"]),
        keyConcepts: JSON.stringify(["Penjumlahan sebagai operasi penggabungan", "Simbol '+' dan '=' dalam matematika", "Sifat komutatif penjumlahan", "Strategi menghitung penjumlahan"]),
        practicalApplications: JSON.stringify(["Menghitung total benda atau mainan", "Menambahkan jumlah dalam permainan", "Memahami konsep 'menambah' dalam kehidupan", "Dasar untuk operasi matematika lanjutan"]),
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
      // Huruf Hijaiyah
      {
        id: 4,
        topicId: 8,
        title: "Alif, Ba, Ta: Gerbang Bahasa Arab",
        content:
          "Assalamu'alaikum! Selamat datang dalam perjalanan mempelajari bahasa Arab melalui huruf Hijaiyah. Huruf Alif (ا), Ba (ب), dan Ta (ت) adalah tiga huruf pertama yang akan membuka pintu pemahaman kamu terhadap bahasa Al-Qur'an.\n\nPengenalan Huruf Hijaiyah:\nHuruf Hijaiyah adalah sistem tulisan bahasa Arab yang terdiri dari 28 huruf. Setiap huruf memiliki bentuk, bunyi, dan makna yang unik. Huruf-huruf ini tidak hanya digunakan untuk menulis bahasa Arab sehari-hari, tetapi juga untuk membaca Al-Qur'an.\n\nHuruf Alif (ا):\n- Bentuk: Seperti garis lurus vertikal\n- Bunyi: 'A' panjang atau pendek\n- Posisi: Dapat berada di awal, tengah, atau akhir kata\n- Keunikan: Huruf pertama dalam abjad Arab\n- Contoh kata: أب (ab = ayah), أم (umm = ibu)\n\nHuruf Ba (ب):\n- Bentuk: Seperti mangkuk dengan satu titik di bawah\n- Bunyi: 'B' seperti dalam bahasa Indonesia\n- Posisi: Dapat disambung dengan huruf lain\n- Keunikan: Memiliki bentuk yang berubah sesuai posisi dalam kata\n- Contoh kata: بيت (bait = rumah), كتاب (kitab = buku)\n\nHuruf Ta (ت):\n- Bentuk: Seperti huruf Ba tetapi dengan dua titik di atas\n- Bunyi: 'T' seperti dalam bahasa Indonesia\n- Posisi: Dapat disambung dengan huruf lain\n- Keunikan: Sering digunakan dalam kata-kata sehari-hari\n- Contoh kata: تفاح (tuffah = apel), بنت (bint = anak perempuan)\n\nCara Menulis dan Membaca:\n1. Bahasa Arab ditulis dari kanan ke kiri\n2. Huruf dapat berubah bentuk sesuai posisinya dalam kata\n3. Setiap huruf memiliki bunyi yang konsisten\n4. Latihan menulis dimulai dengan bentuk dasar setiap huruf\n\nPenerapan dalam Kehidupan:\n- Membaca nama-nama dalam bahasa Arab\n- Memahami kata-kata dasar dalam Al-Qur'an\n- Menulis nama sendiri dalam huruf Arab\n- Dasar untuk mempelajari huruf Hijaiyah lainnya\n\nDengan menguasai Alif, Ba, dan Ta, kamu telah mengambil langkah pertama dalam perjalanan spiritual dan intelektual mempelajari bahasa Arab!",
        summary: "Mempelajari tiga huruf Hijaiyah pertama (Alif, Ba, Ta) dengan pemahaman bentuk, bunyi, dan penerapan praktis",
        learningObjectives: JSON.stringify([
          "Mengenal dan menulis huruf Alif, Ba, dan Ta",
          "Memahami bunyi dan cara membaca setiap huruf",
          "Mengenal posisi huruf dalam kata bahasa Arab",
          "Membangun fondasi untuk mempelajari huruf Hijaiyah lainnya",
        ]),
        prerequisites: JSON.stringify(["Kemampuan mengenali bentuk dan pola", "Pemahaman dasar tentang sistem tulisan"]),
        keyConcepts: JSON.stringify(["Huruf Hijaiyah sebagai sistem tulisan Arab", "Bentuk dan bunyi huruf Alif, Ba, Ta", "Arah penulisan dari kanan ke kiri", "Perubahan bentuk huruf sesuai posisi"]),
        practicalApplications: JSON.stringify(["Menulis dan membaca kata-kata sederhana", "Mengenal huruf dalam nama-nama Arab", "Dasar untuk membaca Al-Qur'an", "Memahami tulisan Arab dalam kehidupan sehari-hari"]),
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
      // Additional lessons for Topic 1 (Pengenalan Angka)
      {
        id: 5,
        topicId: 1,
        title: "Mengurutkan Angka 1-10",
        content:
          "Setelah mengenal angka 1-10, sekarang saatnya belajar mengurutkan angka dari yang terkecil ke terbesar atau sebaliknya. Mengurutkan angka adalah keterampilan penting yang akan membantu dalam berbagai aspek matematika.\n\nApa itu Mengurutkan Angka?\nMengurutkan angka adalah menyusun angka-angka dalam urutan tertentu, biasanya dari terkecil ke terbesar (urutan naik) atau dari terbesar ke terkecil (urutan turun).\n\nUrutan Naik (Ascending): 1, 2, 3, 4, 5, 6, 7, 8, 9, 10\nUrutan Turun (Descending): 10, 9, 8, 7, 6, 5, 4, 3, 2, 1\n\nMengapa Mengurutkan Penting?\n- Membantu memahami konsep 'lebih besar' dan 'lebih kecil'\n- Dasar untuk operasi perbandingan\n- Membangun logika matematika\n- Berguna dalam kehidupan sehari-hari\n\nStrategi Mengurutkan:\n1. Mulai dari angka terkecil yang kamu tahu\n2. Cari angka berikutnya yang lebih besar\n3. Lanjutkan sampai semua angka tersusun\n4. Periksa kembali urutannya\n\nPenerapan dalam Kehidupan:\n- Mengurutkan nomor rumah di jalan\n- Menyusun ranking dalam permainan\n- Mengatur jadwal berdasarkan waktu\n- Memahami sistem antrian",
        summary: "Mempelajari cara mengurutkan angka 1-10 dari terkecil ke terbesar dan sebaliknya",
        learningObjectives: JSON.stringify(["Memahami konsep urutan naik dan turun", "Mengurutkan angka 1-10 dengan benar", "Menggunakan konsep perbandingan angka", "Menerapkan pengurutan dalam situasi praktis"]),
        prerequisites: JSON.stringify(["Penguasaan angka 1-10", "Pemahaman konsep 'lebih besar' dan 'lebih kecil'"]),
        keyConcepts: JSON.stringify(["Urutan naik (ascending)", "Urutan turun (descending)", "Konsep perbandingan angka", "Logika pengurutan"]),
        practicalApplications: JSON.stringify(["Mengurutkan nomor rumah", "Menyusun ranking permainan", "Mengatur jadwal waktu", "Memahami sistem antrian"]),
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
      // Additional lessons for Topic 2 (Penjumlahan Dasar)
      {
        id: 6,
        topicId: 2,
        title: "Penjumlahan 6-10: Operasi Lanjutan",
        content:
          "Setelah menguasai penjumlahan 1-5, sekarang saatnya melangkah ke level berikutnya dengan penjumlahan yang melibatkan angka 6-10. Ini akan memperluas kemampuan matematika dan mempersiapkan untuk konsep yang lebih kompleks.\n\nPenjumlahan dengan Angka Lebih Besar:\nPenjumlahan dengan angka 6-10 memerlukan strategi yang sedikit berbeda karena hasilnya bisa melebihi 10. Ini adalah langkah penting menuju pemahaman sistem bilangan yang lebih luas.\n\nContoh Penjumlahan 6-10:\n- 6 + 1 = 7\n- 6 + 2 = 8\n- 6 + 3 = 9\n- 6 + 4 = 10\n- 7 + 3 = 10\n- 5 + 5 = 10\n- 4 + 6 = 10\n\nKonsep Penting - Angka 10:\nAngka 10 adalah angka istimewa karena:\n- Merupakan hasil dari berbagai kombinasi penjumlahan\n- Dasar sistem bilangan desimal\n- Gerbang menuju bilangan dua digit\n\nStrategi Menghitung Lanjutan:\n1. Gunakan kedua tangan (10 jari)\n2. Hitung mundur dari angka yang lebih besar\n3. Pecah angka menjadi bagian yang lebih mudah\n4. Gunakan pola yang sudah dikenal\n\nPenjumlahan yang Menghasilkan Lebih dari 10:\nKetika hasil penjumlahan melebihi 10, kita mulai mengenal bilangan dua digit:\n- 6 + 5 = 11 (sepuluh ditambah satu)\n- 7 + 4 = 11\n- 8 + 3 = 11\n- 9 + 2 = 11\n\nPenerapan Praktis:\n- Menghitung uang saku yang terkumpul\n- Menjumlahkan skor dalam permainan\n- Menghitung total benda dalam kelompok\n- Memahami konsep 'lebih dari sepuluh'",
        summary: "Mempelajari penjumlahan dengan angka 6-10 dan pengenalan hasil yang melebihi 10",
        learningObjectives: JSON.stringify(["Menguasai penjumlahan dengan angka 6-10", "Memahami berbagai cara mencapai angka 10", "Mengenal konsep bilangan lebih dari 10", "Menggunakan strategi menghitung yang efektif"]),
        prerequisites: JSON.stringify(["Penguasaan penjumlahan 1-5", "Pemahaman angka 6-10", "Kemampuan menghitung dengan jari"]),
        keyConcepts: JSON.stringify(["Penjumlahan dengan hasil 10", "Pengenalan bilangan dua digit", "Strategi menghitung lanjutan", "Sistem bilangan desimal"]),
        practicalApplications: JSON.stringify(["Menghitung uang saku", "Menjumlahkan skor permainan", "Menghitung total benda", "Memahami konsep 'puluhan'"]),
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
      // Additional lessons for Topic 3 (Pengurangan Dasar)
      {
        id: 7,
        topicId: 3,
        title: "Pengurangan 1-10: Operasi Kebalikan",
        content:
          "Selamat datang di dunia pengurangan! Jika penjumlahan adalah tentang menggabungkan, maka pengurangan adalah tentang mengambil atau mengurangi. Pengurangan adalah operasi matematika yang sama pentingnya dengan penjumlahan.\n\nApa itu Pengurangan?\nPengurangan adalah operasi matematika yang mengurangi satu angka dari angka lainnya. Simbol pengurangan adalah '-' (minus), dan hasilnya disebut 'selisih' atau 'hasil pengurangan'.\n\nKonsep Dasar Pengurangan:\n- Pengurangan berarti 'mengambil' atau 'mengurangi'\n- Angka pertama (yang dikurangi) harus lebih besar atau sama dengan angka kedua\n- Hasil pengurangan selalu lebih kecil dari angka pertama\n- Pengurangan adalah kebalikan dari penjumlahan\n\nContoh Pengurangan Sederhana:\n- 5 - 1 = 4 (lima dikurangi satu sama dengan empat)\n- 5 - 2 = 3 (lima dikurangi dua sama dengan tiga)\n- 10 - 3 = 7 (sepuluh dikurangi tiga sama dengan tujuh)\n- 8 - 4 = 4 (delapan dikurangi empat sama dengan empat)\n- 6 - 6 = 0 (enam dikurangi enam sama dengan nol)\n\nHubungan dengan Penjumlahan:\nPengurangan dan penjumlahan saling berkaitan:\n- Jika 3 + 2 = 5, maka 5 - 2 = 3\n- Jika 4 + 3 = 7, maka 7 - 3 = 4\n- Ini disebut 'operasi kebalikan' atau 'invers'\n\nStrategi Menghitung Pengurangan:\n1. Menghitung mundur - mulai dari angka besar, hitung mundur\n2. Menggunakan jari - lipat jari sesuai angka yang dikurangi\n3. Menggunakan benda nyata - ambil benda sesuai pengurangan\n4. Menggunakan garis bilangan - bergerak ke kiri\n\nKonsep Nol dalam Pengurangan:\n- Mengurangi dengan 0 tidak mengubah angka (5 - 0 = 5)\n- Mengurangi angka dengan dirinya sendiri menghasilkan 0 (7 - 7 = 0)\n- 0 adalah titik netral dalam matematika\n\nPenerapan dalam Kehidupan:\n- Menghitung sisa uang setelah berbelanja\n- Menghitung sisa makanan setelah dimakan\n- Memahami konsep 'berkurang' dalam berbagai situasi\n- Dasar untuk pembagian dan operasi lanjutan",
        summary: "Mempelajari konsep pengurangan sebagai operasi kebalikan penjumlahan dengan angka 1-10",
        learningObjectives: JSON.stringify([
          "Memahami konsep pengurangan sebagai operasi mengambil",
          "Menguasai pengurangan dengan angka 1-10",
          "Memahami hubungan antara penjumlahan dan pengurangan",
          "Menggunakan berbagai strategi untuk menghitung pengurangan",
        ]),
        prerequisites: JSON.stringify(["Penguasaan angka 1-10", "Pemahaman penjumlahan dasar", "Konsep 'lebih besar' dan 'lebih kecil'"]),
        keyConcepts: JSON.stringify(["Pengurangan sebagai operasi kebalikan penjumlahan", "Simbol '-' dan konsep selisih", "Hubungan invers dengan penjumlahan", "Peran angka 0 dalam pengurangan"]),
        practicalApplications: JSON.stringify(["Menghitung sisa uang", "Menghitung sisa makanan", "Memahami konsep 'berkurang'", "Dasar untuk operasi matematika lanjutan"]),
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
      // Additional lessons for Topic 4 (Huruf Hijaiyah)
      {
        id: 8,
        topicId: 4,
        title: "Jim, Ha, Kho: Huruf Hijaiyah Lanjutan",
        content:
          "Setelah mengenal Alif, Ba, dan Ta, sekarang saatnya mempelajari tiga huruf Hijaiyah berikutnya: Jim (ج), Ha (ح), dan Kho (خ). Ketiga huruf ini memiliki keunikan tersendiri dalam bentuk dan cara pengucapannya.\n\nHuruf Jim (ج):\nJim adalah huruf ke-5 dalam abjad Hijaiyah. Huruf ini memiliki ciri khas berupa titik di bawah bentuk dasarnya.\n- Bentuk: ج (bentuk terpisah)\n- Bunyi: 'jim' seperti 'j' dalam kata 'jalan'\n- Penulisan: Dimulai dari atas, turun ke bawah, lalu melengkung\n- Titik: Satu titik di bawah\n\nHuruf Ha (ح):\nHa adalah huruf ke-6 dalam abjad Hijaiyah. Huruf ini tidak memiliki titik dan berbentuk seperti lingkaran yang tidak tertutup sempurna.\n- Bentuk: ح (bentuk terpisah)\n- Bunyi: 'ha' dengan hembusan napas yang lembut\n- Penulisan: Berbentuk seperti huruf 'o' yang terbuka di atas\n- Titik: Tidak ada titik\n\nHuruf Kho (خ):\nKho adalah huruf ke-7 dalam abjad Hijaiyah. Bentuknya mirip dengan Ha, tetapi memiliki satu titik di atas.\n- Bentuk: خ (bentuk terpisah)\n- Bunyi: 'kho' dengan hembusan napas yang kuat\n- Penulisan: Sama seperti Ha, tetapi dengan titik di atas\n- Titik: Satu titik di atas\n\nPerbedaan Penting:\n- Jim memiliki titik di bawah, Ha tidak ada titik, Kho ada titik di atas\n- Bunyi Jim lebih keras, Ha dan Kho lebih lembut dengan hembusan\n- Bentuk dasar Ha dan Kho sama, hanya berbeda di titik\n\nTips Mengingat:\n1. Jim = Jalan (mudah diingat karena bunyinya sama)\n2. Ha = Hembusan lembut tanpa titik\n3. Kho = Seperti Ha tapi ada 'topi' (titik di atas)\n\nLatihan Penulisan:\n- Mulai dengan bentuk dasar masing-masing huruf\n- Perhatikan arah penulisan yang benar\n- Tambahkan titik sesuai dengan hurufnya\n- Latih berkali-kali sampai lancar\n\nPenerapan dalam Kata:\nKetiga huruf ini sering muncul dalam kata-kata Arab:\n- جميل (jamil) = cantik\n- حسن (hasan) = baik\n- خير (khoir) = kebaikan",
        summary: "Mempelajari huruf Hijaiyah Jim, Ha, dan Kho dengan bentuk, bunyi, dan cara penulisannya",
        learningObjectives: JSON.stringify(["Mengenal bentuk huruf Jim, Ha, dan Kho", "Memahami bunyi masing-masing huruf", "Menguasai cara penulisan yang benar", "Membedakan huruf berdasarkan titik dan bentuk"]),
        prerequisites: JSON.stringify(["Penguasaan huruf Alif, Ba, Ta", "Pemahaman konsep titik dalam huruf Arab", "Kemampuan menulis huruf Arab dasar"]),
        keyConcepts: JSON.stringify(["Huruf Jim dengan titik di bawah", "Huruf Ha tanpa titik", "Huruf Kho dengan titik di atas", "Perbedaan bunyi dan bentuk"]),
        practicalApplications: JSON.stringify(["Membaca kata-kata Arab sederhana", "Menulis nama-nama dalam huruf Arab", "Memahami teks Al-Quran dasar", "Pengenalan kosakata Arab"]),
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
      // Additional lessons for Topic 5 (Sholat)
      {
        id: 9,
        topicId: 5,
        title: "Gerakan Sholat: Rukun dan Tata Cara",
        content:
          "Sholat adalah ibadah yang sangat penting dalam Islam. Setelah memahami pentingnya sholat, sekarang saatnya mempelajari gerakan-gerakan dalam sholat dan tata caranya yang benar sesuai dengan ajaran Islam.\n\nApa itu Gerakan Sholat?\nGerakan sholat adalah rangkaian posisi tubuh yang dilakukan secara berurutan dalam ibadah sholat. Setiap gerakan memiliki makna dan tujuan spiritual yang mendalam.\n\nRukun Sholat (Gerakan Wajib):\n1. Takbiratul Ihram - mengangkat kedua tangan sambil mengucapkan 'Allahu Akbar'\n2. Berdiri (Qiyam) - berdiri tegak menghadap kiblat\n3. Membaca Al-Fatihah - membaca surat pembuka Al-Quran\n4. Rukuk - membungkuk dengan tangan di lutut\n5. I'tidal - berdiri kembali setelah rukuk\n6. Sujud - meletakkan dahi, hidung, kedua telapak tangan, lutut, dan ujung kaki ke lantai\n7. Duduk di antara dua sujud\n8. Sujud kedua\n9. Tasyahud - duduk sambil membaca doa tasyahud\n10. Salam - mengucapkan salam ke kanan dan kiri\n\nTata Cara Setiap Gerakan:\n\nTakbiratul Ihram:\n- Angkat kedua tangan setinggi telinga\n- Ucapkan 'Allahu Akbar' dengan khusyuk\n- Letakkan tangan kanan di atas tangan kiri di dada\n\nQiyam (Berdiri):\n- Berdiri tegak menghadap kiblat\n- Pandangan ke tempat sujud\n- Baca Al-Fatihah dan surat pendek\n\nRukuk:\n- Bungkukkan badan hingga tangan menyentuh lutut\n- Punggung lurus sejajar dengan lantai\n- Ucapkan 'Subhana Rabbiyal Adhim' (3x)\n\nSujud:\n- Letakkan dahi dan hidung ke lantai\n- Kedua telapak tangan di samping kepala\n- Lutut dan ujung kaki menyentuh lantai\n- Ucapkan 'Subhana Rabbiyal A'la' (3x)\n\nAdab dalam Sholat:\n- Bersuci terlebih dahulu (wudhu)\n- Menghadap kiblat\n- Menutup aurat\n- Khusyuk dan fokus\n- Tidak bergerak yang tidak perlu\n\nHikmah Gerakan Sholat:\n- Melatih kedisiplinan tubuh dan jiwa\n- Menunjukkan kerendahan hati kepada Allah\n- Menyehatkan tubuh melalui gerakan\n- Melatih konsentrasi dan fokus\n- Membangun hubungan spiritual dengan Allah\n\nTips untuk Pemula:\n1. Pelajari satu gerakan dalam satu waktu\n2. Latih gerakan tanpa bacaan dulu\n3. Perhatikan posisi tubuh yang benar\n4. Minta bantuan orang yang sudah bisa\n5. Sabar dalam belajar, yang penting konsisten",
        summary: "Mempelajari gerakan-gerakan sholat, rukun sholat, dan tata cara yang benar",
        learningObjectives: JSON.stringify(["Mengenal rukun-rukun sholat", "Memahami tata cara setiap gerakan sholat", "Menguasai posisi tubuh yang benar dalam sholat", "Memahami hikmah di balik setiap gerakan"]),
        prerequisites: JSON.stringify(["Pemahaman dasar tentang sholat", "Kemampuan berwudhu", "Pengetahuan arah kiblat"]),
        keyConcepts: JSON.stringify(["Rukun sholat dan gerakannya", "Takbiratul ihram hingga salam", "Posisi tubuh yang benar", "Adab dan etika dalam sholat"]),
        practicalApplications: JSON.stringify(["Melaksanakan sholat 5 waktu", "Mengajarkan sholat kepada orang lain", "Memimpin sholat berjamaah", "Memperbaiki kualitas ibadah"]),
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
      // Examples for Lesson 1 (Angka 1-5)
      {
        id: 1,
        lessonId: 1,
        title: "Contoh Angka 1",
        content: "1 - Satu",
        explanation: "Angka 1 melambangkan satu buah benda",
        orderIndex: 1,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 2,
        lessonId: 1,
        title: "Contoh Angka 2",
        content: "2 - Dua",
        explanation: "Angka 2 melambangkan dua buah benda",
        orderIndex: 2,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 3,
        lessonId: 1,
        title: "Contoh Angka 3",
        content: "3 - Tiga",
        explanation: "Angka 3 melambangkan tiga buah benda",
        orderIndex: 3,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 4,
        lessonId: 1,
        title: "Contoh Angka 4",
        content: "4 - Empat",
        explanation: "Angka 4 melambangkan empat buah benda",
        orderIndex: 4,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 5,
        lessonId: 1,
        title: "Contoh Angka 5",
        content: "5 - Lima",
        explanation: "Angka 5 melambangkan lima buah benda",
        orderIndex: 5,
        exampleType: "text",
        mediaUrl: null,
      },
      // Examples for Lesson 2 (Angka 6-10)
      {
        id: 6,
        lessonId: 2,
        title: "Contoh Angka 6",
        content: "6 - Enam",
        explanation: "Angka 6 melambangkan enam buah benda",
        orderIndex: 1,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 7,
        lessonId: 2,
        title: "Contoh Angka 7",
        content: "7 - Tujuh",
        explanation: "Angka 7 melambangkan tujuh buah benda",
        orderIndex: 2,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 8,
        lessonId: 2,
        title: "Contoh Angka 8",
        content: "8 - Delapan",
        explanation: "Angka 8 melambangkan delapan buah benda",
        orderIndex: 3,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 9,
        lessonId: 2,
        title: "Contoh Angka 9",
        content: "9 - Sembilan",
        explanation: "Angka 9 melambangkan sembilan buah benda",
        orderIndex: 4,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 10,
        lessonId: 2,
        title: "Contoh Angka 10",
        content: "10 - Sepuluh",
        explanation: "Angka 10 melambangkan sepuluh buah benda",
        orderIndex: 5,
        exampleType: "text",
        mediaUrl: null,
      },
      // Examples for Lesson 3 (Penjumlahan 1-5: Menggabungkan Angka)
      {
        id: 31,
        lessonId: 3,
        title: "Konsep Penjumlahan Dasar",
        content: "Penjumlahan adalah operasi menggabungkan dua atau lebih angka. Contoh: 1+1=2, 2+1=3, 2+2=4. Simbol '+' berarti 'ditambah' dan '=' berarti 'sama dengan'.",
        explanation: "Penjumlahan adalah operasi matematika fundamental yang mengajarkan konsep 'menambah' atau 'menggabungkan'. Ini adalah dasar untuk semua operasi matematika lanjutan.",
        orderIndex: 1,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/addition-concept.png",
      },
      {
        id: 32,
        lessonId: 3,
        title: "Penjumlahan dengan Jari",
        content: "Gunakan jari untuk membantu penjumlahan. Untuk 2+3: tunjukkan 2 jari di tangan kiri, lalu 3 jari di tangan kanan. Hitung semua jari yang ditunjukkan: 1, 2, 3, 4, 5. Jadi 2+3=5.",
        explanation: "Menggunakan jari sebagai alat bantu visual membantu anak memahami konsep penjumlahan secara konkret. Ini adalah metode yang efektif untuk pemula.",
        orderIndex: 2,
        exampleType: "interactive",
        mediaUrl: "/images/lessons/finger-addition.png",
      },
      {
        id: 33,
        lessonId: 3,
        title: "Sifat Komutatif Penjumlahan",
        content: "Urutan angka dalam penjumlahan tidak mempengaruhi hasil. Contoh: 2+3=5 dan 3+2=5. Ini disebut sifat komutatif penjumlahan.",
        explanation: "Sifat komutatif adalah konsep penting yang menunjukkan bahwa penjumlahan dapat dilakukan dalam urutan apa pun. Ini membantu fleksibilitas dalam menghitung.",
        orderIndex: 3,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/commutative-property.png",
      },
      {
        id: 34,
        lessonId: 3,
        title: "Penjumlahan dengan Benda Nyata",
        content: "Gunakan benda nyata untuk memahami penjumlahan. Misalnya: 2 apel + 3 apel = 5 apel. Atau 1 mainan + 4 mainan = 5 mainan. Ini membantu memvisualisasikan konsep penjumlahan.",
        explanation: "Menggunakan benda nyata membuat konsep abstrak menjadi konkret. Anak dapat melihat dan menyentuh objek, sehingga lebih mudah memahami konsep penjumlahan.",
        orderIndex: 4,
        exampleType: "interactive",
        mediaUrl: "/images/lessons/real-objects-addition.png",
      },
      // Examples for Lesson 4 (Alif, Ba, Ta)
      {
        id: 11,
        lessonId: 4,
        title: "Huruf Alif",
        content: "ا - Alif",
        explanation: "Huruf Alif adalah huruf pertama dalam abjad Arab",
        orderIndex: 1,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 12,
        lessonId: 4,
        title: "Huruf Ba",
        content: "ب - Ba",
        explanation: "Huruf Ba berbentuk seperti mangkuk dengan satu titik di bawah",
        orderIndex: 2,
        exampleType: "text",
        mediaUrl: null,
      },
      {
        id: 13,
        lessonId: 4,
        title: "Huruf Ta",
        content: "ت - Ta",
        explanation: "Huruf Ta seperti Ba tetapi dengan dua titik di atas",
        orderIndex: 3,
        exampleType: "text",
        mediaUrl: null,
      },
      // Examples for Lesson 5 (Mengurutkan Angka 1-10)
      {
        id: 14,
        lessonId: 5,
        title: "Urutan Naik (Ascending)",
        content: "Urutan naik adalah menyusun angka dari yang terkecil ke terbesar. Contoh urutan naik untuk angka 1-10 adalah: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10.",
        explanation: "Urutan naik membantu kita memahami konsep 'lebih besar dari' dan melihat pola pertambahan nilai. Ini adalah dasar untuk banyak operasi matematika lanjutan.",
        orderIndex: 1,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/ascending-order.png",
      },
      {
        id: 15,
        lessonId: 5,
        title: "Urutan Turun (Descending)",
        content: "Urutan turun adalah menyusun angka dari yang terbesar ke terkecil. Contoh urutan turun untuk angka 1-10 adalah: 10, 9, 8, 7, 6, 5, 4, 3, 2, 1.",
        explanation: "Urutan turun membantu kita memahami konsep 'lebih kecil dari' dan melihat pola pengurangan nilai. Ini juga penting untuk operasi matematika seperti pengurangan.",
        orderIndex: 2,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/descending-order.png",
      },
      {
        id: 16,
        lessonId: 5,
        title: "Mengurutkan Angka Acak",
        content: "Ketika angka disajikan secara acak, kita perlu mengurutkannya. Misalnya, jika kita memiliki angka 3, 1, 5, 2, 4, urutan naiknya adalah 1, 2, 3, 4, 5.",
        explanation: "Kemampuan mengurutkan angka acak sangat penting dalam kehidupan sehari-hari, seperti saat menyusun barang berdasarkan nomor, mengatur jadwal, atau memahami rangking.",
        orderIndex: 3,
        exampleType: "interactive",
        mediaUrl: "/images/lessons/ordering-exercise.png",
      },

      // Lesson 6 Examples (Penjumlahan 6-10: Operasi Lanjutan)
      {
        id: 17,
        lessonId: 6,
        title: "Berbagai Cara Mencapai 10",
        content: "Ada banyak cara untuk mencapai angka 10 melalui penjumlahan: 1+9=10, 2+8=10, 3+7=10, 4+6=10, 5+5=10. Setiap kombinasi ini penting untuk dipahami.",
        explanation: "Memahami berbagai cara mencapai 10 adalah fondasi penting untuk matematika lanjutan. Angka 10 adalah dasar sistem bilangan desimal yang kita gunakan.",
        orderIndex: 1,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/ways-to-ten.png",
      },
      {
        id: 18,
        lessonId: 6,
        title: "Penjumlahan dengan Hasil Lebih dari 10",
        content: "Ketika hasil penjumlahan melebihi 10, kita mulai mengenal bilangan dua digit. Contoh: 6+5=11, 7+4=11, 8+3=11, 9+2=11. Angka 11 terdiri dari 1 puluhan dan 1 satuan.",
        explanation: "Konsep bilangan dua digit adalah langkah penting menuju pemahaman sistem bilangan yang lebih kompleks. Ini memperkenalkan konsep nilai tempat (puluhan dan satuan).",
        orderIndex: 2,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/two-digit-numbers.png",
      },
      {
        id: 19,
        lessonId: 6,
        title: "Strategi Menghitung dengan Jari",
        content: "Gunakan kedua tangan untuk menghitung penjumlahan 6-10. Misalnya untuk 7+3: tunjukkan 7 jari di tangan kiri, lalu tambahkan 3 jari di tangan kanan. Total: 10 jari.",
        explanation: "Menggunakan jari sebagai alat bantu visual membantu anak memahami konsep penjumlahan secara konkret sebelum beralih ke pemikiran abstrak.",
        orderIndex: 3,
        exampleType: "interactive",
        mediaUrl: "/images/lessons/finger-counting-advanced.png",
      },

      // Lesson 7 Examples (Pengurangan 1-10: Operasi Kebalikan)
      {
        id: 20,
        lessonId: 7,
        title: "Pengurangan Sederhana",
        content: "Pengurangan adalah kebalikan dari penjumlahan. Contoh sederhana: 5-2=3, 8-3=5, 10-4=6. Kita 'mengambil' atau 'mengurangi' sejumlah objek dari kelompok awal.",
        explanation: "Pengurangan membantu kita memahami konsep 'berkurang' dan 'sisa'. Ini adalah operasi fundamental yang digunakan dalam banyak situasi kehidupan sehari-hari.",
        orderIndex: 1,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/subtraction-basics.png",
      },
      {
        id: 21,
        lessonId: 7,
        title: "Hubungan Penjumlahan dan Pengurangan",
        content: "Penjumlahan dan pengurangan saling berkaitan. Jika 3+4=7, maka 7-4=3 dan 7-3=4. Ini disebut operasi kebalikan atau invers.",
        explanation: "Memahami hubungan invers antara penjumlahan dan pengurangan membantu dalam pemecahan masalah dan verifikasi jawaban. Ini juga membangun pemahaman yang lebih dalam tentang operasi matematika.",
        orderIndex: 2,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/inverse-operations.png",
      },
      {
        id: 22,
        lessonId: 7,
        title: "Pengurangan dengan Nol",
        content: "Pengurangan dengan nol memiliki aturan khusus: mengurangi dengan 0 tidak mengubah angka (5-0=5), sedangkan mengurangi angka dengan dirinya sendiri menghasilkan 0 (5-5=0).",
        explanation: "Konsep nol dalam pengurangan penting untuk dipahami karena nol adalah elemen netral dalam matematika. Ini juga memperkenalkan konsep identitas dalam operasi matematika.",
        orderIndex: 3,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/subtraction-with-zero.png",
      },

      // Lesson 8 Examples (Jim, Ha, Kho: Huruf Hijaiyah Lanjutan)
      {
        id: 23,
        lessonId: 8,
        title: "Huruf Jim (ج)",
        content: "Jim adalah huruf ke-5 dalam abjad Hijaiyah. Bentuknya seperti mangkuk dengan satu titik di bawah. Dalam bentuk terpisah, Jim ditulis sebagai ج.",
        explanation: "Jim adalah huruf konsonan dalam bahasa Arab yang memiliki satu titik di bawah. Cara pengucapannya mirip dengan 'j' dalam kata 'jalan' dalam bahasa Indonesia.",
        orderIndex: 1,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/jim.png",
      },
      {
        id: 24,
        lessonId: 8,
        title: "Huruf Ha (ح)",
        content: "Ha adalah huruf ke-6 dalam abjad Hijaiyah. Bentuknya seperti lingkaran yang tidak tertutup sempurna dan tidak memiliki titik. Dalam bentuk terpisah, Ha ditulis sebagai ح.",
        explanation: "Ha adalah huruf konsonan dalam bahasa Arab yang tidak memiliki titik. Cara pengucapannya dengan hembusan napas yang lembut dari tenggorokan.",
        orderIndex: 2,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/ha.png",
      },
      {
        id: 25,
        lessonId: 8,
        title: "Huruf Kho (خ)",
        content: "Kho adalah huruf ke-7 dalam abjad Hijaiyah. Bentuknya mirip dengan Ha tetapi memiliki satu titik di atas. Dalam bentuk terpisah, Kho ditulis sebagai خ.",
        explanation: "Kho adalah huruf konsonan dalam bahasa Arab yang memiliki satu titik di atas. Cara pengucapannya dengan hembusan napas yang kuat dari tenggorokan.",
        orderIndex: 3,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/kho.png",
      },
      {
        id: 26,
        lessonId: 8,
        title: "Perbedaan Jim, Ha, dan Kho",
        content: "Ketiga huruf ini memiliki bentuk dasar yang mirip, tetapi dibedakan oleh titik: Jim memiliki titik di bawah, Ha tidak memiliki titik, dan Kho memiliki titik di atas.",
        explanation: "Memahami perbedaan titik pada huruf Arab sangat penting karena dapat mengubah bunyi dan makna kata. Ini adalah dasar untuk membaca dan menulis bahasa Arab dengan benar.",
        orderIndex: 4,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/jim-ha-kho-comparison.png",
      },

      // Lesson 9 Examples (Gerakan Sholat: Rukun dan Tata Cara)
      {
        id: 27,
        lessonId: 9,
        title: "Takbiratul Ihram",
        content: "Takbiratul Ihram adalah gerakan awal sholat dengan mengangkat kedua tangan setinggi telinga sambil mengucapkan 'Allahu Akbar'. Setelah itu, letakkan tangan kanan di atas tangan kiri di dada.",
        explanation: "Takbiratul Ihram menandai dimulainya sholat dan merupakan rukun sholat yang pertama. Gerakan ini melambangkan pengagungan Allah dan meninggalkan segala urusan duniawi selama sholat.",
        orderIndex: 1,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/takbiratul-ihram.png",
      },
      {
        id: 28,
        lessonId: 9,
        title: "Rukuk dan I'tidal",
        content: "Rukuk adalah gerakan membungkukkan badan dengan tangan menyentuh lutut dan punggung sejajar dengan lantai. Setelah rukuk, dilanjutkan dengan I'tidal yaitu berdiri kembali dengan tangan di samping badan.",
        explanation: "Rukuk melambangkan kerendahan hati manusia di hadapan Allah. I'tidal adalah gerakan kembali tegak yang melambangkan keteguhan iman dan penghormatan kepada Allah.",
        orderIndex: 2,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/rukuk-itidal.png",
      },
      {
        id: 29,
        lessonId: 9,
        title: "Sujud dan Duduk Antara Dua Sujud",
        content: "Sujud dilakukan dengan meletakkan dahi, hidung, kedua telapak tangan, lutut, dan ujung kaki ke lantai. Setelah sujud pertama, duduk di antara dua sujud dengan posisi kaki kanan tegak dan kaki kiri diduduki.",
        explanation: "Sujud adalah puncak kerendahan hati manusia di hadapan Allah. Posisi ini menunjukkan penyerahan diri sepenuhnya. Duduk antara dua sujud adalah waktu untuk memohon ampunan dan rahmat Allah.",
        orderIndex: 3,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/sujud-duduk.png",
      },
      {
        id: 30,
        lessonId: 9,
        title: "Tasyahud dan Salam",
        content: "Tasyahud adalah duduk di akhir sholat sambil membaca doa tasyahud. Salam adalah gerakan mengakhiri sholat dengan menoleh ke kanan dan ke kiri sambil mengucapkan 'Assalamu'alaikum warahmatullah'.",
        explanation: "Tasyahud berisi pengakuan keesaan Allah dan kesaksian kenabian Muhammad SAW. Salam mengakhiri sholat dan melambangkan perdamaian yang disebarkan ke seluruh penjuru.",
        orderIndex: 4,
        exampleType: "text_with_image",
        mediaUrl: "/images/lessons/tasyahud-salam.png",
      },
    ];

    await db.insert(lessonExamples).values(examplesData);
    console.log("✅ Lesson examples created");

    // 6. Create practice questions
    const questionsData = [
      // Questions for Lesson 1 (Angka 1-5)
      {
        id: 1,
        lessonId: 1,
        type: "multiple_choice",
        question: "Berapa angka yang ditunjukkan: 3?",
        explanation: "Angka 3 dibaca 'tiga'",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 2,
        lessonId: 1,
        type: "true_false",
        question: "Angka 5 lebih besar dari angka 3. Benar atau salah?",
        explanation: "Benar. Angka 5 memang lebih besar dari angka 3.",
        difficultyLevel: "beginner",
        points: 8,
        orderIndex: 2,
      },
      {
        id: 3,
        lessonId: 1,
        type: "fill_blank",
        question: "Angka setelah 4 adalah ___",
        explanation: "Angka setelah 4 adalah 5.",
        difficultyLevel: "beginner",
        points: 12,
        orderIndex: 3,
      },
      // Questions for Lesson 2 (Angka 6-10)
      {
        id: 4,
        lessonId: 2,
        type: "multiple_choice",
        question: "Berapa angka yang ditunjukkan: 8?",
        explanation: "Angka 8 dibaca 'delapan'",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 5,
        lessonId: 2,
        type: "true_false",
        question: "Angka 10 adalah angka terbesar yang kita pelajari. Benar atau salah?",
        explanation: "Benar. Dalam pelajaran ini, angka 10 adalah yang terbesar.",
        difficultyLevel: "beginner",
        points: 8,
        orderIndex: 2,
      },
      {
        id: 6,
        lessonId: 2,
        type: "fill_blank",
        question: "Angka sebelum 10 adalah ___",
        explanation: "Angka sebelum 10 adalah 9.",
        difficultyLevel: "beginner",
        points: 12,
        orderIndex: 3,
      },
      // Questions for Lesson 3 (Penjumlahan 1-5)
      {
        id: 7,
        lessonId: 3,
        type: "multiple_choice",
        question: "Berapa hasil dari 2 + 3?",
        explanation: "2 + 3 = 5. Penjumlahan adalah menggabungkan dua angka.",
        difficultyLevel: "beginner",
        points: 15,
        orderIndex: 1,
      },
      {
        id: 8,
        lessonId: 3,
        type: "true_false",
        question: "1 + 4 sama dengan 5. Benar atau salah?",
        explanation: "Benar. 1 + 4 = 5.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 2,
      },
      // Questions for Lesson 4 (Alif, Ba, Ta)
      {
        id: 9,
        lessonId: 4,
        type: "multiple_choice",
        question: "Huruf Arab mana yang berbentuk seperti garis lurus?",
        explanation: "Huruf Alif (ا) berbentuk seperti garis lurus vertikal.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 10,
        lessonId: 4,
        type: "true_false",
        question: "Bahasa Arab ditulis dari kiri ke kanan. Benar atau salah?",
        explanation: "Salah. Bahasa Arab ditulis dari kanan ke kiri.",
        difficultyLevel: "beginner",
        points: 12,
        orderIndex: 2,
      },
      {
        id: 11,
        lessonId: 4,
        type: "fill_blank",
        question: "Huruf Ba memiliki ___ titik di bawahnya.",
        explanation: "Huruf Ba memiliki satu titik di bawahnya.",
        difficultyLevel: "beginner",
        points: 8,
        orderIndex: 3,
      },

      // Questions for Lesson 5 (Mengurutkan Angka 1-10)
      {
        id: 13,
        lessonId: 5,
        type: "multiple_choice",
        question: "Urutkan angka berikut dari terkecil ke terbesar: 5, 2, 8, 1, 6",
        explanation: "Urutan naik (ascending) dimulai dari angka terkecil yaitu 1, kemudian 2, 5, 6, dan terakhir 8.",
        difficultyLevel: "beginner",
        points: 15,
        orderIndex: 1,
      },
      {
        id: 14,
        lessonId: 5,
        type: "true_false",
        question: "Urutan turun dari angka 10 sampai 6 adalah: 10, 9, 8, 7, 6. Benar atau salah?",
        explanation: "Benar. Urutan turun (descending) dari 10 sampai 6 adalah: 10, 9, 8, 7, 6.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 2,
      },
      {
        id: 15,
        lessonId: 5,
        type: "fill_blank",
        question: "Angka yang berada di antara 4 dan 6 dalam urutan naik adalah ___",
        explanation: "Dalam urutan naik, angka 5 berada di antara 4 dan 6.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 3,
      },

      // Questions for Lesson 6 (Penjumlahan 6-10)
      {
        id: 16,
        lessonId: 6,
        type: "multiple_choice",
        question: "Berapa hasil dari 7 + 3?",
        explanation: "7 + 3 = 10. Ini adalah salah satu cara untuk mencapai angka 10 melalui penjumlahan.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 17,
        lessonId: 6,
        type: "true_false",
        question: "Hasil dari 6 + 5 adalah 11. Benar atau salah?",
        explanation: "Benar. 6 + 5 = 11. Ini adalah contoh penjumlahan yang hasilnya melebihi 10 dan menghasilkan bilangan dua digit.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 2,
      },
      {
        id: 18,
        lessonId: 6,
        type: "fill_blank",
        question: "Ada berapa cara untuk mencapai angka 10 dengan penjumlahan dua angka? ___",
        explanation: "Ada 5 cara: 1+9, 2+8, 3+7, 4+6, dan 5+5.",
        difficultyLevel: "beginner",
        points: 15,
        orderIndex: 3,
      },

      // Questions for Lesson 7 (Pengurangan 1-10)
      {
        id: 19,
        lessonId: 7,
        type: "multiple_choice",
        question: "Berapa hasil dari 8 - 3?",
        explanation: "8 - 3 = 5. Pengurangan adalah operasi mengambil atau mengurangi sejumlah objek dari kelompok awal.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 20,
        lessonId: 7,
        type: "true_false",
        question: "Jika 4 + 3 = 7, maka 7 - 3 = 4. Benar atau salah?",
        explanation: "Benar. Ini menunjukkan hubungan invers antara penjumlahan dan pengurangan. Operasi ini saling berkebalikan.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 2,
      },
      {
        id: 21,
        lessonId: 7,
        type: "fill_blank",
        question: "Hasil dari 9 - 9 adalah ___",
        explanation: "Ketika suatu angka dikurangi dengan dirinya sendiri, hasilnya adalah 0 (nol).",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 3,
      },

      // Questions for Lesson 8 (Jim, Ha, Kho)
      {
        id: 22,
        lessonId: 8,
        type: "multiple_choice",
        question: "Huruf Hijaiyah yang memiliki titik di bawah adalah...",
        explanation: "Huruf Jim (ج) memiliki satu titik di bawah, berbeda dengan Ha yang tidak memiliki titik dan Kho yang memiliki titik di atas.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 23,
        lessonId: 8,
        type: "true_false",
        question: "Huruf Ha dan Kho memiliki bentuk dasar yang sama. Benar atau salah?",
        explanation: "Benar. Huruf Ha (ح) dan Kho (خ) memiliki bentuk dasar yang sama, hanya berbeda pada titik. Ha tidak memiliki titik, sedangkan Kho memiliki satu titik di atas.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 2,
      },
      {
        id: 24,
        lessonId: 8,
        type: "fill_blank",
        question: "Huruf yang bunyinya mirip dengan 'j' dalam kata 'jalan' adalah ___",
        explanation: "Huruf Jim (ج) cara pengucapannya mirip dengan 'j' dalam kata 'jalan' dalam bahasa Indonesia.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 3,
      },

      // Questions for Lesson 9 (Gerakan Sholat)
      {
        id: 25,
        lessonId: 9,
        type: "multiple_choice",
        question: "Gerakan awal sholat yang dilakukan dengan mengangkat kedua tangan adalah...",
        explanation: "Takbiratul Ihram adalah gerakan awal sholat dengan mengangkat kedua tangan setinggi telinga sambil mengucapkan 'Allahu Akbar'.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 1,
      },
      {
        id: 26,
        lessonId: 9,
        type: "true_false",
        question: "Sujud adalah puncak kerendahan hati manusia di hadapan Allah. Benar atau salah?",
        explanation: "Benar. Sujud memang merupakan puncak kerendahan hati manusia di hadapan Allah, di mana seluruh tubuh menyentuh lantai sebagai bentuk penyerahan diri.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 2,
      },
      {
        id: 27,
        lessonId: 9,
        type: "fill_blank",
        question: "Gerakan mengakhiri sholat dengan menoleh ke kanan dan kiri disebut ___",
        explanation: "Salam adalah gerakan mengakhiri sholat dengan menoleh ke kanan dan ke kiri sambil mengucapkan 'Assalamu'alaikum warahmatullah'.",
        difficultyLevel: "beginner",
        points: 10,
        orderIndex: 3,
      },
    ];

    await db.insert(practiceQuestions).values(questionsData);
    console.log("✅ Practice questions created");

    // 7. Create question options
    const optionsData = [
      // Options for question 1 (Angka 3)
      {
        id: 1,
        questionId: 1,
        optionText: "Tiga",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 2,
        questionId: 1,
        optionText: "Empat",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 3,
        questionId: 1,
        optionText: "Lima",
        isCorrect: false,
        orderIndex: 3,
      },
      // Options for question 2 (True/False)
      {
        id: 100,
        questionId: 2,
        optionText: "Benar",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 101,
        questionId: 2,
        optionText: "Salah",
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

      // Options for question 4 (Angka 8)
      {
        id: 4,
        questionId: 4,
        optionText: "Delapan",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 5,
        questionId: 4,
        optionText: "Tujuh",
        isCorrect: false,
        orderIndex: 2,
      },
      {
        id: 6,
        questionId: 4,
        optionText: "Sembilan",
        isCorrect: false,
        orderIndex: 3,
      },
      // Options for question 5 (True/False)
      {
        id: 105,
        questionId: 5,
        optionText: "Benar",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 106,
        questionId: 5,
        optionText: "Salah",
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

      // Options for question 7 (Penjumlahan 2 + 3)
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
        optionText: "Benar",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 111,
        questionId: 8,
        optionText: "Salah",
        isCorrect: false,
        orderIndex: 2,
      },

      // Options for question 9 (Huruf garis lurus)
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
        optionText: "Benar",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 113,
        questionId: 10,
        optionText: "Salah",
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

      // Options for question 13 (Mengurutkan angka)
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
        optionText: "Benar",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 118,
        questionId: 14,
        optionText: "Salah",
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
        optionText: "Benar",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 123,
        questionId: 17,
        optionText: "Salah",
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
        optionText: "Benar",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 128,
        questionId: 20,
        optionText: "Salah",
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

      // Options for question 22 (Huruf dengan titik di bawah)
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
        optionText: "Benar",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 138,
        questionId: 23,
        optionText: "Salah",
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

      // Options for question 25 (Gerakan awal sholat)
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
        optionText: "Tasyahud",
        isCorrect: false,
        orderIndex: 4,
      },
      // Options for question 26 (True/False)
      {
        id: 132,
        questionId: 26,
        optionText: "Benar",
        isCorrect: true,
        orderIndex: 1,
      },
      {
        id: 133,
        questionId: 26,
        optionText: "Salah",
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
        name: "Pemula",
        description: "Menyelesaikan pelajaran pertama",
        icon: "🌟",
        conditionType: "lessons_completed",
        conditionValue: 1,
        points: 50,
        isActive: true,
      },
      {
        id: 2,
        name: "Rajin Belajar",
        description: "Belajar selama 3 hari berturut-turut",
        icon: "🔥",
        conditionType: "streak",
        conditionValue: 3,
        points: 100,
        isActive: true,
      },
      {
        id: 3,
        name: "Kolektor Poin",
        description: "Mengumpulkan 500 poin",
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
