import { useState, useEffect, useRef } from "react";
import {
  Heart, Play, Pause, QrCode, Trophy, CheckCircle, ChevronRight,
  BookOpen, Zap, GraduationCap, Clock, Lock, PlayCircle,
  Star, RotateCcw, Check, X, Users, AlertCircle, MessageCircle,
  UserPlus, Search, Send, ArrowLeft, CreditCard,
  Eye, EyeOff, User, Bell, Settings, LogOut, ChevronDown,
  ThumbsUp, Share2, BadgeCheck, ChevronUp, Shield,
  ExternalLink, Ticket, Timer, Key
} from "lucide-react";

type Lang = "DE" | "EN" | "TR" | "AR";
type AuthState = "lang_select" | "splash" | "login" | "register" | "paywall" | "license" | "app";
type MainTab = "home" | "inclass" | "community" | "profile";
type InTab = "qr" | "quiz" | "cpr" | "escape" | "team";
type ComTab = "feed" | "friends" | "messages";

// ─── Translations ─────────────────────────────────────────────────────────────

const UI: Record<string, Record<Lang, string>> = {
  langSelectTitle:    { DE:"Sprache wählen",             EN:"Choose Language",           TR:"Dil Seçin",              AR:"اختر اللغة" },
  langSelectSub:      { DE:"Du kannst die Sprache jederzeit ändern", EN:"You can change the language anytime", TR:"Dili istediğin zaman değiştirebilirsin", AR:"يمكنك تغيير اللغة في أي وقت" },
  splashTagline:      { DE:"Lerne Erste Hilfe. Überall. In deiner Sprache.", EN:"Learn First Aid. Anywhere. In your language.", TR:"İlk Yardım Öğren. Her Yerde. Kendi Dilinde.", AR:"تعلم الإسعافات الأولية. في أي مكان. بلغتك." },
  splashRegister:     { DE:"Kostenlos registrieren",     EN:"Register for free",          TR:"Ücretsiz kaydol",        AR:"سجل مجاناً" },
  splashLogin:        { DE:"Bereits ein Konto? Einloggen", EN:"Already have an account? Log in", TR:"Zaten hesabın var mı? Giriş yap", AR:"لديك حساب؟ تسجيل الدخول" },
  splashDemo:         { DE:"Demo starten – kein Konto nötig", EN:"Start Demo – no account needed", TR:"Demo başlat – hesap gerekmez", AR:"ابدأ التجربة – لا حساب مطلوب" },
  splashNote:         { DE:"Registrierung kostenlos · Vollzugang für einmalig 5,00 €", EN:"Free registration · Full access for a one-time 5.00 €", TR:"Ücretsiz kayıt · Tek seferlik 5,00 € ile tam erişim", AR:"تسجيل مجاني · وصول كامل مقابل 5.00 € لمرة واحدة" },
  feat1:              { DE:"60-Sekunden Micro-Learning Videos", EN:"60-second Micro-Learning Videos", TR:"60 Saniyelik Mikro-Öğrenme Videoları", AR:"مقاطع فيديو تعليمية 60 ثانية" },
  feat2:              { DE:"CPR-Taktgeber · 110 BPM",   EN:"CPR Metronome · 110 BPM",   TR:"KPR Ritim · 110 BPM",   AR:"إيقاع CPR · 110 BPM" },
  feat3:              { DE:"Live Quizzes mit Rangliste", EN:"Live Quizzes with Leaderboard", TR:"Canlı Quizler ve Sıralama", AR:"اختبارات مباشرة مع لوحة المتصدرين" },
  feat4:              { DE:"Lerne mit Freunden aus deinem Kurs", EN:"Learn with friends from your course", TR:"Kursundan arkadaşlarınla öğren", AR:"تعلم مع أصدقاء دورتك" },
  createAccount:      { DE:"Konto erstellen",            EN:"Create Account",            TR:"Hesap Oluştur",          AR:"إنشاء حساب" },
  registerSub:        { DE:"Kostenlos registrieren, dann freischalten", EN:"Register for free, then unlock", TR:"Ücretsiz kaydol, sonra aç", AR:"سجل مجاناً ثم افتح" },
  fullName:           { DE:"Vollständiger Name",         EN:"Full Name",                 TR:"Tam Ad",                 AR:"الاسم الكامل" },
  emailAddress:       { DE:"E-Mail-Adresse",             EN:"Email Address",             TR:"E-Posta Adresi",         AR:"عنوان البريد الإلكتروني" },
  password:           { DE:"Passwort",                   EN:"Password",                  TR:"Şifre",                  AR:"كلمة المرور" },
  passwordMin:        { DE:"Mindestens 6 Zeichen",       EN:"At least 6 characters",    TR:"En az 6 karakter",       AR:"6 أحرف على الأقل" },
  creating:           { DE:"Wird erstellt…",             EN:"Creating…",                 TR:"Oluşturuluyor…",         AR:"جارٍ الإنشاء…" },
  terms:              { DE:"Mit der Registrierung stimmst du unseren", EN:"By registering you agree to our", TR:"Kaydolarak şunları kabul ediyorsun:", AR:"بالتسجيل تقبل" },
  termsLink:          { DE:"Nutzungsbedingungen",        EN:"Terms of Service",          TR:"Kullanım Şartları",      AR:"شروط الاستخدام" },
  privacy:            { DE:"Datenschutzerklärung",       EN:"Privacy Policy",            TR:"Gizlilik Politikası",    AR:"سياسة الخصوصية" },
  back:               { DE:"Zurück",                     EN:"Back",                      TR:"Geri",                   AR:"رجوع" },
  login:              { DE:"Einloggen",                  EN:"Log In",                    TR:"Giriş Yap",              AR:"تسجيل الدخول" },
  loginSub:           { DE:"Willkommen zurück!",         EN:"Welcome back!",             TR:"Tekrar hoşgeldin!",      AR:"مرحباً بعودتك!" },
  loggingIn:          { DE:"Wird angemeldet…",           EN:"Logging in…",               TR:"Giriş yapılıyor…",       AR:"جارٍ تسجيل الدخول…" },
  forgotPassword:     { DE:"Passwort vergessen?",        EN:"Forgot password?",          TR:"Şifreni mi unuttun?",    AR:"نسيت كلمة المرور؟" },
  fillAllFields:      { DE:"Bitte alle Felder ausfüllen", EN:"Please fill in all fields", TR:"Lütfen tüm alanları doldurun", AR:"يرجى ملء جميع الحقول" },
  nameRequired:       { DE:"Name erforderlich",          EN:"Name required",             TR:"İsim gerekli",           AR:"الاسم مطلوب" },
  validEmail:         { DE:"Gültige E-Mail eingeben",    EN:"Enter a valid email",       TR:"Geçerli bir e-posta girin", AR:"أدخل بريداً إلكترونياً صحيحاً" },
  passwordShort:      { DE:"Mindestens 6 Zeichen",       EN:"At least 6 characters",    TR:"En az 6 karakter",       AR:"6 أحرف على الأقل" },
  unlockApp:          { DE:"App freischalten",           EN:"Unlock App",                TR:"Uygulamayı Aç",          AR:"فتح التطبيق" },
  paywallSub:         { DE:"Einmalig, kein Abo.",        EN:"One-time, no subscription.", TR:"Tek seferlik, abonelik yok.", AR:"دفعة واحدة، لا اشتراك." },
  fullAccess:         { DE:"Vollzugang",                 EN:"Full Access",               TR:"Tam Erişim",             AR:"الوصول الكامل" },
  oneTimePayment:     { DE:"Einmalzahlung",              EN:"One-time payment",          TR:"Tek seferlik ödeme",     AR:"دفعة واحدة" },
  allContentNoSub:    { DE:"Alle Inhalte · Kein Abo",   EN:"All content · No subscription", TR:"Tüm içerik · Abonelik yok", AR:"جميع المحتوى · لا اشتراك" },
  paymentMethod:      { DE:"Zahlungsmethode",            EN:"Payment Method",            TR:"Ödeme Yöntemi",          AR:"طريقة الدفع" },
  payNow:             { DE:"Jetzt für 5,00 € freischalten", EN:"Unlock now for 5.00 €", TR:"5,00 € ile şimdi aç",   AR:"افتح الآن مقابل 5.00 €" },
  securePayment:      { DE:"Sichere Zahlung · 14 Tage Rückgaberecht", EN:"Secure payment · 14-day return policy", TR:"Güvenli ödeme · 14 günlük iade hakkı", AR:"دفع آمن · سياسة إرجاع 14 يوماً" },
  processing:         { DE:"Zahlung wird verarbeitet…", EN:"Processing payment…",       TR:"Ödeme işleniyor…",       AR:"جارٍ معالجة الدفع…" },
  paymentSuccess:     { DE:"Zahlung erfolgreich!",       EN:"Payment successful!",       TR:"Ödeme başarılı!",        AR:"تمت الدفعة بنجاح!" },
  paymentConfirmed:   { DE:"5,00 € · Einmalzahlung bestätigt", EN:"5.00 € · One-time payment confirmed", TR:"5,00 € · Tek seferlik ödeme onaylandı", AR:"5.00 € · تم تأكيد الدفعة الواحدة" },
  payIncludes:        { DE:"Alle 5 Kapitel freigeschaltet|Live Quizzes & Ranglisten|CPR-Taktgeber|Community & Freunde|Kein Abo, kein Ablauf", EN:"All 5 chapters unlocked|Live Quizzes & Leaderboards|CPR Metronome|Community & Friends|No subscription, no expiry", TR:"Tüm 5 bölüm açık|Canlı Quizler & Sıralama|KPR Ritim|Topluluk & Arkadaşlar|Abonelik yok, süre yok", AR:"جميع الفصول الـ5 مفتوحة|اختبارات مباشرة ولوحة متصدرين|إيقاع CPR|مجتمع وأصدقاء|لا اشتراك ولا انتهاء صلاحية" },
  startApp:           { DE:"App starten 🚀",             EN:"Start App 🚀",              TR:"Uygulamayı Başlat 🚀",  AR:"ابدأ التطبيق 🚀" },
  schoolCode:         { DE:"Schulcode eingeben",         EN:"Enter School Code",         TR:"Okul Kodunu Girin",      AR:"أدخل رمز المدرسة" },
  schoolCodeSub:      { DE:"Du erhältst den Code von deiner Erste-Hilfe-Schule.", EN:"You receive the code from your first aid school.", TR:"Kodu ilk yardım okulundan alırsın.", AR:"تحصل على الرمز من مدرسة الإسعافات الأولية." },
  licenseCode:        { DE:"Lizenzcode",                 EN:"License Code",              TR:"Lisans Kodu",            AR:"رمز الترخيص" },
  licensePlaceholder: { DE:"z. B. EH-2024-DEMO",        EN:"e.g. EH-2024-DEMO",        TR:"örn. EH-2024-DEMO",      AR:"مثال: EH-2024-DEMO" },
  licenseHint:        { DE:"Der Code wird von deiner Schule bereitgestellt. Demo:", EN:"The code is provided by your school. Demo:", TR:"Kod okulun tarafından sağlanır. Demo:", AR:"الرمز تقدمه مدرستك. تجريبي:" },
  checking:           { DE:"Wird geprüft…",              EN:"Checking…",                 TR:"Kontrol ediliyor…",      AR:"جارٍ التحقق…" },
  unlock:             { DE:"Freischalten",               EN:"Unlock",                    TR:"Etkinleştir",            AR:"تفعيل" },
  invalidCode:        { DE:"Ungültiger Code. Demo: EH-2024-DEMO", EN:"Invalid code. Demo: EH-2024-DEMO", TR:"Geçersiz kod. Demo: EH-2024-DEMO", AR:"رمز غير صالح. تجريبي: EH-2024-DEMO" },
  welcomeBack:        { DE:"Willkommen zurück",          EN:"Welcome back",              TR:"Tekrar hoşgeldin",       AR:"مرحباً بعودتك" },
  learningPlan:       { DE:"Lernplan",                   EN:"Learning Plan",             TR:"Öğrenme Planı",          AR:"خطة التعلم" },
  chapters:           { DE:"Lernkapitel",                EN:"Learning Chapters",         TR:"Öğrenme Bölümleri",      AR:"فصول التعلم" },
  chaptersOf:         { DE:"von",                        EN:"of",                        TR:"/",                      AR:"من" },
  chaptersCompleted:  { DE:"Kapitel abgeschlossen",      EN:"chapters completed",        TR:"bölüm tamamlandı",       AR:"فصول مكتملة" },
  done:               { DE:"Fertig",                     EN:"Done",                      TR:"Bitti",                  AR:"منتهي" },
  progress:           { DE:"Fortschritt",                EN:"Progress",                  TR:"İlerleme",               AR:"التقدم" },
  streak:             { DE:"Streak",                     EN:"Streak",                    TR:"Seri",                   AR:"سلسلة" },
  streakDays:         { DE:"3 Tage",                     EN:"3 days",                    TR:"3 gün",                  AR:"3 أيام" },
  active:             { DE:"Aktiv",                      EN:"Active",                    TR:"Aktif",                  AR:"نشط" },
  ticketReady:        { DE:"Kursticket bereit – vorzeigen beim Ausbilder", EN:"Course ticket ready – show to instructor", TR:"Kurs bileti hazır – eğitmene göster", AR:"تذكرة الدورة جاهزة – أظهرها للمدرب" },
  allChaptersDone:    { DE:"Alle Kapitel bestanden ✓",   EN:"All chapters passed ✓",     TR:"Tüm bölümler tamamlandı ✓", AR:"اكتملت جميع الفصول ✓" },
  done2:              { DE:"fertig",                     EN:"done",                      TR:"bitti",                  AR:"منتهي" },
  noContent:          { DE:"Klicke Play, um das Video zu starten", EN:"Click Play to start the video", TR:"Videoyu başlatmak için Play'e tıkla", AR:"انقر على تشغيل لبدء الفيديو" },
  inClassTitle:       { DE:"Präsenzmodul",               EN:"Class Module",              TR:"Sınıf Modülü",           AR:"وحدة الفصل" },
  inClassSub:         { DE:"Erste-Hilfe Kurs · Do. 09:00 Uhr", EN:"First Aid Course · Thu. 09:00", TR:"İlk Yardım Kursu · Per. 09:00", AR:"دورة الإسعافات · خميس 09:00" },
  checkedInBadge:     { DE:"Raum 3B eingecheckt",        EN:"Room 3B checked in",        TR:"Oda 3B'de giriş yapıldı", AR:"تم تسجيل الدخول للغرفة 3B" },
  scanFirst:          { DE:"Erst QR-Code scannen um alle Module freizuschalten.", EN:"Scan QR code first to unlock all modules.", TR:"Tüm modülleri açmak için önce QR kodu tara.", AR:"امسح رمز QR أولاً لإلغاء قفل جميع الوحدات." },
  tabCheckin:         { DE:"Check-in",                   EN:"Check-in",                  TR:"Giriş",                  AR:"تسجيل" },
  tabLiveQuiz:        { DE:"Live Quiz",                  EN:"Live Quiz",                 TR:"Canlı Quiz",             AR:"اختبار مباشر" },
  tabCPR:             { DE:"CPR-Takt",                   EN:"CPR Beat",                  TR:"KPR Ritmi",              AR:"إيقاع CPR" },
  tabEscape:          { DE:"Escape",                     EN:"Escape",                    TR:"Senaryo",                AR:"سيناريو" },
  tabTeamCPR:         { DE:"4er CPR",                    EN:"4P CPR",                    TR:"4'lü KPR",               AR:"فريق CPR" },
  scanQR:             { DE:"QR-Code scannen",            EN:"Scan QR Code",              TR:"QR Kod Tara",            AR:"امسح رمز QR" },
  scanQRSub:          { DE:"Scanne den Kurs-QR-Code vom Ausbilder", EN:"Scan the course QR code from the instructor", TR:"Eğitmenden kurs QR kodunu tara", AR:"امسح رمز QR للدورة من المدرب" },
  sessionAutoDetect:  { DE:"Session-ID wird automatisch erkannt", EN:"Session ID detected automatically", TR:"Oturum Kimliği otomatik algılanır", AR:"يتم اكتشاف معرف الجلسة تلقائياً" },
  scanning:           { DE:"Verbinde…",                  EN:"Connecting…",               TR:"Bağlanıyor…",            AR:"جارٍ الاتصال…" },
  scanButton:         { DE:"QR-Code scannen / Einsteigen", EN:"Scan QR Code / Join",     TR:"QR Kodu Tara / Katıl",   AR:"امسح QR / انضم" },
  participantsIn:     { DE:"Teilnehmer bereits eingecheckt", EN:"participants already checked in", TR:"katılımcı zaten giriş yaptı", AR:"مشارك سجل دخوله بالفعل" },
  nicknameTitle:      { DE:"Nickname wählen",            EN:"Choose Nickname",           TR:"Takma Ad Seç",           AR:"اختر الاسم المستعار" },
  nicknameSub:        { DE:"Dieser Name erscheint auf der Rangliste", EN:"This name will appear on the leaderboard", TR:"Bu isim sıralamada görünecek", AR:"سيظهر هذا الاسم في لوحة المتصدرين" },
  nicknamePlaceholder:{ DE:"Dein Nickname",              EN:"Your Nickname",             TR:"Takma adın",             AR:"اسمك المستعار" },
  joinCourse:         { DE:"Kurs beitreten",             EN:"Join Course",               TR:"Kursa Katıl",            AR:"انضم إلى الدورة" },
  checkedIn:          { DE:"Eingecheckt!",               EN:"Checked In!",               TR:"Giriş Yapıldı!",         AR:"تم تسجيل الدخول!" },
  courseInfo:         { DE:"Erste Hilfe Kurs · 09:00 Uhr", EN:"First Aid Course · 09:00", TR:"İlk Yardım Kursu · 09:00", AR:"دورة الإسعافات الأولية · 09:00" },
  roomInfo:           { DE:"Raum 3B · Ausbilder: Klaus Müller", EN:"Room 3B · Instructor: Klaus Müller", TR:"Oda 3B · Eğitmen: Klaus Müller", AR:"الغرفة 3B · المدرب: Klaus Müller" },
  loggedInAs:         { DE:"Eingeloggt als",             EN:"Logged in as",              TR:"Giriş yapıldı:",         AR:"مسجل الدخول باسم" },
  participants:       { DE:"Teilnehmer",                 EN:"Participants",              TR:"Katılımcılar",           AR:"المشاركون" },
  online:             { DE:"Online",                     EN:"Online",                    TR:"Çevrimiçi",              AR:"متصل" },
  ready:              { DE:"Bereit",                     EN:"Ready",                     TR:"Hazır",                  AR:"جاهز" },
  question:           { DE:"Frage",                      EN:"Question",                  TR:"Soru",                   AR:"سؤال" },
  leaderboard:        { DE:"Rangliste",                  EN:"Leaderboard",               TR:"Sıralama",               AR:"لوحة المتصدرين" },
  quizDone:           { DE:"Quiz beendet!",              EN:"Quiz finished!",            TR:"Quiz bitti!",            AR:"انتهى الاختبار!" },
  yourScore:          { DE:"Du hast",                    EN:"You scored",                TR:"Puan aldın:",            AR:"حصلت على" },
  yourScorePoints:    { DE:"Punkte erreicht",            EN:"points",                    TR:"puan",                   AR:"نقطة" },
  points:             { DE:"Punkte",                     EN:"Points",                    TR:"Puan",                   AR:"نقاط" },
  playAgain:          { DE:"Nochmal spielen",            EN:"Play again",                TR:"Tekrar oyna",            AR:"العب مجدداً" },
  next:               { DE:"Weiter",                     EN:"Next",                      TR:"Devam",                  AR:"التالي" },
  results:            { DE:"Ergebnis",                   EN:"Results",                   TR:"Sonuç",                  AR:"النتائج" },
  again:              { DE:"Nochmal",                    EN:"Again",                     TR:"Tekrar",                 AR:"مرة أخرى" },
  pushLabel:          { DE:"DRÜCKEN",                    EN:"PUSH",                      TR:"BAS",                    AR:"اضغط" },
  releaseLabel:       { DE:"LOSLASSEN",                  EN:"RELEASE",                   TR:"BIRAK",                  AR:"أطلق" },
  cprStart:           { DE:"Drücke Start, um den Takt zu beginnen", EN:"Press Start to begin the rhythm", TR:"Ritmi başlatmak için Start'a bas", AR:"اضغط ابدأ لبدء الإيقاع" },
  cprDepth:           { DE:"Drücke 5–6 cm tief. Der Beat hilft dir, das richtige Tempo zu halten.", EN:"Push 5–6 cm deep. The beat helps you maintain the correct pace.", TR:"5–6 cm derinliğinde bas. Ritim doğru tempoyu korumanı sağlar.", AR:"اضغط بعمق 5–6 سم. الإيقاع يساعدك على الحفاظ على الوتيرة الصحيحة." },
  compressions:       { DE:"Drücke",                     EN:"Compressions",              TR:"Baskı",                  AR:"ضغطات" },
  start:              { DE:"Start",                      EN:"Start",                     TR:"Başlat",                 AR:"ابدأ" },
  stop:               { DE:"Stop",                       EN:"Stop",                      TR:"Durdur",                 AR:"توقف" },
  escapeTitle:        { DE:"Team-Gefahrensimulation",    EN:"Team Danger Simulation",    TR:"Ekip Tehlike Simülasyonu", AR:"محاكاة خطر الفريق" },
  escapeSub:          { DE:"Ihr werdet in 4er-Teams aufgeteilt. Jeder erhält andere Infos – kombiniert euer Wissen!", EN:"You'll be split into 4-person teams. Each gets different info — combine your knowledge!", TR:"4 kişilik ekiplere ayrılacaksınız. Her biri farklı bilgi alır – bilgilerinizi birleştirin!", AR:"ستنقسمون إلى فرق من 4 أشخاص. كل شخص يحصل على معلومات مختلفة – ادمجوا معرفتكم!" },
  yourTeam:           { DE:"Dein Team",                  EN:"Your Team",                 TR:"Senin Ekibin",           AR:"فريقك" },
  findTeam:           { DE:"Findet euch im Raum zusammen!", EN:"Find each other in the room!", TR:"Birbirinizi odada bulun!", AR:"ابحثوا عن بعضكم في الغرفة!" },
  seeMyRole:          { DE:"Meine Rolle sehen",          EN:"See My Role",               TR:"Rolümü Gör",             AR:"أرى دوري" },
  myTask:             { DE:"Deine Aufgabe",              EN:"Your Task",                 TR:"Senin Görevin",          AR:"مهمتك" },
  scenario:           { DE:"Szenario",                   EN:"Scenario",                  TR:"Senaryo",                AR:"السيناريو" },
  discussTeam:        { DE:"Besprecht euch im Team und entscheidet gemeinsam!", EN:"Discuss with your team and decide together!", TR:"Ekibinizle tartışın ve birlikte karar verin!", AR:"ناقشوا مع فريقكم وقرروا معاً!" },
  makeDecisions:      { DE:"Entscheidungen treffen",     EN:"Make Decisions",            TR:"Kararları Al",           AR:"اتخاذ القرارات" },
  simDone:            { DE:"Simulation beendet!",        EN:"Simulation Complete!",      TR:"Simülasyon Bitti!",      AR:"اكتملت المحاكاة!" },
  teamScore:          { DE:"Team-Score:",                EN:"Team Score:",               TR:"Ekip Puanı:",            AR:"نقاط الفريق:" },
  decision:           { DE:"Entscheidung",               EN:"Decision",                  TR:"Karar",                  AR:"قرار" },
  discussTeamShort:   { DE:"Besprecht euch im Team!",   EN:"Discuss with your team!",   TR:"Ekibinizle tartışın!",   AR:"ناقشوا مع فريقكم!" },
  evaluate:           { DE:"Auswerten",                  EN:"Results",                   TR:"Değerlendir",            AR:"النتائج" },
  teamCPRTitle:       { DE:"4er-Team Reanimation",       EN:"4-Person CPR Team",         TR:"4 Kişilik KPR Ekibi",    AR:"فريق CPR من 4 أشخاص" },
  teamCPRSub:         { DE:"Wähle deine Rolle für die Übung", EN:"Choose your role for the exercise", TR:"Alıştırma için rolünü seç", AR:"اختر دورك للتمرين" },
  roleCompressor:     { DE:"Der Drücker",                EN:"Compressor",                TR:"Baskı Yapan",            AR:"الضاغط" },
  roleCompressorDesc: { DE:"110 BPM Taktgeber – drücke mit dem Metronom", EN:"110 BPM metronome – compress with the beat", TR:"110 BPM – metro ile bas", AR:"110 BPM – اضغط مع الإيقاع" },
  roleBreather:       { DE:"Der Beatmer",                EN:"Breather",                  TR:"Nefes Veren",            AR:"المنعش" },
  roleBreatherDesc:   { DE:"30:2 – beatme nach je 30 Drücken", EN:"30:2 – breathe after every 30 compressions", TR:"30:2 – her 30 baskıdan sonra nefes ver", AR:"30:2 – تنفس بعد كل 30 ضغطة" },
  roleDefi:           { DE:"Defi-Operator",              EN:"AED Operator",              TR:"AED Operatörü",          AR:"مشغّل AED" },
  roleDefiDesc:       { DE:"Bediene das AED-Gerät – drücke wenn bereit", EN:"Operate the AED device – press when ready", TR:"AED'yi kullan – hazır olunca bas", AR:"شغّل AED – اضغط عند الاستعداد" },
  roleProtocol:       { DE:"Protokollant",               EN:"Recorder",                  TR:"Protokolcü",             AR:"المسجّل" },
  roleProtocolDesc:   { DE:"Tracke Zeit & Ereignisse als Rettungsleitstelle", EN:"Track time & events as dispatch", TR:"Zamanı ve olayları takip et", AR:"تتبع الوقت والأحداث كمرسل" },
  nextRotation:       { DE:"Nächster Wechsel",           EN:"Next Rotation",             TR:"Sonraki Dönüş",          AR:"الدوران التالي" },
  dispatch:           { DE:"Rettungsleitstelle",         EN:"Dispatch",                  TR:"Kurtarma Merkezi",       AR:"مركز الإرسال" },
  rotateTitle:        { DE:"ROLLENWECHSEL!",             EN:"ROLE ROTATION!",            TR:"ROL DEĞİŞİMİ!",          AR:"تغيير الأدوار!" },
  rotateSub:          { DE:"Rollen wechseln jetzt im Uhrzeigersinn. Bestätige deine neue Position.", EN:"Roles rotate clockwise now. Confirm your new position.", TR:"Roller şimdi saat yönünde dönüyor. Yeni pozisyonunu onayla.", AR:"تتناوب الأدوار الآن. أكد موضعك الجديد." },
  newRole:            { DE:"Deine neue Rolle:",          EN:"Your new role:",            TR:"Yeni rolün:",            AR:"دورك الجديد:" },
  readyNewPos:        { DE:"Bereit auf neuer Position",  EN:"Ready on new position",     TR:"Yeni pozisyonda hazır",  AR:"جاهز في الموضع الجديد" },
  compressionsToBreathe: { DE:"Drücke bis zur nächsten Beatmung", EN:"Compressions until next breath", TR:"Sonraki nefese kadar baskı", AR:"ضغطات حتى النفس التالي" },
  totalBreaths:       { DE:"Beatmungen gesamt:",        EN:"Total breaths:",            TR:"Toplam nefes:",          AR:"إجمالي الأنفاس:" },
  defiSub:            { DE:"Bediene das physische AED-Gerät der Schule. Drücke wenn das Gerät die Analyse ankündigt.", EN:"Operate the school's physical AED. Press when the device announces analysis.", TR:"Okulun fiziksel AED'sini kullan. Cihaz analiz bildirdiğinde bas.", AR:"شغّل AED الفيزيائي للمدرسة. اضغط عندما يُعلن الجهاز عن التحليل." },
  defiButtonLabel:    { DE:"⚡ Defi Analyse\nstartet jetzt", EN:"⚡ AED Analysis\nstarts now", TR:"⚡ AED Analizi\nbaşlıyor", AR:"⚡ تحليل AED\nيبدأ الآن" },
  defiNote:           { DE:"Löst automatischen Rollenwechsel aus", EN:"Triggers automatic role rotation", TR:"Otomatik rol değişimini tetikler", AR:"يُشغّل تناوب الأدوار تلقائياً" },
  exerciseStart:      { DE:"Übung starten",              EN:"Start Exercise",            TR:"Alıştırmayı Başlat",     AR:"ابدأ التمرين" },
  exerciseDone:       { DE:"Übung beendet",              EN:"Exercise ended",            TR:"Alıştırma bitti",        AR:"انتهى التمرين" },
  log:                { DE:"Protokoll",                  EN:"Log",                       TR:"Protokol",               AR:"السجل" },
  noLogEntries:       { DE:"Noch keine Einträge",        EN:"No entries yet",            TR:"Henüz giriş yok",        AR:"لا توجد إدخالات بعد" },
  switchRole:         { DE:"Rolle wechseln",             EN:"Switch Role",               TR:"Rol Değiştir",           AR:"تغيير الدور" },
  courseDone:         { DE:"Kurs geschafft!",            EN:"Course done!",              TR:"Kurs tamamlandı!",       AR:"اكتملت الدورة!" },
  reviewQuestion:     { DE:"Hat dir der Kurs bei",       EN:"Did you enjoy the course at", TR:"Kursun nasıldı?",       AR:"هل استمتعت بالدورة في" },
  reviewQuestion2:    { DE:"gefallen?",                  EN:"?",                         TR:"?",                      AR:"؟" },
  rateGoogle:         { DE:"bei Google bewerten",        EN:"Rate on Google",            TR:"Google'da değerlendir",  AR:"قيّم على Google" },
  notNow:             { DE:"Jetzt nicht",                EN:"Not now",                   TR:"Şimdi değil",            AR:"ليس الآن" },
  courseCompleteReview:{ DE:"Kurs abgeschlossen!",       EN:"Course complete!",          TR:"Kurs tamamlandı!",       AR:"اكتملت الدورة!" },
  leaveReview:        { DE:"Hinterlasse eine Google-Bewertung für die Schule.", EN:"Leave a Google review for the school.", TR:"Okul için Google yorumu bırak.", AR:"اترك تقييماً على Google للمدرسة." },
  rate:               { DE:"Bewerten",                   EN:"Rate",                      TR:"Değerlendir",            AR:"قيّم" },
  communityTitle:     { DE:"Community",                  EN:"Community",                 TR:"Topluluk",               AR:"المجتمع" },
  communitySub:       { DE:"Lerne mit deinem Kurs",      EN:"Learn with your course",    TR:"Kursunla öğren",         AR:"تعلم مع دورتك" },
  tabFeed:            { DE:"Feed",                       EN:"Feed",                      TR:"Akış",                   AR:"التغذية" },
  tabContacts:        { DE:"Kontakte",                   EN:"Contacts",                  TR:"Kişiler",                AR:"جهات الاتصال" },
  tabMessages:        { DE:"Nachrichten",                EN:"Messages",                  TR:"Mesajlar",               AR:"الرسائل" },
  searchPeople:       { DE:"Personen suchen…",           EN:"Search people…",            TR:"Kişi ara…",              AR:"البحث عن أشخاص…" },
  connected:          { DE:"Verbunden",                  EN:"Connected",                 TR:"Bağlı",                  AR:"متصل" },
  suggestions:        { DE:"Vorschläge",                 EN:"Suggestions",               TR:"Öneriler",               AR:"اقتراحات" },
  remove:             { DE:"Entfernen",                  EN:"Remove",                    TR:"Kaldır",                 AR:"إزالة" },
  connect:            { DE:"Verbinden",                  EN:"Connect",                   TR:"Bağlan",                 AR:"اتصال" },
  newMessage:         { DE:"Neue Nachricht",             EN:"New Message",               TR:"Yeni Mesaj",             AR:"رسالة جديدة" },
  typeMessage:        { DE:"Nachricht eingeben…",        EN:"Type a message…",           TR:"Mesaj yaz…",             AR:"اكتب رسالة…" },
  profileTitle:       { DE:"Mein Profil",                EN:"My Profile",                TR:"Profilim",               AR:"ملفي الشخصي" },
  profileSub:         { DE:"Einmalig 5,00 € · Lizenz aktiv", EN:"One-time 5.00 € · License active", TR:"Tek seferlik 5,00 € · Lisans etkin", AR:"5.00 € لمرة واحدة · الترخيص نشط" },
  editProfile:        { DE:"Profil bearbeiten",          EN:"Edit Profile",              TR:"Profili Düzenle",        AR:"تعديل الملف الشخصي" },
  contacts:           { DE:"Kontakte",                   EN:"Contacts",                  TR:"Kişiler",                AR:"جهات الاتصال" },
  modules:            { DE:"Module",                     EN:"Modules",                   TR:"Modüller",               AR:"الوحدات" },
  badges:             { DE:"Abzeichen",                  EN:"Badges",                    TR:"Rozetler",               AR:"الشارات" },
  badgeFast:          { DE:"Schnellstarter",             EN:"Fast Starter",              TR:"Hızlı Başlangıç",        AR:"بادئ سريع" },
  badgeCPR:           { DE:"CPR-Profi",                  EN:"CPR Pro",                   TR:"KPR Uzmanı",             AR:"محترف CPR" },
  badgeQuiz:          { DE:"Quiz-Meister",               EN:"Quiz Master",               TR:"Quiz Ustası",            AR:"سيد الاختبار" },
  badgeCourse:        { DE:"Kursabschluss",              EN:"Course Complete",           TR:"Kurs Tamamlama",         AR:"إتمام الدورة" },
  settingsTitle:      { DE:"Einstellungen",              EN:"Settings",                  TR:"Ayarlar",                AR:"الإعدادات" },
  settingsNotif:      { DE:"Benachrichtigungen",         EN:"Notifications",             TR:"Bildirimler",            AR:"الإشعارات" },
  settingsApp:        { DE:"App-Einstellungen",          EN:"App Settings",              TR:"Uygulama Ayarları",      AR:"إعدادات التطبيق" },
  settingsPrivacy:    { DE:"Datenschutz & AGB",          EN:"Privacy & Terms",           TR:"Gizlilik & Şartlar",     AR:"الخصوصية والشروط" },
  settingsPayment:    { DE:"Zahlung & Lizenz",           EN:"Payment & License",         TR:"Ödeme & Lisans",         AR:"الدفع والترخيص" },
  logout:             { DE:"Abmelden",                   EN:"Log Out",                   TR:"Çıkış Yap",              AR:"تسجيل الخروج" },
  courseProgress:     { DE:"Kursfortschritt",            EN:"Course Progress",           TR:"Kurs İlerlemesi",        AR:"تقدم الدورة" },
  version:            { DE:"RescueReady · Version 1.0.0", EN:"RescueReady · Version 1.0.0", TR:"RescueReady · Sürüm 1.0.0", AR:"RescueReady · الإصدار 1.0.0" },
  licenseActive:      { DE:"Lizenz aktiv · Einmalig 5,00 € bezahlt ✓", EN:"License active · One-time 5.00 € paid ✓", TR:"Lisans etkin · Tek seferlik 5,00 € ödendi ✓", AR:"الترخيص نشط · 5.00 € مدفوعة لمرة واحدة ✓" },
  tabLearn:           { DE:"Lernen",                     EN:"Learn",                     TR:"Öğren",                  AR:"تعلم" },
  tabInClass:         { DE:"Im Kurs",                    EN:"In Class",                  TR:"Kursta",                 AR:"في الفصل" },
  tabCommunity:       { DE:"Community",                  EN:"Community",                 TR:"Topluluk",               AR:"مجتمع" },
  tabProfile:         { DE:"Profil",                     EN:"Profile",                   TR:"Profil",                 AR:"الملف" },
  stillLocked:        { DE:"Noch gesperrt",              EN:"Still Locked",              TR:"Hâlâ Kilitli",           AR:"لا يزال مقفلاً" },
  lockedDesc:         { DE:"Schließe alle 5 Lernkapitel ab, um den Präsenzkurs zu entsperren.", EN:"Complete all 5 learning chapters to unlock the in-person course.", TR:"Sınıf kursunun kilidini açmak için tüm 5 bölümü tamamla.", AR:"أكمل جميع الفصول الـ5 لإلغاء قفل الدورة الحضورية." },
  chapterProgress:    { DE:"Kapitelfortschritt",         EN:"Chapter Progress",          TR:"Bölüm İlerlemesi",       AR:"تقدم الفصل" },
  startLearning:      { DE:"Jetzt lernen",               EN:"Start Learning",            TR:"Şimdi Öğren",            AR:"ابدأ التعلم" },
  mandatoryQuiz:      { DE:"⚠️ Pflichtquiz · nicht überspringbar", EN:"⚠️ Mandatory Quiz · cannot skip", TR:"⚠️ Zorunlu Quiz · atlanamaz", AR:"⚠️ اختبار إلزامي · لا يمكن تخطيه" },
  understanding:      { DE:"Verständnisfrage",           EN:"Understanding Check",       TR:"Anlayış Kontrolü",       AR:"فحص الفهم" },
  skip:               { DE:"Überspringen",               EN:"Skip",                      TR:"Atla",                   AR:"تخطي" },
  pointsEarned:       { DE:"Punkte!",                    EN:"Points!",                   TR:"Puan!",                  AR:"نقاط!" },
  feedFinished:       { DE:"Fertig",                     EN:"Done",                      TR:"Bitti",                  AR:"انتهى" },
  infographic:        { DE:"INFOGRAFIK",                 EN:"INFOGRAPHIC",               TR:"İNFOGRAFİK",             AR:"إنفوجرافيك" },
  infStep1:           { DE:"Eigensicherung",             EN:"Self-protection",           TR:"Öz koruma",              AR:"الحماية الذاتية" },
  infStep2:           { DE:"Notruf 112",                 EN:"Call 112",                  TR:"112'yi ara",             AR:"اتصل بـ 112" },
  infStep3:           { DE:"Erste Hilfe",                EN:"First Aid",                 TR:"İlk yardım",             AR:"الإسعافات الأولية" },
  infStep4:           { DE:"Übergabe",                   EN:"Hand over",                 TR:"Teslim et",              AR:"التسليم" },
};

function t(key: string, lang: Lang): string {
  return UI[key]?.[lang] ?? UI[key]?.["DE"] ?? key;
}

// ─── White-Label ──────────────────────────────────────────────────────────────

interface SchoolTheme { name:string; primaryColor:string; googleReviewUrl:string; emoji:string }
const SCHOOL_THEMES: Record<string,SchoolTheme> = {
  "EH-DLRG-001":  { name:"DLRG München",     primaryColor:"#003fa3", googleReviewUrl:"https://maps.google.com/", emoji:"🌊" },
  "EH-DRK-001":   { name:"DRK Bayern",       primaryColor:"#c8102e", googleReviewUrl:"https://maps.google.com/", emoji:"🏥" },
  "EH-ASB-001":   { name:"ASB Köln",         primaryColor:"#ff6600", googleReviewUrl:"https://maps.google.com/", emoji:"🚑" },
  "EH-2024-DEMO": { name:"Demo Erste-Hilfe", primaryColor:"#d4001f", googleReviewUrl:"https://maps.google.com/", emoji:"🩺" },
  "EH-DEMO-001":  { name:"Musterschule GmbH",primaryColor:"#6200ea", googleReviewUrl:"https://maps.google.com/", emoji:"🎓" },
};

// ─── Static Data ──────────────────────────────────────────────────────────────

const LANGUAGES: { code:Lang; flag:string; label:string }[] = [
  { code:"DE", flag:"🇩🇪", label:"Deutsch" },
  { code:"EN", flag:"🇬🇧", label:"English" },
  { code:"TR", flag:"🇹🇷", label:"Türkçe" },
  { code:"AR", flag:"🇸🇦", label:"عربي" },
];

type ModuleStatus = "completed"|"current"|"locked";
const MODULES: { id:number; title:Record<Lang,string>; duration:number; status:ModuleStatus; category:Record<Lang,string>; description:Record<Lang,string>; keyPoints:Record<Lang,string[]> }[] = [
  { id:1, title:{DE:"Notruf absetzen",EN:"Emergency Call",TR:"Acil Çağrı",AR:"الاتصال بالطوارئ"}, duration:75, status:"completed", category:{DE:"Grundlagen",EN:"Basics",TR:"Temel",AR:"أساسيات"},
    description:{DE:"Lerne, wie du im Notfall schnell und richtig die 112 anrufst. Welche Informationen braucht die Leitstelle?",EN:"Learn how to quickly and correctly call 112 in an emergency. What information does the dispatcher need?",TR:"Acil durumlarda 112'yi hızlı ve doğru aramayı öğren. Merkez hangi bilgilere ihtiyaç duyuyor?",AR:"تعلم كيفية الاتصال بـ 112 بسرعة وبشكل صحيح في حالات الطوارئ. ما المعلومات التي يحتاجها المرسل؟"},
    keyPoints:{DE:["5 W-Fragen: Wo, Was, Wie viele, Welche Verletzungen, Warten","Europaweit gültig: 112","Ruhig und deutlich sprechen","Nicht auflegen bevor die Leitstelle es sagt"],EN:["5 W-questions: Where, What, How many, What injuries, Wait","Valid across Europe: 112","Speak calmly and clearly","Don't hang up until dispatch tells you"],TR:["5 soru: Nerede, Ne, Kaç kişi, Ne tür yaralanma, Bekle","Avrupa genelinde geçerli: 112","Sakin ve net konuş","Merkez söyleyene kadar kapatma"],AR:["5 أسئلة: أين، ماذا، كم شخص، ما نوع الإصابة، انتظر","صالح في جميع أنحاء أوروبا: 112","تحدث بهدوء ووضوح","لا تغلق حتى يخبرك المرسل"]} },
  { id:2, title:{DE:"Bewusstlosigkeit prüfen",EN:"Check Consciousness",TR:"Bilinç Kontrolü",AR:"فحص الوعي"}, duration:68, status:"completed", category:{DE:"Beurteilung",EN:"Assessment",TR:"Değerlendirme",AR:"التقييم"},
    description:{DE:"Wie erkennst du, ob eine Person bewusstlos ist? Lernt das Vorgehen nach dem ABCDE-Schema.",EN:"How do you recognise if a person is unconscious? Learn the ABCDE assessment approach.",TR:"Bir kişinin bilinçsiz olup olmadığını nasıl anlarsın? ABCDE değerlendirme yaklaşımını öğren.",AR:"كيف تتعرف على ما إذا كان الشخص فاقداً للوعي؟ تعلم نهج التقييم ABCDE."},
    keyPoints:{DE:["Ansprechen: 'Hören Sie mich?'","Schulter antippen","Reaktion auf Schmerzreiz prüfen","Atemwege freimachen & Atmung prüfen"],EN:["Address: 'Can you hear me?'","Tap the shoulder","Check pain response","Open airway & check breathing"],TR:["Seslen: 'Beni duyuyor musunuz?'","Omuzu tık","Ağrı tepkisini kontrol et","Hava yolunu aç ve solunumu kontrol et"],AR:["ناد: 'هل تسمعني؟'","اضغط على الكتف","افحص استجابة الألم","افتح مجرى الهواء وافحص التنفس"]} },
  { id:3, title:{DE:"Atemwege freimachen",EN:"Open Airways",TR:"Hava Yolu Açma",AR:"فتح مجرى الهواء"}, duration:82, status:"completed", category:{DE:"Wiederbelebung",EN:"Resuscitation",TR:"Canlandırma",AR:"الإنعاش"},
    description:{DE:"Überkehren des Kopfes und Anheben des Kinns öffnet die Atemwege. Wichtig vor jeder Beatmung.",EN:"Head tilt and chin lift opens the airway. Essential before any rescue breathing.",TR:"Baş geri eğme ve çene kaldırma hava yolunu açar. Her kurtarma solunumundan önce önemlidir.",AR:"إمالة الرأس ورفع الذقن يفتح مجرى الهواء. ضروري قبل أي تنفس اصطناعي."},
    keyPoints:{DE:["Kopf überstrecken (Head-tilt)","Kinn anheben (Chin-lift)","Mundraum auf Fremdkörper kontrollieren","Bei Verdacht auf HWS-Verletzung: Kiefergriff"],EN:["Head-tilt technique","Chin-lift technique","Check mouth for foreign objects","Jaw-thrust if neck injury suspected"],TR:["Baş geri eğme tekniği","Çene kaldırma tekniği","Ağzı yabancı cisimler için kontrol et","Boyun yaralanması şüphesinde çene itme"],AR:["تقنية إمالة الرأس","تقنية رفع الذقن","فحص الفم للأجسام الغريبة","دفع الفك إذا اشتبه في إصابة العنق"]} },
  { id:4, title:{DE:"Herzdruckmassage",EN:"Chest Compressions",TR:"Göğüs Baskısı",AR:"ضغط الصدر"}, duration:90, status:"current", category:{DE:"Wiederbelebung",EN:"Resuscitation",TR:"Canlandırma",AR:"الإنعاش"},
    description:{DE:"Das Herzstillstand ist ein Notfall. Korrekte Herzdruckmassage kann Leben retten – lerne den richtigen Druck, die richtige Tiefe und das richtige Tempo.",EN:"Cardiac arrest is an emergency. Correct chest compressions can save lives — learn the right pressure, depth and pace.",TR:"Kalp durması bir acil durumdur. Doğru göğüs baskısı hayat kurtarabilir.",AR:"توقف القلب حالة طارئة. الضغط الصحيح على الصدر يمكن أن ينقذ الحياة."},
    keyPoints:{DE:["Handballen auf Brustbeinmitte","5–6 cm tief drücken","100–120 Drücke/Minute","Arme gestreckt lassen – Körpergewicht nutzen"],EN:["Heel of hand on center of chest","Push 5–6 cm deep","100–120 compressions/minute","Keep arms straight — use body weight"],TR:["El tabanını göğüs merkezine koy","5–6 cm derinliğinde bas","100–120 baskı/dakika","Kolları düz tut – vücut ağırlığını kullan"],AR:["ضع كعب اليد على منتصف الصدر","اضغط بعمق 5–6 سم","100–120 ضغطة/دقيقة","حافظ على استقامة الذراعين"]} },
  { id:5, title:{DE:"Atemspende",EN:"Rescue Breathing",TR:"Kurtarma Solunumu",AR:"التنفس الاصطناعي"}, duration:78, status:"locked", category:{DE:"Wiederbelebung",EN:"Resuscitation",TR:"Canlandırma",AR:"الإنعاش"},
    description:{DE:"Beatmung im Verhältnis 30:2 – nach 30 Herzdruckmassagen kommen 2 Atemspenden. Richtige Technik vermeidet Luftmagen.",EN:"Ventilation at 30:2 ratio — after 30 compressions come 2 rescue breaths. Correct technique avoids air swallowing.",TR:"30:2 oranında solunum – 30 baskıdan sonra 2 kurtarma nefesi. Doğru teknik hava yutmayı önler.",AR:"التهوية بنسبة 30:2 — بعد 30 ضغطة تأتي 2 نفسة إنقاذ. التقنية الصحيحة تمنع ابتلاع الهواء."},
    keyPoints:{DE:["Kopf überstrecken, Kinn anheben","Nase zuhalten","Mund versiegeln","Sichtbare Brustbewegung als Ziel"],EN:["Head tilt, chin lift","Pinch nose","Seal mouth","Visible chest rise as goal"],TR:["Baş geri eğ, çene kaldır","Burnu tıka","Ağzı kapat","Görünür göğüs yükselmesi hedef"],AR:["أمل الرأس، ارفع الذقن","أمسك الأنف","أغلق الفم","ارتفاع الصدر المرئي هو الهدف"]} },
  { id:6, title:{DE:"Stabile Seitenlage",EN:"Recovery Position",TR:"Koma Pozisyonu",AR:"وضع الإنعاش"}, duration:65, status:"locked", category:{DE:"Beurteilung",EN:"Assessment",TR:"Değerlendirme",AR:"التقييم"},
    description:{DE:"Die stabile Seitenlage schützt bewusstlose, atmende Personen vor dem Ersticken. Übe die Handgriffe richtig.",EN:"The recovery position protects unconscious breathing persons from choking. Practise the correct grips.",TR:"Koma pozisyonu bilinçsiz ama nefes alan kişileri boğulmadan korur.",AR:"وضع الإنعاش يحمي الأشخاص فاقدي الوعي والذين يتنفسون من الاختناق."},
    keyPoints:{DE:["Arm anwinkeln (90°)","Knie anziehen","Person auf die Seite rollen","Kopf rückwärts neigen"],EN:["Bend arm at 90°","Bend knee","Roll person onto their side","Tilt head back"],TR:["Kolu 90° bük","Dizi çek","Kişiyi yana çevir","Başı geri eğ"],AR:["اثنِ الذراع بزاوية 90°","اثنِ الركبة","اقلب الشخص على جانبه","أمل الرأس للخلف"]} },
  { id:7, title:{DE:"Wunden versorgen",EN:"Wound Care",TR:"Yara Bakımı",AR:"العناية بالجروح"}, duration:88, status:"locked", category:{DE:"Versorgung",EN:"Care",TR:"Bakım",AR:"الرعاية"},
    description:{DE:"Kleine und große Wunden richtig reinigen, abdecken und verbinden. Wann ist ein Arzt notwendig?",EN:"Correctly clean, cover and bandage small and large wounds. When is a doctor needed?",TR:"Küçük ve büyük yaraları doğru temizleme, örtme ve bağlama. Ne zaman doktora ihtiyaç vardır?",AR:"تنظيف الجروح الصغيرة والكبيرة وتغطيتها وربطها بشكل صحيح. متى يلزم طبيب؟"},
    keyPoints:{DE:["Direkter Druck auf die Wunde","Sauberen Verband anlegen","Tetanusschutz prüfen","Nicht entfernen, was tief steckt"],EN:["Direct pressure on wound","Apply clean bandage","Check tetanus protection","Don't remove deeply embedded objects"],TR:["Yaraya doğrudan baskı","Temiz bandaj uygula","Tetanoz korumasını kontrol et","Derine saplanmış şeyleri çıkarma"],AR:["ضغط مباشر على الجرح","ضع ضمادة نظيفة","افحص الحماية من الكزاز","لا تخرج الأجسام المغروسة بعمق"]} },
  { id:8, title:{DE:"Knochenbrüche erkennen",EN:"Fractures",TR:"Kırık Tespiti",AR:"الكسور"}, duration:72, status:"locked", category:{DE:"Versorgung",EN:"Care",TR:"Bakım",AR:"الرعاية"},
    description:{DE:"Wie erkenne ich einen Knochenbruch? Geschlossene vs. offene Fraktur. Erste Hilfe bis der Rettungsdienst kommt.",EN:"How do I recognise a fracture? Closed vs open fracture. First aid until emergency services arrive.",TR:"Kırığı nasıl tanırım? Kapalı ve açık kırık farkı. Ambulans gelene kadar ilk yardım.",AR:"كيف أتعرف على الكسر؟ الكسر المغلق مقابل المفتوح. إسعافات أولية حتى وصول الإسعاف."},
    keyPoints:{DE:["Schmerz, Schwellung, Fehlstellung","Ruhigstellung – nicht richten!","Kühlen (nicht direkt auf Haut)","Offene Fraktur: Steril abdecken"],EN:["Pain, swelling, deformity","Immobilise — don't straighten!","Cool (not directly on skin)","Open fracture: cover sterile"],TR:["Ağrı, şişlik, deformasyon","Sabitle – düzeltme!","Soğut (direkt cilde değil)","Açık kırık: steril örtün"],AR:["ألم، تورم، تشوه","ثبّت — لا تعدّل!","ضع الثلج (ليس مباشرة على الجلد)","الكسر المفتوح: غطه بشكل معقم"]} },
  { id:9, title:{DE:"Verbrennung & Verätzung",EN:"Burns & Scalds",TR:"Yanık ve Haşlanma",AR:"الحروق"}, duration:81, status:"locked", category:{DE:"Versorgung",EN:"Care",TR:"Bakım",AR:"الرعاية"},
    description:{DE:"Grad 1 bis 3 – was ist wirklich gefährlich? Kühlen, Abdecken, Kein Eis! Chemische Verätzungen behandeln.",EN:"Grade 1 to 3 — what is really dangerous? Cool, cover, no ice! Treating chemical burns.",TR:"1'den 3'e kadar derece yanıklar – gerçekten ne tehlikelidir? Soğut, ört, buz yok!",AR:"الدرجة 1 إلى 3 — ما الخطير حقاً؟ برّد، غطِّ، لا ثلج! معالجة الحروق الكيميائية."},
    keyPoints:{DE:["10 Min. kühles Wasser (15–20°C)","KEIN Eis, KEINE Hausmittel","Verbrannte Kleider lassen","Grad 2b+ → immer Arzt"],EN:["10 min cool water (15–20°C)","NO ice, NO home remedies","Leave burnt clothing","Grade 2b+ → always see doctor"],TR:["10 dk serin su (15–20°C)","BARIŞ buz yok, ev ilacı yok","Yanık giysileri bırak","2b+ derece → daima doktor"],AR:["10 دقائق ماء بارد (15–20°C)","لا ثلج، لا علاجات منزلية","اترك الملابس المحترقة","الدرجة 2b فأكثر → اذهب للطبيب دائماً"]} },
  { id:10, title:{DE:"Schock behandeln",EN:"Treating Shock",TR:"Şok Tedavisi",AR:"علاج الصدمة"}, duration:70, status:"locked", category:{DE:"Grundlagen",EN:"Basics",TR:"Temel",AR:"أساسيات"},
    description:{DE:"Schock ist lebensbedrohlich. Erkenne die Zeichen früh und lege die Person in die richtige Position.",EN:"Shock is life-threatening. Recognise the signs early and position the person correctly.",TR:"Şok hayatı tehdit edici. Belirtileri erken tanı ve kişiyi doğru pozisyona al.",AR:"الصدمة مهددة للحياة. تعرف على العلامات مبكراً وضع الشخص في الوضع الصحيح."},
    keyPoints:{DE:["Blasse, kalte, feuchte Haut","Beschleunigter Puls","Schocklage: Beine hoch (wenn kein Wirbelsäulentrauma)","Warm halten, beruhigen"],EN:["Pale, cold, moist skin","Rapid pulse","Shock position: legs raised (if no spinal injury)","Keep warm, reassure"],TR:["Soluk, soğuk, nemli cilt","Hızlı nabız","Şok pozisyonu: bacakları kaldır (omurga yaralanması yoksa)","Sıcak tut, sakinleştir"],AR:["جلد شاحب وبارد ورطب","نبض سريع","وضع الصدمة: ارفع الساقين (إذا لم تكن هناك إصابة في العمود الفقري)","ابقه دافئاً وهدئه"]} },
  { id:11, title:{DE:"AED anwenden",EN:"Using an AED",TR:"AED Kullanımı",AR:"استخدام AED"}, duration:85, status:"locked", category:{DE:"Wiederbelebung",EN:"Resuscitation",TR:"Canlandırma",AR:"الإنعاش"},
    description:{DE:"Automatisierte externe Defibrillatoren retten Leben. Lerne, wo sie stehen und wie du sie richtig bedienst.",EN:"Automated external defibrillators save lives. Learn where to find them and how to use them correctly.",TR:"Otomatik harici defibrilatörler hayat kurtarır. Nerede olduklarını ve nasıl doğru kullanılacağını öğren.",AR:"أجهزة تنظيم ضربات القلب الآلية الخارجية تنقذ الأرواح. تعلم أين تجدها وكيف تستخدمها."},
    keyPoints:{DE:["AED einschalten (Gerät führt Schritte an)","Pads anbringen (Piktogramme beachten)","CPR unterbrechen nur für Analyse & Schock","Keine Berührung beim Schock!"],EN:["Switch on AED (device guides you)","Attach pads (follow pictograms)","Pause CPR only for analysis & shock","Don't touch during shock!"],TR:["AED'yi aç (cihaz sizi yönlendirir)","Elektrotları tak (piktogramlara bak)","Analiz ve şok için sadece KPR'yi durdur","Şok sırasında dokunma!"],AR:["شغّل AED (الجهاز يرشدك)","ثبّت الأقطاب (اتبع الصور التوضيحية)","أوقف CPR فقط للتحليل والصدمة","لا تلمس أثناء الصدمة!"]} },
  { id:12, title:{DE:"Kurs abgeschlossen",EN:"Course Complete",TR:"Kurs Tamamlandı",AR:"اكتمال الدورة"}, duration:60, status:"locked", category:{DE:"Grundlagen",EN:"Basics",TR:"Temel",AR:"أساسيات"},
    description:{DE:"Glückwunsch! Du hast alle Theoriemodule abgeschlossen. Jetzt bist du bereit für den Präsenzkurs. Zeige dein QR-Ticket dem Ausbilder.",EN:"Congratulations! You have completed all theory modules. Now you are ready for the in-person course. Show your QR ticket to the instructor.",TR:"Tebrikler! Tüm teorik modülleri tamamladın. Artık yüz yüze kurs için hazırsın.",AR:"تهانيّ! لقد أكملت جميع وحدات النظرية. أنت الآن مستعد للدورة الحضورية."},
    keyPoints:{DE:["Alle Kapitel 1–5 bestanden","QR-Ticket generiert","Präsenzkurs freigeschaltet","Wissen jetzt in der Praxis anwenden!"],EN:["All chapters 1–5 passed","QR ticket generated","In-person course unlocked","Apply knowledge in practice now!"],TR:["1–5 arası tüm bölümler geçildi","QR bileti oluşturuldu","Yüz yüze kurs açıldı","Bilgiyi şimdi pratikte uygula!"],AR:["اجتياز جميع الفصول من 1–5","تذكرة QR مُنشأة","الدورة الحضورية مفتوحة","طبّق المعرفة الآن في الممارسة!"]} },
];

const MOCK_FRIENDS = [
  { id:1, name:"Sarah Köhler",  role:{DE:"Kurs · Kl. 3B",EN:"Course · Cl. 3B",TR:"Kurs · Sınıf 3B",AR:"دورة · الفصل 3B"}, avatar:"SK", verified:true,  connected:true,  progress:83 },
  { id:2, name:"Ahmed Rashid",  role:{DE:"Kurs · Kl. 3B",EN:"Course · Cl. 3B",TR:"Kurs · Sınıf 3B",AR:"دورة · الفصل 3B"}, avatar:"AR", verified:false, connected:true,  progress:67 },
  { id:3, name:"Ayşe Demir",   role:{DE:"Kurs · Kl. 2A",EN:"Course · Cl. 2A",TR:"Kurs · Sınıf 2A",AR:"دورة · الفصل 2A"}, avatar:"AD", verified:false, connected:true,  progress:100},
  { id:4, name:"Klaus Müller", role:{DE:"Ausbilder · DLRG",EN:"Instructor · DLRG",TR:"Eğitmen · DLRG",AR:"مدرب · DLRG"},   avatar:"KM", verified:true,  connected:false, progress:100},
  { id:5, name:"Julia Fischer", role:{DE:"Kurs · Kl. 3B",EN:"Course · Cl. 3B",TR:"Kurs · Sınıf 3B",AR:"دورة · الفصل 3B"}, avatar:"JF", verified:false, connected:false, progress:45 },
  { id:6, name:"Thomas Weber",  role:{DE:"Kurs · Kl. 1C",EN:"Course · Cl. 1C",TR:"Kurs · Sınıf 1C",AR:"دورة · الفصل 1C"}, avatar:"TW", verified:false, connected:false, progress:58 },
];
const MOCK_MESSAGES = [
  { id:1, from:"Sarah Köhler",   avatar:"SK", last:{DE:"Hast du Modul 4 schon?",EN:"Have you done Module 4?",TR:"Modül 4'ü tamamladın mı?",AR:"هل أتممت الوحدة 4؟"}, time:"09:42", unread:2 },
  { id:2, from:"Ahmed Rashid",   avatar:"AR", last:{DE:"Top! Bis zum Kurs 💪",EN:"Great! See you at course 💪",TR:"Harika! Kursta görüşürüz 💪",AR:"رائع! أراك في الدورة 💪"}, time:{DE:"Gestern",EN:"Yesterday",TR:"Dün",AR:"أمس"} as Record<Lang,string>, unread:0 },
  { id:3, from:{DE:"Kurs-Gruppe 3B",EN:"Course Group 3B",TR:"Kurs Grubu 3B",AR:"مجموعة الدورة 3B"} as Record<Lang,string>, avatar:"3B", last:{DE:"Bitte bis Freitag fertig",EN:"Please finish by Friday",TR:"Cumaya kadar bitirin",AR:"يرجى الإنهاء بحلول الجمعة"}, time:{DE:"Gestern",EN:"Yesterday",TR:"Dün",AR:"أمس"} as Record<Lang,string>, unread:5 },
];
const MOCK_FEED_POSTS = [
  { id:1, name:"Sarah Köhler", avatar:"SK", time:{DE:"vor 2 Std.",EN:"2 hrs ago",TR:"2 saat önce",AR:"منذ ساعتين"}, text:{DE:"Modul 4 abgeschlossen! Der Taktgeber hilft wirklich 🫀",EN:"Module 4 done! The metronome really helps 🫀",TR:"Modül 4 tamamlandı! Ritim gerçekten yardımcı oluyor 🫀",AR:"انتهيت من الوحدة 4! الإيقاع يساعد حقاً 🫀"}, likes:12, comments:3 },
  { id:2, name:"Klaus Müller", avatar:"KM", time:{DE:"vor 5 Std.",EN:"5 hrs ago",TR:"5 saat önce",AR:"منذ 5 ساعات"}, text:{DE:"📢 Kurs Donnerstag 09:00. Bitte Modul 1–4 vorher durcharbeiten!",EN:"📢 Course Thursday 09:00. Please complete modules 1–4 beforehand!",TR:"📢 Kurs Perşembe 09:00. Lütfen 1–4. modülleri önceden tamamlayın!",AR:"📢 الدورة الخميس 09:00. يرجى إكمال الوحدات 1–4 مسبقاً!"}, likes:8, comments:1, verified:true },
  { id:3, name:"Ayşe Demir",  avatar:"AD", time:{DE:"vor 1 Tag",EN:"1 day ago",TR:"1 gün önce",AR:"منذ يوم"},      text:{DE:"Alle Kapitel abgeschlossen! 🎉 Jetzt fühle ich mich wirklich vorbereitet.",EN:"All chapters done! 🎉 I feel really prepared now.",TR:"Tüm bölümler tamamlandı! 🎉 Şimdi hazır hissediyorum.",AR:"اكتملت جميع الفصول! 🎉 أشعر بالاستعداد الآن."}, likes:24, comments:7 },
];
const MOCK_CHAT = [
  { from:"them", text:{DE:"Hey! Bist du auch in der Gruppe 3B?",EN:"Hey! Are you in Group 3B too?",TR:"Hey! Sen de Grup 3B'de misin?",AR:"مرحباً! هل أنت في المجموعة 3B؟"}, time:"09:30" },
  { from:"me",   text:{DE:"Ja! Hast du schon angefangen?",EN:"Yes! Have you started yet?",TR:"Evet! Başladın mı?",AR:"نعم! هل بدأت؟"}, time:"09:31" },
  { from:"them", text:{DE:"Hast du Modul 4 schon?",EN:"Have you done Module 4?",TR:"Modül 4'ü tamamladın mı?",AR:"هل أتممت الوحدة 4؟"}, time:"09:42" },
];
const AVATAR_COLORS = ["bg-primary","bg-accent","bg-amber-500","bg-violet-500","bg-blue-500","bg-pink-500"];
const QUIZ_QUESTIONS: { question:Record<Lang,string>; options:Record<Lang,string[]>; correct:number; explanation:Record<Lang,string> }[] = [
  { question:{DE:"Wie viele Drücke/min bei der Herzdruckmassage?",EN:"How many compressions/min in CPR?",TR:"KPR'de dakikada kaç baskı?",AR:"كم ضغطة في الدقيقة أثناء الإنعاش؟"},
    options:{DE:["60–80/min","100–120/min","130–150/min","80–90/min"],EN:["60–80/min","100–120/min","130–150/min","80–90/min"],TR:["60–80/dak","100–120/dak","130–150/dak","80–90/dak"],AR:["60–80/دق","100–120/دق","130–150/دق","80–90/دق"]},
    correct:1, explanation:{DE:"100–120/min gemäß ERC-Leitlinien.",EN:"100–120/min per ERC guidelines.",TR:"ERC'ye göre 100–120/dak.",AR:"100–120/دقيقة وفق ERC."} },
  { question:{DE:"Wie tief drückt man bei Erwachsenen?",EN:"How deep for adult compressions?",TR:"Yetişkinlerde ne kadar derin?",AR:"كم عمق الضغط للبالغين؟"},
    options:{DE:["1–2 cm","3–4 cm","5–6 cm","7–8 cm"],EN:["1–2 cm","3–4 cm","5–6 cm","7–8 cm"],TR:["1–2 cm","3–4 cm","5–6 cm","7–8 cm"],AR:["1–2 سم","3–4 سم","5–6 سم","7–8 سم"]},
    correct:2, explanation:{DE:"5–6 cm ist leitliniengerecht.",EN:"5–6 cm is guideline-correct.",TR:"5–6 cm kılavuz uyumludur.",AR:"5–6 سم صحيح وفق المبادئ."} },
  { question:{DE:"Europäische Notrufnummer?",EN:"European emergency number?",TR:"Avrupa acil numarası?",AR:"رقم طوارئ أوروبا؟"},
    options:{DE:["999","110","112","911"],EN:["999","110","112","911"],TR:["999","110","112","911"],AR:["999","110","112","911"]},
    correct:2, explanation:{DE:"112 ist die einheitliche EU-Nummer.",EN:"112 is the unified EU number.",TR:"112, AB'nin ortak numarasıdır.",AR:"112 هو رقم الاتحاد الأوروبي الموحد."} },
  { question:{DE:"Verhältnis Drücken:Beatmen?",EN:"Compression:breath ratio?",TR:"Baskı:nefes oranı?",AR:"نسبة الضغط إلى التنفس؟"},
    options:{DE:["15:2","30:2","5:1","20:2"],EN:["15:2","30:2","5:1","20:2"],TR:["15:2","30:2","5:1","20:2"],AR:["15:2","30:2","5:1","20:2"]},
    correct:1, explanation:{DE:"30:2 ist der ERC-Standard.",EN:"30:2 is the ERC standard.",TR:"30:2, ERC standardıdır.",AR:"30:2 هو المعيار وفق ERC."} },
];
const LEADERBOARD_MOCK=[{name:"Sarah K.",score:980},{name:"Max M.",score:960},{name:"Ayşe D.",score:940},{name:"Du / You",score:0,isUser:true},{name:"Ahmed R.",score:870},{name:"Julia F.",score:820}];

const CHAPTER_COUNT=5;
const CHAPTER_NAMES: Record<Lang,string[]> = {
  DE:["Eigenschutz & Notruf","Bewusstlosigkeit","Reanimation (CPR)","Wunden & Verletzungen","Spezielle Notfälle"],
  EN:["Self-Protection & Call","Unconsciousness","Resuscitation (CPR)","Wounds & Injuries","Special Emergencies"],
  TR:["Öz Koruma & Çağrı","Bilinçsizlik","Canlandırma (CPR)","Yaralar","Özel Aciller"],
  AR:["الحماية والنداء","فقدان الوعي","الإنعاش القلبي","الجروح","طوارئ خاصة"],
};

type FeedType="video"|"infographic"|"optional_quiz"|"mandatory_quiz";
interface FeedItem{id:string;type:FeedType;chapter:number;title:Record<Lang,string>;image?:string;duration?:number;question?:Record<Lang,string>;options?:Record<Lang,string[]>;correct?:number;explanation?:Record<Lang,string>}
const TH=["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=900&fit=crop&auto=format","https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=900&fit=crop&auto=format","https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=900&fit=crop&auto=format","https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=900&fit=crop&auto=format","https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=900&fit=crop&auto=format"];
const FEED_ITEMS:FeedItem[]=[
  {id:"c0v1",type:"video",chapter:0,title:{DE:"Eigenschutz zuerst",EN:"Self-protection first",TR:"Önce öz koruma",AR:"الحماية أولاً"},image:TH[0],duration:45},
  {id:"c0i1",type:"infographic",chapter:0,title:{DE:"Die Rettungskette",EN:"Chain of Survival",TR:"Yaşam Zinciri",AR:"سلسلة النجاة"},image:TH[1]},
  {id:"c0v2",type:"video",chapter:0,title:{DE:"Notruf 112 absetzen",EN:"How to call 112",TR:"112'yi aramak",AR:"كيف تتصل بـ 112"},image:TH[0],duration:38},
  {id:"c0oq",type:"optional_quiz",chapter:0,title:{DE:"Lernfrage",EN:"Quick Check",TR:"Hızlı Kontrol",AR:"فحص سريع"},question:{DE:"Erste Maßnahme am Unfallort?",EN:"First action at accident scene?",TR:"Kaza yerinde ilk adım?",AR:"الإجراء الأول في الحادث؟"},options:{DE:["Erste Hilfe leisten","Eigenschutz sicherstellen","Fotos machen","Zeugen befragen"],EN:["Give first aid","Ensure self-protection","Take photos","Interview witnesses"],TR:["İlk yardım ver","Öz korumayı sağla","Fotoğraf çek","Tanıkları sorgula"],AR:["تقديم الإسعافات","ضمان الحماية","التقاط الصور","استجواب الشهود"]},correct:1,explanation:{DE:"Eigenschutz hat immer Vorrang.",EN:"Self-protection always comes first.",TR:"Öz koruma her zaman önce gelir.",AR:"الحماية الذاتية تأتي دائماً أولاً."}},
  {id:"c0mq",type:"mandatory_quiz",chapter:0,title:{DE:"Pflichtquiz – Kapitel 1",EN:"Mandatory Quiz – Ch.1",TR:"Zorunlu Quiz – Bölüm 1",AR:"اختبار إلزامي – الفصل 1"},question:{DE:"Welche Notrufnummer gilt europaweit?",EN:"European emergency number?",TR:"Avrupa acil numarası?",AR:"رقم الطوارئ الأوروبي؟"},options:{DE:["999","110","112","911"],EN:["999","110","112","911"],TR:["999","110","112","911"],AR:["999","110","112","911"]},correct:2,explanation:{DE:"112 ist die einheitliche EU-Notrufnummer.",EN:"112 is the unified EU emergency number.",TR:"112, AB'nin ortak acil numarasıdır.",AR:"112 هو رقم الطوارئ الموحد."}},
  {id:"c1v1",type:"video",chapter:1,title:{DE:"Bewusstsein prüfen",EN:"Check Consciousness",TR:"Bilinç Kontrolü",AR:"فحص الوعي"},image:TH[1],duration:52},
  {id:"c1i1",type:"infographic",chapter:1,title:{DE:"Stabile Seitenlage",EN:"Recovery Position",TR:"Koma Pozisyonu",AR:"وضع الإنعاش"},image:TH[2]},
  {id:"c1v2",type:"video",chapter:1,title:{DE:"Atemwege freimachen",EN:"Open Airways",TR:"Hava Yolunu Aç",AR:"فتح مجرى الهواء"},image:TH[1],duration:44},
  {id:"c1mq",type:"mandatory_quiz",chapter:1,title:{DE:"Pflichtquiz – Kapitel 2",EN:"Mandatory Quiz – Ch.2",TR:"Zorunlu Quiz – Bölüm 2",AR:"اختبار إلزامي – الفصل 2"},question:{DE:"Position für bewusstlose, atmende Person?",EN:"Position for unconscious breathing person?",TR:"Bilinçsiz nefes alan kişi pozisyonu?",AR:"وضعية الشخص فاقد الوعي ويتنفس؟"},options:{DE:["Rückenlage","Stabile Seitenlage","Bauchlage","Sitzend"],EN:["On back","Recovery position","Face down","Seated"],TR:["Sırt üstü","Koma pozisyonu","Yüz üstü","Oturur"],AR:["على الظهر","وضع الإنعاش","على الوجه","جالسًا"]},correct:1,explanation:{DE:"Stabile Seitenlage verhindert Erstickung.",EN:"Recovery position prevents choking.",TR:"Koma pozisyonu boğulmayı önler.",AR:"وضع الإنعاش يمنع الاختناق."}},
  {id:"c2v1",type:"video",chapter:2,title:{DE:"Herzdruckmassage",EN:"Chest Compressions",TR:"Göğüs Baskısı",AR:"ضغط الصدر"},image:TH[2],duration:58},
  {id:"c2i1",type:"infographic",chapter:2,title:{DE:"30:2 Verhältnis",EN:"30:2 Ratio",TR:"30:2 Oranı",AR:"نسبة 30:2"},image:TH[3]},
  {id:"c2v2",type:"video",chapter:2,title:{DE:"AED einsetzen",EN:"Using an AED",TR:"AED Kullanımı",AR:"استخدام AED"},image:TH[2],duration:62},
  {id:"c2mq",type:"mandatory_quiz",chapter:2,title:{DE:"Pflichtquiz – Kapitel 3",EN:"Mandatory Quiz – Ch.3",TR:"Zorunlu Quiz – Bölüm 3",AR:"اختبار إلزامي – الفصل 3"},question:{DE:"Wie viele Drücke pro Minute?",EN:"Compressions per minute?",TR:"Dakikada kaç baskı?",AR:"ضغطات في الدقيقة؟"},options:{DE:["60–80","100–120","130–150","80–90"],EN:["60–80","100–120","130–150","80–90"],TR:["60–80","100–120","130–150","80–90"],AR:["60–80","100–120","130–150","80–90"]},correct:1,explanation:{DE:"100–120/min gemäß ERC.",EN:"100–120/min per ERC.",TR:"ERC'ye göre 100–120/dak.",AR:"100–120/دقيقة وفق ERC."}},
  {id:"c3v1",type:"video",chapter:3,title:{DE:"Blutungen stillen",EN:"Stop Bleeding",TR:"Kanama Durdurmak",AR:"إيقاف النزيف"},image:TH[3],duration:48},
  {id:"c3i1",type:"infographic",chapter:3,title:{DE:"FAST-Schema",EN:"FAST Stroke Test",TR:"FAST Testi",AR:"اختبار FAST"},image:TH[4]},
  {id:"c3v2",type:"video",chapter:3,title:{DE:"Wunden versorgen",EN:"Wound Care",TR:"Yara Bakımı",AR:"العناية بالجروح"},image:TH[3],duration:55},
  {id:"c3mq",type:"mandatory_quiz",chapter:3,title:{DE:"Pflichtquiz – Kapitel 4",EN:"Mandatory Quiz – Ch.4",TR:"Zorunlu Quiz – Bölüm 4",AR:"اختبار إلزامي – الفصل 4"},question:{DE:"Wie stoppt man starke Blutung?",EN:"How to stop severe bleeding?",TR:"Şiddetli kanama nasıl durdurulur?",AR:"كيف توقف النزيف الشديد؟"},options:{DE:["Kühlen","Direkter Druck","Massieren","Abwarten"],EN:["Cool it","Direct pressure","Massage","Wait"],TR:["Soğut","Doğrudan baskı","Masaj","Bekle"],AR:["تبريد","ضغط مباشر","تدليك","انتظار"]},correct:1,explanation:{DE:"Direkter Druck ist die effektivste Maßnahme.",EN:"Direct pressure is the most effective measure.",TR:"Doğrudan baskı en etkilidir.",AR:"الضغط المباشر هو الأكثر فعالية."}},
  {id:"c4v1",type:"video",chapter:4,title:{DE:"Verbrennungen behandeln",EN:"Treating Burns",TR:"Yanık Tedavisi",AR:"علاج الحروق"},image:TH[4],duration:42},
  {id:"c4i1",type:"infographic",chapter:4,title:{DE:"Schockzeichen",EN:"Signs of Shock",TR:"Şok Belirtileri",AR:"علامات الصدمة"},image:TH[0]},
  {id:"c4v2",type:"video",chapter:4,title:{DE:"Hyperventilation & Panik",EN:"Hyperventilation & Panic",TR:"Hiperventilasyon",AR:"فرط التنفس"},image:TH[4],duration:40},
  {id:"c4mq",type:"mandatory_quiz",chapter:4,title:{DE:"Pflichtquiz – Kapitel 5",EN:"Mandatory Quiz – Ch.5",TR:"Zorunlu Quiz – Bölüm 5",AR:"اختبار إلزامي – الفصل 5"},question:{DE:"Symptom für Schock?",EN:"Symptom indicating shock?",TR:"Şok belirtisi?",AR:"عرض يشير إلى الصدمة؟"},options:{DE:["Rotes Gesicht","Blasse feuchte Haut","Hohes Fieber","Pupillenerweiterung"],EN:["Red face","Pale moist skin","High fever","Pupil dilation"],TR:["Kızarık yüz","Soluk nemli cilt","Yüksek ateş","Göz bebeği genişleme"],AR:["وجه أحمر","جلد شاحب ورطب","حمى","اتساع الحدقة"]},correct:1,explanation:{DE:"Blasse, feuchte Haut ist ein klassisches Schocksymptom.",EN:"Pale, moist skin is a classic shock symptom.",TR:"Soluk, nemli cilt klasik şok belirtisidir.",AR:"الجلد الشاحب والرطب عرض صدمة كلاسيكي."}},
];

interface ProgressData{chapterProgress:number[];currentChapter:number;totalScore:number;completedAt?:string}
const PROGRESS_KEY="eh_progress_v3";
function loadProgress():ProgressData{try{const s=localStorage.getItem(PROGRESS_KEY);if(s)return JSON.parse(s);}catch{/**/}return{chapterProgress:Array(CHAPTER_COUNT).fill(0),currentChapter:0,totalScore:0};}
function saveProgress(p:ProgressData){localStorage.setItem(PROGRESS_KEY,JSON.stringify(p));}

const CPR_BPM=110;const CPR_MS=Math.round(60000/CPR_BPM);
function fmt(s:number){return`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;}
function Avatar({initials,color="bg-primary",size="md"}:{initials:string;color?:string;size?:"sm"|"md"|"lg"}){
  const sz=size==="sm"?"w-8 h-8 text-xs":size==="lg"?"w-14 h-14 text-lg":"w-10 h-10 text-sm";
  return<div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>{initials}</div>;
}

// ─── Language Select ──────────────────────────────────────────────────────────

function LangSelectScreen({onSelect}:{onSelect:(l:Lang)=>void}){
  return(
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-8 text-white">
      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl overflow-hidden"><img src="/logo.png" alt="RescueReady" className="w-16 h-16 object-contain"/></div>
      <h1 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-black text-5xl uppercase tracking-tight mb-2 text-center">RescueReady</h1>
      <p className="text-white/60 text-sm mb-12 text-center">Wähle deine Sprache · Choose your language · Dil seç · اختر لغتك</p>
      <div className="w-full flex flex-col gap-4">
        {LANGUAGES.map(l=>(
          <button key={l.code} onClick={()=>onSelect(l.code)} className="flex items-center gap-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-6 py-5 transition-all active:scale-95">
            <span className="text-4xl">{l.flag}</span>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl">{l.label}</span>
            <ChevronRight className="w-5 h-5 ml-auto opacity-60"/>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Splash ───────────────────────────────────────────────────────────────────

function SplashScreen({lang,onLogin,onRegister,onDemo}:{lang:Lang;onLogin:()=>void;onRegister:()=>void;onDemo:()=>void}){
  return(
    <div className="flex flex-col min-h-screen bg-primary text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3"/>
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3"/>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-2xl overflow-hidden"><img src="/logo.png" alt="RescueReady" className="w-16 h-16 object-contain"/></div>
        <h1 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-black text-5xl uppercase tracking-tight mb-2">RescueReady</h1>
        <p className="text-white/70 text-base mb-2">{t("splashTagline",lang)}</p>
        <div className="flex gap-2 justify-center mb-10">{LANGUAGES.map(l=><span key={l.code} className="text-xl">{l.flag}</span>)}</div>
        <div className="flex flex-col gap-3 w-full mb-12">
          {[{k:"feat1",i:"🎬"},{k:"feat2",i:"🫀"},{k:"feat3",i:"🏆"},{k:"feat4",i:"👥"}].map(f=>(
            <div key={f.k} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 text-left">
              <span className="text-xl">{f.i}</span><span className="text-sm font-medium">{t(f.k,lang)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 pb-10 flex flex-col gap-3 relative z-10">
        <button onClick={onRegister} className="w-full bg-white text-primary font-bold text-lg uppercase py-4 rounded-xl active:scale-95 transition-transform" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("splashRegister",lang)}</button>
        <button onClick={onLogin}    className="w-full border-2 border-white/40 text-white font-bold text-lg uppercase py-4 rounded-xl active:scale-95 transition-transform" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("splashLogin",lang)}</button>
        <button onClick={onDemo}     className="w-full bg-white/15 text-white text-sm py-3 rounded-xl active:scale-95 transition-transform border border-white/20">{t("splashDemo",lang)}</button>
        <p className="text-center text-white/40 text-xs">{t("splashNote",lang)}</p>
      </div>
    </div>
  );
}

// ─── Register ─────────────────────────────────────────────────────────────────

function RegisterScreen({lang,onBack,onSuccess}:{lang:Lang;onBack:()=>void;onSuccess:(name:string)=>void}){
  const [name,setName]=useState("");const [email,setEmail]=useState("");const [pw,setPw]=useState("");
  const [showPw,setShowPw]=useState(false);const [errors,setErrors]=useState<Record<string,string>>({});const [loading,setLoading]=useState(false);
  const validate=()=>{const e:Record<string,string>={};if(!name.trim())e.name=t("nameRequired",lang);if(!email.includes("@"))e.email=t("validEmail",lang);if(pw.length<6)e.pw=t("passwordShort",lang);return e;};
  const submit=()=>{const e=validate();if(Object.keys(e).length){setErrors(e);return;}setLoading(true);setTimeout(()=>{setLoading(false);onSuccess(name.split(" ")[0]);},1200);};
  return(
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary px-5 pt-12 pb-6 text-white">
        <button onClick={onBack} className="flex items-center gap-2 text-white/70 mb-4 text-sm"><ArrowLeft className="w-4 h-4"/>{t("back",lang)}</button>
        <h1 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-3xl uppercase tracking-tight">{t("createAccount",lang)}</h1>
        <p className="text-white/60 text-sm mt-1">{t("registerSub",lang)}</p>
      </div>
      <div className="flex-1 px-6 py-8 flex flex-col gap-5">
        {[{label:t("fullName",lang),val:name,set:setName,ph:"Max Mustermann",err:errors.name,type:"text"},{label:t("emailAddress",lang),val:email,set:setEmail,ph:"max@example.com",err:errors.email,type:"email"}].map(f=>(
          <div key={f.label}><label className="text-sm font-medium mb-1.5 block">{f.label}</label>
            <input type={f.type} value={f.val} onChange={e=>{f.set(e.target.value);setErrors({});}} placeholder={f.ph}
              className={`w-full border-2 rounded-xl px-4 py-3 bg-background outline-none placeholder:text-muted-foreground transition-colors ${f.err?"border-primary":"border-border focus:border-foreground"}`}/>
            {f.err&&<p className="text-primary text-xs mt-1">{f.err}</p>}</div>
        ))}
        <div><label className="text-sm font-medium mb-1.5 block">{t("password",lang)}</label>
          <div className="relative">
            <input type={showPw?"text":"password"} value={pw} onChange={e=>{setPw(e.target.value);setErrors({});}} placeholder={t("passwordMin",lang)}
              className={`w-full border-2 rounded-xl px-4 py-3 pr-12 bg-background outline-none placeholder:text-muted-foreground transition-colors ${errors.pw?"border-primary":"border-border focus:border-foreground"}`}/>
            <button onClick={()=>setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{showPw?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>
          </div>{errors.pw&&<p className="text-primary text-xs mt-1">{errors.pw}</p>}</div>
        <p className="text-xs text-muted-foreground">{t("terms",lang)} <span className="underline">{t("termsLink",lang)}</span> &amp; <span className="underline">{t("privacy",lang)}</span></p>
        <button onClick={submit} disabled={loading} className="w-full bg-primary text-white font-bold text-lg uppercase py-4 rounded-xl disabled:opacity-60 active:scale-95 transition-all" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{loading?t("creating",lang):t("createAccount",lang)}</button>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────

function LoginScreen({lang,onBack,onSuccess}:{lang:Lang;onBack:()=>void;onSuccess:(name:string)=>void}){
  const [email,setEmail]=useState("");const [pw,setPw]=useState("");const [showPw,setShowPw]=useState(false);
  const [loading,setLoading]=useState(false);const [error,setError]=useState("");
  const submit=()=>{if(!email||!pw){setError(t("fillAllFields",lang));return;}setLoading(true);setTimeout(()=>{setLoading(false);onSuccess("Max");},1200);};
  return(
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary px-5 pt-12 pb-6 text-white">
        <button onClick={onBack} className="flex items-center gap-2 text-white/70 mb-4 text-sm"><ArrowLeft className="w-4 h-4"/>{t("back",lang)}</button>
        <h1 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-3xl uppercase tracking-tight">{t("login",lang)}</h1>
        <p className="text-white/60 text-sm mt-1">{t("loginSub",lang)}</p>
      </div>
      <div className="flex-1 px-6 py-8 flex flex-col gap-5">
        <div><label className="text-sm font-medium mb-1.5 block">{t("emailAddress",lang)}</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="max@example.com"
            className="w-full border-2 border-border focus:border-foreground rounded-xl px-4 py-3 bg-background outline-none placeholder:text-muted-foreground transition-colors"/></div>
        <div><label className="text-sm font-medium mb-1.5 block">{t("password",lang)}</label>
          <div className="relative">
            <input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} placeholder={t("passwordMin",lang)}
              className="w-full border-2 border-border focus:border-foreground rounded-xl px-4 py-3 pr-12 bg-background outline-none placeholder:text-muted-foreground transition-colors"/>
            <button onClick={()=>setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">{showPw?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>
          </div></div>
        <button className="text-sm text-primary font-medium text-right -mt-2">{t("forgotPassword",lang)}</button>
        {error&&<p className="text-primary text-sm text-center">{error}</p>}
        <button onClick={submit} disabled={loading} className="w-full bg-primary text-white font-bold text-lg uppercase py-4 rounded-xl disabled:opacity-60 active:scale-95 transition-all" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{loading?t("loggingIn",lang):t("login",lang)}</button>
      </div>
    </div>
  );
}

// ─── Paywall ──────────────────────────────────────────────────────────────────

const PAYMENT_METHODS=[
  {id:"paypal",label:"PayPal",icon:"🅿️"},
  {id:"card",  label:{DE:"Kreditkarte",EN:"Credit Card",TR:"Kredi Kartı",AR:"بطاقة ائتمان"} as Record<Lang,string>,icon:"💳"},
  {id:"apple", label:"Apple Pay",icon:"🍎"},
  {id:"google",label:"Google Pay",icon:"🟡"},
  {id:"klarna",label:"Klarna",icon:"🟣"},
  {id:"school",label:{DE:"Schullizenz eingeben",EN:"Enter School License",TR:"Okul Lisansı Gir",AR:"أدخل ترخيص المدرسة"} as Record<Lang,string>,icon:"🏫"},
];

function PaywallScreen({lang,userName,onSuccess,onSchoolLicense}:{lang:Lang;userName:string;onSuccess:()=>void;onSchoolLicense:()=>void}){
  const [method,setMethod]=useState<string|null>(null);
  const [step,setStep]=useState<"select"|"processing"|"done">("select");
  if(step==="done")return(
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6"><CheckCircle className="w-10 h-10 text-white"/></div>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-3xl uppercase tracking-tight mb-2">{t("paymentSuccess",lang)}</h2>
      <p className="text-muted-foreground text-sm mb-8">{t("paymentConfirmed",lang)}</p>
      <div className="w-full bg-card rounded-2xl p-5 mb-8 text-left">
        {t("payIncludes",lang).split("|").map(f=>(
          <div key={f} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"><Check className="w-4 h-4 text-accent flex-shrink-0"/><span className="text-sm">{f}</span></div>
        ))}
      </div>
      <button onClick={onSuccess} className="w-full bg-primary text-white font-bold text-xl uppercase py-4 rounded-xl active:scale-95 transition-transform" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("startApp",lang)}</button>
    </div>
  );
  if(step==="processing")return(
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
      <p className="font-medium text-muted-foreground">{t("processing",lang)}</p>
    </div>
  );
  return(
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary px-5 pt-12 pb-6 text-white text-center">
        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 overflow-hidden"><img src="/logo.png" alt="RescueReady" className="w-11 h-11 object-contain"/></div>
        <h1 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-3xl uppercase tracking-tight">{t("unlockApp",lang)}</h1>
        <p className="text-white/70 text-sm mt-1">{userName}! {t("paywallSub",lang)}</p>
      </div>
      <div className="flex-1 px-5 py-6 overflow-y-auto">
        <div className="bg-foreground text-background rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div><p className="text-background/60 text-xs font-medium uppercase tracking-wide">{t("fullAccess",lang)}</p><p className="font-bold text-xl mt-0.5">{t("oneTimePayment",lang)}</p><p className="text-background/60 text-xs mt-1">{t("allContentNoSub",lang)}</p></div>
          <div className="text-right"><span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-black text-5xl">5</span><span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl">,00 €</span></div>
        </div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">{t("paymentMethod",lang)}</p>
        <div className="flex flex-col gap-2 mb-6">
          {PAYMENT_METHODS.map(pm=>(
            <button key={pm.id} onClick={()=>setMethod(pm.id)} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${method===pm.id?"border-primary bg-primary/5":"border-border"}`}>
              <span className="text-2xl">{pm.icon}</span>
              <span className="font-medium text-sm flex-1">{typeof pm.label==="string"?pm.label:(pm.label as Record<Lang,string>)[lang]}</span>
              {method===pm.id&&<Check className="w-4 h-4 text-primary"/>}
            </button>
          ))}
        </div>
        {method==="school" ? (
          <button onClick={onSchoolLicense}
            className="w-full bg-foreground text-background font-bold text-xl uppercase py-4 rounded-xl active:scale-95 transition-all" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>
            🏫 {lang==="DE"?"Lizenzcode eingeben":lang==="EN"?"Enter License Code":lang==="TR"?"Lisans Kodu Gir":"أدخل رمز الترخيص"}
          </button>
        ) : (
          <button onClick={()=>{if(!method)return;setStep("processing");setTimeout(()=>setStep("done"),2200);}} disabled={!method}
            className="w-full bg-primary text-white font-bold text-xl uppercase py-4 rounded-xl disabled:opacity-40 active:scale-95 transition-all" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("payNow",lang)}</button>
        )}
        <p className="text-xs text-muted-foreground text-center mt-3">{t("securePayment",lang)}</p>
      </div>
    </div>
  );
}

// ─── License Screen ───────────────────────────────────────────────────────────

function LicenseScreen({lang,onSuccess}:{lang:Lang;onSuccess:(s:SchoolTheme)=>void}){
  const [code,setCode]=useState("");const [error,setError]=useState("");const [loading,setLoading]=useState(false);
  const submit=()=>{const k=code.trim().toUpperCase();const s=SCHOOL_THEMES[k];if(!s){setError(t("invalidCode",lang));return;}setLoading(true);setTimeout(()=>{setLoading(false);onSuccess(s);},1400);};
  return(
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-foreground px-5 pt-12 pb-6 text-background">
        <h1 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-3xl uppercase tracking-tight">{t("schoolCode",lang)}</h1>
        <p className="text-background/60 text-sm mt-1">{t("schoolCodeSub",lang)}</p>
      </div>
      <div className="flex-1 px-6 py-8 flex flex-col gap-5 overflow-y-auto">
        <div><label className="text-sm font-medium mb-1.5 block">{t("licenseCode",lang)}</label>
          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <input value={code} onChange={e=>{setCode(e.target.value);setError("");}} placeholder={t("licensePlaceholder",lang)}
              className="w-full border-2 border-border focus:border-foreground rounded-xl pl-11 pr-4 py-3 bg-background outline-none placeholder:text-muted-foreground uppercase tracking-widest font-mono text-sm transition-colors"
              onKeyDown={e=>e.key==="Enter"&&submit()}/>
          </div>{error&&<p className="text-primary text-xs mt-1">{error}</p>}</div>
        <div className="bg-card rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-muted-foreground leading-relaxed">{t("licenseHint",lang)} <span className="font-mono font-bold">EH-2024-DEMO</span></p>
        </div>
        <div className="flex flex-col gap-2">
          {Object.entries(SCHOOL_THEMES).map(([k,v])=>(
            <button key={k} onClick={()=>{setCode(k);setError("");}} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary transition-colors text-left">
              <span className="text-xl">{v.emoji}</span>
              <div><p className="text-sm font-medium">{v.name}</p><p className="text-xs text-muted-foreground font-mono">{k}</p></div>
            </button>
          ))}
        </div>
        <button onClick={submit} disabled={loading} className="w-full bg-primary text-white font-bold text-lg uppercase py-4 rounded-xl disabled:opacity-60 active:scale-95 transition-all" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{loading?t("checking",lang):t("unlock",lang)}</button>
      </div>
    </div>
  );
}

// ─── Google Review Modal ──────────────────────────────────────────────────────

function GoogleReviewModal({lang,school,onClose}:{lang:Lang;school:SchoolTheme|null;onClose:()=>void}){
  return(
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{maxWidth:430,margin:"0 auto"}}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose}/>
      <div className="relative bg-background rounded-t-3xl w-full px-6 pt-6 pb-10 shadow-2xl">
        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6"/>
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🎉</div>
          <h2 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl uppercase tracking-tight mb-2">{t("courseDone",lang)}</h2>
          <p className="text-muted-foreground text-sm">{t("reviewQuestion",lang)} <span className="font-medium text-foreground">{school?.name??""}</span> {t("reviewQuestion2",lang)}</p>
        </div>
        <div className="flex justify-center gap-1 mb-6">{[1,2,3,4,5].map(s=><Star key={s} className="w-8 h-8 fill-amber-400 text-amber-400"/>)}</div>
        <a href={school?.googleReviewUrl??"#"} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-3 bg-primary text-white font-bold text-lg uppercase py-4 rounded-xl active:scale-95 transition-transform mb-3" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>
          <ExternalLink className="w-5 h-5"/>{school?.name??""} {t("rateGoogle",lang)}
        </a>
        <button onClick={onClose} className="w-full text-muted-foreground text-sm py-2">{t("notNow",lang)}</button>
      </div>
    </div>
  );
}

// ─── TikTok Feed ──────────────────────────────────────────────────────────────

function TikTokFeed({lang,progress,onUpdate,onBack}:{lang:Lang;progress:ProgressData;onUpdate:(p:ProgressData)=>void;onBack:()=>void}){
  const items=FEED_ITEMS.filter(f=>f.chapter===progress.currentChapter);
  const [idx,setIdx]=useState(0);const [quizSel,setQuizSel]=useState<number|null>(null);
  const [quizDone,setQuizDone]=useState(false);const [timer,setTimer]=useState(15);const [timerOn,setTimerOn]=useState(false);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const item=items[idx];const isMandatory=item?.type==="mandatory_quiz";const isOptional=item?.type==="optional_quiz";

  useEffect(()=>{setQuizSel(null);setQuizDone(false);setTimer(15);setTimerOn(false);if(timerRef.current)clearInterval(timerRef.current);},[idx]);
  useEffect(()=>{if(isMandatory&&!quizDone)setTimerOn(true);else{setTimerOn(false);if(timerRef.current)clearInterval(timerRef.current);};},[isMandatory,quizDone]);
  useEffect(()=>{
    if(!timerOn)return;
    timerRef.current=setInterval(()=>setTimer(tt=>{if(tt<=1){clearInterval(timerRef.current!);setTimerOn(false);setQuizDone(true);return 0;}return tt-1;}),1000);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[timerOn]);

  const handleAnswer=(i:number)=>{
    if(quizDone||quizSel!==null)return;
    if(timerRef.current)clearInterval(timerRef.current);
    setTimerOn(false);setQuizSel(i);setQuizDone(true);
    if(isMandatory&&i===items[idx].correct){
      const pts=Math.max(100,timer*20);
      const prog=[...progress.chapterProgress];
      prog[progress.currentChapter]=Math.min(100,prog[progress.currentChapter]+50);
      const chDone=prog[progress.currentChapter]>=100;
      const newCh=chDone&&progress.currentChapter<CHAPTER_COUNT-1?progress.currentChapter+1:progress.currentChapter;
      const allDone=prog.every(p=>p>=100);
      const updated:ProgressData={...progress,chapterProgress:prog,currentChapter:newCh,totalScore:progress.totalScore+pts,completedAt:allDone?new Date().toISOString():progress.completedAt};
      saveProgress(updated);onUpdate(updated);
    }
  };

  const goNext=()=>{if(idx<items.length-1)setIdx(n=>n+1);else onBack();};
  if(!item)return null;
  const chPct=progress.chapterProgress[progress.currentChapter];

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollToItem = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const el = container.children[index] as HTMLElement;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  useEffect(() => { scrollToItem(idx); }, [idx]);

  return(
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col select-none" style={{maxWidth:430,margin:"0 auto"}}>
      <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-12 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="text-white/70 flex-shrink-0"><ArrowLeft className="w-5 h-5"/></button>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-white/60">{CHAPTER_NAMES[lang][progress.currentChapter]}</span>
              <span className="text-xs text-white/60">{idx+1}/{items.length}</span>
            </div>
            <div className="h-1 bg-white/20 rounded-full overflow-hidden"><div className="h-1 bg-white rounded-full transition-all" style={{width:`${chPct}%`}}/></div>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth" style={{scrollSnapType:"y mandatory"}}>
      {items.map((feedItem, feedIdx) => {
        const isActive = feedIdx === idx;
        const feedQuizSel = feedIdx === idx ? quizSel : null;
        const feedQuizDone = feedIdx === idx ? quizDone : false;
        const feedTimer = feedIdx === idx ? timer : 15;
        const feedIsMandatory = feedItem.type === "mandatory_quiz";
        const feedIsOptional = feedItem.type === "optional_quiz";
        return (
        <div key={feedItem.id} className="snap-start flex-shrink-0" style={{height:"100dvh",scrollSnapAlign:"start"}} onClick={()=>{if(feedIdx!==idx){setIdx(feedIdx);setQuizSel(null);setQuizDone(false);setTimer(15);}}}>
        <div className="flex flex-col h-full pt-24 pb-4">
        {feedItem.type==="video"&&(
          <div className="flex-1 relative">
            <img src={feedItem.image} alt={feedItem.title[lang]} className="absolute inset-0 w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"/>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl"><Play className="w-7 h-7 fill-white text-white ml-1"/></div>
            </div>
            <div className="absolute bottom-6 left-5 right-5">
              <div className="inline-block bg-primary text-white text-xs font-bold px-2 py-1 rounded mb-2">VIDEO · {fmt(feedItem.duration!)}</div>
              <h2 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-3xl uppercase">{feedItem.title[lang]}</h2>
            </div>
          </div>
        )}
        {feedItem.type==="infographic"&&(
          <div className="flex-1 relative">
            <img src={feedItem.image} alt={feedItem.title[lang]} className="absolute inset-0 w-full h-full object-cover opacity-50"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"/>
            <div className="absolute bottom-6 left-5 right-5">
              <div className="inline-block bg-white/20 text-white text-xs font-bold px-2 py-1 rounded mb-2">{t("infographic",lang)}</div>
              <h2 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-3xl uppercase mb-4">{feedItem.title[lang]}</h2>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 grid grid-cols-2 gap-3">
                {(["infStep1","infStep2","infStep3","infStep4"] as const).map((k,i)=>(
                  <div key={i} className="flex items-start gap-2"><span className="text-primary font-bold">{["①","②","③","④"][i]}</span><span className="text-xs text-white/80 leading-tight">{t(k,lang)}</span></div>
                ))}
              </div>
            </div>
          </div>
        )}
        {(feedItem.type==="optional_quiz"||feedItem.type==="mandatory_quiz")&&(
          <div className="flex-1 flex flex-col px-5 pt-2">
            {feedIsMandatory&&(
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-white/60 font-bold uppercase tracking-wide">{t("mandatoryQuiz",lang)}</span>
                  <span className={`font-mono font-bold text-sm ${feedTimer<=5?"text-red-400":"text-white"}`}>{feedTimer}s</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className={`h-1.5 rounded-full transition-all duration-1000 ${feedTimer<=5?"bg-red-500":"bg-primary"}`} style={{width:`${(feedTimer/15)*100}%`}}/>
                </div>
              </div>
            )}
            {feedIsOptional&&(
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-white/50 uppercase tracking-wide">{t("understanding",lang)}</span>
                <button onClick={()=>{const ni=feedIdx+1;if(ni<items.length){setIdx(ni);setQuizSel(null);setQuizDone(false);setTimer(15);setTimeout(()=>scrollToItem(ni),50);}}} className="text-xs text-white/50 underline">{t("skip",lang)}</button>
              </div>
            )}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-5">
              <p style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl leading-tight" dir={lang==="AR"?"rtl":"ltr"}>{feedItem.question?.[lang]}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {feedItem.options?.[lang].map((opt,i)=>{
                let cls="rounded-xl p-4 text-left text-sm font-medium border-2 transition-all ";
                if(!feedQuizDone)cls+="border-white/20 bg-white/10 hover:bg-white/20 active:scale-95";
                else if(i===feedItem.correct)cls+="border-green-400 bg-green-500/30";
                else if(i===feedQuizSel&&i!==feedItem.correct)cls+="border-red-400 bg-red-500/30";
                else cls+="border-white/10 bg-white/5 opacity-40";
                return(<button key={i} onClick={()=>feedIdx===idx&&handleAnswer(i)} className={cls} dir={lang==="AR"?"rtl":"ltr"}><span className="block text-xs opacity-60 mb-1 font-bold">{String.fromCharCode(65+i)}</span>{opt}</button>);
              })}
            </div>
            {feedQuizDone&&(
              <div className={`mt-4 rounded-xl p-4 flex gap-3 ${feedQuizSel===feedItem.correct?"bg-green-500/20 border border-green-400/50":"bg-red-500/20 border border-red-400/50"}`}>
                {feedQuizSel===feedItem.correct?<Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"/>:<X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/>}
                <div>
                  {feedIsMandatory&&feedQuizSel===feedItem.correct&&<p className="text-green-400 text-sm font-bold mb-1">+{Math.max(100,feedTimer*20)} {t("pointsEarned",lang)}</p>}
                  <p className="text-sm text-white/80">{feedItem.explanation?.[lang]}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
          {/* Scroll hint */}
          {(feedItem.type!=="mandatory_quiz"||(feedQuizDone))&&(
            <div className="flex items-center justify-center pb-4 flex-shrink-0">
              {feedIdx < items.length-1 ? (
                <button onClick={()=>{const ni=feedIdx+1;setIdx(ni);setQuizSel(null);setQuizDone(false);setTimer(15);setTimeout(()=>scrollToItem(ni),50);}}
                  className="flex flex-col items-center gap-1 text-white/50 active:text-white transition-colors">
                  <span className="text-xs uppercase tracking-wide">{t("next",lang)}</span>
                  <ChevronDown className="w-6 h-6 animate-bounce"/>
                </button>
              ) : (
                <button onClick={onBack} className="bg-primary text-white font-bold px-8 py-3 rounded-xl uppercase text-sm tracking-wide">
                  {t("feedFinished",lang)}
                </button>
              )}
            </div>
          )}
        </div>
        </div>
        );
      })}
      </div>
    </div>
  );
}

// ─── Home Mode ────────────────────────────────────────────────────────────────

function HomeMode({lang,progress,onOpenFeed}:{lang:Lang;progress:ProgressData;onOpenFeed:(ch:number)=>void}){
  const completed=MODULES.filter(m=>m.status==="completed").length;
  const [selected,setSelected]=useState<number|null>(null);
  const overallPct=Math.round(progress.chapterProgress.reduce((a,b)=>a+b,0)/CHAPTER_COUNT);
  const allDone=progress.chapterProgress.every(p=>p>=100);
  const doneCount=progress.chapterProgress.filter(p=>p>=100).length;
  return(
    <div className="pb-6">
      {/* Chapter section */}
      <div className="px-5 py-4 bg-card/60 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-base uppercase tracking-wide">{t("chapters",lang)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{doneCount} {t("chaptersOf",lang)} {CHAPTER_COUNT} {t("chaptersCompleted",lang)}</p>
          </div>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-black text-2xl text-primary">{overallPct}%</span>
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({length:CHAPTER_COUNT},(_,i)=>{
            const cp=progress.chapterProgress[i];
            const isActive=i===progress.currentChapter&&cp<100;
            const isDone=cp>=100;const isLocked=i>progress.currentChapter;
            return(
              <button key={i} onClick={()=>!isLocked&&onOpenFeed(i)} disabled={isLocked}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${isLocked?"border-dashed border-border opacity-40 cursor-not-allowed":isDone?"border-accent/60 bg-accent/5 active:scale-[0.98]":isActive?"border-primary bg-primary/5 active:scale-[0.98]":"border-border hover:border-primary/50"}`}>
                <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 text-sm font-bold ${isDone?"bg-accent text-white":isActive?"bg-primary text-white":"bg-muted text-muted-foreground"}`}>
                  {isDone?<Check className="w-4 h-4"/>:isLocked?<Lock className="w-3.5 h-3.5"/>:i+1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{CHAPTER_NAMES[lang][i]}</p>
                    {isActive&&<span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded flex-shrink-0">{t("active",lang)}</span>}
                    {isDone&&<span className="text-xs bg-accent text-white px-1.5 py-0.5 rounded flex-shrink-0">✓</span>}
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-1.5 rounded-full transition-all ${isDone?"bg-accent":"bg-primary"}`} style={{width:`${cp}%`}}/>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right flex-shrink-0">{cp}%</span>
              </button>
            );
          })}
        </div>
        {allDone&&(
          <div className="mt-3 border-2 border-accent rounded-xl p-4 flex items-center gap-3">
            <Ticket className="w-8 h-8 text-accent flex-shrink-0"/>
            <div><p className="text-sm font-medium text-accent">{t("ticketReady",lang)}</p><p className="text-xs text-muted-foreground mt-0.5">{t("allChaptersDone",lang)}</p></div>
          </div>
        )}
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-0 border-b border-border">
        {[{lk:"done",value:`${completed}/${MODULES.length}`,icon:CheckCircle,color:"text-accent"},{lk:"progress",value:`${overallPct}%`,icon:Zap,color:"text-primary"},{lk:"streak",value:t("streakDays",lang),icon:Star,color:"text-amber-500"}].map((s,i)=>(
          <div key={i} className={`px-3 py-4 flex flex-col items-center text-center ${i<2?"border-r border-border":""}`}>
            <s.icon className={`w-5 h-5 mb-1 ${s.color}`}/>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-xl leading-none">{s.value}</span>
            <span className="text-muted-foreground text-xs mt-0.5">{t(s.lk,lang)}</span>
          </div>
        ))}
      </div>
      {/* Plan bar */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex justify-between items-center mb-2">
          <span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-base uppercase tracking-wide">{t("learningPlan",lang)}</span>
          <span className="text-xs text-muted-foreground">{Math.round((completed/MODULES.length)*100)}% {t("done2",lang)}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-2 bg-primary rounded-full transition-all" style={{width:`${Math.round((completed/MODULES.length)*100)}%`}}/></div>
      </div>
      {/* Module list */}
      <div className="divide-y divide-border">
        {MODULES.map(mod=>{
          const open=selected===mod.id;
          return(
            <div key={mod.id}>
              <button onClick={()=>mod.status!=="locked"&&setSelected(open?null:mod.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${mod.status==="locked"?"opacity-40 cursor-not-allowed":"hover:bg-muted/40"}`}>
                <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${mod.status==="completed"?"bg-accent text-white":mod.status==="current"?"bg-primary text-white":"bg-muted text-muted-foreground"}`}>
                  {mod.status==="completed"?<Check className="w-5 h-5"/>:mod.status==="current"?<PlayCircle className="w-5 h-5"/>:<Lock className="w-4 h-4"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{mod.category[lang]}</span>
                    {mod.status==="current"&&<span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded font-medium">{t("active",lang)}</span>}
                  </div>
                  <p className="font-medium text-sm mt-0.5">{mod.title[lang]}</p>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                  <Clock className="w-3.5 h-3.5"/><span className="text-xs">{fmt(mod.duration)}</span>
                  {mod.status!=="locked"&&<ChevronRight className={`w-4 h-4 ml-1 transition-transform ${open?"rotate-90":""}`}/>}
                </div>
              </button>
              {open&&(
                <div className="mx-5 mb-4 bg-card rounded-lg overflow-hidden border border-border">
                  <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                    <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=338&fit=crop&auto=format" alt="Demo" className="absolute inset-0 w-full h-full object-cover opacity-50"/>
                    <div className="relative z-10 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"><Play className="w-6 h-6 text-white fill-white ml-1"/></div>
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">{fmt(mod.duration)}</div>
                    <div className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded font-medium">{lang}</div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium mb-1">{mod.title[lang]}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{mod.description[lang]}</p>
                    <div className="flex flex-col gap-1.5">
                      {mod.keyPoints[lang].map((point,pi)=>(
                        <div key={pi} className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-primary text-xs font-bold">{pi+1}</span></div>
                          <span className="text-xs text-muted-foreground leading-tight">{point}</span>
                        </div>
                      ))}
                    </div>
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

function QRCheckin({lang,checkedIn,setCheckedIn,userName}:{lang:Lang;checkedIn:boolean;setCheckedIn:(v:boolean)=>void;userName:string}){
  const [scanning,setScanning]=useState(false);
  const [nickname,setNickname]=useState(userName.split(" ")[0]);
  const [step,setStep]=useState<"scan"|"nickname"|"done">("scan");

  if(checkedIn||step==="done")return(
    <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
      <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-5"><CheckCircle className="w-10 h-10 text-white"/></div>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-3xl uppercase tracking-tight mb-2">{t("checkedIn",lang)}</h2>
      <p className="text-muted-foreground text-sm mb-1">{t("courseInfo",lang)}</p>
      <p className="text-muted-foreground text-sm mb-2">{t("roomInfo",lang)}</p>
      <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-sm font-medium px-3 py-1.5 rounded-full mb-6"><span>👤</span>{t("loggedInAs",lang)}: <strong>{nickname}</strong></div>
      <div className="grid grid-cols-3 gap-3 w-full">
        {[{lk:"participants",v:"18"},{lk:"online",v:"16"},{lk:"ready",v:"100%"}].map(s=>(
          <div key={s.lk} className="bg-card rounded-xl p-3 text-center">
            <div style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-xl">{s.v}</div>
            <div className="text-xs text-muted-foreground">{t(s.lk,lang)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if(step==="nickname")return(
    <div className="flex flex-col items-center py-10 px-6 text-center">
      <div className="text-5xl mb-4">👤</div>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl uppercase mb-2">{t("nicknameTitle",lang)}</h2>
      <p className="text-muted-foreground text-sm mb-6">{t("nicknameSub",lang)}</p>
      <input value={nickname} onChange={e=>setNickname(e.target.value)} placeholder={t("nicknamePlaceholder",lang)}
        className="w-full border-2 border-border focus:border-primary rounded-xl px-4 py-3 bg-background outline-none text-center font-medium text-lg mb-5 transition-colors"/>
      <button onClick={()=>{setStep("done");setCheckedIn(true);}} className="w-full bg-primary text-white font-bold text-lg uppercase py-4 rounded-xl active:scale-95 transition-transform" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("joinCourse",lang)}</button>
    </div>
  );

  return(
    <div className="flex flex-col items-center py-6 px-6 text-center">
      {/* Instructor info banner */}
      <div className="w-full bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 flex items-center gap-3 mb-6 text-left">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">KM</div>
        <div>
          <p className="text-xs text-muted-foreground">{t("scanQRSub",lang)}</p>
          <p className="text-sm font-medium">Klaus Müller · {t("checkedInBadge",lang).split(" ")[0]}</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-accent text-xs font-bold"><div className="w-2 h-2 bg-accent rounded-full animate-pulse"/>Live</div>
      </div>

      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl uppercase tracking-tight mb-1">{t("scanQR",lang)}</h2>
      <p className="text-muted-foreground text-sm mb-5">{t("scanQRSub",lang)}</p>

      {/* Camera viewfinder simulation */}
      <div className={`relative w-56 h-56 rounded-2xl overflow-hidden transition-colors mb-2 bg-gray-900`}>
        {/* Corner brackets */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-sm"/>
        <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-sm"/>
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-sm"/>
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-sm"/>
        {/* Instructor's QR code (simulated) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 160 160" className="w-36 h-36">
            {[[0,0,5],[0,6,1],[0,11,5],[1,0,1],[1,4,1],[1,6,1],[1,8,2],[1,11,1],[1,15,1],[2,0,1],[2,2,2],[2,4,1],[2,6,1],[2,9,1],[2,11,1],[2,13,2],[2,15,1],[3,0,1],[3,2,2],[3,4,1],[3,7,3],[3,11,1],[3,13,2],[3,15,1],[4,0,1],[4,4,1],[4,6,2],[4,10,1],[4,11,1],[4,15,1],[5,0,5],[5,6,1],[5,8,1],[5,11,5],[7,1,2],[7,4,2],[7,7,1],[7,10,2],[7,14,2],[8,0,1],[8,3,1],[8,6,3],[8,11,1],[8,13,1],[9,1,2],[9,5,1],[9,7,2],[9,12,2],[9,15,1],[10,0,1],[10,3,2],[10,6,1],[10,9,1],[10,12,1],[10,14,2],[11,0,5],[11,6,1],[11,9,2],[11,11,5],[12,0,1],[12,4,1],[12,7,2],[12,12,1],[12,15,1],[13,0,1],[13,2,2],[13,4,1],[13,7,1],[13,10,1],[13,11,1],[13,13,2],[13,15,1],[14,0,1],[14,2,2],[14,4,1],[14,6,2],[14,11,1],[14,13,2],[14,15,1],[15,0,1],[15,4,1],[15,6,1],[15,9,1],[15,11,1],[15,15,1],[16,0,5],[16,7,2],[16,11,5]].map(([r,c,s],i)=>(
              <rect key={i} x={c*10} y={r*10} width={s*10-1} height={9} fill="#ffffff"/>
            ))}
          </svg>
        </div>
        {scanning&&(
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="w-48 h-1 bg-primary rounded-full animate-bounce shadow-lg shadow-primary/50"/>
          </div>
        )}
        {/* Session ID overlay */}
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <span className="text-xs text-white/70 font-mono bg-black/50 px-2 py-0.5 rounded">SESSION-3B-{new Date().getHours()}{String(new Date().getMinutes()).padStart(2,"0")}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-5">{t("sessionAutoDetect",lang)}</p>
      <div className="w-full flex flex-col gap-3">
        <button onClick={()=>{setScanning(true);setTimeout(()=>{setScanning(false);setStep("nickname");},1800);}} disabled={scanning}
          className="w-full bg-primary text-white font-bold text-lg uppercase py-4 rounded-xl disabled:opacity-60 active:scale-95 transition-all" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>
          {scanning?t("scanning",lang):t("scanButton",lang)}
        </button>
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
          <Users className="w-3.5 h-3.5"/><span>17 {t("participantsIn",lang)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Live Quiz ────────────────────────────────────────────────────────────────

function LiveQuiz({lang}:{lang:Lang}){
  const [qIdx,setQIdx]=useState(0);const [selected,setSelected]=useState<number|null>(null);
  const [showResult,setShowResult]=useState(false);const [score,setScore]=useState(0);
  const [done,setDone]=useState(false);const [timeLeft,setTimeLeft]=useState(20);const [showBoard,setShowBoard]=useState(false);
  const q=QUIZ_QUESTIONS[qIdx];const total=QUIZ_QUESTIONS.length;
  useEffect(()=>{if(showResult||done)return;if(timeLeft<=0){setShowResult(true);return;}const tt=setTimeout(()=>setTimeLeft(n=>n-1),1000);return()=>clearTimeout(tt);},[timeLeft,showResult,done]);
  const pick=(i:number)=>{if(showResult)return;setSelected(i);setShowResult(true);if(i===q.correct)setScore(s=>s+Math.max(50,timeLeft*25));};
  const next=()=>{if(qIdx+1<total){setQIdx(n=>n+1);setSelected(null);setShowResult(false);setTimeLeft(20);}else setDone(true);};
  const reset=()=>{setQIdx(0);setSelected(null);setShowResult(false);setScore(0);setDone(false);setTimeLeft(20);setShowBoard(false);};
  const board=LEADERBOARD_MOCK.map(e=>e.isUser?{...e,score}:e).sort((a,b)=>b.score-a.score);
  if(showBoard)return(
    <div className="px-5 py-6">
      <div className="flex items-center justify-between mb-5"><h2 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl uppercase tracking-tight">{t("leaderboard",lang)}</h2><Trophy className="w-6 h-6 text-amber-500"/></div>
      <div className="space-y-2">{board.map((e,i)=>(
        <div key={e.name} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${e.isUser?"bg-primary text-white":"bg-card"}`}>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className={`font-bold text-xl w-7 ${i===0?"text-amber-400":i===1?"text-gray-400":i===2?"text-amber-700":""}`}>{i+1}</span>
          <span className="flex-1 text-sm font-medium">{e.name}</span>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold">{e.score}</span>
        </div>
      ))}</div>
      <button onClick={reset} className="w-full mt-6 border-2 border-foreground font-bold uppercase py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-foreground hover:text-background transition-colors" style={{fontFamily:"'Barlow Condensed',sans-serif"}}><RotateCcw className="w-4 h-4"/>{t("playAgain",lang)}</button>
    </div>
  );
  if(done)return(
    <div className="flex flex-col items-center py-12 px-6 text-center">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-5"><Trophy className="w-8 h-8 text-white"/></div>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-3xl uppercase tracking-tight mb-1">{t("quizDone",lang)}</h2>
      <p className="text-muted-foreground text-sm mb-6">{t("yourScore",lang)} {score} {t("yourScorePoints",lang)}</p>
      <div className="w-full bg-card rounded-xl p-5 mb-6"><div style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-black text-5xl text-primary">{score}</div><div className="text-muted-foreground text-sm mt-1">{t("points",lang)}</div></div>
      <div className="flex gap-3 w-full">
        <button onClick={()=>setShowBoard(true)} className="flex-1 bg-primary text-white font-bold uppercase py-3 rounded-xl" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("leaderboard",lang)}</button>
        <button onClick={reset} className="flex-1 border-2 border-foreground font-bold uppercase py-3 rounded-xl" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("again",lang)}</button>
      </div>
    </div>
  );
  return(
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">{t("question",lang)} {qIdx+1} / {total}</span>
        <div className={`text-sm font-bold ${timeLeft<=5?"text-primary":""}`} style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{timeLeft}s</div>
      </div>
      <div className="h-1.5 bg-muted rounded-full mb-5 overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all duration-1000 ${timeLeft<=5?"bg-primary":"bg-foreground"}`} style={{width:`${(timeLeft/20)*100}%`}}/>
      </div>
      <div className="bg-foreground text-background rounded-xl p-5 mb-5">
        <p style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-xl leading-tight" dir={lang==="AR"?"rtl":"ltr"}>{q.question[lang]}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {q.options[lang].map((opt,i)=>{
          let cls="border-2 rounded-xl p-4 text-left font-medium text-sm transition-all ";
          if(!showResult)cls+="border-border hover:border-foreground active:scale-95";
          else if(i===q.correct)cls+="border-accent bg-accent text-white";
          else if(i===selected&&i!==q.correct)cls+="border-primary bg-primary text-white";
          else cls+="border-border opacity-50";
          return(<button key={i} onClick={()=>pick(i)} className={cls} dir={lang==="AR"?"rtl":"ltr"}><span className="block text-xs opacity-70 mb-0.5 font-bold">{String.fromCharCode(65+i)}</span>{opt}</button>);
        })}
      </div>
      {showResult&&(<div className={`rounded-xl p-4 mb-4 flex gap-3 ${selected===q.correct?"bg-accent/10 border border-accent":"bg-primary/10 border border-primary"}`}>
        {selected===q.correct?<Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"/>:<X className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"/>}
        <p className="text-sm" dir={lang==="AR"?"rtl":"ltr"}>{q.explanation[lang]}</p>
      </div>)}
      {showResult&&(<button onClick={next} className="w-full bg-primary text-white font-bold text-lg uppercase py-4 rounded-xl active:scale-95 transition-transform" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{qIdx+1<total?t("next",lang):t("results",lang)}</button>)}
    </div>
  );
}

// ─── CPR Metronome ────────────────────────────────────────────────────────────

function CPRMetronome({lang}:{lang:Lang}){
  const [running,setRunning]=useState(false);const [beat,setBeat]=useState(false);
  const [count,setCount]=useState(0);const [phase,setPhase]=useState<"compress"|"release">("compress");
  const ref=useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>{if(running){ref.current=setInterval(()=>{setBeat(b=>!b);setPhase(p=>p==="compress"?"release":"compress");setCount(c=>c+1);},CPR_MS);}else{if(ref.current)clearInterval(ref.current);}return()=>{if(ref.current)clearInterval(ref.current);};},[running]);
  const stop=()=>{setRunning(false);setBeat(false);setCount(0);setPhase("compress");};
  return(
    <div className="flex flex-col items-center px-6 py-8">
      <div className="bg-primary text-white font-bold text-2xl px-6 py-2 rounded-full tracking-wider mb-8" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{CPR_BPM} BPM</div>
      <div className="relative mb-8 flex items-center justify-center">
        <div className={`w-44 h-44 rounded-full flex items-center justify-center transition-all duration-100 ${running?beat?"bg-primary scale-110 shadow-2xl shadow-primary/40":"bg-primary/80 scale-100":"bg-muted"}`}>
          <Heart className={`transition-all duration-100 ${running?"w-20 h-20 text-white fill-white":"w-14 h-14 text-muted-foreground"}`}/>
        </div>
        {running&&beat&&(<><div className="absolute w-52 h-52 rounded-full border-4 border-primary/30 animate-ping"/><div className="absolute w-60 h-60 rounded-full border-2 border-primary/15 animate-ping" style={{animationDuration:"1.2s"}}/></>)}
      </div>
      <div className="h-12 flex items-center justify-center mb-3">
        {running?<span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className={`font-black text-4xl uppercase tracking-widest transition-colors duration-100 ${phase==="compress"?"text-primary":"text-foreground"}`}>{phase==="compress"?t("pushLabel",lang):t("releaseLabel",lang)}</span>
          :<span className="text-muted-foreground text-sm text-center">{t("cprStart",lang)}</span>}
      </div>
      {running&&(<div className="mb-6 text-center"><div style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-5xl tabular-nums">{Math.ceil(count/2)}</div><div className="text-xs text-muted-foreground mt-1">{t("compressions",lang)}</div></div>)}
      <div className="flex gap-4 mt-2">
        {!running?<button onClick={()=>setRunning(true)} className="flex items-center gap-3 bg-primary text-white font-bold text-xl uppercase px-10 py-4 rounded-xl active:scale-95 transition-transform shadow-lg shadow-primary/20" style={{fontFamily:"'Barlow Condensed',sans-serif"}}><Play className="w-6 h-6 fill-white"/>{t("start",lang)}</button>
          :<button onClick={stop} className="flex items-center gap-3 border-2 border-foreground font-bold text-xl uppercase px-10 py-4 rounded-xl active:scale-95 transition-transform" style={{fontFamily:"'Barlow Condensed',sans-serif"}}><Pause className="w-6 h-6"/>{t("stop",lang)}</button>}
      </div>
      <div className="mt-8 bg-card rounded-xl p-4 w-full flex gap-3">
        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"/>
        <p className="text-xs text-muted-foreground leading-relaxed">{t("cprDepth",lang)}</p>
      </div>
    </div>
  );
}

// ─── Escape Room ──────────────────────────────────────────────────────────────

function EscapeRoomMode({lang,userName}:{lang:Lang;userName:string}){
  const [phase,setPhase]=useState<"lobby"|"role"|"solve"|"done">("lobby");
  const [myRoleIdx]=useState(Math.floor(Math.random()*4));
  const [decIdx,setDecIdx]=useState(0);const [selected,setSelected]=useState<number|null>(null);
  const [score,setScore]=useState(0);const [timeLeft,setTimeLeft]=useState(90);
  const roles=[
    {icon:"🚨",info:{DE:"⚠️ Nahender Zug auf Gleis 3. Person liegt bewusstlos 2m vom Gleis. Strom eingeschaltet!",EN:"⚠️ Incoming train on track 3. Person unconscious 2m from track. Power on track is active!",TR:"⚠️ Hat 3'te yaklaşan tren! Kişi hat kenarında bilinçsiz.",AR:"⚠️ قطار قادم على القضيب 3. شخص فاقد الوعي على بعد 2م."}},
    {icon:"💓",info:{DE:"📊 Patient männlich ~40J. Keine Atmung. Puls schwach. Gesicht blass/zyanotisch.",EN:"📊 Patient male ~40y. No breathing. Pulse weak. Face pale/cyanotic.",TR:"📊 Hasta erkek ~40 yaş. Nefes yok. Nabız zayıf.",AR:"📊 مريض ذكر ~40 سنة. لا يوجد تنفس. نبض ضعيف."}},
    {icon:"📱",info:{DE:"📞 Du hast 112 verständigt. Leitstelle fragt: Wie viele Verletzte? Ist Weg frei für RTW?",EN:"📞 You called 112. Dispatch asks: How many injured? Is access clear for ambulance?",TR:"📞 112'yi aradın. Kaç yaralı var? Ambulans geçişi serbest mi?",AR:"📞 اتصلت بـ 112. كم عدد المصابين؟ هل الطريق واضح؟"}},
    {icon:"🩺",info:{DE:"🩺 AED-Gerät am Bahnsteig (Kasten beim Ausgang). Wer drückt, wer beatmet?",EN:"🩺 AED found on platform (box near exit). Who compresses, who breathes?",TR:"🩺 Perontta AED bulundu. Kim baskı yapar, kim nefes verir?",AR:"🩺 وُجد AED على الرصيف. من يضغط ومن يتنفس؟"}},
  ];
  const decisions=[
    {q:{DE:"Was ist die allererste Maßnahme?",EN:"What is the very first action?",TR:"İlk yapılacak şey?",AR:"الإجراء الأول؟"},options:{DE:["Sofort CPR","Eigenschutz sicherstellen","AED holen","Notruf"],EN:["Start CPR","Ensure self-protection","Get AED","Call 112"],TR:["Hemen KPR","Öz koruma","AED getir","112"],AR:["ابدأ CPR","الحماية الذاتية","احضر AED","اتصل 112"]},correct:1},
    {q:{DE:"Person reagiert nicht – was nun?",EN:"Person unresponsive – what next?",TR:"Kişi yanıt vermiyor?",AR:"الشخص لا يستجيب؟"},options:{DE:["Warten","112 + CPR beginnen","Seitenlage","Weiter beobachten"],EN:["Wait","Call 112 + start CPR","Recovery position","Keep observing"],TR:["Bekle","112 + KPR","Koma pozisyonu","Gözlemle"],AR:["انتظر","112 + CPR","وضع الإنعاش","راقب"]},correct:1},
  ];
  useEffect(()=>{if(phase!=="solve")return;if(timeLeft<=0){setPhase("done");return;}const tt=setTimeout(()=>setTimeLeft(n=>n-1),1000);return()=>clearTimeout(tt);},[timeLeft,phase]);
  const roleData=roles[myRoleIdx];
  const teamColors=["bg-blue-500","bg-red-500","bg-green-500","bg-amber-500"];
  const teamNames=["BLAU","ROT","GRÜN","GOLD"];

  if(phase==="lobby")return(
    <div className="px-5 py-6 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-4 text-3xl">🚨</div>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl uppercase tracking-tight mb-2">{t("escapeTitle",lang)}</h2>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{t("escapeSub",lang)}</p>
      <div className="w-full grid grid-cols-2 gap-3 mb-6">
        {["Sarah K.",userName.split(" ")[0]+" ("+{DE:"Du",EN:"You",TR:"Sen",AR:"أنت"}[lang]+")","Ahmed R.","Ayşe D."].map((n,i)=>(
          <div key={i} className={`${teamColors[i]} text-white rounded-xl p-3 text-sm font-medium`}>{n}</div>
        ))}
      </div>
      <div className={`${teamColors[myRoleIdx%4]} text-white rounded-xl p-4 w-full mb-6`}>
        <p className="text-xs opacity-70 mb-1">{t("yourTeam",lang)}</p>
        <p className="font-bold text-lg">Team {teamNames[myRoleIdx%4]}</p>
        <p className="text-sm opacity-80 mt-1">{t("findTeam",lang)}</p>
      </div>
      <button onClick={()=>setPhase("role")} className="w-full bg-amber-500 text-white font-bold text-lg uppercase py-4 rounded-xl active:scale-95" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("seeMyRole",lang)}</button>
    </div>
  );

  if(phase==="role")return(
    <div className="px-5 py-6">
      <div className="text-4xl text-center mb-4">{roleData.icon}</div>
      <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 mb-5">
        <p className="text-xs text-amber-600 font-bold uppercase mb-1">{t("myTask",lang)}</p>
        <p className="text-sm leading-relaxed">{roleData.info[lang]}</p>
      </div>
      <div className="bg-card rounded-xl p-4 mb-5">
        <p className="text-xs text-muted-foreground mb-1">{t("scenario",lang)}</p>
        <p className="font-medium">{lang==="DE"?"Bahnhofsunfall München":lang==="EN"?"Train Station Accident Munich":lang==="TR"?"Münih İstasyon Kazası":"حادث محطة ميونيخ"}</p>
        <p className="text-xs text-muted-foreground mt-1">{t("discussTeam",lang)}</p>
      </div>
      <button onClick={()=>setPhase("solve")} className="w-full bg-primary text-white font-bold text-lg uppercase py-4 rounded-xl active:scale-95" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("makeDecisions",lang)}</button>
    </div>
  );

  if(phase==="done")return(
    <div className="px-5 py-8 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4"><Trophy className="w-8 h-8 text-white"/></div>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl uppercase mb-2">{t("simDone",lang)}</h2>
      <p className="text-muted-foreground text-sm mb-6">{t("teamScore",lang)} <strong>{score}</strong> {t("points",lang)}</p>
      <button onClick={()=>{setPhase("lobby");setDecIdx(0);setSelected(null);setScore(0);setTimeLeft(90);}} className="border-2 border-foreground font-bold uppercase px-8 py-3 rounded-xl active:scale-95" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("again",lang)}</button>
    </div>
  );

  const dec=decisions[decIdx];
  return(
    <div className="px-5 py-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{t("decision",lang)} {decIdx+1}/{decisions.length}</span>
        <div className={`font-mono font-bold text-sm flex items-center gap-1 ${timeLeft<=20?"text-primary":""}`}><Timer className="w-3.5 h-3.5"/>{timeLeft}s</div>
      </div>
      <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all duration-1000 ${timeLeft<=20?"bg-primary":"bg-foreground"}`} style={{width:`${(timeLeft/90)*100}%`}}/>
      </div>
      <div className="bg-amber-500 text-white rounded-xl p-5 mb-5">
        <p style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-xl leading-tight">{dec.q[lang]}</p>
        <p className="text-xs text-white/70 mt-1">{t("discussTeamShort",lang)}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 mb-5">
        {dec.options[lang].map((opt,i)=>{
          let cls="border-2 rounded-xl p-4 text-left font-medium text-sm transition-all ";
          if(selected===null)cls+="border-border hover:border-amber-400 active:scale-[0.98]";
          else if(i===dec.correct)cls+="border-accent bg-accent text-white";
          else if(i===selected&&i!==dec.correct)cls+="border-primary bg-primary text-white";
          else cls+="border-border opacity-40";
          return(<button key={i} onClick={()=>{if(selected!==null)return;setSelected(i);if(i===dec.correct)setScore(s=>s+Math.max(50,Math.floor(timeLeft/2)*10));}} className={cls}><span className="font-bold text-xs opacity-60 mr-2">{String.fromCharCode(65+i)}</span>{opt}</button>);
        })}
      </div>
      {selected!==null&&(<button onClick={()=>{if(decIdx+1<decisions.length){setDecIdx(n=>n+1);setSelected(null);}else setPhase("done");}} className="w-full bg-primary text-white font-bold text-lg uppercase py-4 rounded-xl active:scale-95" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{decIdx+1<decisions.length?t("next",lang):t("evaluate",lang)}</button>)}
    </div>
  );
}

// ─── 4er-Team CPR ─────────────────────────────────────────────────────────────

function TeamCPRMode({lang,userName}:{lang:Lang;userName:string}){
  type Role="drücker"|"beatmer"|"defi"|"protokoll";
  const [role,setRole]=useState<Role|null>(null);
  const [running,setRunning]=useState(false);const [beat,setBeat]=useState(false);
  const [count,setCount]=useState(0);const [cprPhase,setCprPhase]=useState<"compress"|"release">("compress");
  const [elapsed,setElapsed]=useState(0);const [showRotate,setShowRotate]=useState(false);
  const [log,setLog]=useState<string[]>([]);
  const cprRef=useRef<ReturnType<typeof setInterval>|null>(null);const elRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const ROLES:{id:Role;lk:string;dk:string;color:string;icon:string}[]=[
    {id:"drücker",   lk:"roleCompressor",dk:"roleCompressorDesc",color:"bg-primary",   icon:"🫀"},
    {id:"beatmer",   lk:"roleBreather",  dk:"roleBreatherDesc",  color:"bg-blue-500",  icon:"💨"},
    {id:"defi",      lk:"roleDefi",      dk:"roleDefiDesc",      color:"bg-amber-500", icon:"⚡"},
    {id:"protokoll", lk:"roleProtocol",  dk:"roleProtocolDesc",  color:"bg-violet-500",icon:"📋"},
  ];

  useEffect(()=>{if(running&&role==="drücker"){cprRef.current=setInterval(()=>{setBeat(b=>!b);setCprPhase(p=>p==="compress"?"release":"compress");setCount(c=>c+1);},CPR_MS);}else{if(cprRef.current)clearInterval(cprRef.current);}return()=>{if(cprRef.current)clearInterval(cprRef.current);};},[running,role]);
  useEffect(()=>{if(running){elRef.current=setInterval(()=>{setElapsed(e=>{const ne=e+1;if(ne===120&&!showRotate)setShowRotate(true);return ne;});},1000);}else{if(elRef.current)clearInterval(elRef.current);}return()=>{if(elRef.current)clearInterval(elRef.current);};},[running,showRotate]);

  const elStr=`${String(Math.floor(elapsed/60)).padStart(2,"0")}:${String(elapsed%60).padStart(2,"0")}`;
  const myRole=ROLES.find(r=>r.id===role);

  if(!role)return(
    <div className="px-5 py-5">
      <div className="text-center mb-5">
        <p style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-xl uppercase tracking-tight mb-1">{t("teamCPRTitle",lang)}</p>
        <p className="text-xs text-muted-foreground">{t("teamCPRSub",lang)}</p>
      </div>
      <div className="flex flex-col gap-3">
        {ROLES.map(r=>(
          <button key={r.id} onClick={()=>{setRole(r.id);setLog([`[00:00] ${t("exerciseStart",lang)}`]);}}
            className={`flex items-center gap-4 p-4 rounded-xl ${r.color} text-white text-left active:scale-[0.98] transition-transform`}>
            <span className="text-3xl">{r.icon}</span>
            <div><p className="font-bold">{t(r.lk,lang)}</p><p className="text-xs text-white/80 mt-0.5">{t(r.dk,lang)}</p></div>
          </button>
        ))}
      </div>
    </div>
  );

  if(showRotate)return(
    <div className="fixed inset-0 z-50 bg-amber-500 flex flex-col items-center justify-center px-6 text-center" style={{maxWidth:430,margin:"0 auto"}}>
      <div className="text-6xl mb-4 animate-bounce">🔄</div>
      <h2 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-black text-4xl uppercase text-white mb-3">{t("rotateTitle",lang)}</h2>
      <p className="text-white/80 text-sm mb-8">{t("rotateSub",lang)}</p>
      <div className="bg-white/20 rounded-xl p-4 w-full mb-6">
        <p className="text-white text-sm font-bold">{t("newRole",lang)}</p>
        <p className="text-white font-bold text-2xl mt-1" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t(ROLES[(ROLES.findIndex(r=>r.id===role)+1)%4].lk,lang)}</p>
      </div>
      <button onClick={()=>{const ni=(ROLES.findIndex(r=>r.id===role)+1)%4;setRole(ROLES[ni].id);setShowRotate(false);setElapsed(0);setCount(0);if(ROLES[ni].id!=="defi")setRunning(true);}}
        className="w-full bg-white text-amber-500 font-bold text-xl uppercase py-4 rounded-xl active:scale-95" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("readyNewPos",lang)}</button>
    </div>
  );

  return(
    <div className="flex flex-col">
      <div className={`${myRole?.color} text-white px-5 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2"><span className="text-xl">{myRole?.icon}</span><span className="font-bold text-sm">{t(myRole?.lk??"",lang)}</span></div>
        <div className="font-mono text-sm font-bold">{elStr}</div>
      </div>
      <div className="px-5 py-5">
        {role==="drücker"&&(
          <div className="flex flex-col items-center">
            <div className="relative mb-5 flex items-center justify-center">
              <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-100 ${running?beat?"bg-primary scale-110 shadow-2xl shadow-primary/40":"bg-primary/80":"bg-muted"}`}>
                <Heart className={`w-16 h-16 transition-all duration-100 ${running?"text-white fill-white":"text-muted-foreground"}`}/>
              </div>
              {running&&beat&&<div className="absolute w-48 h-48 rounded-full border-4 border-primary/30 animate-ping"/>}
            </div>
            {running&&<span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className={`font-black text-4xl uppercase mb-4 ${cprPhase==="compress"?"text-primary":"text-foreground"}`}>{cprPhase==="compress"?t("pushLabel",lang):t("releaseLabel",lang)}</span>}
            <div className="text-center mb-4"><div style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-5xl">{Math.ceil(count/2)}</div><div className="text-xs text-muted-foreground">{t("compressions",lang)} · 110 BPM</div></div>
            <div className="flex gap-3">
              {!running?<button onClick={()=>setRunning(true)} className="bg-primary text-white font-bold text-xl uppercase px-8 py-4 rounded-xl flex items-center gap-2" style={{fontFamily:"'Barlow Condensed',sans-serif"}}><Play className="w-6 h-6 fill-white"/>{t("start",lang)}</button>
                :<button onClick={()=>setRunning(false)} className="border-2 border-foreground font-bold text-xl uppercase px-8 py-4 rounded-xl flex items-center gap-2" style={{fontFamily:"'Barlow Condensed',sans-serif"}}><Pause className="w-6 h-6"/>{t("stop",lang)}</button>}
            </div>
          </div>
        )}
        {role==="beatmer"&&(
          <div className="flex flex-col items-center">
            <div className="text-6xl mb-4">💨</div>
            <div className="bg-blue-500 text-white rounded-2xl p-6 w-full text-center mb-5">
              <p className="text-5xl font-bold mb-2" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{30-(count%30)}</p>
              <p className="text-sm opacity-80">{t("compressionsToBreathe",lang)}</p>
            </div>
            <div className="flex gap-1 w-full mb-2">{Array.from({length:30},(_,i)=><div key={i} className={`flex-1 h-3 rounded-sm ${i<(count%30)?"bg-blue-500":"bg-muted"}`}/>)}</div>
            <p className="text-xs text-muted-foreground">{t("totalBreaths",lang)} {Math.floor(count/30)}</p>
          </div>
        )}
        {role==="defi"&&(
          <div className="flex flex-col items-center py-4">
            <div className="text-6xl mb-5">⚡</div>
            <p className="text-center text-muted-foreground text-sm mb-8 px-4">{t("defiSub",lang)}</p>
            <button onClick={()=>{setRunning(false);setShowRotate(true);setLog(l=>[...l,`[${elStr}] ⚡ ${t("defiButtonLabel",lang).replace("\n"," ")}`]);}}
              className="w-full bg-amber-500 text-white font-bold text-2xl uppercase py-8 rounded-2xl active:scale-95 transition-transform shadow-xl shadow-amber-500/30" style={{fontFamily:"'Barlow Condensed',sans-serif",whiteSpace:"pre-line"}}>
              {t("defiButtonLabel",lang)}
            </button>
            <p className="text-xs text-muted-foreground mt-4">{t("defiNote",lang)}</p>
          </div>
        )}
        {role==="protokoll"&&(
          <div>
            <div className="bg-violet-500 text-white rounded-xl p-4 mb-4 flex items-center justify-between">
              <div><p className="text-xs opacity-70">{t("dispatch",lang)}</p><p style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-3xl">{elStr}</p></div>
              <div className="text-right"><p className="text-xs opacity-70">{t("nextRotation",lang)}</p><p style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-xl">{String(Math.floor((120-(elapsed%120))/60)).padStart(2,"0")}:{String((120-(elapsed%120))%60).padStart(2,"0")}</p></div>
            </div>
            {!running?<button onClick={()=>{setRunning(true);setLog([`[00:00] ${t("exerciseStart",lang)}`]);}} className="w-full bg-violet-500 text-white font-bold text-lg uppercase py-4 rounded-xl mb-4" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("exerciseStart",lang)}</button>
              :<button onClick={()=>{setRunning(false);setLog(l=>[...l,`[${elStr}] ${t("exerciseDone",lang)}`]);}} className="w-full border-2 border-violet-500 text-violet-500 font-bold text-lg uppercase py-3 rounded-xl mb-4" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("stop",lang)}</button>}
            <div className="bg-card rounded-xl p-4 max-h-40 overflow-y-auto">
              <p className="text-xs text-muted-foreground font-medium uppercase mb-2">{t("log",lang)}</p>
              {log.length===0?<p className="text-xs text-muted-foreground">{t("noLogEntries",lang)}</p>:log.map((e,i)=><p key={i} className="text-xs font-mono py-0.5 border-b border-border last:border-0">{e}</p>)}
            </div>
          </div>
        )}
      </div>
      <div className="px-5 pb-4"><button onClick={()=>{setRole(null);setRunning(false);setElapsed(0);setCount(0);setShowRotate(false);}} className="text-xs text-muted-foreground underline">{t("switchRole",lang)}</button></div>
    </div>
  );
}

// ─── In-Class Mode ────────────────────────────────────────────────────────────

function InClassMode({lang,checkedIn,setCheckedIn,userName,allDone,onShowReview}:{lang:Lang;checkedIn:boolean;setCheckedIn:(v:boolean)=>void;userName:string;allDone:boolean;onShowReview:()=>void}){
  const [tab,setTab]=useState<InTab>("qr");
  const tabs=[
    {id:"qr"     as InTab,lk:"tabCheckin", icon:QrCode},
    {id:"quiz"   as InTab,lk:"tabLiveQuiz",icon:Zap},
    {id:"cpr"    as InTab,lk:"tabCPR",     icon:Heart},
    {id:"escape" as InTab,lk:"tabEscape",  icon:Shield},
    {id:"team"   as InTab,lk:"tabTeamCPR", icon:Users},
  ];
  return(
    <div>
      {!checkedIn&&tab!=="qr"&&<div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0"/><p className="text-xs text-amber-700">{t("scanFirst",lang)}</p></div>}
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map(tt=>(
          <button key={tt.id} onClick={()=>setTab(tt.id)} disabled={!checkedIn&&tt.id!=="qr"}
            className={`flex-shrink-0 flex flex-col items-center px-3 py-3 gap-0.5 text-xs font-medium transition-colors border-b-2 ${tab===tt.id?"border-primary text-primary":"border-transparent text-muted-foreground"} disabled:opacity-30`}>
            <tt.icon className="w-4 h-4"/>{t(tt.lk,lang)}
          </button>
        ))}
      </div>
      {tab==="qr"     && <QRCheckin lang={lang} checkedIn={checkedIn} setCheckedIn={setCheckedIn} userName={userName}/>}
      {tab==="quiz"   && <LiveQuiz lang={lang}/>}
      {tab==="cpr"    && <CPRMetronome lang={lang}/>}
      {tab==="escape" && <EscapeRoomMode lang={lang} userName={userName}/>}
      {tab==="team"   && <TeamCPRMode lang={lang} userName={userName}/>}
      {checkedIn&&tab==="qr"&&allDone&&(
        <div className="mx-5 mt-4 bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center gap-3">
          <Star className="w-6 h-6 text-amber-500 flex-shrink-0 fill-amber-500"/>
          <div className="flex-1"><p className="text-sm font-medium">{t("courseCompleteReview",lang)}</p><p className="text-xs text-muted-foreground">{t("leaveReview",lang)}</p></div>
          <button onClick={onShowReview} className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95">{t("rate",lang)}</button>
        </div>
      )}
    </div>
  );
}

// ─── Community ────────────────────────────────────────────────────────────────

function CommunityMode({lang,userName}:{lang:Lang;userName:string}){
  const [tab,setTab]=useState<ComTab>("feed");
  const [friends,setFriends]=useState(MOCK_FRIENDS);
  const [search,setSearch]=useState("");const [activeChat,setActiveChat]=useState<typeof MOCK_MESSAGES[0]|null>(null);
  const [chatInput,setChatInput]=useState("");const [chatMessages,setChatMessages]=useState(MOCK_CHAT);
  const [likedPosts,setLikedPosts]=useState<number[]>([]);
  const toggleConnect=(id:number)=>setFriends(p=>p.map(f=>f.id===id?{...f,connected:!f.connected}:f));
  const sendMessage=()=>{if(!chatInput.trim())return;setChatMessages(p=>[...p,{from:"me",text:{DE:chatInput,EN:chatInput,TR:chatInput,AR:chatInput},time:"—"}]);setChatInput("");};

  if(activeChat)return(
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button onClick={()=>setActiveChat(null)} className="text-muted-foreground"><ArrowLeft className="w-5 h-5"/></button>
        <Avatar initials={activeChat.avatar} color={AVATAR_COLORS[0]}/>
        <div><p className="font-medium text-sm">{activeChat.from}</p><p className="text-xs text-accent">Online</p></div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {chatMessages.map((m,i)=>(
          <div key={i} className={`flex ${m.from==="me"?"justify-end":"justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.from==="me"?"bg-primary text-white rounded-br-sm":"bg-card text-foreground rounded-bl-sm"}`}>
              <p>{m.text[lang]}</p><p className={`text-xs mt-1 ${m.from==="me"?"text-white/60":"text-muted-foreground"}`}>{m.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 px-4 py-3 border-t border-border">
        <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder={t("typeMessage",lang)} className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm outline-none"/>
        <button onClick={sendMessage} className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0"><Send className="w-4 h-4 text-white"/></button>
      </div>
    </div>
  );

  return(
    <div className="flex flex-col">
      <div className="flex border-b border-border">
        {[{id:"feed"as ComTab,lk:"tabFeed",icon:BookOpen},{id:"friends"as ComTab,lk:"tabContacts",icon:Users},{id:"messages"as ComTab,lk:"tabMessages",icon:MessageCircle}].map(tt=>(
          <button key={tt.id} onClick={()=>setTab(tt.id)} className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors border-b-2 ${tab===tt.id?"border-primary text-primary":"border-transparent text-muted-foreground"}`}>
            <tt.icon className="w-4 h-4"/>{t(tt.lk,lang)}
          </button>
        ))}
      </div>
      {tab==="feed"&&(
        <div className="divide-y divide-border">
          {MOCK_FEED_POSTS.map(post=>(
            <div key={post.id} className="px-5 py-4">
              <div className="flex items-start gap-3 mb-3">
                <Avatar initials={post.avatar} color={AVATAR_COLORS[post.id%AVATAR_COLORS.length]}/>
                <div className="flex-1"><div className="flex items-center gap-1.5"><span className="font-medium text-sm">{post.name}</span>{post.verified&&<BadgeCheck className="w-4 h-4 text-primary"/>}</div><p className="text-xs text-muted-foreground">{post.time[lang]}</p></div>
              </div>
              <p className="text-sm leading-relaxed mb-3">{post.text[lang]}</p>
              <div className="flex items-center gap-4">
                <button onClick={()=>setLikedPosts(p=>p.includes(post.id)?p.filter(x=>x!==post.id):[...p,post.id])} className={`flex items-center gap-1.5 text-sm transition-colors ${likedPosts.includes(post.id)?"text-primary":"text-muted-foreground"}`}>
                  <ThumbsUp className={`w-4 h-4 ${likedPosts.includes(post.id)?"fill-primary":""}`}/><span>{post.likes+(likedPosts.includes(post.id)?1:0)}</span>
                </button>
                <button className="flex items-center gap-1.5 text-muted-foreground text-sm"><MessageCircle className="w-4 h-4"/><span>{post.comments}</span></button>
                <button className="flex items-center gap-1.5 text-muted-foreground text-sm ml-auto"><Share2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {tab==="friends"&&(
        <div>
          <div className="px-5 py-3 border-b border-border">
            <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t("searchPeople",lang)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"/>
            </div>
          </div>
          <div className="px-5 py-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">{t("connected",lang)} · {friends.filter(f=>f.connected).length}</p>
            <div className="space-y-3">
              {friends.filter(f=>f.connected&&f.name.toLowerCase().includes(search.toLowerCase())).map((f,i)=>(
                <div key={f.id} className="flex items-center gap-3">
                  <Avatar initials={f.avatar} color={AVATAR_COLORS[i%AVATAR_COLORS.length]}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1"><p className="font-medium text-sm">{f.name}</p>{f.verified&&<BadgeCheck className="w-3.5 h-3.5 text-primary"/>}</div>
                    <p className="text-xs text-muted-foreground truncate">{f.role[lang]}</p>
                    <div className="mt-1 flex items-center gap-2"><div className="flex-1 h-1 bg-muted rounded-full max-w-20"><div className="h-1 bg-accent rounded-full" style={{width:`${f.progress}%`}}/></div><span className="text-xs text-muted-foreground">{f.progress}%</span></div>
                  </div>
                  <button onClick={()=>toggleConnect(f.id)} className="text-xs border border-border text-muted-foreground px-3 py-1.5 rounded-full hover:border-primary hover:text-primary transition-colors">{t("remove",lang)}</button>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">{t("suggestions",lang)}</p>
            <div className="space-y-3">
              {friends.filter(f=>!f.connected&&f.name.toLowerCase().includes(search.toLowerCase())).map((f,i)=>(
                <div key={f.id} className="flex items-center gap-3">
                  <Avatar initials={f.avatar} color={AVATAR_COLORS[(i+3)%AVATAR_COLORS.length]}/>
                  <div className="flex-1 min-w-0"><p className="font-medium text-sm">{f.name}</p><p className="text-xs text-muted-foreground truncate">{f.role[lang]}</p></div>
                  <button onClick={()=>toggleConnect(f.id)} className="text-xs bg-primary text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 active:scale-95 transition-transform"><UserPlus className="w-3 h-3"/>{t("connect",lang)}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab==="messages"&&(
        <div className="divide-y divide-border">
          {MOCK_MESSAGES.map((msg,i)=>(
            <button key={msg.id} onClick={()=>setActiveChat(msg)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors text-left">
              <div className="relative">
                <Avatar initials={msg.avatar} color={AVATAR_COLORS[i%AVATAR_COLORS.length]}/>
                {msg.unread>0&&<div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">{msg.unread}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{typeof msg.from==="string"?msg.from:(msg.from as Record<Lang,string>)[lang]}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{msg.last[lang]}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{typeof msg.time==="string"?msg.time:(msg.time as Record<Lang,string>)[lang]}</span>
            </button>
          ))}
          <div className="p-5"><button className="w-full border-2 border-dashed border-border rounded-xl py-4 text-sm text-muted-foreground flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors"><MessageCircle className="w-4 h-4"/>{t("newMessage",lang)}</button></div>
        </div>
      )}
    </div>
  );
}

// ─── Settings Panels ──────────────────────────────────────────────────────────

function SettingsPanel({ title, onBack, children }: { title: string; onBack: ()=>void; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary px-5 pt-12 pb-5 text-white flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-white/70 mb-3 text-sm"><ArrowLeft className="w-4 h-4"/>Zurück</button>
        <h1 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl uppercase tracking-tight">{title}</h1>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

const NOTIF_KEY = "eh_notif_v1";
function loadNotifSettings() {
  try { const s = localStorage.getItem(NOTIF_KEY); if (s) return JSON.parse(s); } catch { /* */ }
  return { push:true, quiz:true, reminder:false, sound:true, badges:true, reminderTime:"18:00" };
}

function Toggle({ on, onToggle }: { on:boolean; onToggle:()=>void }) {
  return (
    <button onClick={onToggle} className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${on?"bg-primary":"bg-muted"}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on?"translate-x-6":"translate-x-0.5"}`}/>
    </button>
  );
}

function NotificationsSettings({ lang, onBack }: { lang: Lang; onBack: ()=>void }) {
  const [settings, setSettings] = useState(loadNotifSettings);
  const save = (key: string, val: boolean | string) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  };

  const items: { k: string; icon: string; label: Record<Lang,string>; sub: Record<Lang,string> }[] = [
    { k:"push",    icon:"🔔", label:{DE:"Push-Benachrichtigungen",EN:"Push Notifications",TR:"Anlık Bildirimler",AR:"إشعارات فورية"}, sub:{DE:"Alle App-Benachrichtigungen",EN:"All app notifications",TR:"Tüm uygulama bildirimleri",AR:"جميع إشعارات التطبيق"} },
    { k:"quiz",    icon:"⚡", label:{DE:"Live Quiz-Alarm",EN:"Live Quiz Alert",TR:"Canlı Quiz Uyarısı",AR:"تنبيه الاختبار المباشر"}, sub:{DE:"Wenn Ausbilder ein Quiz startet",EN:"When instructor starts a quiz",TR:"Eğitmen quiz başlattığında",AR:"عند بدء اختبار مباشر"} },
    { k:"reminder",icon:"📅", label:{DE:"Lern-Erinnerungen",EN:"Study Reminders",TR:"Hatırlatıcılar",AR:"تذكيرات الدراسة"}, sub:{DE:"Täglich zur eingestellten Uhrzeit",EN:"Daily at set time",TR:"Her gün belirlenen saatte",AR:"يومياً في الوقت المحدد"} },
    { k:"badges",  icon:"🏅", label:{DE:"Abzeichen-Nachrichten",EN:"Badge Alerts",TR:"Rozet Bildirimleri",AR:"إشعارات الشارات"}, sub:{DE:"Wenn du ein Abzeichen erhältst",EN:"When you earn a badge",TR:"Rozet kazandığında",AR:"عند كسب شارة"} },
    { k:"sound",   icon:"🔊", label:{DE:"Ton & Vibration",EN:"Sound & Vibration",TR:"Ses ve Titreşim",AR:"الصوت والاهتزاز"}, sub:{DE:"Für CPR-Taktgeber und Alarme",EN:"For CPR metronome and alerts",TR:"CPR ve alarmlar için",AR:"لإيقاع CPR والتنبيهات"} },
  ];

  return (
    <SettingsPanel title={t("settingsNotif", lang)} onBack={onBack}>
      <div className="divide-y divide-border">
        {items.map(item => (
          <div key={item.k} className="flex items-center gap-4 px-5 py-4">
            <span className="text-2xl flex-shrink-0">{item.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.label[lang]}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.sub[lang]}</p>
            </div>
            <Toggle on={!!(settings as any)[item.k]} onToggle={() => save(item.k, !(settings as any)[item.k])}/>
          </div>
        ))}
      </div>
      {settings.reminder && (
        <div className="px-5 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            {lang==="DE"?"Erinnerungszeit":lang==="EN"?"Reminder Time":lang==="TR"?"Hatırlatma Saati":"وقت التذكير"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {["08:00","12:00","18:00","20:00"].map(h => (
              <button key={h} onClick={() => save("reminderTime", h)}
                className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${settings.reminderTime===h?"border-primary bg-primary/5 text-primary":"border-border hover:border-primary/40"}`}>{h}</button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {lang==="DE"?`Nächste Erinnerung: heute, ${settings.reminderTime} Uhr`:`Next: today at ${settings.reminderTime}`}
          </p>
        </div>
      )}
      <div className="px-5 pb-5 pt-2">
        <div className="bg-muted/50 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang==="DE"?"Push-Benachrichtigungen müssen auch in den Systemeinstellungen deines Geräts aktiviert sein.":lang==="EN"?"Push notifications must also be enabled in your device system settings.":lang==="TR"?"Anlık bildirimler cihaz sistem ayarlarında da etkinleştirilmelidir.":"يجب تفعيل الإشعارات في إعدادات جهازك أيضاً."}
          </p>
        </div>
      </div>
    </SettingsPanel>
  );
}

function AppSettingsScreen({ lang, onBack, currentLang, onLangChange, darkMode, setDarkMode, fontSize, setFontSize, autoplay, setAutoplay, onClearCache }: {
  lang: Lang; onBack: ()=>void; currentLang: Lang; onLangChange: (l:Lang)=>void;
  darkMode: boolean; setDarkMode: (v:boolean)=>void;
  fontSize: "small"|"medium"|"large"; setFontSize: (v:"small"|"medium"|"large")=>void;
  autoplay: boolean; setAutoplay: (v:boolean)=>void;
  onClearCache: ()=>void;
}) {
  const [offlineMode, setOfflineMode] = useState(() => localStorage.getItem("eh_offline")==="true");
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem("eh_reduced_motion")==="true");
  const [cleared, setCleared] = useState(false);

  const handleClear = () => { onClearCache(); setCleared(true); setTimeout(()=>setCleared(false), 2500); };

  return (
    <SettingsPanel title={t("settingsApp", lang)} onBack={onBack}>
      <div className="px-5 py-5 flex flex-col gap-6">

        {/* Language */}
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            {lang==="DE"?"App-Sprache":lang==="EN"?"App Language":lang==="TR"?"Uygulama Dili":"لغة التطبيق"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => { onLangChange(l.code); localStorage.setItem("eh_lang", l.code); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all active:scale-95 ${currentLang===l.code?"border-primary bg-primary/5":"border-border hover:border-primary/40"}`}>
                <span className="text-2xl">{l.flag}</span>
                <span className="text-sm font-medium">{l.label}</span>
                {currentLang===l.code && <Check className="w-4 h-4 text-primary ml-auto"/>}
              </button>
            ))}
          </div>
        </div>

        {/* Appearance toggles */}
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            {lang==="DE"?"Darstellung":lang==="EN"?"Appearance":lang==="TR"?"Görünüm":"المظهر"}
          </p>
          <div className="bg-card rounded-xl divide-y divide-border overflow-hidden">
            {[
              { label:{DE:"Dunkelmodus",EN:"Dark Mode",TR:"Karanlık Mod",AR:"الوضع الداكن"}, sub:{DE:"Dunkles Design aktivieren",EN:"Enable dark theme",TR:"Karanlık temayı etkinleştir",AR:"تفعيل السمة الداكنة"}, icon:"🌙", val:darkMode, set:(v:boolean)=>{setDarkMode(v);localStorage.setItem("eh_dark",String(v));} },
              { label:{DE:"Reduzierte Bewegung",EN:"Reduced Motion",TR:"Azaltılmış Hareket",AR:"حركة مخفضة"}, sub:{DE:"Weniger Animationen für bessere Lesbarkeit",EN:"Fewer animations for better readability",TR:"Daha iyi okunabilirlik için az animasyon",AR:"حركات أقل لقراءة أفضل"}, icon:"✨", val:reducedMotion, set:(v:boolean)=>{setReducedMotion(v);localStorage.setItem("eh_reduced_motion",String(v));} },
            ].map((item,i)=>(
              <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1"><p className="text-sm font-medium">{item.label[lang]}</p><p className="text-xs text-muted-foreground">{item.sub[lang]}</p></div>
                <Toggle on={item.val} onToggle={() => item.set(!item.val)}/>
              </div>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            {lang==="DE"?"Schriftgröße":lang==="EN"?"Font Size":lang==="TR"?"Yazı Boyutu":"حجم الخط"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["small","medium","large"] as const).map(sz=>(
              <button key={sz} onClick={()=>{setFontSize(sz);localStorage.setItem("eh_fontsize",sz);}}
                className={`py-3 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center gap-1 ${fontSize===sz?"border-primary bg-primary/5":"border-border hover:border-primary/40"}`}>
                <span className={`font-semibold ${sz==="small"?"text-xs":sz==="large"?"text-base":"text-sm"}`}>Aa</span>
                <span className="text-xs text-muted-foreground">{sz==="small"?(lang==="DE"?"Klein":"Small"):sz==="medium"?(lang==="DE"?"Mittel":"Medium"):(lang==="DE"?"Groß":"Large")}</span>
                {fontSize===sz && <div className="w-1.5 h-1.5 bg-primary rounded-full"/>}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {lang==="DE"?"Vorschau: aktuell ":"Preview: currently "}<strong>{fontSize==="small"?(lang==="DE"?"Klein":"Small"):fontSize==="large"?(lang==="DE"?"Groß":"Large"):(lang==="DE"?"Mittel":"Medium")}</strong>
          </p>
        </div>

        {/* Feed & Media */}
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            {lang==="DE"?"Feed & Medien":lang==="EN"?"Feed & Media":lang==="TR"?"Feed ve Medya":"الخلاصة والوسائط"}
          </p>
          <div className="bg-card rounded-xl divide-y divide-border overflow-hidden">
            {[
              { label:{DE:"Videos automatisch abspielen",EN:"Autoplay Videos",TR:"Videoları Otomatik Oynat",AR:"تشغيل الفيديو تلقائياً"}, sub:{DE:"Im TikTok-Feed automatisch starten",EN:"Auto-start videos in feed",TR:"Feede otomatik başlat",AR:"تشغيل تلقائي في الخلاصة"}, icon:"▶️", val:autoplay, set:(v:boolean)=>{setAutoplay(v);localStorage.setItem("eh_autoplay",String(v));} },
              { label:{DE:"Offline-Modus",EN:"Offline Mode",TR:"Çevrimdışı Mod",AR:"الوضع غير المتصل"}, sub:{DE:"Inhalte für Offline-Nutzung zwischenspeichern",EN:"Cache content for offline use",TR:"İçerikleri çevrimdışı kaydet",AR:"تخزين المحتوى للاستخدام دون اتصال"}, icon:"📥", val:offlineMode, set:(v:boolean)=>{setOfflineMode(v);localStorage.setItem("eh_offline",String(v));} },
            ].map((item,i)=>(
              <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1"><p className="text-sm font-medium">{item.label[lang]}</p><p className="text-xs text-muted-foreground">{item.sub[lang]}</p></div>
                <Toggle on={item.val} onToggle={() => item.set(!item.val)}/>
              </div>
            ))}
          </div>
        </div>

        {/* Cache */}
        <div className="bg-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium">{lang==="DE"?"Cache leeren":lang==="EN"?"Clear Cache":lang==="TR"?"Önbelleği Temizle":"مسح ذاكرة التخزين"}</p>
              <p className="text-xs text-muted-foreground">{lang==="DE"?"Gespeicherte Offline-Daten":lang==="EN"?"Cached offline data":lang==="TR"?"Önbellekteki veri":"البيانات المخزنة"}: {cleared?"0 MB":"48 MB"}</p>
            </div>
            <button onClick={handleClear} className={`text-xs font-medium border px-3 py-1.5 rounded-lg transition-all active:scale-95 ${cleared?"border-accent text-accent bg-accent/5":"border-primary/30 text-primary hover:bg-primary/5"}`}>
              {cleared?(lang==="DE"?"✓ Geleert":lang==="EN"?"✓ Cleared":lang==="TR"?"✓ Temizlendi":"✓ تم"):(lang==="DE"?"Leeren":lang==="EN"?"Clear":lang==="TR"?"Temizle":"مسح")}
            </button>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={`h-1.5 bg-primary rounded-full transition-all duration-700 ${cleared?"w-0":"w-[35%]"}`}/>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{cleared?"0":"48"} MB / 150 MB</p>
        </div>

        {/* Reset progress */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
          <p className="text-sm font-medium text-destructive mb-1">
            {lang==="DE"?"Lernfortschritt zurücksetzen":lang==="EN"?"Reset Learning Progress":lang==="TR"?"Öğrenme İlerlemesini Sıfırla":"إعادة تعيين تقدم التعلم"}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {lang==="DE"?"Alle Kapitel, Punkte und Abzeichen werden gelöscht.":lang==="EN"?"All chapters, points and badges will be deleted.":lang==="TR"?"Tüm bölümler, puanlar ve rozetler silinecek.":"سيتم حذف جميع الفصول والنقاط والشارات."}
          </p>
          <button onClick={()=>{ if(window.confirm(lang==="DE"?"Wirklich zurücksetzen? Dies kann nicht rückgängig gemacht werden.":lang==="EN"?"Really reset? This cannot be undone.":lang==="TR"?"Gerçekten sıfırlanacak mı? Geri alınamaz.":"هل تريد إعادة التعيين؟ لا يمكن التراجع.")){ localStorage.removeItem(PROGRESS_KEY); window.location.reload(); } }}
            className="w-full border-2 border-destructive text-destructive text-sm font-medium py-2.5 rounded-xl hover:bg-destructive/10 transition-colors active:scale-95">
            {lang==="DE"?"🗑 Zurücksetzen":lang==="EN"?"🗑 Reset":lang==="TR"?"🗑 Sıfırla":"🗑 إعادة تعيين"}
          </button>
        </div>
      </div>
    </SettingsPanel>
  );
}

function PrivacyScreen({ lang, onBack }: { lang: Lang; onBack: ()=>void }) {
  const sections = [
    {
      title: { DE: "Datenschutzrichtlinie", EN: "Privacy Policy", TR: "Gizlilik Politikası", AR: "سياسة الخصوصية" },
      content: { DE: "Wir erheben nur die Daten, die für den Betrieb der App notwendig sind. Deine Lernfortschritte werden lokal auf deinem Gerät gespeichert. Personenbezogene Daten wie Name und E-Mail werden ausschließlich zur Kontoverwaltung verwendet.", EN: "We only collect data necessary for the app to operate. Your learning progress is stored locally on your device. Personal data such as name and email are used solely for account management.", TR: "Yalnızca uygulamanın çalışması için gerekli verileri topluyoruz. Öğrenme ilerlemeniz cihazınızda yerel olarak saklanır.", AR: "نجمع فقط البيانات الضرورية لتشغيل التطبيق. يتم تخزين تقدمك في التعلم محلياً على جهازك." },
    },
    {
      title: { DE: "Nutzungsbedingungen", EN: "Terms of Service", TR: "Kullanım Şartları", AR: "شروط الاستخدام" },
      content: { DE: "Die App darf ausschließlich für Lernzwecke im Rahmen der Erste-Hilfe-Ausbildung genutzt werden. Die Inhalte ersetzen keine professionelle medizinische Ausbildung.", EN: "The app may only be used for learning purposes within first aid training. The content does not replace professional medical training.", TR: "Uygulama yalnızca ilk yardım eğitimi kapsamında öğrenme amaçlı kullanılabilir.", AR: "يمكن استخدام التطبيق فقط لأغراض التعلم في إطار تدريب الإسعافات الأولية." },
    },
    {
      title: { DE: "Deine Rechte", EN: "Your Rights", TR: "Haklarınız", AR: "حقوقك" },
      content: { DE: "Du hast das Recht auf Auskunft, Berichtigung und Löschung deiner Daten. Kontaktiere uns unter: datenschutz@erstehilfe.app", EN: "You have the right to access, correct, and delete your data. Contact us at: privacy@firstaid.app", TR: "Verilerinize erişme, düzeltme ve silme hakkına sahipsiniz.", AR: "لديك الحق في الوصول إلى بياناتك وتصحيحها وحذفها." },
    },
  ];

  return (
    <SettingsPanel title={t("settingsPrivacy", lang)} onBack={onBack}>
      <div className="px-5 py-5 flex flex-col gap-5">
        {sections.map((s, i) => (
          <div key={i} className="bg-card rounded-xl p-4">
            <h3 className="font-medium text-sm mb-2">{s.title[lang]}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.content[lang]}</p>
          </div>
        ))}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"/>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang === "DE" ? "Stand: Juni 2025 · Bei Fragen: info@erstehilfe.app" : lang === "EN" ? "Last updated: June 2025 · Questions: info@firstaid.app" : lang === "TR" ? "Güncelleme: Haziran 2025" : "آخر تحديث: يونيو 2025"}
          </p>
        </div>
      </div>
    </SettingsPanel>
  );
}

function PaymentLicenseScreen({ lang, onBack, school, onLicense }: { lang: Lang; onBack: ()=>void; school: SchoolTheme|null; onLicense: ()=>void }) {
  return (
    <SettingsPanel title={t("settingsPayment", lang)} onBack={onBack}>
      <div className="px-5 py-5 flex flex-col gap-4">
        {/* License status */}
        <div className="bg-accent/10 border-2 border-accent rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-accent flex-shrink-0"/>
          <div>
            <p className="font-medium text-sm text-accent">{lang === "DE" ? "Lizenz aktiv" : lang === "EN" ? "License active" : lang === "TR" ? "Lisans etkin" : "الترخيص نشط"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{lang === "DE" ? "Einmalig 5,00 € bezahlt · kein Ablaufdatum" : lang === "EN" ? "One-time 5.00 € paid · no expiry" : lang === "TR" ? "Tek seferlik 5,00 € ödendi · süresiz" : "5.00 € مدفوعة لمرة واحدة · بدون انتهاء"}</p>
          </div>
        </div>

        {/* School */}
        <div className="bg-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            {lang === "DE" ? "Verknüpfte Schule" : lang === "EN" ? "Linked School" : lang === "TR" ? "Bağlı Okul" : "المدرسة المرتبطة"}
          </p>
          {school ? (
            <div className="flex items-center gap-3">
              <span className="text-3xl">{school.emoji}</span>
              <div>
                <p className="font-medium">{school.name}</p>
                <p className="text-xs text-muted-foreground">{lang === "DE" ? "Schule erkannt via Lizenzcode" : "School detected via license code"}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{lang === "DE" ? "Keine Schule verknüpft" : lang === "EN" ? "No school linked" : lang === "TR" ? "Okul bağlı değil" : "لا توجد مدرسة مرتبطة"}</p>
          )}
          <button onClick={onLicense} className="mt-3 w-full border-2 border-border text-sm font-medium py-2.5 rounded-xl hover:border-primary transition-colors flex items-center justify-center gap-2">
            <Key className="w-4 h-4"/>
            {lang === "DE" ? "Schulcode eingeben / wechseln" : lang === "EN" ? "Enter / change school code" : lang === "TR" ? "Okul kodunu gir / değiştir" : "أدخل / غيّر رمز المدرسة"}
          </button>
        </div>

        {/* Transaction */}
        <div className="bg-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            {lang === "DE" ? "Transaktion" : lang === "EN" ? "Transaction" : lang === "TR" ? "İşlem" : "المعاملة"}
          </p>
          {[
            { label: lang === "DE" ? "Betrag" : lang === "EN" ? "Amount" : lang === "TR" ? "Tutar" : "المبلغ", value: "5,00 €" },
            { label: lang === "DE" ? "Datum" : lang === "EN" ? "Date" : lang === "TR" ? "Tarih" : "التاريخ", value: new Date().toLocaleDateString(lang === "DE" ? "de-DE" : lang === "TR" ? "tr-TR" : lang === "AR" ? "ar" : "en-GB") },
            { label: lang === "DE" ? "Methode" : lang === "EN" ? "Method" : lang === "TR" ? "Yöntem" : "الطريقة", value: "PayPal" },
            { label: lang === "DE" ? "Status" : "Status", value: lang === "DE" ? "✓ Bestätigt" : lang === "EN" ? "✓ Confirmed" : lang === "TR" ? "✓ Onaylandı" : "✓ مؤكد" },
          ].map(r => (
            <div key={r.label} className="flex justify-between py-2 border-b border-border last:border-0 text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-medium">{r.value}</span>
            </div>
          ))}
        </div>

        {/* Refund */}
        <div className="bg-card rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            {lang === "DE" ? "14 Tage Rückgaberecht · Noch 8 Tage" : lang === "EN" ? "14-day return policy · 8 days remaining" : lang === "TR" ? "14 günlük iade hakkı · 8 gün kaldı" : "سياسة الإرجاع 14 يوماً · متبقي 8 أيام"}
          </p>
          <button className="text-xs text-primary font-medium underline">
            {lang === "DE" ? "Rückerstattung beantragen" : lang === "EN" ? "Request refund" : lang === "TR" ? "İade talep et" : "طلب استرداد"}
          </button>
        </div>
      </div>
    </SettingsPanel>
  );
}

// ─── Edit Profile Screen ──────────────────────────────────────────────────────

const AVATAR_EMOJIS = ["🧑","👩","👨","🧑‍⚕️","👩‍⚕️","👨‍⚕️","🦸","🦸‍♀️","🐻","🦊","🐱","🐶","🌟","🔥","💪","🩺"];

function EditProfileScreen({ lang, userName, onBack, onSave }: {
  lang: Lang; userName: string; onBack: ()=>void; onSave: (data:{name:string;avatar:string;bio:string;location:string})=>void;
}) {
  const [name, setName] = useState(userName);
  const [avatar, setAvatar] = useState(() => localStorage.getItem("eh_avatar") || "🧑");
  const [bio, setBio] = useState(() => localStorage.getItem("eh_bio") || "");
  const [location, setLocation] = useState(() => localStorage.getItem("eh_location") || "");
  const [avatarPhoto, setAvatarPhoto] = useState(() => localStorage.getItem("rr_avatar_photo") || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("eh_avatar", avatar);
    localStorage.setItem("eh_bio", bio);
    localStorage.setItem("eh_location", location);
    if(avatarPhoto) localStorage.setItem("rr_avatar_photo", avatarPhoto);
    setSaved(true);
    onSave({ name, avatar: avatarPhoto || avatar, bio, location });
    setTimeout(() => { setSaved(false); onBack(); }, 800);
  };

  const L = (de:string, en:string, tr:string, ar:string) => lang==="DE"?de:lang==="EN"?en:lang==="TR"?tr:ar;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary px-5 pt-12 pb-5 text-white flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-white/70 mb-3 text-sm">
          <ArrowLeft className="w-4 h-4"/>{t("back",lang)}
        </button>
        <h1 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl uppercase tracking-tight">
          {L("Profil bearbeiten","Edit Profile","Profili Düzenle","تعديل الملف الشخصي")}
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">

        {/* Avatar with photo upload */}
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            {L("Profilbild","Profile Picture","Profil Resmi","صورة الملف الشخصي")}
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              {avatarPhoto ? (
                <img src={avatarPhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/20"/>
              ) : (
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-4xl">{avatar}</div>
              )}
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/80 transition-colors">
                <span className="text-white text-xs">📷</span>
                <input type="file" accept="image/*" className="hidden" onChange={e=>{
                  const file=e.target.files?.[0];
                  if(file){const r=new FileReader();r.onload=ev=>{const d=ev.target?.result as string;setAvatarPhoto(d);localStorage.setItem("rr_avatar_photo",d);};r.readAsDataURL(file);}
                }}/>
              </label>
            </div>
            <div>
              <p className="text-sm font-medium">{L("Foto hochladen oder Emoji wählen","Upload photo or choose emoji","Fotoğraf yükle veya emoji seç","ارفع صورة أو اختر رمزاً")}</p>
              <p className="text-xs text-muted-foreground">{L("Tippe auf 📷 für ein Foto","Tap 📷 for a photo","📷 fotoğraf için","📷 لصورة")}</p>
              {avatarPhoto && (
                <button onClick={()=>{setAvatarPhoto("");localStorage.removeItem("rr_avatar_photo");}} className="text-xs text-primary mt-1 underline">
                  {L("Foto entfernen","Remove photo","Fotoğrafı kaldır","إزالة الصورة")}
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {AVATAR_EMOJIS.map(e => (
              <button key={e} onClick={() => {setAvatar(e);}}
                className={`text-2xl p-2 rounded-xl transition-all active:scale-90 ${avatar===e&&!avatarPhoto?"bg-primary/10 ring-2 ring-primary":"bg-card hover:bg-muted"}`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2 block">
            {L("Vollständiger Name","Full Name","Tam Ad","الاسم الكامل")}
          </label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder={L("Dein Name","Your name","Adın","اسمك")}
            className="w-full border-2 border-border focus:border-primary rounded-xl px-4 py-3 bg-background outline-none text-sm transition-colors"/>
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2 block">
            {L("Über mich","About me","Hakkımda","عني")}
          </label>
          <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3}
            placeholder={L("z. B. Ich mache den Erste-Hilfe-Kurs für meinen neuen Job…","e.g. Taking the first aid course for my new job…","örn. Yeni işim için ilk yardım kursu alıyorum…","مثال: أخذ دورة الإسعافات الأولية لعملي الجديد…")}
            className="w-full border-2 border-border focus:border-primary rounded-xl px-4 py-3 bg-background outline-none text-sm transition-colors resize-none"/>
          <p className="text-xs text-muted-foreground mt-1">{bio.length}/150</p>
        </div>

        {/* Location */}
        <div>
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2 block">
            {L("Standort","Location","Konum","الموقع")}
          </label>
          <input value={location} onChange={e=>setLocation(e.target.value)} placeholder={L("z. B. München, Bayern","e.g. Munich, Bavaria","örn. Münih, Bavyera","مثال: ميونيخ، بافاريا")}
            className="w-full border-2 border-border focus:border-primary rounded-xl px-4 py-3 bg-background outline-none text-sm transition-colors"/>
        </div>

        {/* Badges info */}
        <div className="bg-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            {L("Abzeichen verdienen","Earn Badges","Rozet Kazan","كسب الشارات")}
          </p>
          {[
            {icon:"🚑", name:{DE:"Schnellstarter",EN:"Fast Starter",TR:"Hızlı Başlangıç",AR:"بادئ سريع"}, how:{DE:"Beantworte dein erstes Quiz",EN:"Answer your first quiz",TR:"İlk quizi yanıtla",AR:"أجب على أول اختبار"}, earned:true},
            {icon:"🫀", name:{DE:"CPR-Profi",EN:"CPR Pro",TR:"KPR Uzmanı",AR:"محترف CPR"}, how:{DE:"Schließe Kapitel 3 ab",EN:"Complete Chapter 3",TR:"Bölüm 3'ü tamamla",AR:"أكمل الفصل 3"}, earned:true},
            {icon:"🏅", name:{DE:"Quiz-Meister",EN:"Quiz Master",TR:"Quiz Ustası",AR:"سيد الاختبار"}, how:{DE:"Beantworte 5 Quizfragen richtig",EN:"Answer 5 quiz questions correctly",TR:"5 soruyu doğru cevapla",AR:"أجب على 5 أسئلة بشكل صحيح"}, earned:false},
            {icon:"🎓", name:{DE:"Kursabschluss",EN:"Course Complete",TR:"Kurs Tamamlama",AR:"إتمام الدورة"}, how:{DE:"Alle 5 Kapitel abschließen",EN:"Complete all 5 chapters",TR:"Tüm 5 bölümü tamamla",AR:"أكمل جميع الفصول الـ5"}, earned:false},
          ].map(b=>(
            <div key={b.icon} className={`flex items-center gap-3 py-2.5 border-b border-border last:border-0 ${b.earned?"":"opacity-50"}`}>
              <span className="text-2xl">{b.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{b.name[lang]}</p>
                <p className="text-xs text-muted-foreground">{b.how[lang]}</p>
              </div>
              {b.earned ? <CheckCircle className="w-5 h-5 text-accent flex-shrink-0"/> : <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0"/>}
            </div>
          ))}
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={!name.trim()}
          className={`w-full font-bold text-lg uppercase py-4 rounded-xl transition-all active:scale-95 ${saved?"bg-accent text-white":"bg-primary text-white disabled:opacity-40"}`}
          style={{fontFamily:"'Barlow Condensed',sans-serif"}}>
          {saved ? (L("✓ Gespeichert","✓ Saved","✓ Kaydedildi","✓ تم الحفظ")) : L("Speichern","Save","Kaydet","حفظ")}
        </button>
      </div>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

function ProfileMode({lang,userName,onLogout,school,onLicense,onLangChange,darkMode,setDarkMode,fontSize,setFontSize,autoplay,setAutoplay,onClearCache}:{
  lang:Lang;userName:string;onLogout:()=>void;school:SchoolTheme|null;onLicense:()=>void;
  onLangChange:(l:Lang)=>void;darkMode:boolean;setDarkMode:(v:boolean)=>void;
  fontSize:"small"|"medium"|"large";setFontSize:(v:"small"|"medium"|"large")=>void;
  autoplay:boolean;setAutoplay:(v:boolean)=>void;onClearCache:()=>void;
}){
  const completed=MODULES.filter(m=>m.status==="completed").length;
  const pct=Math.round((completed/MODULES.length)*100);
  const [settingsScreen, setSettingsScreen] = useState<""|"notif"|"app"|"privacy"|"payment">("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [displayAvatar, setDisplayAvatar] = useState(() => localStorage.getItem("rr_avatar_photo") || localStorage.getItem("eh_avatar") || "");
  const [displayBio, setDisplayBio] = useState(() => localStorage.getItem("eh_bio") || "");
  const [displayLocation, setDisplayLocation] = useState(() => localStorage.getItem("eh_location") || "");

  if (settingsScreen === "notif") return <NotificationsSettings lang={lang} onBack={() => setSettingsScreen("")} />;
  if (settingsScreen === "app")   return <AppSettingsScreen lang={lang} onBack={() => setSettingsScreen("")} currentLang={lang} onLangChange={onLangChange} darkMode={darkMode} setDarkMode={setDarkMode} fontSize={fontSize} setFontSize={setFontSize} autoplay={autoplay} setAutoplay={setAutoplay} onClearCache={onClearCache} />;
  if (settingsScreen === "privacy") return <PrivacyScreen lang={lang} onBack={() => setSettingsScreen("")} />;
  if (settingsScreen === "payment") return <PaymentLicenseScreen lang={lang} onBack={() => setSettingsScreen("")} school={school} onLicense={() => { setSettingsScreen(""); onLicense(); }} />;

  if (showEditProfile) return <EditProfileScreen lang={lang} userName={userName} onBack={() => setShowEditProfile(false)} onSave={(d) => { setDisplayAvatar(localStorage.getItem("rr_avatar_photo") || d.avatar); setDisplayBio(d.bio); setDisplayLocation(d.location); setShowEditProfile(false); }}/>;

  return(
    <div className="pb-8">
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
            {displayAvatar && displayAvatar.startsWith("data:") ? (
              <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover"/>
            ) : displayAvatar ? (
              <span>{displayAvatar}</span>
            ) : (
              <span className="text-white font-bold text-lg">{userName.split(" ").map((w:string)=>w[0]).join("").slice(0,2).toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-medium text-lg">{userName}</h2>
            <p className="text-sm text-muted-foreground">{school?school.name:lang==="DE"?"Erste-Hilfe Kursteilnehmer":lang==="EN"?"First Aid Participant":lang==="TR"?"İlk Yardım Katılımcısı":"مشارك الإسعافات الأولية"}</p>
            <div className="flex items-center gap-4 mt-3">
              {[{l:t("contacts",lang),v:"3"},{l:t("modules",lang),v:`${completed}`},{l:t("streak",lang),v:t("streakDays",lang)}].map((s,i)=>(
                <div key={i} className="text-center"><div style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-lg">{s.v}</div><div className="text-xs text-muted-foreground">{s.l}</div></div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>{t("courseProgress",lang)}</span><span>{pct}%</span></div>
          <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-2 bg-primary rounded-full transition-all" style={{width:`${pct}%`}}/></div>
        </div>
        {displayBio && <p className="text-xs text-muted-foreground mt-2 italic">"{displayBio}"</p>}
        {displayLocation && <p className="text-xs text-muted-foreground mt-1">📍 {displayLocation}</p>}
        <button onClick={() => setShowEditProfile(true)} className="mt-4 w-full bg-primary/10 border-2 border-primary/30 text-primary text-sm font-medium py-2.5 rounded-xl hover:bg-primary/20 transition-colors">{t("editProfile",lang)}</button>
      </div>
      <div className="px-5 py-4 border-b border-border">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">{t("badges",lang)}</p>
        <div className="flex gap-3">
          {[{lk:"badgeFast",icon:"🚑",earned:true},{lk:"badgeCPR",icon:"🫀",earned:true},{lk:"badgeQuiz",icon:"🏅",earned:false},{lk:"badgeCourse",icon:"🎓",earned:false}].map(b=>(
            <div key={b.lk} className={`flex flex-col items-center gap-1 flex-1 ${b.earned?"":"opacity-30"}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${b.earned?"bg-amber-50 border-2 border-amber-200":"bg-muted"}`}>{b.icon}</div>
              <span className="text-xs text-muted-foreground text-center leading-tight px-0.5 break-words w-full">{t(b.lk,lang)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">{t("settingsTitle",lang)}</p>
        <div className="space-y-1">
          {[
            {icon:Bell,   lk:"settingsNotif",   panel:"notif"   as const},
            {icon:Settings,lk:"settingsApp",    panel:"app"     as const},
            {icon:BookOpen,lk:"settingsPrivacy", panel:"privacy" as const},
            {icon:CreditCard,lk:"settingsPayment",panel:"payment" as const},
          ].map(item=>(
            <button key={item.lk} onClick={() => setSettingsScreen(item.panel)}
              className="w-full flex items-center gap-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/40 transition-colors rounded-lg px-1">
              <item.icon className="w-5 h-5 text-muted-foreground"/><span className="flex-1 text-sm text-left">{t(item.lk,lang)}</span><ChevronRight className="w-4 h-4 text-muted-foreground"/>
            </button>
          ))}
          <button onClick={onLicense} className="w-full flex items-center gap-4 py-3.5 border-b border-border hover:bg-muted/40 transition-colors rounded-lg px-1">
            <Key className="w-5 h-5 text-muted-foreground"/><span className="flex-1 text-sm text-left">{t("schoolCode",lang)}</span><ChevronRight className="w-4 h-4 text-muted-foreground"/>
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-4 py-3.5 text-primary hover:opacity-70 transition-opacity mt-2">
            <LogOut className="w-5 h-5"/><span className="text-sm font-medium">{t("logout",lang)}</span>
          </button>
        </div>
      </div>
      <div className="px-5 py-4 text-center">
        <p className="text-xs text-muted-foreground">{t("version",lang)}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{t("licenseActive",lang)}</p>
        {school&&<p className="text-xs text-primary mt-0.5">{school.emoji} {school.name}</p>}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [auth,setAuth]=useState<AuthState>("lang_select");
  const [userName,setUserName]=useState("Max");
  const [lang,setLang]=useState<Lang>(()=>(localStorage.getItem("eh_lang") as Lang)||"DE");
  const [mainTab,setMainTab]=useState<MainTab>("home");
  const [checkedIn,setCheckedIn]=useState(false);
  const [progress,setProgress]=useState<ProgressData>(loadProgress);
  const [showFeed,setShowFeed]=useState(false);
  const [feedChapter,setFeedChapter]=useState(0);
  const [showReview,setShowReview]=useState(false);
  const [school,setSchool]=useState<SchoolTheme|null>(null);
  const [showLicense,setShowLicense]=useState(false);
  // Global app settings (persisted)
  const [darkMode,setDarkMode]=useState(()=>localStorage.getItem("eh_dark")==="true");
  const [fontSize,setFontSize]=useState<"small"|"medium"|"large">(()=>(localStorage.getItem("eh_fontsize") as any)||"medium");
  const [autoplay,setAutoplay]=useState(()=>localStorage.getItem("eh_autoplay")!=="false");

  const handleClearCache=()=>{ localStorage.removeItem("eh_notif_v1"); };

  // Dark mode: set on html element AND the container
  useEffect(()=>{
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
  },[darkMode]);

  // Font size: change root CSS variable so all rem-based Tailwind classes scale
  useEffect(()=>{
    const size = fontSize==="small" ? "13px" : fontSize==="large" ? "21px" : "16px";
    document.documentElement.style.setProperty("--font-size", size);
  },[fontSize]);

  const fontSizePx = fontSize==="small" ? 13 : fontSize==="large" ? 21 : 16;

  const allDone=progress.chapterProgress.every(p=>p>=100);
  const overallPct=Math.round(progress.chapterProgress.reduce((a,b)=>a+b,0)/CHAPTER_COUNT);
  const updateProgress=(p:ProgressData)=>{setProgress(p);saveProgress(p);};
  const handleOpenFeed=(ch:number)=>{setFeedChapter(ch);updateProgress({...progress,currentChapter:ch});setShowFeed(true);};

  // Auth routing
  if(auth==="lang_select") return <LangSelectScreen onSelect={l=>{setLang(l);setAuth("splash");}}/>;
  if(auth==="splash")      return <SplashScreen lang={lang} onLogin={()=>setAuth("login")} onRegister={()=>setAuth("register")} onDemo={()=>{
    setUserName("Demo");
    // Unlock everything for demo so all features are immediately accessible
    const demo:ProgressData={chapterProgress:Array(CHAPTER_COUNT).fill(100),currentChapter:CHAPTER_COUNT-1,totalScore:3200,completedAt:new Date().toISOString()};
    updateProgress(demo);
    setAuth("app");
  }}/>;
  if(auth==="login")       return <LoginScreen  lang={lang} onBack={()=>setAuth("splash")} onSuccess={name=>{setUserName(name);setAuth("app");}}/>;
  if(auth==="register")    return <RegisterScreen lang={lang} onBack={()=>setAuth("splash")} onSuccess={name=>{setUserName(name);setAuth("paywall");}}/>;
  if(auth==="paywall")     return <PaywallScreen lang={lang} userName={userName} onSuccess={()=>setAuth("app")} onSchoolLicense={()=>setAuth("license")}/>;
  if(auth==="license")     return <LicenseScreen lang={lang} onSuccess={s=>{setSchool(s);setAuth("app");}}/>;
  if(showLicense)          return <LicenseScreen lang={lang} onSuccess={s=>{setSchool(s);setShowLicense(false);}}/>;
  if(showFeed)             return <TikTokFeed lang={lang} progress={{...progress,currentChapter:feedChapter}} onUpdate={updateProgress} onBack={()=>setShowFeed(false)}/>;

  const headerColor=school?.primaryColor??"var(--color-primary)";
  const BOTTOM_TABS=[
    {id:"home"      as MainTab,lk:"tabLearn",    icon:BookOpen},
    {id:"inclass"   as MainTab,lk:"tabInClass",  icon:GraduationCap},
    {id:"community" as MainTab,lk:"tabCommunity",icon:Users},
    {id:"profile"   as MainTab,lk:"tabProfile",  icon:User},
  ];

  return(
    <>
      {showReview&&<GoogleReviewModal lang={lang} school={school} onClose={()=>setShowReview(false)}/>}
      <div className={`flex flex-col bg-background text-foreground${darkMode?" dark":""}`} style={{fontFamily:"'DM Sans',system-ui,sans-serif",maxWidth:430,margin:"0 auto",minHeight:"100vh",fontSize:fontSizePx}}>
        <header className="text-white px-5 pt-10 pb-5 flex-shrink-0" style={{backgroundColor:headerColor}}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button onClick={()=>setShowLicense(true)} className="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
                {school?<span className="text-base">{school.emoji}</span>:<Heart className="w-5 h-5 fill-primary text-primary"/>}
              </button>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-xl tracking-tight leading-none">
                {school?school.name:<>Erst<span className="opacity-60">Hilfe</span>+</>}
              </span>
            </div>
            <div className="flex gap-1">
              {LANGUAGES.map(l=>(
                <button key={l.code} onClick={()=>setLang(l.code)} className={`text-lg px-1 py-0.5 rounded transition-all ${lang===l.code?"bg-white/20 scale-110":"opacity-50 hover:opacity-80"}`}>{l.flag}</button>
              ))}
            </div>
          </div>
          {mainTab==="home"&&(
            <div>
              <p className="text-white/60 text-xs">{t("welcomeBack",lang)}, {userName} 👋</p>
              <div className="flex items-center justify-between mt-0.5">
                <span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl uppercase tracking-tight">{t("learningPlan",lang)}</span>
                <span className="text-sm font-medium opacity-80">{overallPct}%</span>
              </div>
              <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-1.5 bg-white rounded-full" style={{width:`${overallPct}%`}}/></div>
            </div>
          )}
          {mainTab==="inclass"&&(
            <div>
              <p className="text-white/60 text-xs">{t("inClassSub",lang)}</p>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl uppercase tracking-tight block mt-0.5">{t("inClassTitle",lang)}</span>
              {checkedIn&&<span className="inline-flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full mt-1.5"><Check className="w-3 h-3"/>{t("checkedInBadge",lang)}</span>}
            </div>
          )}
          {mainTab==="community"&&(
            <div>
              <p className="text-white/60 text-xs">{t("communitySub",lang)}</p>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl uppercase tracking-tight block mt-0.5">{t("communityTitle",lang)}</span>
            </div>
          )}
          {mainTab==="profile"&&(
            <div>
              <p className="text-white/60 text-xs">{t("profileSub",lang)}</p>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl uppercase tracking-tight block mt-0.5">{t("profileTitle",lang)}</span>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          {mainTab==="home"&&<HomeMode lang={lang} progress={progress} onOpenFeed={handleOpenFeed}/>}
          {mainTab==="inclass"&&(
            allDone
              ?<InClassMode lang={lang} checkedIn={checkedIn} setCheckedIn={setCheckedIn} userName={userName} allDone={allDone} onShowReview={()=>setShowReview(true)}/>
              :<div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-5"><Lock className="w-8 h-8 text-muted-foreground"/></div>
                <h2 style={{fontFamily:"'Barlow Condensed',sans-serif"}} className="font-bold text-2xl uppercase mb-2">{t("stillLocked",lang)}</h2>
                <p className="text-muted-foreground text-sm mb-6">{t("lockedDesc",lang)}</p>
                <div className="w-full bg-card rounded-xl p-4 mb-6">
                  <div className="flex justify-between text-sm mb-2"><span>{t("chapterProgress",lang)}</span><span className="font-bold">{overallPct}%</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-2 bg-primary rounded-full" style={{width:`${overallPct}%`}}/></div>
                </div>
                <button onClick={()=>setMainTab("home")} className="bg-primary text-white font-bold text-lg uppercase px-8 py-3 rounded-xl active:scale-95 transition-transform" style={{fontFamily:"'Barlow Condensed',sans-serif"}}>{t("startLearning",lang)}</button>
              </div>
          )}
          {mainTab==="community"&&<CommunityMode lang={lang} userName={userName}/>}
          {mainTab==="profile"&&<ProfileMode lang={lang} userName={userName} onLogout={()=>{setAuth("lang_select");setMainTab("home");}} school={school} onLicense={()=>setShowLicense(true)} onLangChange={setLang} darkMode={darkMode} setDarkMode={setDarkMode} fontSize={fontSize} setFontSize={setFontSize} autoplay={autoplay} setAutoplay={setAutoplay} onClearCache={handleClearCache}/>}
        </main>

        <nav className="flex border-t border-border bg-background flex-shrink-0">
          {BOTTOM_TABS.map(tt=>(
            <button key={tt.id} onClick={()=>setMainTab(tt.id)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors relative ${mainTab===tt.id?"text-primary":"text-muted-foreground hover:text-foreground"}`}>
              <tt.icon className={`w-5 h-5 ${mainTab===tt.id?"stroke-2":"stroke-[1.5]"}`}/>
              {t(tt.lk,lang)}
              {tt.id==="inclass"&&!allDone&&<Lock className="absolute top-2 right-[18%] w-2.5 h-2.5 text-muted-foreground/60"/>}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
