import React from 'react';
import { X, BookOpen, Smartphone, CheckCircle, Sparkles, Cpu, Tv, Award, ShieldCheck, Layers, Play, Phone, MessageCircle } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserGuideModal({ isOpen, onClose }: UserGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        dir="rtl"
        className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 text-right text-neutral-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950/50">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-teal-400 animate-pulse" />
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">دليل الاستخدام الذكي والتعريفي للبرنامج</h2>
              <p className="text-xs text-teal-400 mt-1">بوابتك لتجربة تعليمية سينمائية فريدة من نوعها</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-neutral-900/40 space-y-8">
          
          {/* Welcome & App Overview */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/20 overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -translate-x-8 -translate-y-8"></div>
            <div className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-400/10 text-teal-300 border border-teal-400/20">
                <Sparkles className="w-3.5 h-3.5" /> فكرة مبتكرة
              </span>
              <h3 className="text-lg font-bold text-white">مرحباً بك في تطبيق "قناة أولى ثانوى"</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                أهلاً بك في أول منصة عربية ذكية مخصصة بالكامل لعرض شروحات ومحاضرات الصف الأول الثانوي بأسلوب <strong>البث المباشر الافتراضي المتزامن</strong>. لقد صممنا هذا التطبيق ليمنحك تجربة دراسية خالية تماماً من التشتيت والإعلانات والتعليقات الجانبية، مع تركيز بنسبة 100% على تحصيلك العلمي.
              </p>
            </div>
          </div>

          {/* Section 1: Detailed Usage Guide */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white border-r-4 border-teal-500 pr-3 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-teal-400" />
              كيفية استخدام وتشغيل التطبيق باحترافية
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800 hover:border-neutral-700/50 transition-all space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs">١</span>
                  <h5 className="font-semibold text-white text-sm">اختيار المادة والبدء فوراً</h5>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  عند فتح التطبيق، ستظهر لك الواجهة الرئيسية. اضغط على زر <strong className="text-teal-300">"اختر القناة"</strong> لعرض المواد التعليمية المتوفرة، أو <strong className="text-teal-300">"تشغيل البث"</strong> لدخول القناة النشطة مباشرة لتبدأ رحلتك التعليمية على الفور وبدون تعقيد.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800 hover:border-neutral-700/50 transition-all space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">٢</span>
                  <h5 className="font-semibold text-white text-sm">ميزة البث المباشر المتزامن</h5>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  على عكس مشغلات الفيديوهات التقليدية، يعمل هذا التطبيق بمبدأ التزامن الزمني. هذا يعني أن الدرس يعرض لجميع زوار المنصة في <strong>نفس اللحظة والدقيقة والثانية تماماً</strong>، مما يعطيك شعور "البث الحي والمباشر" ويساعدك على الانضباط مع زملائك.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800 hover:border-neutral-700/50 transition-all space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">٣</span>
                  <h5 className="font-semibold text-white text-sm">شريط التحكم المدمج والسينمائي</h5>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  قمنا باستبدال أزرار يوتيوب المشتتة بشريط ذكي وأنيق يتيح لك: التحكم بمستوى الصوت، كتم الصوت السريع، تشغيل وإيقاف البث مؤقتاً، وتكبير الفيديو لملء الشاشة بالكامل للاستمتاع بتجربة دراسة ممتعة ومريحة لعينيك.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/40 border border-neutral-800 hover:border-neutral-700/50 transition-all space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">٤</span>
                  <h5 className="font-semibold text-white text-sm">متابعة جدول الحصص القادمة</h5>
                </div>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  لمعرفة ما سيتم بثه بعد انتهاء الحصة الحالية، يمكنك ببساطة الضغط على زر <strong className="text-amber-300">"الجدول"</strong> المتاح في شريط التحكم. ستنبثق لك قائمة منسدلة مرتبة بالأوقات تعرض لك أسماء الدروس التالية لتستعد لها مبكراً.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Promotional / Marketing Pitch */}
          <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 relative overflow-hidden space-y-4">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl"></div>
            
            <div className="flex items-center gap-2 text-indigo-400">
              <Award className="w-6 h-6 animate-bounce" />
              <h4 className="text-lg font-bold text-white">هل تتطلع لامتلاك منصة تعليمية ذكية ومخصصة مثل هذه؟</h4>
            </div>

            <p className="text-neutral-300 text-sm leading-relaxed">
              إذا كنت معلماً مستقلاً، مديراً لمدرسة، صاحب أكاديمية تدريبية، أو جهة تعليمية وتبحث عن وسيلة مثالية لنشر محتواك التعليمي بأسلوب بث مباشر ومجدول يرفع من نسب التزام الطلاب واهتمامهم، <strong>فهذا هو طلبك تماماً!</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <h6 className="font-bold text-white text-xs">تقنية فريدة</h6>
                  <p className="text-[10px] text-neutral-400">بث متزامن ثانية بثانية لجميع الزوار</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <h6 className="font-bold text-white text-xs">أمان واستقلالية</h6>
                  <p className="text-[10px] text-neutral-400">تحكم كامل بدروسك وبدون إعلانات مشتتة</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <h6 className="font-bold text-white text-xs">سهولة مطلقة</h6>
                  <p className="text-[10px] text-neutral-400">لوحة تحكم خفية وبسيطة لتعديل المحتوى</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-neutral-300 leading-relaxed">
              📢 <strong>اجعل مؤسستك مميزة ومواكبة للمستقبل!</strong> نوفر لك إمكانية تخصيص وتطوير هذا التطبيق بالكامل ليحمل هويتك البصرية، قنواتك وموادك المخصصة، مع دعم خوادم فائق السرعة وخيارات متميزة مثل الامتحانات التفاعلية، شهادات النجاح، تتبع الغياب والحضور، وربط السيرفرات الآمنة. 
              <div className="mt-2 text-indigo-300 font-medium">
                تواصل معنا اليوم لتحصل على نسختك الخاصة والفريدة المصممة خصيصاً لأجلك بلمسات برمجية سحرية واحترافية!
              </div>
            </div>

            {/* Contact Methods */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a 
                href="tel:01066802250" 
                className="flex-1 flex items-center justify-center gap-2.5 p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 transition-all text-neutral-200 hover:text-white"
              >
                <Phone className="w-4 h-4 text-teal-400" />
                <div className="text-right">
                  <span className="block text-[10px] text-neutral-500">اتصال هاتفي مباشر</span>
                  <span className="font-mono font-bold text-xs">01066802250</span>
                </div>
              </a>

              <a 
                href="https://wa.me/201066802250" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 flex items-center justify-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 hover:border-emerald-500/30 transition-all text-emerald-300 hover:text-emerald-200"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <div className="text-right">
                  <span className="block text-[10px] text-emerald-500">تواصل عبر واتساب</span>
                  <span className="font-mono font-bold text-xs">01066802250</span>
                </div>
              </a>
            </div>
          </div>



        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/40 text-center text-xs text-neutral-500 flex items-center justify-between px-6">
          <span>دليل قناة أولى ثانوى التعليمية المبتكرة</span>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-neutral-900 rounded-xl transition-all cursor-pointer text-xs font-bold"
          >
            البدء في المشاهدة والدراسة الآن
          </button>
        </div>
      </div>
    </div>
  );
}
