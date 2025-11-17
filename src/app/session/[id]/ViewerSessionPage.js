"use client";

//  TO DO:
// 
// Make the menus dynamic to change with viewers language
// 
//
//
//

import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Filter } from "bad-words";

const FFilter = new Filter();

const BASE_LANGS = [
  { code: "en" },
  { code: "es" },
  { code: "de" },
  { code: "fr" },
  { code: "it" },
  { code: "ht" },
  { code: "zh" },
  { code: "ja" },
];

const LANG_LABELS = {
  en: { en: "English", es: "Spanish", de: "German", fr: "French", it: "Italian", ht: "Haitian Creole", zh: "Chinese", ja: "Japanese" },
  es: { en: "Inglés", es: "Español", de: "Alemán", fr: "Francés", it: "Italiano", ht: "Criollo haitiano", zh: "Chino", ja: "Japonés" },
  de: { en: "Englisch", es: "Spanisch", de: "Deutsch", fr: "Französisch", it: "Italienisch", ht: "Haitianisches Kreolisch", zh: "Chinesisch", ja: "Japanisch" },
  fr: { en: "Anglais", es: "Espagnol", de: "Allemand", fr: "Français", it: "Italien", ht: "Créole haïtien", zh: "Chinois", ja: "Japonais" },
  it: { en: "Inglese", es: "Spagnolo", de: "Tedesco", fr: "Francese", it: "Italiano", ht: "Creolo haitiano", zh: "Cinese", ja: "Giapponese" },
  ht: { en: "Angle", es: "Panyòl", de: "Alman", fr: "Franse", it: "Italyen", ht: "Kreyòl Ayisyen", zh: "Chinwa", ja: "Japonè" },
  zh: { en: "英语", es: "西班牙语", de: "德语", fr: "法语", it: "意大利语", ht: "海地克里奥尔语", zh: "中文", ja: "日语" },
  ja: { en: "英語", es: "スペイン語", de: "ドイツ語", fr: "フランス語", it: "イタリア語", ht: "ハイチ・クレオール語", zh: "中国語", ja: "日本語" },
};

const UI_STRINGS = {
  en: { 
    spokenLanguage: "Spoken Language:",
    translateTo: "Translate To:"
  },
  es: { 
    spokenLanguage: "Idioma Hablado:",
    translateTo: "Traducir a:"
  },
  de: { 
    spokenLanguage: "Gesprochene Sprache:",
    translateTo: "Übersetzen in:"
  },
  fr: { 
    spokenLanguage: "Langue Parlée:",
    translateTo: "Traduire vers:"
  },
  it: { 
    spokenLanguage: "Lingua Parlata:",
    translateTo: "Tradurre in:"
  },
  ht: { 
    spokenLanguage: "Lang Lang Ou Pale:",
    translateTo: "Tradui nan:"
  },
  zh: { 
    spokenLanguage: "口语语言：",
    translateTo: "翻译成："
  },
  ja: { 
    spokenLanguage: "話される言語：",
    translateTo: "翻訳先："
  },
};

export default function ViewerSessionPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const sessionKey = searchParams.get("key");

  const [isHost, setIsHost] = useState(roleParam ? roleParam === "host" : null);
  const [sessionId, setsessionId] = useState(id || "");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [lastInput, setlastInput] = useState("");
  const [lastOutput, setlastOutput] = useState("");
  const [listening, setListening] = useState();

  const normalizeLang = (code) => code.split("-")[0];  // FIXED

  // 🗣️ Language selectors
  const [spokenLang, setSpokenLang] = useState("en-US");   // host microphone input
  const [targetLang, setTargetLang] = useState("es");      // host translation output
  const [viewerLang, setViewerLang] = useState("es");      // viewer display

  const recognitionRef = useRef(null);
  const wsRef = useRef(null);
  const fullEnglishRef = useRef("");
  const fullSpanishRef = useRef("");
  const targetLangRef = useRef(targetLang);
  const lastInputRef = useRef(lastInput);  // Initialize with an empty string
  const lastOutputRef = useRef(lastOutput);  // Initialize with an empty string

useEffect(() => {
  targetLangRef.current = targetLang;
}, [targetLang]);

// useEffect(() => {
//   spokenLangRef.current = spokenLang;
// }, [spokenLang]);

useEffect(() => {
  lastInputRef.current = lastInput;
}, [lastInput]);

useEffect(() => {
  lastOutputRef.current = lastOutput;
}, [lastOutput]);

useEffect(() => 
  {

  if (!sessionId) 
    {
    console.log("ERROR: No session ID found");
    return;
    }
    sessionId == sessionId + "1"
    console.log(sessionId)
   if (wsRef.current) 
    {
    wsRef.current.close(1000, "Switching session");
    wsRef.current = null;
    }

  const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${sessionId}`);
  wsRef.current = ws;

    ws.onopen = () => {

        ws.send(JSON.stringify({ source: "viewer", payload: { output: targetLang } }));
        
      };

ws.onmessage = (e) => {
      try {

        const msg = JSON.parse(e.data);
        //console.log("📨 WS:", msg);

        switch (msg.source) {
           
            case "client":
          
            //if (msg.payload.sessionID == sessionId){ // make sure session IDs match the client websocket broadcast

            //cleantext = cleanText(msg.payload.english) 
            console.log("input set to:" + msg.payload.english_punctuated); 
            //setInput(lastInputRef + cleantext); // might not be visible because of the speed of the translate / punctuate, look into this. might also be a source of failure with the string concatenate
            break; 
              

            case "punctuate": 
             //cleantext = cleanText(msg.payload.english_punctuated)
              if (msg.payload.sessionID == sessionId)
              {
              // console.log("input set to:" + msg.payload.english_punctuated); 
               //setInput(msg.payload.english_punctuated);
              // break; // how is this getting punctuation if this is commented out?!?
              }

            case "translate": 
             if (msg.payload.sessionID == sessionId)
            {
              console.log(targetLangRef.current + " == " + msg.payload.lang)
              if (targetLangRef.current ==  msg.payload.lang && msg.payload.sessionID == sessionId)
                {
                  console.log("output set to:" + msg.payload.translated)
                  setOutput(msg.payload.translated); // look out of dupe info?
                  fullSpanishRef.current = msg.payload.translated;
                  break;
                }
              }

            case "viewer_lang_change":
              {
              console.log(" Language update sent : " +  msg.payload.newLang); // TODO add this to the backend so the viewer can change langauges 
              break;
              }

            case "viewer_lang_change_confirm":  // add into backend
              {

                  return
                
              }

            default: console.warn("Unknown message source:", msg.source);
        
        }
      } catch (err) { console.error(" WS error:", err); }
    };

 return () => {
    if (ws.readyState === WebSocket.OPEN) ws.close(1000, "Cleanup");
    wsRef.current = null;
  };
}, [sessionId]);

  // ✅ Setup filters
  useEffect(() => {
    FFilter.addWords(
      "puta", "mierda", "cabron", "coño", "pendejo", "chingar",
      "culero", "gilipollas", "joder", "hostia", "maldito","fuck", 
      "shit", "bitch", "asshole", "nigger", "cunt", "faggot", "cock",
      "pussy", "dick", "slut", "whore", "nigga",
    );
  }, []);


    const languageOptions = useMemo(() => {
      const target = normalizeLang(targetLangRef.current || "en");
      return BASE_LANGS.map((l) => ({
        code: l.code,
        label: LANG_LABELS[target]?.[l.code] ?? LANG_LABELS.en[l.code],
      }));
    }, [targetLang]);   // ✅ re-run if UI language changes
  // add more filters for the other languages 
  
function cleanText(text, lang = spokenLang) {
  if (!text) return "";
  if (lang){ return FFilter.clean(text);}
}

function sendToServer(type, payload, selector) {
  if (selector == 1){

  if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
  setTargetLang(e.target.value)
  wsRef.current.send(JSON.stringify({ source: type, payload }));
  }
  else
  {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
  wsRef.current.send(JSON.stringify({ source: type, payload }));
  }
}



    return (
    <main className="p-8 max-w-xl mx-auto space-y-6">
      {/* Host Interface */}
      {/* make sure the is host is false, if not transfer to host page */}
      { ( 
        <>
          <h2 className="text-xl font-semibold text-center">
            SmugAlpaca Translating
          </h2>


          <div className="flex justify-center gap-4 my-4">
{/* 🌐 Language Selectors  uneeded due to lack of spoken bullshit
            <div>
              <label className="block text-sm font-semibold mb-1">
                {UI_STRINGS[spokenLang]?.spokenLanguage || UI_STRINGS.en.spokenLanguage}
              </label>
              <select value={spokenLang} onChange={(e) => setSpokenLang(e.target.value)}>
                {languageOptions.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
*/}
            <div>
              <label className="block text-sm font-semibold mb-1">
                {UI_STRINGS[targetLang]?.translateTo || UI_STRINGS.en.translateTo}  {/* translate to : is the main option. different languages  */}
              </label>
              <select value={targetLang} onChange={(e) =>{ 
                 const val = e.target.value;
                  setTargetLang(val);
                  sendToServer("host_lang_update", {input: "", output: val}); {/* TODO : see if this works with backend  */}
                }}
                className="border rounded p-2"
              >
                {languageOptions.map((l) => (
                  <option 
                    key={l.code} value={`${l.code}-${l.code.toUpperCase()}`}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Input / Output Text Boxes */}
          <div>
            <label className="block font-semibold mb-1">
              Hosts original text: {/* TODO ::: LEVEL 2 : CHANGE TO TRANSLATED LANG */ }
            </label>
            <textarea
              value={input}
              onChange={(e) => setOutput(e.target.value)}
               className="w-full border p-3 rounded bg-gray-100 text-gray-900 min-h-[600px] max-h-[1000px] overflow-y-auto"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Translation of Hosts Speech({targetLang.toUpperCase()}): {/* TODO ::: LEVEL 2 : CHANGE TO TRANSLATED LANG */ }
            </label>
            <div
              className="w-full border p-3 rounded bg-gray-100 text-gray-900 min-h-[600px] max-h-[1000px] overflow-y-auto"
            >
              {output || "Translation will appear here..."}
            </div>
          </div>
        </>
      )}

      {/* TODO ::: LEVEL 2 : MAKE A USE CASE FOR THE ISHOST = FALSE */ }

    </main>
  );

}
