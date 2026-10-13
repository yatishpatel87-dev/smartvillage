import React from 'react';
import { X, Award, CheckCircle2, HelpCircle, Cpu, BookOpen, Sparkles, Copy, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface ScienceFairGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'gu' | 'en';
}

export const ScienceFairGuideModal: React.FC<ScienceFairGuideModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [copied, setCopied] = React.useState(false);
  if (!isOpen) return null;

  const isGu = language === 'gu';

  const copySpeech = () => {
    const speechText = isGu
      ? `નમસ્તે નિર્ણાયક સાહેબ! અમે રજૂ કરીએ છીએ "૩D સ્માર્ટ એકો-વિલેજ AI સિમ્યુલેટર". આ પ્રોજેક્ટમાં ૭ મુખ્ય સ્માર્ટ મોડ્યુલ્સ છે: (૧) સોલાર શાળા અને ઘર, (૨) AI આધારિત સેન્સર અને ઓટોમેટેડ વોટર સ્પ્રિંકલર્સ વડે ૪૦% જળબચત કરતી સ્માર્ટ ખેતી, (૩) LDR અને મોશન સેન્સર આધારિત સ્માર્ટ સ્ટ્રીટ લાઇટ્સ, (૪) અલ્ટ્રાસોનિક સેન્સર આધારિત ઓવરફ્લો-મુક્ત વોટર ટાંકી, (૫) ટચલેસ અને ૮૫% એલર્ટ આપતી સ્માર્ટ ડસ્ટબિન, (૬) ગોબર-કચરામાંથી રાંધણ ગેસ અને ઓર્ગેનિક ખાતર બનાવતો બાયોગેસ પ્લાન્ટ, અને (૭) સોલાર પાવર્ડ EV ચાર્જિંગ સ્ટેશન. એક જ બટન દબાવતાં જ સમગ્ર ગામનું ઓટોમેશન શરૂ થાય છે!`
      : `Respected Judges! We present the "3D Smart Eco-Village AI Simulator". Our project integrates 7 sustainable modules: (1) Solar School & Eco-Home, (2) AI Smart Agriculture with soil probes and automated 3D sprinklers saving 40% water, (3) LDR & PIR Motion-adaptive Streetlights, (4) Ultrasonic non-overflow Smart Water Tank, (5) Touchless Smart Dustbin with 85% full siren, (6) Anaerobic Biogas Plant generating methane and organic slurry, and (7) Solar EV Fast Charging Station.`;

    navigator.clipboard.writeText(speechText);
    sound.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>
                  {isGu
                    ? 'વિજ્ઞાન મેળો પ્રોજેક્ટ માર્ગદર્શિકા અને જજ પ્રશ્નોત્તરી'
                    : 'Science Fair Presentation Handbook & Judge Q&A'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isGu
                  ? 'શાળા વિજ્ઞાન મેળામાં શ્રેષ્ઠ પ્રદર્શન માટે વિદ્યાર્થીઓ માટે સંપૂર્ણ ગાઇડ'
                  : 'Comprehensive Presentation Guide for Students & Science Fair Presenters'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-6 pr-1">
          {/* 1. Student Elevator Pitch / Presentation Speech */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                {isGu ? 'જજ સામે બોલવાની ૨-મિનિટની સ્પીચ (Elevator Pitch)' : '2-Minute Presentation Pitch for Judges'}
              </span>
              <button
                type="button"
                onClick={copySpeech}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isGu ? 'કોપી થયું!' : 'Copied!') : (isGu ? 'સ્પીચ કોપી કરો' : 'Copy Pitch')}</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans bg-black/30 p-3 rounded-xl border border-white/5">
              {isGu
                ? '“નમસ્તે નિર્ણાયક સાહેબ! અમે રજૂ કરીએ છીએ "૩D સ્માર્ટ એકો-વિલેજ AI સિમ્યુલેટર". આજના યુગમાં ગ્રામીણ ભારતમાં વીજળી, પાણીનો બગાડ અને કચરા વ્યવસ્થાપન મુખ્ય પડકારો છે. અમારા પ્રોજેક્ટમાં ૭ સ્વયંસંચાલિત મોડ્યુલ્સ છે: સોલાર શાળા, AI ખેતીમાં ભેજ ઘટતાં જ ૩D વોટર સ્પ્રિંકલર્સ, LDR આધારિત સ્ટ્રીટ લાઇટ્સ, પારદર્શક ઓટો-કંટ્રોલ પાણીની ટાંકી, ૮૫% ભરાતાં એલર્ટ આપતી ડસ્ટબિન, મિથેન બાયોગેસ પ્લાન્ટ અને સોલાર EV ચાર્જિંગ સ્ટેશન. આ સમગ્ર ગામ સ્વયંસંચાલિત અને શૂન્ય કાર્બન ઉત્સર્જન ધરાવતું આદર્શ ગામ બને છે!”'
                : '"Respected Judges! We proudly demonstrate the "3D Smart Eco-Village AI Simulator". To solve rural energy waste, erratic rainfall, and municipal management, our prototype brings 7 autonomous modules: Rooftop Solar generation, AI soil-sensor activated water sprinklers saving 40% water, Adaptive Streetlights, Smart Water Tank, Touchless Ultrasonic Dustbin, Anaerobic Biogas Plant, and Solar EV Station."'}
            </p>
          </div>

          {/* 2. Hardware & Arduino Components Used */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>{isGu ? 'પ્રોજેક્ટ મોડેલમાં વપરાતા સાધનો (Hardware Components)' : 'Required Hardware Components for Working Model'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-white/10">
                <span className="font-semibold text-emerald-300 block mb-1">૧. Arduino Uno / ESP32</span>
                <span className="text-slate-300">મુખ્ય કંટ્રોલર જે સેન્સર્સના એનાલોગ/ડિજિટલ સિગ્નલ વાંચી રિલે મોડ્યુલને ઓટો-આદેશ આપે છે.</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-white/10">
                <span className="font-semibold text-emerald-300 block mb-1">૨. કેપેસિટીવ સોઇલ સેન્સર</span>
                <span className="text-slate-300">માટીમાં ભેજ માપે છે. ભેજ ૩૫% થી ઘટતાં ૧૨V સબમર્સિબલ સ્પ્રિંકલર પંપ શરૂ કરે છે.</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-white/10">
                <span className="font-semibold text-emerald-300 block mb-1">૩. HC-SR04 અલ્ટ્રાસોનિક (૨ નંગ)</span>
                <span className="text-slate-300">ટાંકીમાં પાણીની ઊંચાઈ માપવા અને સ્માર્ટ ડસ્ટબિનમાં કચરાનું સ્તર તેમજ ઢાંકણ ખોલવા માટે.</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-white/10">
                <span className="font-semibold text-emerald-300 block mb-1">૪. LDR ફોટોરેઝિસ્ટર + PIR</span>
                <span className="text-slate-300">દિવસ/રાત ઓળખી સ્ટ્રીટ લાઇટ ઓટોમેટિક ઓન કરે છે અને મોશન ડિટેક્ટ થતાં ૧૦૦% તેજ આપે છે.</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-white/10">
                <span className="font-semibold text-emerald-300 block mb-1">૫. SG90 સર્વો મોટર</span>
                <span className="text-slate-300">સ્માર્ટ ડસ્ટબિનનું ઢાંકણ ૯૦ ડિગ્રી ટચલેસ ખોલવા માટે રોટેશનલ એંગલ કંટ્રોલ.</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl border border-white/10">
                <span className="font-semibold text-emerald-300 block mb-1">૬. ૪-ચેનલ રિલે મોડ્યુલ</span>
                <span className="text-slate-300">ઓવરહેડ પંપ, સ્પ્રિંકલર પંપ, સોલાર ઇન્વર્ટર અને EV ચાર્જરને સુરક્ષિત સ્વિચ કરવા.</span>
              </div>
            </div>
          </div>

          {/* 3. Top Judge Questions & Model Answers */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2.5 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>{isGu ? 'જજ દ્વારા પૂછાતા મુખ્ય પ્રશ્નો અને આદર્શ જવાબો (Judge FAQs)' : 'Common Judge Questions & Ideal Answers'}</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-800/50 p-3 rounded-xl border border-white/10">
                <p className="font-bold text-amber-300 mb-1">
                  {isGu ? 'પ્રશ્ન ૧: સામાન્ય ખેતી કરતાં આ સ્માર્ટ ખેતીથી ખેડૂતને શું ફાયદો થાય?' : 'Q1: What are the concrete advantages for farmers using smart irrigation?'}
                </p>
                <p className="text-slate-300 leading-relaxed">
                  {isGu
                    ? 'જવાબ: સામાન્ય ખેતીમાં જરૂર વગર વધુ પાણી અપાતાં મૂળ કોહવાઈ જાય છે અને ૪૦% પાણી વેડફાય છે. અહીં સેન્સર માત્ર જરૂર પડે ત્યારે જ સ્પ્રિંકલર શરૂ કરે છે, જેથી વીજળી અને પાણી બંને બચે છે અને પાકનું ઉત્પાદન ૨૫% વધે છે.'
                    : 'Ans: Prevents root rot and over-irrigation. Closed-loop AI threshold saves 40% water and 30% electricity, increasing yield.'}
                </p>
              </div>

              <div className="bg-slate-800/50 p-3 rounded-xl border border-white/10">
                <p className="font-bold text-amber-300 mb-1">
                  {isGu ? 'પ્રશ્ન ૨: બાયોગેસ પ્લાન્ટમાં પ્રેશર ગેજ અને સ્લરીનો શું રોલ છે?' : 'Q2: How does the biogas plant integrate with the village circular economy?'}
                </p>
                <p className="text-slate-300 leading-relaxed">
                  {isGu
                    ? 'જવાબ: ગોબરના અનએરોબિક પાચનથી મિથેન ગેસ બને છે. પ્રેશર ગેજ પાઇપલાઇનમાં ગેસનું દબાણ દર્શાવે છે જેથી લીકેજ ન થાય. પાચન પછી નીકળતી સ્લરી નાઇટ્રોજનયુક્ત ઓર્ગેનિક ખાતર તરીકે બાજુના ખેતરમાં સીધી જાય છે - એટલે કે શૂન્ય કચરો!'
                    : 'Ans: Anaerobic methanogenesis produces methane fuel for clean cooking. The effluent nitrogen slurry provides 100% organic fertilizer to the smart farm, completing a zero-waste circular loop.'}
                </p>
              </div>

              <div className="bg-slate-800/50 p-3 rounded-xl border border-white/10">
                <p className="font-bold text-amber-300 mb-1">
                  {isGu ? 'પ્રશ્ન ૩: ચોમાસામાં સૂર્યપ્રકાશ ન હોય ત્યારે EV અને ગામને પાવર કેવી રીતે મળે?' : 'Q3: How does the village handle cloudy or monsoon days?'}
                </p>
                <p className="text-slate-300 leading-relaxed">
                  {isGu
                    ? 'જવાબ: ગામમાં હાઇબ્રિડ સિસ્ટમ છે - સોલાર બેટરી સ્ટોરેજ ઉપરાંત બાયોગેસ જનરેટર અને વિન્ડ ટર્બાઇન બેકઅપ તરીકે જોડાયેલા છે, જેથી અવિરત સ્વચ્છ પાવર મળી રહે.'
                    : 'Ans: Hybrid multi-source renewable architecture combines solar battery storage with biogas generator backup and wind turbine support.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            {isGu ? 'સમજાયું, પ્રદર્શન ચાલુ રાખો' : 'Got it, Continue Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
};
