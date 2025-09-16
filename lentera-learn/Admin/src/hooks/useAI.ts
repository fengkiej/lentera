import { useState } from "react";
import { toast } from "sonner";

interface GenerateTextParams {
  prompt: string;
  model?: string;
}

interface GenerateTextResponse {
  generatedText: string;
}

export const useAIGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const backendUrl = import.meta.env.VITE_API_BASE_URL;

  const generateText = async ({ prompt, model }: GenerateTextParams): Promise<string | null> => {
    setIsGenerating(true);

    try {
      const response = await fetch(`${backendUrl}/ollama/generate-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, model }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate text");
      }

      const data: GenerateTextResponse = await response.json();
      return data.generatedText;
    } catch (error) {
      console.error("Error generating text:", error);
      toast.error("Gagal menggenerate teks dengan AI");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLessonSummary = async (title: string): Promise<string | null> => {
    const prompt = `Buatkan ringkasan lesson untuk topik "${title}". Ringkasan harus:
- Maksimal 500 karakter
- Maksimal 3-4 kalimat
- Menjelaskan apa yang akan dipelajari siswa
- Menggunakan bahasa Indonesia yang mudah dipahami
- Fokus pada tujuan pembelajaran
- Langsung mulai dengan inti materi, jangan gunakan kata pembuka seperti "Dalam lesson tentang" atau "Lesson ini membahas"

Jangan sertakan format markdown atau bullet points, hanya teks biasa.`;

    const result = await generateText({ prompt });
    if (result) {
      // Clean up the result to remove unwanted intro phrases and limit to 500 characters
      let cleanedResult = result
        .replace(/^(dalam\s+lesson\s+(tentang|ini)\s*["']?[^"']*["']?[,.]?\s*)/i, "")
        .replace(/^(lesson\s+ini\s+(membahas|akan\s+membahas|menjelaskan)\s*)/i, "")
        .replace(/^(pada\s+lesson\s+ini[,.]?\s*)/i, "")
        .replace(/^(materi\s+ini\s+(akan\s+)?membahas\s*)/i, "")
        .trim();

      // Limit to 500 characters
      if (cleanedResult.length > 500) {
        cleanedResult = cleanedResult.substring(0, 500).trim();
        // Try to end at a complete sentence
        const lastPeriod = cleanedResult.lastIndexOf(".");
        if (lastPeriod > 400) {
          cleanedResult = cleanedResult.substring(0, lastPeriod + 1);
        }
      }

      return cleanedResult || null;
    }
    return null;
  };

  const generateLessonContent = async (title: string, summary: string): Promise<string | null> => {
    const prompt = `Buatkan konten lesson lengkap untuk topik "${title}" dengan ringkasan: "${summary}". Konten harus:
- Terstruktur dengan jelas
- Menggunakan bahasa Indonesia yang mudah dipahami
- Mencakup penjelasan konsep, contoh, dan aplikasi praktis
- Panjang sekitar 300-500 kata
- Format dalam paragraf yang mudah dibaca

Jangan gunakan format markdown atau bullet points, hanya teks biasa dengan paragraf yang terpisah.`;

    return generateText({ prompt });
  };

  const generateLearningObjectives = async (title: string, summary: string, content: string): Promise<string[] | null> => {
    const prompt = `Buatkan 3-5 tujuan pembelajaran yang spesifik untuk lesson "${title}" dengan ringkasan "${summary}" dan konten "${content.substring(0, 200)}...".

Syarat:
- Setiap tujuan merupakan kalimat terpisah dan independen
- Mulai dengan kata kerja aktif (memahami, mampu, dapat, menjelaskan, menganalisis, dll)
- Spesifik dan terukur
- Menggunakan bahasa Indonesia yang baik dan benar
- Jangan gunakan bullet points, numbering, atau format khusus
- Tulis setiap tujuan dalam baris terpisah

Contoh output yang diharapkan:
Memahami konsep dasar matematika
Mampu menyelesaikan soal penjumlahan dengan benar
Dapat mengaplikasikan rumus dalam kehidupan sehari-hari
Menjelaskan hubungan antar konsep matematika

Hanya berikan tujuan pembelajaran, tanpa penjelasan tambahan:`;

    const result = await generateText({ prompt });
    if (result) {
      // Split by newlines and clean up each line
      const objectives = result
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "" && !line.match(/^(contoh|format|output|tujuan pembelajaran|berikut|adalah):/i))
        .map((line) =>
          line
            .replace(/^[-*•]\s*/, "")
            .replace(/^\d+\.\s*/, "")
            .trim()
        )
        .filter((line) => line.length > 10); // Filter out very short lines

      return objectives.length > 0 ? objectives : null;
    }
    return null;
  };

  const generatePrerequisites = async (title: string, summary: string): Promise<string[] | null> => {
    const prompt = `Buatkan 2-4 prasyarat yang harus dikuasai siswa sebelum mempelajari lesson "${title}" dengan ringkasan "${summary}".

Syarat:
- Setiap prasyarat merupakan kalimat terpisah dan independen
- Spesifik dan jelas tentang pengetahuan atau keterampilan dasar
- Menggunakan bahasa Indonesia yang baik dan benar
- Jangan gunakan bullet points, numbering, atau format khusus
- Tulis setiap prasyarat dalam baris terpisah
- Fokus pada konsep fundamental yang diperlukan

Contoh output yang diharapkan:
Memahami operasi penjumlahan dan pengurangan dasar
Mengenal konsep bilangan bulat positif dan negatif
Mampu membaca dan menulis angka hingga ribuan
Memahami konsep urutan dan perbandingan angka

Hanya berikan prasyarat pembelajaran, tanpa penjelasan tambahan:`;

    const result = await generateText({ prompt });
    if (result) {
      // Split by newlines and clean up each line
      const prerequisites = result
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "" && !line.match(/^(contoh|format|output|prasyarat|berikut|adalah):/i) && !line.match(/^berikut\s+(adalah|ini)\s+/i) && !line.match(/dari\s+lesson\s+"/i) && !line.match(/^(\d+\.\s*)?berikut/i))
        .map((line) =>
          line
            .replace(/^[-*•]\s*/, "")
            .replace(/^\d+\.\s*/, "")
            .trim()
        )
        .filter((line) => line.length > 10 && !line.toLowerCase().includes("berikut adalah")); // Filter out very short lines and intro phrases

      return prerequisites.length > 0 ? prerequisites : null;
    }
    return null;
  };

  const generateKeyConcepts = async (title: string, content: string): Promise<string[] | null> => {
    const prompt = `Buatkan 3-5 konsep kunci yang paling penting dalam lesson "${title}" dengan konten "${content.substring(0, 300)}...".

Syarat:
- Setiap konsep merupakan istilah atau frasa terpisah dan independen
- Singkat dan jelas (maksimal 2-3 kata)
- Menggunakan bahasa Indonesia yang baik dan benar
- Jangan gunakan bullet points, numbering, atau format khusus
- Tulis setiap konsep dalam baris terpisah
- Fokus pada terminologi atau konsep fundamental

Contoh output yang diharapkan:
Penjumlahan bilangan
Pengurangan dasar
Bilangan bulat
Operasi matematika
Urutan angka

Hanya berikan konsep kunci, tanpa penjelasan tambahan:`;

    const result = await generateText({ prompt });
    if (result) {
      // Split by newlines and clean up each line
      const concepts = result
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "" && !line.match(/^(contoh|format|output|konsep|berikut|adalah):/i) && !line.match(/^berikut\s+(adalah|ini)\s+/i) && !line.match(/dari\s+lesson\s+"/i) && !line.match(/^(\d+\.\s*)?berikut/i))
        .map((line) =>
          line
            .replace(/^[-*•]\s*/, "")
            .replace(/^\d+\.\s*/, "")
            .trim()
        )
        .filter((line) => line.length > 3 && !line.toLowerCase().includes("berikut adalah")); // Filter out very short lines and intro phrases

      return concepts.length > 0 ? concepts : null;
    }
    return null;
  };

  const generatePracticalApplications = async (title: string, content: string): Promise<string[] | null> => {
    const prompt = `Buatkan 3-4 aplikasi praktis dari lesson "${title}" dengan konten "${content.substring(0, 300)}..." dalam kehidupan sehari-hari.

Syarat:
- Setiap aplikasi merupakan contoh penerapan terpisah dan independen
- Konkret, spesifik, dan mudah dipahami
- Menggunakan bahasa Indonesia yang baik dan benar
- Jangan gunakan bullet points, numbering, atau format khusus
- Tulis setiap aplikasi dalam baris terpisah
- Fokus pada situasi nyata yang relevan

Contoh output yang diharapkan:
Menghitung kembalian saat berbelanja di toko
Mengukur takaran bahan saat memasak
Menentukan waktu tempuh perjalanan
Menghitung pengeluaran bulanan keluarga
Membagi makanan secara adil

Hanya berikan aplikasi praktis, tanpa penjelasan tambahan:`;

    const result = await generateText({ prompt });
    if (result) {
      // Split by newlines and clean up each line
      const applications = result
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "" && !line.match(/^(contoh|format|output|aplikasi|berikut|adalah):/i) && !line.match(/^berikut\s+(adalah|ini)\s+/i) && !line.match(/dari\s+lesson\s+"/i) && !line.match(/^(\d+\.\s*)?berikut/i))
        .map((line) =>
          line
            .replace(/^[-*•]\s*/, "")
            .replace(/^\d+\.\s*/, "")
            .trim()
        )
        .filter((line) => line.length > 10 && !line.toLowerCase().includes("berikut adalah")); // Filter out very short lines and intro phrases

      return applications.length > 0 ? applications : null;
    }
    return null;
  };

  const generateExampleContent = async (context?: string): Promise<{ title: string; content: string; explanation: string } | null> => {
    const contextText = context || "pembelajaran umum";

    // Create a more detailed prompt based on the context
    let prompt = "";
    if (context && context.includes("Lesson:")) {
      // If context contains lesson data, use it to create a more specific prompt
      prompt = `Berdasarkan informasi lesson berikut:

${contextText}

Buatkan satu contoh konkret yang relevan dengan materi lesson tersebut.

Syarat:
- Contoh harus sangat relevan dengan topik dan konten lesson
- Berikan judul contoh yang singkat dan jelas
- Konten contoh harus spesifik, praktis, dan mudah dipahami
- Penjelasan harus menjelaskan bagaimana contoh ini membantu pemahaman materi lesson
- Menggunakan bahasa Indonesia yang baik dan benar
- Jangan gunakan format markdown atau bullet points

Format output yang diharapkan:
JUDUL: [judul contoh]
KONTEN: [konten contoh]
PENJELASAN: [penjelasan contoh]

Hanya berikan output dalam format di atas, tanpa penjelasan tambahan:`;
    } else {
      // Fallback to generic prompt
      prompt = `Buatkan satu contoh konkret untuk ${contextText}.

Syarat:
- Contoh harus relevan dan mudah dipahami
- Berikan judul contoh yang singkat dan jelas
- Konten contoh harus spesifik dan praktis
- Penjelasan harus menjelaskan mengapa contoh ini penting
- Menggunakan bahasa Indonesia yang baik dan benar
- Jangan gunakan format markdown atau bullet points

Format output yang diharapkan:
JUDUL: [judul contoh]
KONTEN: [konten contoh]
PENJELASAN: [penjelasan contoh]

Hanya berikan output dalam format di atas, tanpa penjelasan tambahan:`;
    }

    const result = await generateText({ prompt });
    if (result) {
      // Parse the result to extract title, content, and explanation
      const lines = result
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "");

      let title = "";
      let content = "";
      let explanation = "";

      for (const line of lines) {
        if (line.toUpperCase().startsWith("JUDUL:")) {
          title = line.substring(6).trim();
        } else if (line.toUpperCase().startsWith("KONTEN:")) {
          content = line.substring(7).trim();
        } else if (line.toUpperCase().startsWith("PENJELASAN:")) {
          explanation = line.substring(11).trim();
        }
      }

      // If parsing failed, try to extract from unstructured text
      if (!title || !content || !explanation) {
        const cleanResult = result
          .replace(/^(berikut\s+(adalah|ini)\s+)/i, "")
          .replace(/^(contoh\s+untuk\s+lesson)/i, "")
          .trim();

        const sentences = cleanResult.split(".").filter((s) => s.trim().length > 10);
        if (sentences.length >= 3) {
          title = title || "Contoh Pembelajaran";
          content = content || sentences[0].trim() + ".";
          explanation = explanation || sentences.slice(1, 3).join(". ").trim() + ".";
        }
      }

      if (title && content && explanation) {
        return { title, content, explanation };
      }
    }
    return null;
  };

  const generatePracticeContent = async (
    questionType: "multiple_choice" | "true_false" | "fill_blank",
    lessonContext?: { title?: string; content?: string; summary?: string }
  ): Promise<{
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation?: string;
  } | null> => {
    let prompt = "";

    const contextInfo = lessonContext ? `berdasarkan lesson "${lessonContext.title}" dengan konten: "${lessonContext.content?.substring(0, 200)}..." dan ringkasan: "${lessonContext.summary}"` : "untuk pembelajaran umum";

    switch (questionType) {
      case "multiple_choice":
        prompt = `Buatkan 1 soal pilihan ganda ${contextInfo}.

Format yang diharapkan:
SOAL: [pertanyaan]
A. [pilihan A]
B. [pilihan B] 
C. [pilihan C]
D. [pilihan D]
JAWABAN: [A/B/C/D]
PENJELASAN: [penjelasan singkat mengapa jawaban tersebut benar]

Syarat:
- Soal harus jelas dan tidak ambigu
- 4 pilihan jawaban yang masuk akal
- Hanya 1 jawaban yang benar
- Penjelasan singkat dan mudah dipahami
- Menggunakan bahasa Indonesia yang baik dan benar`;
        break;

      case "true_false":
        prompt = `Buatkan 1 soal benar/salah ${contextInfo}.

Format yang diharapkan:
SOAL: [pernyataan]
JAWABAN: [BENAR/SALAH]
PENJELASAN: [penjelasan mengapa pernyataan tersebut benar atau salah]

Syarat:
- Pernyataan harus jelas dan tidak ambigu
- Jawaban harus definitif (benar atau salah)
- Penjelasan singkat dan mudah dipahami
- Menggunakan bahasa Indonesia yang baik dan benar`;
        break;

      case "fill_blank":
        prompt = `Buatkan 1 soal isi titik-titik ${contextInfo}.

Format yang diharapkan:
SOAL: [kalimat dengan tepat 1 underscore (___) sebagai placeholder]
A. [1 kata]
B. [1 kata] 
C. [1 kata]
D. [1 kata]
JAWABAN: [A/B/C/D]
PENJELASAN: [penjelasan singkat mengapa jawaban tersebut benar]

Syarat PENTING untuk soal isi titik-titik:
- Kalimat harus sederhana, natural, dan langsung ke inti
- JANGAN gunakan frasa seperti "dalam lesson ini", "kita akan mempelajari", "mari kita"
- Kalimat harus mengandung TEPAT 1 underscore (___) sebagai placeholder
- Hanya boleh ada 1 placeholder dalam satu kalimat
- Posisi ___ boleh di awal, tengah, atau akhir kalimat
- Contoh format yang BENAR: "___ adalah ibu kota Indonesia", "Ketika Andi lapar, Andi pergi ke ___ untuk makan", "Buku itu milik ___"
- Contoh format yang SALAH: "___ pergi ke ___ nenek" (lebih dari 1 placeholder)
- SETIAP PILIHAN JAWABAN HARUS BERUPA 1 KATA SAJA, bukan kalimat atau frasa panjang
- Contoh pilihan yang BENAR: A. Jakarta, B. Bandung, C. Surabaya, D. Medan
- Contoh pilihan yang SALAH: A. Jakarta adalah ibu kota, B. Kota Bandung yang indah
- Berikan 4 pilihan jawaban yang masuk akal, dengan hanya 1 jawaban yang benar
- Penjelasan harus langsung menjelaskan mengapa jawaban tersebut benar, tanpa bertele-tele
- Contoh penjelasan yang BAIK: "Jakarta adalah jawaban yang benar karena Jakarta adalah ibu kota Indonesia"
- Contoh penjelasan yang BURUK: "Kalimat tersebut mengandung 1 underscore. Jawaban yang diisi..."
- Jawaban harus sesuai dengan konteks kalimat
- Menggunakan bahasa Indonesia yang baik dan benar`;
        break;
    }

    const result = await generateText({ prompt });
    if (result) {
      try {
        // Parse the result based on question type
        const lines = result
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);

        let question = "";
        const options: string[] = [];
        let correctAnswer = "";
        let explanation = "";

        for (const line of lines) {
          if (line.startsWith("SOAL:")) {
            question = line.replace("SOAL:", "").trim();
          } else if (line.match(/^[A-D]\./)) {
            // Remove the option letter (A., B., C., D.) to avoid duplication
            const optionText = line.replace(/^[A-D]\.\s*/, "").trim();
            options.push(optionText);
          } else if (line.startsWith("JAWABAN:")) {
            correctAnswer = line.replace("JAWABAN:", "").trim();
          } else if (line.startsWith("PENJELASAN:")) {
            explanation = line.replace("PENJELASAN:", "").trim();
          }
        }

        // Validate and fix fill_blank format
        if (questionType === "fill_blank" && question) {
          const underscorePattern = /___/g;
          const underscoreMatches = question.match(underscorePattern);
          const underscoreCount = underscoreMatches ? underscoreMatches.length : 0;

          // If no underscores found, try to create one from the answer
          if (underscoreCount === 0 && correctAnswer) {
            // Replace the answer word in question with underscores
            const answerRegex = new RegExp(`\\b${correctAnswer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
            question = question.replace(answerRegex, "___");
          }

          // If still no proper format, create a simple fill-blank
          const finalUnderscoreCount = (question.match(/___/g) || []).length;
          if (finalUnderscoreCount === 0) {
            // Create a simple format: "[answer] adalah..." -> "___ adalah..."
            const words = question.split(" ");
            if (words.length > 0) {
              words[0] = "___";
              question = words.join(" ");
            }
          }
        }

        if (question && correctAnswer) {
          return {
            question,
            options: questionType === "multiple_choice" || questionType === "fill_blank" ? options : undefined,
            correctAnswer,
            explanation,
          };
        }
      } catch (error) {
        console.error("Error parsing practice content:", error);
      }
    }
    return null;
  };

  return {
    isGenerating,
    generateText,
    generateLessonSummary,
    generateLessonContent,
    generateLearningObjectives,
    generatePrerequisites,
    generateKeyConcepts,
    generatePracticalApplications,
    generateExampleContent,
    generatePracticeContent,
  };
};
