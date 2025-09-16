import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIVoiceTeacherProps {
  targetWord: string;
  arabicText: string;
  transliteration: string;
  meaning: string;
}

const AIVoiceTeacher = ({ targetWord, arabicText, transliteration, meaning }: AIVoiceTeacherProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        analyzeRecording(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasRecorded(true);
      setIsAnalyzing(true);
    }
  };

  const analyzeRecording = async (audioBlob: Blob) => {
    // Simulate AI analysis with mock data
    setTimeout(() => {
      const mockScore = Math.floor(Math.random() * 40) + 60; // Score between 60-100
      const mockFeedbacks = [
        "Pengucapan sudah baik! Coba perhatikan penekanan pada huruf ع",
        "Bagus! Suara ك sudah jelas, tingkatkan lagi pada huruf ت",
        "Hampir sempurna! Coba ulang dengan lebih pelan dan jelas",
        "Excellent! Pengucapan Anda sangat baik dan jelas",
      ];

      setScore(mockScore);
      setFeedback(mockFeedbacks[Math.floor(Math.random() * mockFeedbacks.length)]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const playTargetAudio = () => {
    // Mock audio playback - in real implementation, this would play the correct pronunciation
    console.log(`Playing audio for: ${arabicText}`);
  };

  const resetRecording = () => {
    setHasRecorded(false);
    setScore(null);
    setFeedback("");
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 75) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card className="shadow-lg border-none bg-gradient-to-br from-brand-cerulean-blue-700 to-brand-cerulean-blue-800 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-merriweather flex items-center space-x-2">
          <Volume2 className="h-5 w-5" />
          <span>AI Voice Teacher</span>
        </CardTitle>
        <p className="text-brand-cerulean-blue-100 text-sm">Latih pengucapan Anda dan dapatkan feedback instan</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Target Word Display */}
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <div className="arabic-text text-3xl font-bold mb-2 text-center">{arabicText}</div>
          <div className="text-lg font-medium">{targetWord}</div>
          <div className="text-sm text-brand-cerulean-blue-100">/{transliteration}/</div>
          <div className="text-sm text-brand-cerulean-blue-200 mt-1">{meaning}</div>
        </div>

        {/* Listen to Target */}
        <Button onClick={playTargetAudio} variant="secondary" size="sm" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
          <Volume2 className="h-4 w-4 mr-2" />
          Dengarkan Pengucapan
        </Button>

        {/* Recording Controls */}
        <div className="space-y-3">
          {!hasRecorded ? (
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={cn("w-full py-3 text-lg font-medium transition-all duration-200", isRecording ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-white text-brand-cerulean-blue-700 hover:bg-white/90")}
              disabled={isAnalyzing}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5 mr-2" />
                  Berhenti Merekam
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Mulai Merekam
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              {isAnalyzing ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm text-brand-cerulean-blue-100">Menganalisis pengucapan Anda...</p>
                </div>
              ) : score !== null ? (
                <div className="space-y-3">
                  {/* Score Display */}
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      {score >= 75 ? <CheckCircle className="h-6 w-6 text-green-400" /> : <AlertCircle className="h-6 w-6 text-yellow-400" />}
                      <span className="text-2xl font-bold">{score}%</span>
                    </div>
                    <Badge className={getScoreBadgeColor(score)}>{score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Needs Practice"}</Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Akurasi Pengucapan</span>
                      <span>{score}%</span>
                    </div>
                    <Progress value={score} className="h-2 bg-white/20 [&>div]:bg-white" />
                  </div>

                  {/* Feedback */}
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-sm text-brand-cerulean-blue-100 font-medium mb-1">Feedback:</p>
                    <p className="text-sm">{feedback}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button onClick={resetRecording} variant="secondary" className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Coba Lagi
                    </Button>
                    {score >= 75 && (
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Lanjut
                      </Button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-brand-cerulean-blue-200 text-center">💡 Tip: Ucapkan dengan jelas dan pelan untuk hasil terbaik</div>
      </CardContent>
    </Card>
  );
};

export default AIVoiceTeacher;
