import { useState, useEffect, useRef } from "react";
import {
  Heart, Play, Pause, QrCode, Trophy, CheckCircle, ChevronRight,
  BookOpen, Zap, Home, GraduationCap, Clock, Lock, PlayCircle,
  Star, RotateCcw, Check, X, Users, AlertCircle, MessageCircle,
  UserPlus, Search, Send, ArrowLeft, CreditCard, Smartphone,
  Eye, EyeOff, User, Bell, Settings, LogOut, ChevronDown,
  MoreHorizontal, ThumbsUp, Share2, Bookmark, BadgeCheck
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "DE" | "EN" | "TR" | "AR";
type AuthState = "splash" | "login" | "register" | "paywall" | "app";
type MainTab = "home" | "inclass" | "community" | "profile";
type InTab = "qr" | "quiz" | "cpr";
type ComTab = "feed" | "friends" | "messages";

// ─── Data ─────────────────────────────────────────────────────────────────────

const LANGUAGES: { code: Lang; flag: string }[] = [
  { code: "DE", flag: "🇩🇪" },
  { code: "EN", flag: "🇬🇧" },
  { code: "TR", flag: "🇹🇷" },
  { code: "AR", flag: "🇸🇦" },
];

type ModuleStatus = "completed" | "current" | "locked";
const MODULES: { id: number; title: Record<Lang, string>; duration: number; status: ModuleStatus; category: string }[] = [
  { id: 1, title: { DE: "Notruf absetzen", EN: "Emergency Call", TR: "Acil Çağrı", AR: "الاتصال بالطوارئ" }, duration: 75, status: "completed", category: "Grundlagen" },
  { id: 2, title: { DE: "Bewusstlosigkeit prüfen", EN: "Check Consciousness", TR: "Bilinç Kontrolü", AR: "فحص الوعي" }, duration: 68, status: "completed", category: "Beurteilung" },
  { id: 3, title: { DE: "Atemwege freimachen", EN: "Open Airways", TR: "Hava Yolu Açma", AR: "فتح مجرى الهواء" }, duration: 82, status: "completed", category: "Wiederbelebung" },
  { id: 4, title: { DE: "Herzdruckmassage", EN: "Chest Compressions", TR: "Göğüs Baskısı", AR: "ضغط الصدر" }, duration: 90, status: "current", category: "Wiederbelebung" },
  { id: 5, title: { DE: "Atemspende", EN: "Rescue Breathing", TR: "Kurtarma Solunumu", AR: "التنفس الاصطناعي" }, duration: 78, status: "locked", category: "Wiederbelebung" },
  { id: 6, title: { DE: "Stabile Seitenlage", EN: "Recovery Position", TR: "Koma Pozisyonu", AR: "وضع الإنعاش" }, duration: 65, status: "locked", category: "Beurteilung" },
  { id: 7, title: { DE: "Wunden versorgen", EN: "Wound Care", TR: "Yara Bakımı", AR: "العناية بالجروح" }, duration: 88, status: "locked", category: "Versorgung" },
  { id: 8, title: { DE: "Knochenbrüche erkennen", EN: "Fractures", TR: "Kırık Tespiti", AR: "الكسور" }, duration: 72, status: "locked", category: "Versorgung" },
  { id: 9, title: { DE: "Verbrennung & Verätzung", EN: "Burns & Scalds", TR: "Yanık ve Haşlanma", AR: "الحروق" }, duration: 81, status: "locked", category: "Versorgung" },
  { id: 10, title: { DE: "Schock behandeln", EN: "Treating Shock", TR: "Şok Tedavisi", AR: "علاج الصdmة" }, duration: 70, status: "locked", category: "Grundlagen" },
  { id: 11, title: { DE: "AED anwenden", EN: "Using an AED", TR: "AED Kullanımı", AR: "استخدام AED" }, duration: 85, status: "locked", category: "Wiederbelebung" },
  { id: 12, title: { DE: "Kurs abgeschlossen", EN: "Course Complete", TR: "Kurs Tamamlandı", AR: "اكتمال الدورة" }, duration: 60, status: "locked", category: "Grundlagen" },
];

const QUIZ_QUESTIONS: { question: Record<Lang, string>; options: Record<Lang, string[]>; correct: number; explanation: Record<Lang, string> }[] = [
  {
    question: { DE: "Wie viele Drücke pro Minute bei der Herzdruckmassage?", EN: "How many compressions per minute in CPR?", TR: "KPR'de dakikada kaç baskı?", AR: "كم ضغطة في الدقيقة أثناء الإنعاش؟" },
    options: { DE: ["60–80 / min", "100–120 / min", "130–150 / min", "80–90 / min"], EN: ["60–80 / min", "100–120 / min", "130–150 / min", "80–90 / min"], TR: ["60–80 / dak", "100–120 / dak", "130–150 / dak", "80–90 / dak"], AR: ["60–80 / دقيقة", "100–120 / دقيقة", "130–150 / دقيقة", "80–90 / دقيقة"] },
    correct: 1,
    explanation: { DE: "100–120 Drücke/min sind laut ERC-Leitlinien optimal.", EN: "100–120 per minute is optimal per ERC guidelines.", TR: "ERC'ye göre dakikada 100–120 baskı optimaldir.", AR: "100–120 ضغطة/دقيقة هي النسبة المثلى وفقاً لـ ERC." },
  },
  {
    question: { DE: "Wie tief drückt man bei Erwachsenen?", EN: "How deep for adult compressions?", TR: "Yetişkinlerde göğüs ne kadar derinliğe?", AR: "كم عمق الضغط على صدر البالغين؟" },
    options: { DE: ["1–2 cm", "3–4 cm", "5–6 cm", "7–8 cm"], EN: ["1–2 cm", "3–4 cm", "5–6 cm", "7–8 cm"], TR: ["1–2 cm", "3–4 cm", "5–6 cm", "7–8 cm"], AR: ["1–2 سم", "3–4 سم", "5–6 سم", "7–8 سم"] },
    correct: 2,
    explanation: { DE: "5–6 cm Drucktiefe ist bei Erwachsenen leitliniengerecht.", EN: "5–6 cm depth is guideline-correct for adults.", TR: "Yetişkinler için 5–6 cm kılavuz uyumludur.", AR: "عمق 5–6 سم صحيح للبالغين." },
  },
  {
    question: { DE: "Europäische Notrufnummer?", EN: "European emergency number?", TR: "Avrupa acil numarası?", AR: "رقم طوارئ أوروبا؟" },
    options: { DE: ["999", "110", "112", "911"], EN: ["999", "110", "112", "911"], TR: ["999", "110", "112", "911"], AR: ["999", "110", "112", "911"] },
    correct: 2,
    explanation: { DE: "112 ist die einheitliche Notrufnummer in Europa.", EN: "112 is the unified emergency number across Europe.", TR: "112, Avrupa'nın ortak acil numarasıdır.", AR: "112 هو رقم الطوارئ الموحد في أوروبا." },
  },
];

const LEADERBOARD = [
  { name: "Sarah K.", score: 980 }, { name: "Max M.", score: 960 },
  { name: "Ayşe D.", score: 940 }, { name: "Du", score: 0, isUser: true },
  { name: "Ahmed R.", score: 870 }, { name: "Julia F.", score: 820 },
];

const MOCK_FRIENDS = [
  { id: 1, name: "Sarah Köhler", role: "Erste-Hilfe Kurs · Kl. 3B", avatar: "SK", verified: true, connected: true, progress: 83 },
  { id: 2, name: "Ahmed Rashid", role: "Erste-Hilfe Kurs · Kl. 3B", avatar: "AR", verified: false, connected: true, progress: 67 },
  { id: 3, name: "Ayşe Demir", role: "Erste-Hilfe Kurs · Kl. 2A", avatar: "AD", verified: false, connected: true, progress: 100 },
  { id: 4, name: "Klaus Müller", role: "Ausbilder · DLRG München", avatar: "KM", verified: true, connected: false, progress: 100 },
  { id: 5, name: "Julia Fischer", role: "Erste-Hilfe Kurs · Kl. 3B", avatar: "JF", verified: false, connected: false, progress: 45 },
  { id: 6, name: "Thomas Weber", role: "Erste-Hilfe Kurs · Kl. 1C", avatar: "TW", verified: false, connected: false, progress: 58 },
];

const MOCK_MESSAGES = [
  { id: 1, from: "Sarah Köhler", avatar: "SK", last: "Hast du Modul 4 schon geschafft?", time: "09:42", unread: 2 },
  { id: 2, from: "Ahmed Rashid", avatar: "AR", last: "Top! Bis zum Kurs 💪", time: "Gestern", unread: 0 },
  { id: 3, from: "Kurs-Gruppe 3B", avatar: "3B", last: "Ausbilder: Bitte alle bis Freitag fertig", time: "Gestern", unread: 5 },
];

const MOCK_FEED = [
  { id: 1, name: "Sarah Köhler", avatar: "SK", time: "vor 2 Std.", text: "Modul 4 abgeschlossen! Die Herzdruckmassage ist gar nicht so einfach wie ich dachte – aber der Taktgeber hilft wirklich 🫀 Wer hat Tipps?", likes: 12, comments: 3 },
  { id: 2, name: "Klaus Müller", avatar: "KM", time: "vor 5 Std.", text: "📢 Erinnerung an Gruppe 3B: Kurs beginnt am Donnerstag um 09:00 Uhr. Bitte mindestens Modul 1–4 vorher durcharbeiten!", likes: 8, comments: 1, verified: true },
  { id: 3, name: "Ayşe Demir", avatar: "AD", time: "vor 1 Tag", text: "Alle 12 Module abgeschlossen! 🎉 Ich fühl mich jetzt wirklich vorbereitet. Kann jedem empfehlen, das vor dem Kurs zu machen.", likes: 24, comments: 7 },
];

const MOCK_CHAT = [
  { from: "them", text: "Hey! Bist du auch in der Gruppe 3B?", time: "09:30" },
  { from: "me", text: "Ja genau! Hast du schon mit den Modulen angefangen?", time: "09:31" },
  { from: "them", text: "Hast du Modul 4 schon geschafft?", time: "09:42" },
];

const CPR_BPM = 110;
const CPR_MS = Math.round(60000 / CPR_BPM);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

function Avatar({ initials, size = "md", color = "bg-primary" }: { initials: string; size?: "sm" | "md" | "lg"; color?: string }) {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Splash ───────────────────────────────────────────────────────────────────

function SplashScreen({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <div className="flex flex-col min-h-screen bg-primary text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
        {/* Logo */}
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
          <Heart className="w-10 h-10 fill-primary text-primary" />
        </div>

        <h1 className="font-display font-black text-5xl uppercase tracking-tight mb-2">
          ErstHilfe<span className="opacity-60">+</span>
        </h1>
        <p className="text-white/70 text-base mb-2 leading-relaxed">
          Lerne Erste Hilfe. Überall. In deiner Sprache.
        </p>
        <div className="flex gap-2 justify-center mt-1 mb-10">
          {["🇩🇪", "🇬🇧", "🇹🇷", "🇸🇦"].map((f) => (
            <span key={f} className="text-xl">{f}</span>
          ))}
        </div>

        {/* Feature pills */}
        <div className="flex flex-col gap-3 w-full mb-12">
          {[
            { icon: "🎬", text: "60-Sekunden Micro-Learning Videos" },
            { icon: "🫀", text: "CPR-Taktgeber · 110 BPM" },
            { icon: "🏆", text: "Live Quizzes mit Rangliste" },
            { icon: "👥", text: "Lerne mit Freunden aus deinem Kurs" },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 text-left">
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm font-medium">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="px-6 pb-10 flex flex-col gap-3 relative z-10">
        <button
          onClick={onRegister}
          className="w-full bg-white text-primary font-display font-bold text-lg uppercase py-4 rounded-xl tracking-wide active:scale-95 transition-transform"
        >
          Kostenlos registrieren
        </button>
        <button
          onClick={onLogin}
          className="w-full border-2 border-white/40 text-white font-display font-bold text-lg uppercase py-4 rounded-xl tracking-wide active:scale-95 transition-transform"
        >
          Bereits ein Konto? Einloggen
        </button>
        <p className="text-center text-white/40 text-xs mt-2">
          Registrierung kostenlos · Vollzugang für einmalig 5,00 €
        </p>
      </div>
    </div>
  );
}

// ─── Register ────────────────────────────────────────────────────────────────

function RegisterScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: (name: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name erforderlich";
    if (!email.includes("@")) e.email = "Gültige E-Mail eingeben";
    if (password.length < 6) e.password = "Mindestens 6 Zeichen";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(name.split(" ")[0]); }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary px-5 pt-12 pb-6 text-white">
        <button onClick={onBack} className="flex items-center gap-2 text-white/70 mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
        <h1 className="font-display font-bold text-3xl uppercase tracking-tight">Konto erstellen</h1>
        <p className="text-white/60 text-sm mt-1">Kostenlos registrieren, dann freischalten</p>
      </div>

      <div className="flex-1 px-6 py-8 flex flex-col gap-5">
        {/* Name */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Vollständiger Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Max Mustermann"
            className={`w-full border-2 rounded-xl px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground outline-none transition-colors ${errors.name ? "border-primary" : "border-border focus:border-foreground"}`}
          />
          {errors.name && <p className="text-primary text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">E-Mail-Adresse</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="max@beispiel.de"
            className={`w-full border-2 rounded-xl px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground outline-none transition-colors ${errors.email ? "border-primary" : "border-border focus:border-foreground"}`}
          />
          {errors.email && <p className="text-primary text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Passwort</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mindestens 6 Zeichen"
              className={`w-full border-2 rounded-xl px-4 py-3 pr-12 bg-background text-foreground placeholder:text-muted-foreground outline-none transition-colors ${errors.password ? "border-primary" : "border-border focus:border-foreground"}`}
            />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-primary text-xs mt-1">{errors.password}</p>}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Mit der Registrierung stimmst du unseren <span className="underline">Nutzungsbedingungen</span> und der <span className="underline">Datenschutzerklärung</span> zu.
        </p>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-primary text-white font-display font-bold text-lg uppercase py-4 rounded-xl disabled:opacity-60 transition-opacity active:scale-95"
        >
          {loading ? "Wird erstellt…" : "Konto erstellen"}
        </button>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: (name: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    if (!email || !password) { setError("Bitte alle Felder ausfüllen"); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess("Max"); }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary px-5 pt-12 pb-6 text-white">
        <button onClick={onBack} className="flex items-center gap-2 text-white/70 mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
        <h1 className="font-display font-bold text-3xl uppercase tracking-tight">Einloggen</h1>
        <p className="text-white/60 text-sm mt-1">Willkommen zurück!</p>
      </div>

      <div className="flex-1 px-6 py-8 flex flex-col gap-5">
        <div>
          <label className="text-sm font-medium mb-1.5 block">E-Mail-Adresse</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="max@beispiel.de"
            className="w-full border-2 border-border focus:border-foreground rounded-xl px-4 py-3 bg-background outline-none placeholder:text-muted-foreground transition-colors" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Passwort</label>
          <div className="relative">
            <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dein Passwort"
              className="w-full border-2 border-border focus:border-foreground rounded-xl px-4 py-3 pr-12 bg-background outline-none placeholder:text-muted-foreground transition-colors" />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button className="text-sm text-primary font-medium text-right -mt-2">Passwort vergessen?</button>
        {error && <p className="text-primary text-sm text-center">{error}</p>}
        <button onClick={submit} disabled={loading}
          className="w-full bg-primary text-white font-display font-bold text-lg uppercase py-4 rounded-xl disabled:opacity-60 active:scale-95 transition-all">
          {loading ? "Wird angemeldet…" : "Einloggen"}
        </button>
      </div>
    </div>
  );
}

// ─── Paywall ──────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { id: "paypal", label: "PayPal", icon: "🅿️" },
  { id: "card", label: "Kreditkarte", icon: "💳" },
  { id: "apple", label: "Apple Pay", icon: "🍎" },
  { id: "google", label: "Google Pay", icon: "🟡" },
  { id: "klarna", label: "Klarna", icon: "🟣" },
];

function PaywallScreen({ userName, onSuccess }: { userName: string; onSuccess: () => void }) {
  const [method, setMethod] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "confirm" | "processing" | "done">("select");

  const handlePay = () => {
    if (!method) return;
    setStep("processing");
    setTimeout(() => setStep("done"), 2200);
  };

  if (step === "done") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="font-display font-bold text-3xl uppercase tracking-tight mb-2">Zahlung erfolgreich!</h2>
        <p className="text-muted-foreground text-sm mb-8">5,00 € · Einmalzahlung bestätigt</p>
        <div className="w-full bg-card rounded-2xl p-5 mb-8 text-left">
          {[
            "Alle 12 Lernmodule freigeschaltet",
            "Live Quizzes & Ranglisten",
            "CPR-Taktgeber",
            "Community & Freunde",
            "Kein Abo, kein Ablauf",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <Check className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
        <button onClick={onSuccess} className="w-full bg-primary text-white font-display font-bold text-xl uppercase py-4 rounded-xl active:scale-95 transition-transform">
          App starten 🚀
        </button>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-medium text-muted-foreground">Zahlung wird verarbeitet…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary px-5 pt-12 pb-6 text-white text-center">
        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-3">
          <Heart className="w-7 h-7 fill-primary text-primary" />
        </div>
        <h1 className="font-display font-bold text-3xl uppercase tracking-tight">App freischalten</h1>
        <p className="text-white/70 text-sm mt-1">Hallo {userName}! Einmalig, kein Abo.</p>
      </div>

      <div className="flex-1 px-5 py-6">
        {/* Price card */}
        <div className="bg-foreground text-background rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-background/60 text-xs font-medium uppercase tracking-wide">Vollzugang</p>
            <p className="font-display font-bold text-2xl mt-0.5">Einmalzahlung</p>
            <p className="text-background/60 text-xs mt-1">Alle Inhalte · Kein Abo</p>
          </div>
          <div className="text-right">
            <span className="font-display font-black text-5xl">5</span>
            <span className="font-display font-bold text-2xl">,00 €</span>
          </div>
        </div>

        {/* What's included */}
        <div className="mb-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">Was du bekommst</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "🎬", text: "12 Lernvideos" },
              { icon: "🏆", text: "Live Quizzes" },
              { icon: "🫀", text: "CPR-Taktgeber" },
              { icon: "👥", text: "Community" },
            ].map((f) => (
              <div key={f.text} className="bg-card rounded-xl p-3 flex items-center gap-2">
                <span>{f.icon}</span>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment methods */}
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">Zahlungsmethode</p>
        <div className="grid grid-cols-1 gap-2 mb-6">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.id}
              onClick={() => setMethod(pm.id)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${method === pm.id ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <span className="text-2xl">{pm.icon}</span>
              <span className="font-medium text-sm flex-1">{pm.label}</span>
              {method === pm.id && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>

        <button
          onClick={handlePay}
          disabled={!method}
          className="w-full bg-primary text-white font-display font-bold text-xl uppercase py-4 rounded-xl disabled:opacity-40 active:scale-95 transition-all"
        >
          Jetzt für 5,00 € freischalten
        </button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Sichere Zahlung · 14 Tage Rückgaberecht
        </p>
      </div>
    </div>
  );
}

// ─── Home Mode ────────────────────────────────────────────────────────────────

function HomeMode({ lang }: { lang: Lang }) {
  const completed = MODULES.filter((m) => m.status === "completed").length;
  const pct = Math.round((completed / MODULES.length) * 100);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="pb-6">
      <div className="grid grid-cols-3 gap-0 border-b border-border">
        {[
          { label: "Fertig", value: `${completed}/${MODULES.length}`, icon: CheckCircle, color: "text-accent" },
          { label: "Fortschritt", value: `${pct}%`, icon: Zap, color: "text-primary" },
          { label: "Streak", value: "3 Tage", icon: Star, color: "text-amber-500" },
        ].map((s, i) => (
          <div key={i} className={`px-3 py-4 flex flex-col items-center text-center ${i < 2 ? "border-r border-border" : ""}`}>
            <s.icon className={`w-5 h-5 mb-1 ${s.color}`} />
            <span className="font-display font-bold text-xl leading-none">{s.value}</span>
            <span className="text-muted-foreground text-xs mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-b border-border">
        <div className="flex justify-between items-center mb-2">
          <span className="font-display font-bold text-base uppercase tracking-wide">Lernplan</span>
          <span className="text-xs text-muted-foreground">{pct}% fertig</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="divide-y divide-border">
        {MODULES.map((mod) => {
          const open = selected === mod.id;
          return (
            <div key={mod.id}>
              <button
                onClick={() => mod.status !== "locked" && setSelected(open ? null : mod.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${mod.status === "locked" ? "opacity-40 cursor-not-allowed" : "hover:bg-muted/40"}`}
              >
                <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${mod.status === "completed" ? "bg-accent text-white" : mod.status === "current" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                  {mod.status === "completed" ? <Check className="w-5 h-5" /> : mod.status === "current" ? <PlayCircle className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{mod.category}</span>
                    {mod.status === "current" && <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded font-medium">Aktiv</span>}
                  </div>
                  <p className="font-medium text-sm mt-0.5">{mod.title[lang]}</p>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs">{fmt(mod.duration)}</span>
                  {mod.status !== "locked" && <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${open ? "rotate-90" : ""}`} />}
                </div>
              </button>
              {open && (
                <div className="mx-5 mb-4 bg-card rounded-lg overflow-hidden border border-border">
                  <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                    <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=338&fit=crop&auto=format" alt="Erste Hilfe Demo" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    <div className="relative z-10 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">{fmt(mod.duration)}</div>
                    <div className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded font-medium">{lang}</div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium">{mod.title[lang]}</p>
                    <p className="text-xs text-muted-foreground mt-1">Klicke Play, um das Video zu starten</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── QR Check-In ─────────────────────────────────────────────────────────────

function QRCheckin({ checkedIn, setCheckedIn, lang }: { checkedIn: boolean; setCheckedIn: (v: boolean) => void; lang: Lang }) {
  const [scanning, setScanning] = useState(false);
  const handleScan = () => { setScanning(true); setTimeout(() => { setScanning(false); setCheckedIn(true); }, 1800); };

  if (checkedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-5">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="font-display font-bold text-3xl uppercase tracking-tight mb-2">Eingecheckt!</h2>
        <p className="text-muted-foreground text-sm mb-1">Erste Hilfe Kurs · 09:00 Uhr</p>
        <p className="text-muted-foreground text-sm mb-8">Raum 3B · Ausbilder: Klaus Müller</p>
        <div className="grid grid-cols-3 gap-3 w-full">
          {[{ label: "Teilnehmer", value: "18" }, { label: "Videos", value: "3/4" }, { label: "Vorbereitung", value: "75%" }].map((s) => (
            <div key={s.label} className="bg-card rounded-lg p-3 text-center">
              <div className="font-display font-bold text-xl">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-10 px-6 text-center">
      <h2 className="font-display font-bold text-2xl uppercase tracking-tight mb-1">QR-Code scannen</h2>
      <p className="text-muted-foreground text-sm mb-8">Zeige den Code deinem Ausbilder</p>
      <div className={`relative w-52 h-52 border-4 ${scanning ? "border-primary" : "border-foreground"} rounded-2xl overflow-hidden transition-colors`}>
        <svg viewBox="0 0 200 200" className="w-full h-full p-4">
          {[[0,0,7],[0,8,1],[0,13,7],[1,0,1],[1,6,1],[1,13,1],[1,19,1],[2,0,1],[2,2,3],[2,6,1],[2,13,1],[2,15,3],[2,19,1],[3,0,1],[3,2,3],[3,6,1],[3,13,1],[3,15,3],[3,19,1],[4,0,1],[4,2,3],[4,6,1],[4,13,1],[4,15,3],[4,19,1],[5,0,1],[5,6,1],[5,13,1],[5,19,1],[6,0,7],[6,13,7],[8,0,2],[8,4,2],[8,8,3],[8,14,2],[8,18,2],[9,2,2],[9,5,2],[9,10,2],[9,15,2],[10,0,1],[10,4,2],[10,8,1],[10,12,2],[10,17,2],[11,1,2],[11,6,2],[11,9,2],[11,14,1],[12,0,1],[12,3,2],[12,7,3],[12,12,2],[12,16,2],[13,0,7],[13,9,2],[13,14,1],[14,0,1],[14,6,1],[14,9,1],[14,13,2],[15,0,1],[15,2,3],[15,6,1],[15,10,2],[15,15,2],[16,0,1],[16,2,3],[16,6,1],[16,9,1],[16,14,2],[16,18,1],[17,0,1],[17,2,3],[17,6,1],[17,11,2],[17,15,2],[18,0,1],[18,6,1],[18,9,2],[18,16,2],[19,0,7],[19,9,2],[19,14,1]].map(([row, col, size], i) => (
            <rect key={i} x={col * 10} y={row * 10} width={size * 10 - 1} height={9} fill="#0d0d0d" />
          ))}
        </svg>
        {scanning && <div className="absolute inset-0 bg-primary/10 flex items-center justify-center"><div className="w-40 h-1 bg-primary animate-pulse rounded" /></div>}
      </div>
      <div className="mt-8 w-full flex flex-col gap-3">
        <button onClick={handleScan} disabled={scanning}
          className="w-full bg-primary text-white font-display font-bold text-lg uppercase py-4 rounded-xl disabled:opacity-60 active:scale-95 transition-all">
          {scanning ? "Wird gescannt…" : "Als eingecheckt markieren"}
        </button>
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
          <Users className="w-3.5 h-3.5" /><span>17 Teilnehmer bereits eingecheckt</span>
        </div>
      </div>
    </div>
  );
}

// ─── Live Quiz ────────────────────────────────────────────────────────────────

function LiveQuiz({ lang }: { lang: Lang }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [showBoard, setShowBoard] = useState(false);
  const q = QUIZ_QUESTIONS[qIdx];
  const total = QUIZ_QUESTIONS.length;

  useEffect(() => {
    if (showResult || done) return;
    if (timeLeft <= 0) { setShowResult(true); return; }
    const t = setTimeout(() => setTimeLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, showResult, done]);

  const pick = (i: number) => {
    if (showResult) return;
    setSelected(i);
    setShowResult(true);
    if (i === q.correct) setScore((s) => s + Math.max(50, timeLeft * 25));
  };

  const next = () => {
    if (qIdx + 1 < total) { setQIdx((n) => n + 1); setSelected(null); setShowResult(false); setTimeLeft(20); }
    else setDone(true);
  };

  const reset = () => { setQIdx(0); setSelected(null); setShowResult(false); setScore(0); setDone(false); setTimeLeft(20); setShowBoard(false); };

  const board = LEADERBOARD.map((e) => e.isUser ? { ...e, score } : e).sort((a, b) => b.score - a.score);

  if (showBoard) return (
    <div className="px-5 py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-2xl uppercase tracking-tight">Rangliste</h2>
        <Trophy className="w-6 h-6 text-amber-500" />
      </div>
      <div className="space-y-2">
        {board.map((e, i) => (
          <div key={e.name} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${e.isUser ? "bg-primary text-white" : "bg-card"}`}>
            <span className={`font-display font-bold text-xl w-7 ${i === 0 ? "text-amber-400" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : ""}`}>{i + 1}</span>
            <span className={`flex-1 text-sm font-medium`}>{e.name}</span>
            <span className="font-display font-bold">{e.score}</span>
          </div>
        ))}
      </div>
      <button onClick={reset} className="w-full mt-6 border-2 border-foreground font-display font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-colors">
        <RotateCcw className="w-4 h-4" /> Nochmal spielen
      </button>
    </div>
  );

  if (done) return (
    <div className="flex flex-col items-center py-12 px-6 text-center">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-5"><Trophy className="w-8 h-8 text-white" /></div>
      <h2 className="font-display font-bold text-3xl uppercase tracking-tight mb-1">Quiz beendet!</h2>
      <p className="text-muted-foreground text-sm mb-6">Du hast {score} Punkte erreicht</p>
      <div className="w-full bg-card rounded-xl p-5 mb-6"><div className="font-display font-black text-5xl text-primary">{score}</div><div className="text-muted-foreground text-sm mt-1">Punkte</div></div>
      <div className="flex gap-3 w-full">
        <button onClick={() => setShowBoard(true)} className="flex-1 bg-primary text-white font-display font-bold uppercase py-3 rounded-xl">Rangliste</button>
        <button onClick={reset} className="flex-1 border-2 border-foreground font-display font-bold uppercase py-3 rounded-xl">Nochmal</button>
      </div>
    </div>
  );

  return (
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">Frage {qIdx + 1} / {total}</span>
        <div className={`text-sm font-display font-bold ${timeLeft <= 5 ? "text-primary" : ""}`}>{timeLeft}s</div>
      </div>
      <div className="h-1.5 bg-muted rounded-full mb-5 overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all duration-1000 ${timeLeft <= 5 ? "bg-primary" : "bg-foreground"}`} style={{ width: `${(timeLeft / 20) * 100}%` }} />
      </div>
      <div className="bg-foreground text-background rounded-xl p-5 mb-5">
        <p className="font-display font-bold text-xl leading-tight" dir={lang === "AR" ? "rtl" : "ltr"}>{q.question[lang]}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {q.options[lang].map((opt, i) => {
          let cls = "border-2 rounded-xl p-4 text-left font-medium text-sm transition-all ";
          if (!showResult) cls += "border-border hover:border-foreground active:scale-95";
          else if (i === q.correct) cls += "border-accent bg-accent text-white";
          else if (i === selected && i !== q.correct) cls += "border-primary bg-primary text-white";
          else cls += "border-border opacity-50";
          return (
            <button key={i} onClick={() => pick(i)} className={cls} dir={lang === "AR" ? "rtl" : "ltr"}>
              <span className="block text-xs opacity-70 mb-0.5 font-bold">{String.fromCharCode(65 + i)}</span>{opt}
            </button>
          );
        })}
      </div>
      {showResult && (
        <div className={`rounded-xl p-4 mb-4 flex gap-3 ${selected === q.correct ? "bg-accent/10 border border-accent" : "bg-primary/10 border border-primary"}`}>
          {selected === q.correct ? <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" /> : <X className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />}
          <p className="text-sm" dir={lang === "AR" ? "rtl" : "ltr"}>{q.explanation[lang]}</p>
        </div>
      )}
      {showResult && (
        <button onClick={next} className="w-full bg-primary text-white font-display font-bold text-lg uppercase py-4 rounded-xl active:scale-95 transition-transform">
          {qIdx + 1 < total ? "Weiter" : "Ergebnis"}
        </button>
      )}
    </div>
  );
}

// ─── CPR Metronome ────────────────────────────────────────────────────────────

function CPRMetronome({ lang }: { lang: Lang }) {
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(false);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"compress" | "release">("compress");
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => { setBeat((b) => !b); setPhase((p) => (p === "compress" ? "release" : "compress")); setCount((c) => c + 1); }, CPR_MS);
    } else { if (ref.current) clearInterval(ref.current); }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const stop = () => { setRunning(false); setBeat(false); setCount(0); setPhase("compress"); };

  const pressLabel: Record<Lang, string> = { DE: "DRÜCKEN", EN: "PUSH", TR: "BAS", AR: "اضغط" };
  const releaseLabel: Record<Lang, string> = { DE: "LOSLASSEN", EN: "RELEASE", TR: "BIRAK", AR: "أطلق" };

  return (
    <div className="flex flex-col items-center px-6 py-8">
      <div className="bg-primary text-white font-display font-bold text-2xl px-6 py-2 rounded-full tracking-wider mb-8">{CPR_BPM} BPM</div>
      <div className="relative mb-8 flex items-center justify-center">
        <div className={`w-44 h-44 rounded-full flex items-center justify-center transition-all duration-100 ${running ? beat ? "bg-primary scale-110 shadow-2xl shadow-primary/40" : "bg-primary/80 scale-100" : "bg-muted"}`}>
          <Heart className={`transition-all duration-100 ${running ? "w-20 h-20 text-white fill-white" : "w-14 h-14 text-muted-foreground"}`} />
        </div>
        {running && beat && (
          <>
            <div className="absolute w-52 h-52 rounded-full border-4 border-primary/30 animate-ping" />
            <div className="absolute w-60 h-60 rounded-full border-2 border-primary/15 animate-ping" style={{ animationDuration: "1.2s" }} />
          </>
        )}
      </div>
      <div className="h-12 flex items-center justify-center mb-3">
        {running ? (
          <span className={`font-display font-black text-4xl uppercase tracking-widest transition-colors duration-100 ${phase === "compress" ? "text-primary" : "text-foreground"}`}>
            {phase === "compress" ? pressLabel[lang] : releaseLabel[lang]}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm text-center">Drücke Start, um den Takt zu beginnen</span>
        )}
      </div>
      {running && (
        <div className="mb-6 text-center">
          <div className="font-display font-bold text-5xl tabular-nums">{Math.ceil(count / 2)}</div>
          <div className="text-xs text-muted-foreground mt-1">Drücke</div>
        </div>
      )}
      <div className="flex gap-4 mt-2">
        {!running ? (
          <button onClick={() => setRunning(true)} className="flex items-center gap-3 bg-primary text-white font-display font-bold text-xl uppercase px-10 py-4 rounded-xl active:scale-95 transition-transform shadow-lg shadow-primary/20">
            <Play className="w-6 h-6 fill-white" /> Start
          </button>
        ) : (
          <button onClick={stop} className="flex items-center gap-3 border-2 border-foreground font-display font-bold text-xl uppercase px-10 py-4 rounded-xl active:scale-95 transition-transform">
            <Pause className="w-6 h-6" /> Stop
          </button>
        )}
      </div>
      <div className="mt-8 bg-card rounded-xl p-4 w-full flex gap-3">
        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">Drücke 5–6 cm tief. Der Beat hilft dir, das richtige Tempo zu halten.</p>
      </div>
    </div>
  );
}

// ─── In-Class Mode ────────────────────────────────────────────────────────────

function InClassMode({ lang, checkedIn, setCheckedIn }: { lang: Lang; checkedIn: boolean; setCheckedIn: (v: boolean) => void }) {
  const [tab, setTab] = useState<InTab>("qr");
  const tabs = [
    { id: "qr" as InTab, label: "Check-in", icon: QrCode },
    { id: "quiz" as InTab, label: "Live Quiz", icon: Zap },
    { id: "cpr" as InTab, label: "CPR-Takt", icon: Heart },
  ];
  return (
    <div>
      <div className="flex border-b border-border">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors border-b-2 ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>
      {tab === "qr" && <QRCheckin checkedIn={checkedIn} setCheckedIn={setCheckedIn} lang={lang} />}
      {tab === "quiz" && <LiveQuiz lang={lang} />}
      {tab === "cpr" && <CPRMetronome lang={lang} />}
    </div>
  );
}

// ─── Community ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["bg-primary", "bg-accent", "bg-amber-500", "bg-violet-500", "bg-blue-500", "bg-pink-500"];

function CommunityMode({ userName }: { userName: string }) {
  const [tab, setTab] = useState<ComTab>("feed");
  const [friends, setFriends] = useState(MOCK_FRIENDS);
  const [search, setSearch] = useState("");
  const [activeChat, setActiveChat] = useState<typeof MOCK_MESSAGES[0] | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const toggleConnect = (id: number) => {
    setFriends((prev) => prev.map((f) => f.id === id ? { ...f, connected: !f.connected } : f));
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { from: "me", text: chatInput, time: "Jetzt" }]);
    setChatInput("");
  };

  if (activeChat) {
    return (
      <div className="flex flex-col h-full">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setActiveChat(null)} className="text-muted-foreground"><ArrowLeft className="w-5 h-5" /></button>
          <Avatar initials={activeChat.avatar} color={AVATAR_COLORS[0]} />
          <div>
            <p className="font-medium text-sm">{activeChat.from}</p>
            <p className="text-xs text-accent">Online</p>
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {chatMessages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "me" ? "bg-primary text-white rounded-br-sm" : "bg-card text-foreground rounded-bl-sm"}`}>
                <p>{m.text}</p>
                <p className={`text-xs mt-1 ${m.from === "me" ? "text-white/60" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-border">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Nachricht eingeben…"
            className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm outline-none"
          />
          <button onClick={sendMessage} className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Sub-tabs */}
      <div className="flex border-b border-border">
        {[{ id: "feed" as ComTab, label: "Feed", icon: BookOpen }, { id: "friends" as ComTab, label: "Kontakte", icon: Users }, { id: "messages" as ComTab, label: "Nachrichten", icon: MessageCircle }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors border-b-2 ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {tab === "feed" && (
        <div className="divide-y divide-border">
          {MOCK_FEED.map((post) => (
            <div key={post.id} className="px-5 py-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar initials={post.avatar} color={AVATAR_COLORS[post.id % AVATAR_COLORS.length]} />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm">{post.name}</span>
                    {post.verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{post.time}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-3">{post.text}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setLikedPosts((p) => p.includes(post.id) ? p.filter((x) => x !== post.id) : [...p, post.id])}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${likedPosts.includes(post.id) ? "text-primary" : "text-muted-foreground"}`}
                >
                  <ThumbsUp className={`w-4 h-4 ${likedPosts.includes(post.id) ? "fill-primary" : ""}`} />
                  <span>{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
                </button>
                <button className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <MessageCircle className="w-4 h-4" /><span>{post.comments}</span>
                </button>
                <button className="flex items-center gap-1.5 text-muted-foreground text-sm ml-auto">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends / Contacts */}
      {tab === "friends" && (
        <div>
          <div className="px-5 py-3 border-b border-border">
            <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Personen suchen…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            </div>
          </div>
          {/* Connected */}
          <div className="px-5 py-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
              Verbunden · {friends.filter((f) => f.connected).length}
            </p>
            <div className="space-y-3">
              {friends.filter((f) => f.connected && f.name.toLowerCase().includes(search.toLowerCase())).map((f, i) => (
                <div key={f.id} className="flex items-center gap-3">
                  <Avatar initials={f.avatar} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm">{f.name}</p>
                      {f.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{f.role}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-muted rounded-full max-w-20">
                        <div className="h-1 bg-accent rounded-full" style={{ width: `${f.progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{f.progress}%</span>
                    </div>
                  </div>
                  <button onClick={() => toggleConnect(f.id)} className="text-xs border border-border text-muted-foreground px-3 py-1.5 rounded-full hover:border-primary hover:text-primary transition-colors">
                    Entfernen
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* Suggestions */}
          <div className="px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">Vorschläge</p>
            <div className="space-y-3">
              {friends.filter((f) => !f.connected && f.name.toLowerCase().includes(search.toLowerCase())).map((f, i) => (
                <div key={f.id} className="flex items-center gap-3">
                  <Avatar initials={f.avatar} color={AVATAR_COLORS[(i + 3) % AVATAR_COLORS.length]} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{f.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{f.role}</p>
                  </div>
                  <button onClick={() => toggleConnect(f.id)} className="text-xs bg-primary text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 active:scale-95 transition-transform">
                    <UserPlus className="w-3 h-3" /> Verbinden
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {tab === "messages" && (
        <div className="divide-y divide-border">
          {MOCK_MESSAGES.map((msg, i) => (
            <button key={msg.id} onClick={() => setActiveChat(msg)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors text-left">
              <div className="relative">
                <Avatar initials={msg.avatar} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
                {msg.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">{msg.unread}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{msg.from}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.last}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{msg.time}</span>
            </button>
          ))}
          <div className="p-5">
            <button className="w-full border-2 border-dashed border-border rounded-xl py-4 text-sm text-muted-foreground flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors">
              <MessageCircle className="w-4 h-4" /> Neue Nachricht
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

function ProfileMode({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  const completed = MODULES.filter((m) => m.status === "completed").length;
  const pct = Math.round((completed / MODULES.length) * 100);

  return (
    <div className="pb-8">
      {/* Profile card */}
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-display font-bold text-2xl flex-shrink-0">
            {userName[0]}{userName.length > 1 ? userName[1] : ""}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl">{userName} Mustermann</h2>
            </div>
            <p className="text-sm text-muted-foreground">Erste-Hilfe Kursteilnehmer</p>
            <p className="text-xs text-muted-foreground mt-0.5">Gruppe 3B · München</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="text-center">
                <div className="font-display font-bold text-lg">{MOCK_FRIENDS.filter((f) => f.connected).length}</div>
                <div className="text-xs text-muted-foreground">Kontakte</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="font-display font-bold text-lg">{completed}</div>
                <div className="text-xs text-muted-foreground">Module</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="font-display font-bold text-lg">3</div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Kursfortschritt</span><span>{pct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <button className="mt-4 w-full border-2 border-border text-sm font-medium py-2.5 rounded-xl hover:border-foreground transition-colors">
          Profil bearbeiten
        </button>
      </div>

      {/* Badges */}
      <div className="px-5 py-4 border-b border-border">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">Abzeichen</p>
        <div className="flex gap-3">
          {[
            { icon: "🚑", label: "Schnellstarter", earned: true },
            { icon: "🫀", label: "CPR-Profi", earned: true },
            { icon: "🏅", label: "Quiz-Meister", earned: false },
            { icon: "🎓", label: "Kursabschluss", earned: false },
          ].map((b) => (
            <div key={b.label} className={`flex flex-col items-center gap-1 ${b.earned ? "" : "opacity-30"}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${b.earned ? "bg-amber-50 border-2 border-amber-200" : "bg-muted"}`}>
                {b.icon}
              </div>
              <span className="text-xs text-muted-foreground text-center leading-tight w-14">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-5 py-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">Einstellungen</p>
        <div className="space-y-1">
          {[
            { icon: Bell, label: "Benachrichtigungen" },
            { icon: Settings, label: "App-Einstellungen" },
            { icon: BookOpen, label: "Datenschutz & AGB" },
            { icon: CreditCard, label: "Zahlung & Lizenz" },
          ].map((item) => (
            <button key={item.label} className="w-full flex items-center gap-4 py-3.5 border-b border-border last:border-0 hover:text-primary transition-colors">
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-sm text-left">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
          <button onClick={onLogout} className="w-full flex items-center gap-4 py-3.5 text-primary hover:opacity-70 transition-opacity mt-2">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Abmelden</span>
          </button>
        </div>
      </div>

      <div className="px-5 py-4 text-center">
        <p className="text-xs text-muted-foreground">ErstHilfe+ · Version 1.0.0</p>
        <p className="text-xs text-muted-foreground mt-0.5">Lizenz aktiv · Einmalig 5,00 € bezahlt ✓</p>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [auth, setAuth] = useState<AuthState>("splash");
  const [userName, setUserName] = useState("Max");
  const [lang, setLang] = useState<Lang>("DE");
  const [mainTab, setMainTab] = useState<MainTab>("home");
  const [checkedIn, setCheckedIn] = useState(false);

  const handleRegister = (name: string) => { setUserName(name); setAuth("paywall"); };
  const handleLogin = (name: string) => { setUserName(name); setAuth("app"); };
  const handlePayment = () => setAuth("app");
  const handleLogout = () => { setAuth("splash"); setMainTab("home"); };

  if (auth === "splash") return <SplashScreen onLogin={() => setAuth("login")} onRegister={() => setAuth("register")} />;
  if (auth === "login") return <LoginScreen onBack={() => setAuth("splash")} onSuccess={handleLogin} />;
  if (auth === "register") return <RegisterScreen onBack={() => setAuth("splash")} onSuccess={handleRegister} />;
  if (auth === "paywall") return <PaywallScreen userName={userName} onSuccess={handlePayment} />;

  const completed = MODULES.filter((m) => m.status === "completed").length;
  const pct = Math.round((completed / MODULES.length) * 100);

  const BOTTOM_TABS = [
    { id: "home" as MainTab, label: "Lernen", icon: BookOpen },
    { id: "inclass" as MainTab, label: "Im Kurs", icon: GraduationCap },
    { id: "community" as MainTab, label: "Community", icon: Users },
    { id: "profile" as MainTab, label: "Profil", icon: User },
  ];

  return (
    <div className="flex flex-col bg-background text-foreground" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: 430, margin: "0 auto", minHeight: "100vh" }}>
      {/* Header */}
      <header className="bg-primary text-white px-5 pt-10 pb-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <Heart className="w-5 h-5 fill-primary text-primary" />
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="font-bold text-2xl tracking-tight leading-none">
              Erst<span className="opacity-60">Hilfe</span>+
            </span>
          </div>
          <div className="flex gap-1">
            {LANGUAGES.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`text-lg px-1 py-0.5 rounded transition-all ${lang === l.code ? "bg-white/20 scale-110" : "opacity-50 hover:opacity-80"}`}>
                {l.flag}
              </button>
            ))}
          </div>
        </div>

        {mainTab === "home" && (
          <div>
            <p className="text-white/60 text-xs">Willkommen zurück, {userName} 👋</p>
            <div className="flex items-center justify-between mt-0.5">
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="font-bold text-2xl uppercase tracking-tight">Lernplan</span>
              <span className="text-sm font-medium opacity-80">{pct}%</span>
            </div>
            <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-1.5 bg-white rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
        {mainTab === "inclass" && (
          <div>
            <p className="text-white/60 text-xs">Erste-Hilfe Kurs · Do. 09:00 Uhr</p>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="font-bold text-2xl uppercase tracking-tight block mt-0.5">Präsenzmodul</span>
            {checkedIn && <span className="inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1.5"><Check className="w-3 h-3" /> Raum 3B eingecheckt</span>}
          </div>
        )}
        {mainTab === "community" && (
          <div>
            <p className="text-white/60 text-xs">Lerne mit deinem Kurs</p>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="font-bold text-2xl uppercase tracking-tight block mt-0.5">Community</span>
          </div>
        )}
        {mainTab === "profile" && (
          <div>
            <p className="text-white/60 text-xs">Einmalig 5,00 € · Lizenz aktiv</p>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="font-bold text-2xl uppercase tracking-tight block mt-0.5">Mein Profil</span>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {mainTab === "home" && <HomeMode lang={lang} />}
        {mainTab === "inclass" && <InClassMode lang={lang} checkedIn={checkedIn} setCheckedIn={setCheckedIn} />}
        {mainTab === "community" && <CommunityMode userName={userName} />}
        {mainTab === "profile" && <ProfileMode userName={userName} onLogout={handleLogout} />}
      </main>

      {/* Bottom navigation */}
      <nav className="flex border-t border-border bg-background flex-shrink-0 pb-safe">
        {BOTTOM_TABS.map((t) => (
          <button key={t.id} onClick={() => setMainTab(t.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors ${mainTab === t.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className={`w-5 h-5 ${mainTab === t.id ? "stroke-2" : "stroke-[1.5]"}`} />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
