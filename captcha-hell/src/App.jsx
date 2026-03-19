import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const TOTAL_STEPS = 100;

const INSULTS = [
  "Hai fallito. Sei umano, vero? Riprova da capo.",
  "Persino un criceto farebbe meglio. Livello 1.",
  "Il mio generatore di numeri casuali ride di te. Da capo.",
  "Congratulazioni, hai fallito in modo nuovo. Riprova.",
  "Sei la ragione per cui esistono i captcha. Ricomincia.",
  "Wow. Semplicemente wow. Livello 1, per favore.",
  "Anche un bug nel codice sarebbe più elegante. Riprova.",
  "La tua mouse-hand non è all'altezza. Da capo.",
  "Sei stato battuto da un pulsante. Vergogna. Ricomincia.",
  "Riprova. O forse no. Forse arrenditi.",
  "Hai cliccato. Male. Livello 1.",
  "Il bottone ti odisca. Non lo biasimo. Da capo.",
  "Livello 1. Di nuovo. Ancora. Per sempre.",
  "Error 404: intelligenza non trovata. Ricomincia.",
  "Premio Nobel per il fallimento. Da capo.",
];

const FONTS = ['comic-sans', 'papyrus', 'courier', 'wingdings', 'sans-serif'];

const CHALLENGE_TYPES = [
  'fleeingButton',
  'amnesicUI',
  'invertedInput',
  'dynamicPassword',
  'clickTiming',
  'staticClick',
  'holdButton',
  'multiClick',
  'memorySequence',
  'avoidClick',
];

const getChallengeType = (step) => {
  const idx = step % CHALLENGE_TYPES.length;
  return CHALLENGE_TYPES[idx];
};

const getFontClass = (step) => {
  return FONTS[Math.floor(step / 5) % FONTS.length];
};

const getThemeForLevel = (step) => {
  const level = Math.floor(step / 10);
  const themes = [
    { bg: '#0a0a0a', accent: '#ff00ff', text: '#00ff41', label: 'Default' },
    { bg: '#1a0000', accent: '#ff4444', text: '#ff6600', label: 'Blood' },
    { bg: '#000022', accent: '#00ffff', text: '#4488ff', label: 'Arctic' },
    { bg: '#001a00', accent: '#00ff00', text: '#88ff88', label: 'Matrix' },
    { bg: '#1a1a00', accent: '#ffff00', text: '#ffaa00', label: 'Warning' },
    { bg: '#1a001a', accent: '#ff00aa', text: '#ff88ff', label: 'Neon' },
    { bg: '#0a0a0a', accent: '#ffffff', text: '#888888', label: 'Ghosts' },
    { bg: '#001111', accent: '#00ffaa', text: '#00ddaa', label: 'Poison' },
    { bg: '#110000', accent: '#ff8800', text: '#ff4400', label: 'Inferno' },
    { bg: '#000000', accent: '#ffffff', text: '#ffffff', label: 'Void' },
  ];
  return themes[level % themes.length];
};

const randomBetween = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(randomBetween(min, max + 1));

const generateDynamicWord = () => {
  const words = ['DESTINY', 'NIGHTMARE', 'CHAOS', 'SUFFERING', 'HOPELESS', 'ETERNITY', 'PUNISH', 'AGONY', 'MISERY', 'TORMENT'];
  return words[randomInt(0, words.length - 1)];
};

function App() {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [failMessage, setFailMessage] = useState('');

  // Fleeing button state
  const [buttonPos, setButtonPos] = useState({ x: 50, y: 50 });

  // Amnesic UI state
  const [buttonsVisible, setButtonsVisible] = useState(true);

  // Dynamic password state
  const [passwordTarget, setPasswordTarget] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordDisplay, setPasswordDisplay] = useState('');
  const passwordIntervalRef = useRef(null);

  // Click timing state
  const [targetPos, setTargetPos] = useState(0);
  const timingIntervalRef = useRef(null);

  // Distractions
  const [popups, setPopups] = useState([]);
  const [marqueeMessage, setMarqueeMessage] = useState('');
  // showHint / setShowHint kept for future challenge expansion

  // Fake loading bar
  const [fakeProgress, setFakeProgress] = useState(0);
  const fakeProgressRef = useRef(null);

  // Ghost click
  const ghostTimerRef = useRef(null);

  // Idle detection
  const [, setIdleTime] = useState(0);
  const [showIdleButton, setShowIdleButton] = useState(false);
  const idleTimerRef = useRef(null);
  const mouseMovedRef = useRef(true);

  // Inverted input
  const [isInverted, setIsInverted] = useState(false);

  // Hold button
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef(null);

  // Multi click
  const [clickCount, setClickCount] = useState(0);

  // Memory sequence
  const [memorySequence, setMemorySequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [activeCell, setActiveCell] = useState(-1);

  // Avoid click
  const [avoidItems, setAvoidItems] = useState([]);

  // Progress
  const progress = useMemo(() => ((step) / TOTAL_STEPS) * 100, [step]);
  const theme = useMemo(() => getThemeForLevel(step), [step]);
  const fontClass = useMemo(() => getFontClass(step), [step]);
  const challengeType = useMemo(() => getChallengeType(step), [step]);

  // Ghost click handler - adds random delay to every interaction
  const ghostClick = useCallback((callback) => {
    const delay = randomBetween(50, 300);
    ghostTimerRef.current = setTimeout(callback, delay);
  }, []);

  // Fail handler - resets to step 0
  const handleFail = useCallback((msg) => {
    const message = msg || INSULTS[randomInt(0, INSULTS.length - 1)];
    setFailMessage(message);
    setFailed(true);
    setStep(0);
    setTimeout(() => {
      setFailed(false);
      setFailMessage('');
    }, 3000);
  }, []);

  // Complete a step
  const handleStepCompletion = useCallback(() => {
    if (step >= TOTAL_STEPS - 1) {
      setCompleted(true);
      return;
    }
    ghostClick(() => {
      setStep((prev) => prev + 1);
      setPasswordInput('');
      setClickCount(0);
      setHoldProgress(0);
      setIsHolding(false);
      setPlayerSequence([]);
      setMemorySequence([]);
      setAvoidItems([]);
      setShowIdleButton(false);
      setIdleTime(0);
    });
  }, [step, ghostClick]);

  // Fail and reset
  const handleStepFail = useCallback(() => {
    ghostClick(() => {
      handleFail();
    });
  }, [ghostClick, handleFail]);

  // Idle detection
  useEffect(() => {
    if (!started || completed || failed) return;

    const handleMouseMove = () => {
      mouseMovedRef.current = true;
      setIdleTime(0);
      setShowIdleButton(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleMouseMove);

    idleTimerRef.current = setInterval(() => {
      setIdleTime((prev) => {
        if (prev >= 3) {
          setShowIdleButton(true);
          return 3;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseMove);
      clearInterval(idleTimerRef.current);
    };
  }, [started, completed, failed]);

  // Amnesic UI effect
  useEffect(() => {
    if (!started || completed || failed) return;

    const interval = setInterval(() => {
      if (challengeType === 'amnesicUI' || challengeType === 'fleeingButton') {
        setButtonsVisible(false);
        setTimeout(() => {
          setButtonsVisible(true);
          setButtonPos({
            x: randomBetween(10, 80),
            y: randomBetween(10, 80),
          });
        }, randomBetween(800, 2000));
      }
    }, randomBetween(3000, 6000));

    return () => clearInterval(interval);
  }, [started, completed, failed, challengeType, step]);

  // Dynamic password - scramble letters while typing
  useEffect(() => {
    if (!started || completed || failed || challengeType !== 'dynamicPassword') return;

    const word = generateDynamicWord();
    setPasswordTarget(word);
    setPasswordDisplay(word);

    passwordIntervalRef.current = setInterval(() => {
      setPasswordDisplay((prev) => {
        const chars = prev.split('');
        const idx = randomInt(0, chars.length - 1);
        if (Math.random() > 0.5) {
          chars[idx] = String.fromCharCode(randomInt(33, 126));
        }
        return chars.join('');
      });
    }, 300);

    return () => clearInterval(passwordIntervalRef.current);
  }, [started, completed, failed, challengeType, step]);

  // Click timing effect
  useEffect(() => {
    if (!started || completed || failed || challengeType !== 'clickTiming') return;

    setTargetPos(0);
    timingIntervalRef.current = setInterval(() => {
      setTargetPos((prev) => (prev + 2) % 100);
    }, 50);

    return () => clearInterval(timingIntervalRef.current);
  }, [started, completed, failed, challengeType, step]);

  // Fake progress bar
  useEffect(() => {
    if (!started || completed || failed) return;

    fakeProgressRef.current = setInterval(() => {
      setFakeProgress((prev) => {
        if (prev >= 99 && Math.random() > 0.3) {
          return randomBetween(0, 30);
        }
        if (prev >= 100) return randomBetween(0, 20);
        return prev + randomBetween(0.5, 2);
      });
    }, 100);

    return () => clearInterval(fakeProgressRef.current);
  }, [started, completed, failed, step]);

  // Distraction popups
  useEffect(() => {
    if (!started || completed || failed) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const messages = [
          "Il tuo mouse è lento.",
          "Stai ancora provando?",
          "Y U NO CLICK RIGHT?",
          "Funziona sul mio PC.",
          "Layer 8 problem detected.",
          "Hai provato a spegnere e riaccendere?",
          "Git blame dice: sei tu.",
          "Buffer overflow nel cervello.",
          "Segfault a livello 0.",
          "La barra di caricamento è una bugia.",
        ];
        const popup = {
          id: Date.now(),
          message: messages[randomInt(0, messages.length - 1)],
          x: randomBetween(5, 85),
          y: randomBetween(5, 85),
        };
        setPopups((prev) => [...prev.slice(-3), popup]);
        setTimeout(() => {
          setPopups((prev) => prev.filter((p) => p.id !== popup.id));
        }, 2500);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [started, completed, failed]);

  // Marquee insults
  useEffect(() => {
    if (!started || completed || failed) return;
    const msgs = [
      ">>> SEI SICURO DI ESSERE UN UMANO? <<<",
      ">>> IL CAPTCHA HA PERSO LA SPERANZA IN TE <<<",
      ">>> CLICK PIU VELOCE!!! <<<",
      ">>> ERRORE 418: I'M A TEAPOT <<<",
      ">>> HAI 0 PROBABILITA' DI SUCCESSO <<<",
    ];
    setMarqueeMessage(msgs[randomInt(0, msgs.length - 1)]);
  }, [step, started, completed, failed]);

  // Memory sequence setup
  useEffect(() => {
    if (!started || completed || failed || challengeType !== 'memorySequence') return;
    const len = Math.min(3 + Math.floor(step / 20), 7);
    const seq = Array.from({ length: len }, () => randomInt(0, 3));
    setMemorySequence(seq);
    setShowingSequence(true);

    let i = 0;
    const showInterval = setInterval(() => {
      if (i < seq.length) {
        setActiveCell(seq[i]);
        setTimeout(() => setActiveCell(-1), 400);
        i++;
      } else {
        setShowingSequence(false);
        clearInterval(showInterval);
      }
    }, 600);

    return () => clearInterval(showInterval);
  }, [started, completed, failed, challengeType, step]);

  // Avoid click items
  useEffect(() => {
    if (!started || completed || failed || challengeType !== 'avoidClick') return;
    const items = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: randomBetween(5, 90),
      y: randomBetween(10, 85),
      isTarget: i === randomInt(0, 11),
      visible: true,
    }));
    setAvoidItems(items);
  }, [started, completed, failed, challengeType, step]);

  // Hold button logic
  useEffect(() => {
    if (isHolding && !completed && !failed) {
      holdIntervalRef.current = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(holdIntervalRef.current);
            handleStepCompletion();
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
    return () => clearInterval(holdIntervalRef.current);
  }, [isHolding, completed, failed, handleStepCompletion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(ghostTimerRef.current);
      clearInterval(passwordIntervalRef.current);
      clearInterval(timingIntervalRef.current);
      clearInterval(fakeProgressRef.current);
      clearInterval(idleTimerRef.current);
      clearInterval(holdIntervalRef.current);
    };
  }, []);

  const handleFleeingButtonHover = () => {
    setButtonPos({
      x: randomBetween(5, 85),
      y: randomBetween(5, 85),
    });
  };

  const handlePasswordInput = (e) => {
    const val = e.target.value;
    setPasswordInput(val);
    if (val.toUpperCase() === passwordTarget) {
      handleStepCompletion();
    }
  };

  const handleTimingClick = () => {
    if (targetPos >= 45 && targetPos <= 55) {
      handleStepCompletion();
    } else {
      handleStepFail();
    }
  };

  const handleMemoryCellClick = (cellIdx) => {
    if (showingSequence) return;
    const newSeq = [...playerSequence, cellIdx];
    setPlayerSequence(newSeq);

    if (newSeq[newSeq.length - 1] !== memorySequence[newSeq.length - 1]) {
      handleStepFail();
      return;
    }

    if (newSeq.length === memorySequence.length) {
      handleStepCompletion();
    }
  };

  const handleAvoidItemClick = (item) => {
    if (item.isTarget) {
      handleStepCompletion();
    } else {
      handleStepFail();
    }
  };

  const renderChallenge = () => {
    if (completed) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 360, 0] }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="text-center"
        >
          <div className="text-6xl md:text-8xl font-black glitch-text mb-8" style={{ color: '#00ff41' }}>
            SEI LIBERO
          </div>
          <div className="text-2xl text-white/60">
            (ma a che costo?)
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mt-8"
          >
            🎉
          </motion.div>
        </motion.div>
      );
    }

    const challengeDescriptions = {
      fleeingButton: 'Clicca il bottone... SE CI RIESCI.',
      amnesicUI: "L'UI ha l'Alzheimer. Clicca prima che svanisca.",
      invertedInput: isInverted
        ? 'Premi AVANTI per andare AVANTI (o forse no).'
        : 'Premi AVANTI per andare INDIETRO (o forse no).',
      dynamicPassword: 'Scrivi la parola che cambia mentre scrivi.',
      clickTiming: 'Clicca quando la barra è nel centro esatto.',
      staticClick: 'Clicca il bottone. Facile... no?',
      holdButton: 'Tieni premuto per 2 secondi. Non muoverti.',
      multiClick: `Clicca 5 volte. Conteggio: ${clickCount}/5`,
      memorySequence: showingSequence ? 'Memorizza la sequenza...' : 'Ripeti la sequenza!',
      avoidClick: 'Clicca SOLO il bottone giusto. Gli altri sono trappole.',
    };

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <motion.p
          key={`desc-${step}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-lg md:text-xl mb-6 text-center px-4 ${fontClass}`}
          style={{ color: theme.text }}
        >
          {challengeDescriptions[challengeType]}
        </motion.p>

        {/* CHALLENGE: FLEEING BUTTON */}
        {challengeType === 'fleeingButton' && (
          <div className="relative w-full h-64 md:h-80">
            <AnimatePresence>
              {buttonsVisible && (
                <motion.button
                  key={`flee-${step}-${buttonPos.x}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.3 }}
                  onMouseEnter={handleFleeingButtonHover}
                  onClick={() => handleStepCompletion()}
                  className="absolute px-6 py-3 rounded font-bold text-lg transition-colors"
                  style={{
                    left: `${buttonPos.x}%`,
                    top: `${buttonPos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    background: theme.accent,
                    color: theme.bg,
                    boxShadow: `0 0 20px ${theme.accent}80`,
                  }}
                >
                  CLICCA QUI
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* CHALLENGE: AMNESIC UI */}
        {challengeType === 'amnesicUI' && (
          <div className="relative w-full h-64 md:h-80">
            <AnimatePresence>
              {buttonsVisible && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.button
                      key={`amn-${step}-${i}-${buttonPos.x}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: buttonsVisible ? 1 : 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => {
                        if (i === 0) handleStepCompletion();
                        else handleStepFail();
                      }}
                      onMouseEnter={() => {
                        if (Math.random() > 0.5) {
                          setButtonPos({
                            x: randomBetween(10, 85),
                            y: randomBetween(10, 85),
                          });
                        }
                      }}
                      className="absolute px-5 py-3 rounded font-bold text-sm"
                      style={{
                        left: `${(buttonPos.x + i * 15) % 90 + 5}%`,
                        top: `${(buttonPos.y + i * 20) % 80 + 10}%`,
                        transform: 'translate(-50%, -50%)',
                        background: i === 0 ? theme.accent : `${theme.accent}30`,
                        color: i === 0 ? theme.bg : theme.text,
                        border: `2px solid ${theme.accent}`,
                        opacity: buttonsVisible ? (i === 0 ? 1 : 0.4 + Math.random() * 0.6) : 0,
                      }}
                    >
                      {i === 0 ? 'QUESTO' : 'NO QUESTO'}
                    </motion.button>
                  ))}
                </>
              )}
            </AnimatePresence>
            {(!buttonsVisible) && (
              <div className="flex items-center justify-center h-full">
                <p className="text-xl animate-pulse" style={{ color: theme.accent }}>
                  Dove sono andati?
                </p>
              </div>
            )}
          </div>
        )}

        {/* CHALLENGE: INVERTED INPUT */}
        {challengeType === 'invertedInput' && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => ghostClick(() => {
                  if (Math.random() > 0.3) {
                    setIsInverted(!isInverted);
                  }
                })}
                className="px-8 py-4 rounded font-bold text-xl"
                style={{
                  background: theme.accent,
                  color: theme.bg,
                  boxShadow: `0 0 30px ${theme.accent}60`,
                }}
              >
                TOGGLE DIREZIONE
              </motion.button>
            </div>
            <div className="flex gap-4 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => ghostClick(() => {
                  if (!isInverted) {
                    handleStepCompletion();
                  } else {
                    handleStepFail();
                  }
                })}
                className="px-10 py-4 rounded font-bold text-xl"
                style={{
                  background: '#00ff00',
                  color: '#000',
                }}
              >
                AVANTI →
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => ghostClick(() => {
                  if (isInverted) {
                    handleStepCompletion();
                  } else {
                    handleStepFail();
                  }
                })}
                className="px-10 py-4 rounded font-bold text-xl"
                style={{
                  background: '#ff0000',
                  color: '#fff',
                }}
              >
                ← INDIETRO
              </motion.button>
            </div>
            <p className="text-sm mt-2" style={{ color: theme.text, opacity: 0.6 }}>
              {isInverted ? '(Modalità invertita ATTIVA)' : '(Modalità normale... per ora)'}
            </p>
          </div>
        )}

        {/* CHALLENGE: DYNAMIC PASSWORD */}
        {challengeType === 'dynamicPassword' && (
          <div className="flex flex-col items-center gap-6">
            <div
              className="text-3xl font-mono tracking-[0.5em] p-4 rounded"
              style={{
                background: `${theme.accent}20`,
                border: `2px solid ${theme.accent}`,
                color: theme.accent,
              }}
            >
              {passwordDisplay}
            </div>
            <input
              type="text"
              value={passwordInput}
              onChange={handlePasswordInput}
              placeholder="Scrivi la parola esatta..."
              autoComplete="off"
              autoFocus
              className="px-4 py-3 rounded text-center text-xl font-mono tracking-widest outline-none"
              style={{
                background: '#000',
                border: `2px solid ${theme.accent}`,
                color: '#fff',
                width: '300px',
              }}
            />
            <p className="text-xs" style={{ color: theme.text, opacity: 0.5 }}>
              Le lettere cambiano mentre guardi. Buona fortuna.
            </p>
          </div>
        )}

        {/* CHALLENGE: CLICK TIMING */}
        {challengeType === 'clickTiming' && (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <div className="relative w-full h-16 rounded overflow-hidden" style={{ background: `${theme.accent}20`, border: `2px solid ${theme.accent}` }}>
              <motion.div
                className="absolute top-0 h-full w-2 rounded"
                style={{
                  left: `${targetPos}%`,
                  background: theme.accent,
                  boxShadow: `0 0 15px ${theme.accent}`,
                }}
              />
              <div
                className="absolute top-0 h-full w-8 rounded opacity-30"
                style={{
                  left: '46%',
                  background: '#00ff00',
                  border: '2px solid #00ff00',
                }}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleTimingClick}
              className="px-10 py-4 rounded font-bold text-xl"
              style={{
                background: theme.accent,
                color: theme.bg,
                boxShadow: `0 0 30px ${theme.accent}60`,
              }}
            >
              CLICCA ORA!
            </motion.button>
            <p className="text-xs" style={{ color: theme.text, opacity: 0.5 }}>
              Clicca quando la linea verde è nella zona verde.
            </p>
          </div>
        )}

        {/* CHALLENGE: STATIC CLICK */}
        {challengeType === 'staticClick' && (
          <div className="flex flex-col items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, rotate: randomBetween(-5, 5) }}
              whileTap={{ scale: 0.9 }}
              onClick={handleStepCompletion}
              className="px-10 py-5 rounded font-bold text-xl"
              style={{
                background: theme.accent,
                color: theme.bg,
                boxShadow: `0 0 30px ${theme.accent}80`,
              }}
            >
              CLICCA QUESTO (facile, vero?)
            </motion.button>
            {[...Array(4)].map((_, i) => (
              <motion.button
                key={`fake-${i}`}
                whileHover={{ x: randomBetween(-20, 20) }}
                onClick={handleStepFail}
                className="px-8 py-3 rounded font-bold text-sm opacity-50"
                style={{
                  background: `${theme.accent}30`,
                  color: theme.text,
                  border: `1px solid ${theme.accent}40`,
                }}
              >
                {['NO QUESTO', 'FORSE QUESTO?', 'CLICCA QUI!', 'QUI!'][i]}
              </motion.button>
            ))}
          </div>
        )}

        {/* CHALLENGE: HOLD BUTTON */}
        {challengeType === 'holdButton' && (
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-64 h-6 rounded overflow-hidden" style={{ background: `${theme.accent}20` }}>
              <motion.div
                className="h-full rounded"
                style={{
                  width: `${holdProgress}%`,
                  background: `linear-gradient(90deg, ${theme.accent}, #00ff00)`,
                }}
              />
            </div>
            <motion.button
              onMouseDown={() => setIsHolding(true)}
              onMouseUp={() => { setIsHolding(false); setHoldProgress(0); }}
              onMouseLeave={() => { setIsHolding(false); setHoldProgress(0); }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 rounded font-bold text-xl"
              style={{
                background: isHolding ? '#00ff00' : theme.accent,
                color: theme.bg,
                boxShadow: `0 0 ${isHolding ? '50' : '20'}px ${isHolding ? '#00ff00' : theme.accent}80`,
              }}
            >
              TIENI PREMUTO
            </motion.button>
          </div>
        )}

        {/* CHALLENGE: MULTI CLICK */}
        {challengeType === 'multiClick' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-4xl font-black" style={{ color: theme.accent }}>
              {clickCount} / 5
            </div>
            <motion.button
              onClick={() => ghostClick(() => {
                const newCount = clickCount + 1;
                if (newCount >= 5) {
                  handleStepCompletion();
                } else {
                  setClickCount(newCount);
                }
              })}
              whileTap={{ scale: 0.8, rotate: randomBetween(-10, 10) }}
              className="px-10 py-5 rounded font-bold text-xl"
              style={{
                background: theme.accent,
                color: theme.bg,
                boxShadow: `0 0 30px ${theme.accent}60`,
              }}
            >
              CLICCA 5 VOLTE!
            </motion.button>
          </div>
        )}

        {/* CHALLENGE: MEMORY SEQUENCE */}
        {challengeType === 'memorySequence' && (
          <div className="flex flex-col items-center gap-6">
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((cell) => (
                <motion.button
                  key={`cell-${cell}`}
                  onClick={() => handleMemoryCellClick(cell)}
                  whileTap={{ scale: 0.9 }}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-lg font-bold text-2xl transition-all"
                  style={{
                    background: activeCell === cell ? theme.accent : `${theme.accent}30`,
                    color: activeCell === cell ? theme.bg : theme.text,
                    border: `3px solid ${theme.accent}`,
                    boxShadow: activeCell === cell ? `0 0 30px ${theme.accent}` : 'none',
                  }}
                >
                  {['■', '▲', '●', '◆'][cell]}
                </motion.button>
              ))}
            </div>
            {showingSequence && (
              <p className="text-sm animate-pulse" style={{ color: theme.accent }}>
                Memorizza! Sequenza: {memorySequence.length} passi
              </p>
            )}
            {!showingSequence && (
              <p className="text-sm" style={{ color: theme.text }}>
                Tocca: {playerSequence.length}/{memorySequence.length}
              </p>
            )}
          </div>
        )}

        {/* CHALLENGE: AVOID CLICK */}
        {challengeType === 'avoidClick' && (
          <div className="relative w-full h-64 md:h-80">
            {avoidItems.map((item) => (
              <motion.button
                key={`avoid-${item.id}`}
                onClick={() => handleAvoidItemClick(item)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                className="absolute w-14 h-14 md:w-16 md:h-16 rounded-full font-bold text-xs"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                  background: item.isTarget ? '#00ff00' : '#ff0000',
                  color: '#000',
                  border: `2px solid ${item.isTarget ? '#00ff00' : '#ff0000'}`,
                  boxShadow: item.isTarget
                    ? `0 0 15px #00ff0080`
                    : `0 0 15px #ff000080`,
                }}
              >
                {item.isTarget ? '✓' : '✗'}
              </motion.button>
            ))}
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs" style={{ color: theme.text, opacity: 0.5 }}>
              Solo il verde. Non toccare il rosso.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Starting screen
  if (!started) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#000' }}>
        <div className="scanline-overlay" />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg px-8"
        >
          <motion.h1
            animate={{ rotate: [0, -2, 2, -2, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-4xl md:text-6xl font-black glitch-text mb-8"
            style={{ color: '#ff0000' }}
          >
            CAPTCHA DELL'INFERNO
          </motion.h1>
          <p className="text-lg mb-2" style={{ color: '#ff6600' }}>
            100 livelli di pura frustrazione.
          </p>
          <p className="text-sm mb-8" style={{ color: '#666' }}>
            Non c'è undo. Non c'è pietà. Non c'è salvezza.
          </p>
          <motion.button
            whileHover={{ scale: 1.1, rotate: randomBetween(-5, 5) }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setStarted(true)}
            className="px-12 py-5 rounded-lg font-black text-2xl transition-all"
            style={{
              background: '#ff0000',
              color: '#fff',
              boxShadow: '0 0 40px #ff000080',
              border: '2px solid #ff4444',
            }}
          >
            ENTRA SE OSI
          </motion.button>
          <p className="text-xs mt-6" style={{ color: '#333' }}>
            (non cliccare se hai problemi cardiaci)
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden transition-all duration-1000"
      style={{
        background: theme.bg,
        transform:
          Math.floor(step / 10) % 3 === 1
            ? `rotate(${Math.sin(step * 0.5) * 2}deg)`
            : 'none',
        filter:
          Math.floor(step / 10) % 4 === 2
            ? 'blur(1px)'
            : Math.floor(step / 10) % 4 === 3
            ? 'invert(0.8)'
            : 'none',
      }}
    >
      <div className="scanline-overlay" />

      {/* FAKE PROGRESS BAR */}
      <div className="w-full h-2 fixed top-0 z-50" style={{ background: '#111' }}>
        <motion.div
          className="h-full"
          style={{
            width: `${Math.min(fakeProgress, 100)}%`,
            background: `linear-gradient(90deg, #ff0000, #ff6600, #ffff00, #00ff00, #0066ff)`,
          }}
        />
      </div>

      {/* TOP BAR */}
      <div
        className="flex items-center justify-between px-4 py-3 md:px-8 z-10"
        style={{ borderBottom: `2px solid ${theme.accent}40` }}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold" style={{ color: theme.accent }}>
            LIVELLO {step + 1}/{TOTAL_STEPS}
          </span>
          <div className="w-32 md:w-48 h-2 rounded-full overflow-hidden" style={{ background: `${theme.accent}20` }}>
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${progress}%` }}
              style={{ background: theme.accent }}
            />
          </div>
        </div>
        <span className="text-xs" style={{ color: theme.text, opacity: 0.5 }}>
          Tema: {getThemeForLevel(step).label} | Font: {getFontClass(step)}
        </span>
      </div>

      {/* MARQUEE */}
      <div className="w-full overflow-hidden py-1" style={{ background: `${theme.accent}10` }}>
        <div className="marquee-text whitespace-nowrap text-sm font-bold" style={{ color: theme.accent }}>
          {marqueeMessage}
        </div>
      </div>

      {/* MAIN CHALLENGE AREA */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.8, rotate: randomBetween(-10, 10) }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.2, rotate: randomBetween(-5, 5) }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            {/* Step title */}
            <motion.h2
              className={`text-2xl md:text-3xl font-black text-center mb-8 ${fontClass}`}
              style={{ color: theme.accent }}
              animate={{
                textShadow: [
                  `0 0 10px ${theme.accent}80`,
                  `0 0 20px ${theme.accent}`,
                  `0 0 10px ${theme.accent}80`,
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              SFIDA #{step + 1}
            </motion.h2>

            {renderChallenge()}
          </motion.div>
        </AnimatePresence>

        {/* DISTRACTION POPUPS */}
        <AnimatePresence>
          {popups.map((popup) => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute p-4 rounded-lg shadow-2xl z-40 max-w-xs"
              style={{
                left: `${popup.x}%`,
                top: `${popup.y}%`,
                transform: 'translate(-50%, -50%)',
                background: '#1a0000',
                border: '2px solid #ff0000',
                color: '#ff4444',
              }}
            >
              <p className="text-sm font-bold">{popup.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* IDLE CAPTURE-THE-FLAG BUTTON */}
        <AnimatePresence>
          {showIdleButton && !completed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: [1, 1.1, 1] }}
              exit={{ opacity: 0 }}
              transition={{ scale: { duration: 0.5, repeat: Infinity } }}
              onClick={() => {
                setShowIdleButton(false);
                setIdleTime(0);
                handleStepCompletion();
              }}
              className="absolute bottom-8 right-8 px-6 py-3 rounded font-bold z-50"
              style={{
                background: '#00ff00',
                color: '#000',
                boxShadow: '0 0 30px #00ff0080',
              }}
            >
              🏴 CLICCA RAPIDO!
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM BAR */}
      <div
        className="flex items-center justify-center gap-4 px-4 py-3 z-10"
        style={{ borderTop: `2px solid ${theme.accent}40` }}
      >
        <span className="text-xs" style={{ color: theme.text, opacity: 0.4 }}>
          {Math.floor(progress)}% completato (ma quale progresso?)
        </span>
      </div>

      {/* FAILURE OVERLAY */}
      <AnimatePresence>
        {failed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[99998]"
            style={{ background: 'rgba(255, 0, 0, 0.9)' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
              className="text-center p-8"
            >
              <div className="text-6xl md:text-8xl font-black glitch-text mb-6" style={{ color: '#fff' }}>
                FALLIMENTO
              </div>
              <p className="text-xl md:text-2xl text-white/90 max-w-md">
                {failMessage}
              </p>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="text-5xl mt-6"
              >
                💀
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
