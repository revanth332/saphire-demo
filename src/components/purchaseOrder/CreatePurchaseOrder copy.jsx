import React, { useState, useEffect, useRef, useCallback } from "react";
// import BotIconSVG from "./bot-icon.svg"; // Not used
// import UserIconSVG from "./user-icon.svg"; // Not used
import { Mic, Check, Send, FileText as DocumentIcon } from "lucide-react";
import GeneratedPO from "./GeneratedPO.png"; // Path to GeneratedPO.png
import GeneratedPO1 from "./PO1.png";
import GeneratedPO2 from "./PO2.png";
import GeneratedPO21 from "./PO21.png";
import GeneratedPO3 from "./PO3.png"; // Path to PO3.png
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const POGenerationScreen = ({
  vendorName = "Miracle Chemicals",
  vendorEmail = "procure@micchecmicals.com",
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState(""); // Stores recognized text
  const [poPreviewContent, setPoPreviewContent] = useState(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatMessagesEndRef = useRef(null);
const siriWaveRef = useRef(null);
  const [conversationStage, setConversationStage] = useState(0);
  const [poDetails, setPoDetails] = useState({
    item: "",
    vendor: "",
    deliveryAddress: "",
    quantity: "",
    price: "",
    parsedItem: "",
  });

  const [isListening, setIsListening] = useState(false);
  const [userWantsToListen, setUserWantsToListen] = useState(true);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [azureSpeechConfig, setAzureSpeechConfig] = useState(null);
  const [synthesizerReady, setSynthesizerReady] = useState(false);

  const speechRecognizerRef = useRef(null);
  const speechSynthesizerRef = useRef(null);
  const ttsQueueRef = useRef([]);
  const botMessageTimeoutsRef = useRef([]);

  const userWantsToListenRef = useRef(userWantsToListen);
  useEffect(() => {
    userWantsToListenRef.current = userWantsToListen;
  }, [userWantsToListen]);
  const isListeningRef = useRef(isListening);
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);
  const isBotSpeakingRef = useRef(isBotSpeaking);
  useEffect(() => {
    isBotSpeakingRef.current = isBotSpeaking;
  }, [isBotSpeaking]);

  const simulateBotResponseRef = useRef(null);
  const handleSendMessageInternalRef = useRef(null);
  const startContinuousAzureListeningRef = useRef(null);
  const stopContinuousAzureListeningRef = useRef(null);
  const speakTextRef = useRef(null);
  const processTTSQueueRef = useRef(null);

  useEffect(() => {
    const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;
    if (!speechKey || !speechRegion) {
      console.error("Azure Speech Key or Region not configured.");
      setSpeechError("Speech service credentials not found.");
      setSpeechSupported(false);
      setSynthesizerReady(false);
      return;
    }
    try {
      const config = SpeechSDK.SpeechConfig.fromSubscription(
        speechKey,
        speechRegion
      );
      config.speechRecognitionLanguage = "en-US";
      setAzureSpeechConfig(config);
      const synthesizer = new SpeechSDK.SpeechSynthesizer(config);
      speechSynthesizerRef.current = synthesizer;
      setSynthesizerReady(true);
      setSpeechSupported(true);
      setSpeechError(null);
    } catch (error) {
      console.error("Error initializing Azure Speech SDK:", error);
      setSpeechError("Failed to initialize speech services.");
      setSpeechSupported(false);
      setSynthesizerReady(false);
    }
    return () => {
      if (speechRecognizerRef.current) {
        try {
          speechRecognizerRef.current.close();
        } catch (e) {
          console.warn("Error closing recognizer:", e);
        }
        speechRecognizerRef.current = null;
      }
      if (speechSynthesizerRef.current) {
        try {
          speechSynthesizerRef.current.close();
        } catch (e) {
          console.warn("Error closing synthesizer:", e);
        }
        speechSynthesizerRef.current = null;
      }
      setSynthesizerReady(false);
      botMessageTimeoutsRef.current.forEach(clearTimeout);
      botMessageTimeoutsRef.current = [];
    };
  }, []);

  const simulateBotResponseFn = useCallback(
    (userMessageText) => {
      botMessageTimeoutsRef.current.forEach(clearTimeout);
      botMessageTimeoutsRef.current = [];

      setIsBotTyping(true);
      let botResponses = [];
      let nextStage = conversationStage;
      let updatedPoDetails = { ...poDetails };

      const addBotMessage = (text, delay = 0, poUpdate = undefined) => {
        botResponses.push({ text, delay, poUpdate });
      };

      const resetPoData = () => {
        return {
          item: "",
          vendor: "",
          deliveryAddress: "",
          quantity: "",
          price: "",
          parsedItem: "",
        };
      };

      switch (conversationStage) {
        case 0: // User provides item (e.g., "Sodium Hypochlorite")
          updatedPoDetails.item = userMessageText.trim();
          updatedPoDetails.parsedItem = userMessageText.trim();
          addBotMessage(`Got it: ${updatedPoDetails.parsedItem}.`, 1200, "1"); // Show PO1.png
          addBotMessage("Who’s the supplier?", 1200);
          nextStage = 1;
          break;

        case 1: // User provides supplier (e.g., "Miracle Chemicals")
          updatedPoDetails.vendor = userMessageText.trim();
          if (updatedPoDetails.vendor.toLowerCase().includes("miracle chem")) {
            updatedPoDetails.vendor = "Miracle Chemicals";
          }
          addBotMessage(`Supplier is ${updatedPoDetails.vendor}.`, 1200,"21");
          addBotMessage("Where should the delivery be made?", 1200);
          nextStage = 2;
          break;

        case 2: // User provides delivery address (e.g., "Grand River Avenue, Michigan")
          updatedPoDetails.deliveryAddress = userMessageText.trim();
          addBotMessage(
            `Delivery to ${updatedPoDetails.deliveryAddress}.`,
            1200,
            "2"
          ); // Show PO2.png
          addBotMessage("Understood. How much quantity do you need?", 1200);
          nextStage = 3;
          break;

        case 3: // User provides quantity (e.g., "500 gallons")
          const quantityMatch = userMessageText.match(/(\d+\s*gallon[s]?)/i);
          if (quantityMatch) {
            updatedPoDetails.quantity = quantityMatch[1];
            updatedPoDetails.price = "$1.25 per gallon"; // Example price
            addBotMessage(
              `Perfect. Quantity: ${updatedPoDetails.quantity}. I have all the details.`,
              1000
            );
            addBotMessage("Generating the purchase order now.", 1500);
            addBotMessage(
              `Okay, I've drafted the PO. Please review the details on the right. You can then click "Send PO".`,
              1500,
              "3" // This will result in GeneratedPO3.png being displayed due to current JSX logic.
            );
            nextStage = 4;
          } else {
            addBotMessage(
              "I didn't catch the quantity in gallons. How many gallons do we need?",
              1200
            );
          }
          break;

        case 4: // PO is ready, user might say "new po" or click the button
          if (
            userMessageText
              .toLowerCase()
              .match(/new po|start over|reset|create new/i)
          ) {
            addBotMessage(
              "Alright, let's start a new Purchase Order.",
              0,
              null
            );
            addBotMessage("What chemical would you like to order today?", 1200);
            updatedPoDetails = resetPoData();
            nextStage = 0;
          } else {
            addBotMessage(
              "The PO is ready on the right. You can click 'Send PO' or say 'new po' to start another one.",
              0
            );
          }
          break;

        default:
          addBotMessage("I'm a bit lost. Let's try starting over.", 0, null);
          addBotMessage("What chemical would you like to order today?", 1200);
          updatedPoDetails = resetPoData();
          nextStage = 0;
      }

      setConversationStage(nextStage);
      setPoDetails(updatedPoDetails);

      const BASE_INTERVAL = 5000;
      const RANDOM_INTERVAL_SPAN = 1000;
      let cumulativeDelay =
        BASE_INTERVAL + Math.random() * RANDOM_INTERVAL_SPAN;

      botResponses.forEach((response) => {
        const timeoutId = setTimeout(() => {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Date.now() + Math.random(),
              text: response.text,
              sender: "bot",
            },
          ]);
          if (userWantsToListenRef.current) {
            // Only queue TTS if user wants to listen
            ttsQueueRef.current.push({ text: response.text });
            if (processTTSQueueRef.current) processTTSQueueRef.current();
          }
          if (response.poUpdate !== undefined) {
            setPoPreviewContent(response.poUpdate);
          }
        }, cumulativeDelay);
        botMessageTimeoutsRef.current.push(timeoutId);

        let intervalToNextMessage;
        if (response.delay && response.delay > 0) {
          intervalToNextMessage = response.delay + Math.random() * 200;
        } else {
          intervalToNextMessage =
            BASE_INTERVAL + Math.random() * RANDOM_INTERVAL_SPAN;
        }
        cumulativeDelay += intervalToNextMessage;
      });

      const finalTimeoutId = setTimeout(() => {
        setIsBotTyping(false);
        if (
          userWantsToListenRef.current &&
          !isListeningRef.current &&
          !isBotSpeakingRef.current &&
          speechSupported &&
          startContinuousAzureListeningRef.current
        ) {
          if (ttsQueueRef.current.length === 0) {
            startContinuousAzureListeningRef.current();
          }
        }
      }, cumulativeDelay);
      botMessageTimeoutsRef.current.push(finalTimeoutId);
    },
    [conversationStage, poDetails, speechSupported] // Added setMessages, setPoPreviewContent, setIsBotTyping, setPoDetails, setConversationStage if they were not stable, but useState setters are.
  );
  useEffect(() => {
    simulateBotResponseRef.current = simulateBotResponseFn;
  }, [simulateBotResponseFn]);

  const handleSendMessageInternalFn = useCallback((textToSend) => {
    if (textToSend.trim() === "") return;

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now() + "-user-" + Math.random(),
        text: textToSend,
        sender: "user",
      },
    ]);

    // inputValue is already set to textToSend by the recognizer.recognized callback.
    // It will remain as textToSend in the centerDisplayText during the delay.
    // We will clear it *after* the delay, right before simulating the bot response.

    const userDisplayTime = 1500; // Display user's recognized text for 1.5 seconds

    setTimeout(() => {
      setInputValue(""); // Clear recognized text from input display *after* the delay
      if (simulateBotResponseRef.current) {
        simulateBotResponseRef.current(textToSend); // This will set isBotTyping = true
      }
    }, userDisplayTime);
  }, []); // setMessages, setInputValue are stable from useState. simulateBotResponseRef is a stable ref object.
  useEffect(() => {
    handleSendMessageInternalRef.current = handleSendMessageInternalFn;
  }, [handleSendMessageInternalFn]);

  const startContinuousAzureListeningFn = useCallback(() => {
    if (!azureSpeechConfig || !speechSupported || isBotSpeakingRef.current)
      return;
    if (isListeningRef.current && speechRecognizerRef.current) return;

    if (speechRecognizerRef.current) {
      try {
        speechRecognizerRef.current.close();
      } catch (e) {
        /* ignore */
      }
      speechRecognizerRef.current = null;
    }

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(
      azureSpeechConfig,
      audioConfig
    );
    speechRecognizerRef.current = recognizer;
    setSpeechError(null);

    recognizer.recognizing = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizingSpeech)
        setInputValue(e.result.text);
    };
    recognizer.recognized = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        const transcript = e.result.text;
        setInputValue(transcript); // User sees their text here
        if (
          transcript.trim() &&
          !isBotSpeakingRef.current &&
          handleSendMessageInternalRef.current
        ) {
          // This short timeout can remain, it helps ensure state updates propagate
          // before handleSendMessageInternalFn which now has its own longer delay.
          setTimeout(
            () => handleSendMessageInternalRef.current(transcript),
            50
          );
        } else if (!transcript.trim()) setInputValue("");
      } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch)
        setInputValue("");
    };
    recognizer.canceled = (s, e) => {
      console.error(`STT: CANCELED: Reason=${e.reason}`, e.errorDetails);
      let errText = "Speech recognition canceled.";
      if (e.reason === SpeechSDK.CancellationReason.Error) {
        if (e.errorDetails && e.errorDetails.includes("Permission denied")) {
          errText = "Microphone access denied. Please enable it.";
          setSpeechSupported(false);
          setUserWantsToListen(false);
        } else if (
          e.errorCode === SpeechSDK.CancellationErrorCode.ConnectionFailure
        ) {
          errText = "Connection to speech service failed.";
        } else {
          errText = `STT Error: ${
            e.errorDetails ? e.errorDetails.substring(0, 100) : "Unknown"
          }`;
        }
      }
      setSpeechError(errText);
      setInputValue("");
      if (speechRecognizerRef.current === recognizer) {
        try {
          recognizer.close();
        } catch (err) {
          /*ignore*/
        }
        speechRecognizerRef.current = null;
      }
      setIsListening(false);
    };
    recognizer.sessionStarted = () => {
      setIsListening(true);
      setInputValue("");
      setSpeechError(null);
    };
    recognizer.sessionStopped = () => {
      setIsListening(false);
    };

    recognizer.startContinuousRecognitionAsync(
      () => {},
      (err) => {
        console.error("STT: Error starting continuous recognition:", err);
        setSpeechError(`STT Start Error: ${err}`);
        if (speechRecognizerRef.current === recognizer) {
          try {
            recognizer.close();
          } catch (err) {
            /*ignore*/
          }
          speechRecognizerRef.current = null;
        }
        setIsListening(false);
      }
    );
  }, [azureSpeechConfig, speechSupported]); // Added setIsListening, setInputValue, setSpeechError, setSpeechSupported, setUserWantsToListen for completeness though setters are stable.
  useEffect(() => {
    startContinuousAzureListeningRef.current = startContinuousAzureListeningFn;
  }, [startContinuousAzureListeningFn]);

  const stopContinuousAzureListeningFn = useCallback(
    (preserveUserIntent = false) => {
      if (speechRecognizerRef.current) {
        const recognizerToStop = speechRecognizerRef.current;
        speechRecognizerRef.current = null;

        recognizerToStop.stopContinuousRecognitionAsync(
          () => {
            try {
              recognizerToStop.close();
            } catch (e) {
              console.warn("Error closing recognizer on stop:", e);
            }
            if (!preserveUserIntent || !userWantsToListenRef.current)
              setIsListening(false);
          },
          (err) => {
            console.error("Error stopping STT:", err);
            try {
              recognizerToStop.close();
            } catch (e) {
              console.warn("Error closing recognizer on stop error:", e);
            }
            if (!preserveUserIntent || !userWantsToListenRef.current)
              setIsListening(false);
          }
        );
      }
      if (!preserveUserIntent) {
        setUserWantsToListen(false);
      }
      if (!preserveUserIntent || !userWantsToListenRef.current) {
        setIsListening(false);
      }
    },
    [] // Added setIsListening, setUserWantsToListen as they are state setters.
  );
  useEffect(() => {
    stopContinuousAzureListeningRef.current = stopContinuousAzureListeningFn;
  }, [stopContinuousAzureListeningFn]);

  const speakTextFn = useCallback(
    async (textToSpeak) => {
      if (isListeningRef.current && stopContinuousAzureListeningRef.current) {
        stopContinuousAzureListeningRef.current(true);
      }

      if (!speechSynthesizerRef.current || !textToSpeak || !synthesizerReady) {
        console.warn("TTS: Synthesizer not ready or no text to speak.");
        ttsQueueRef.current.shift();
        if (ttsQueueRef.current.length > 0 && processTTSQueueRef.current)
          processTTSQueueRef.current();
        else if (
          userWantsToListenRef.current &&
          !isListeningRef.current &&
          !isBotSpeakingRef.current &&
          speechSupported &&
          startContinuousAzureListeningRef.current
        ) {
          setTimeout(() => {
            if (
              userWantsToListenRef.current &&
              !isListeningRef.current &&
              !isBotSpeakingRef.current &&
              speechSupported &&
              startContinuousAzureListeningRef.current
            ) {
              startContinuousAzureListeningRef.current();
            }
          }, 250);
        }
        return;
      }

      setIsBotSpeaking(true);
      setSpeechError(null);
      setInputValue("");

      speechSynthesizerRef.current.speakTextAsync(
        textToSpeak,
        (result) => {
          setIsBotSpeaking(false);
          if (
            result.reason !== SpeechSDK.ResultReason.SynthesizingAudioCompleted
          ) {
            console.error("TTS Error:", result.errorDetails);
            setSpeechError(
              `TTS Error: ${
                result.errorDetails
                  ? result.errorDetails.substring(0, 100)
                  : "Unknown"
              }`
            );
          }
          ttsQueueRef.current.shift();
          if (ttsQueueRef.current.length > 0 && processTTSQueueRef.current)
            processTTSQueueRef.current();
          else if (
            userWantsToListenRef.current &&
            !isListeningRef.current &&
            speechSupported &&
            startContinuousAzureListeningRef.current
          ) {
            setTimeout(() => {
              if (
                userWantsToListenRef.current &&
                !isListeningRef.current &&
                speechSupported &&
                startContinuousAzureListeningRef.current
              ) {
                startContinuousAzureListeningRef.current();
              }
            }, 250);
          }
        },
        (error) => {
          setIsBotSpeaking(false);
          console.error("TTS Failure:", error);
          setSpeechError(`TTS Failure: ${String(error).substring(0, 100)}`);
          ttsQueueRef.current.shift();
          if (ttsQueueRef.current.length > 0 && processTTSQueueRef.current)
            processTTSQueueRef.current();
          else if (
            userWantsToListenRef.current &&
            !isListeningRef.current &&
            speechSupported &&
            startContinuousAzureListeningRef.current
          ) {
            setTimeout(() => {
              if (
                userWantsToListenRef.current &&
                !isListeningRef.current &&
                speechSupported &&
                startContinuousAzureListeningRef.current
              ) {
                startContinuousAzureListeningRef.current();
              }
            }, 250);
          }
        }
      );
    },
    [synthesizerReady, speechSupported] // Added setIsBotSpeaking, setSpeechError, setInputValue.
  );
  useEffect(() => {
    speakTextRef.current = speakTextFn;
  }, [speakTextFn]);

  const processTTSQueueFn = useCallback(() => {
    if (
      ttsQueueRef.current.length > 0 &&
      !isBotSpeakingRef.current &&
      synthesizerReady
    ) {
      setTimeout(() => {
        // Small delay before speaking to ensure UI updates if any
        if (
          ttsQueueRef.current.length > 0 &&
          !isBotSpeakingRef.current &&
          synthesizerReady &&
          speakTextRef.current
        ) {
          speakTextRef.current(ttsQueueRef.current[0].text);
        }
      }, 100);
    }
  }, [synthesizerReady]);
  useEffect(() => {
    processTTSQueueRef.current = processTTSQueueFn;
  }, [processTTSQueueFn]);

  const [welcomeMessageSent, setWelcomeMessageSent] = useState(false);
  useEffect(() => {
    if (
      welcomeMessageSent ||
      (!synthesizerReady && speechSupported && !azureSpeechConfig) // Wait for config OR non-supported state
    ) {
      return;
    }

    // This check ensures we proceed if speech is not supported OR if synthesizer is ready
    if (!speechSupported || synthesizerReady) {
      const welcomeMessageText =
        "Hello! Let's create a new purchase order. What chemical would you like to order today?";

      setMessages((prevMessages) => {
        // Prevent adding duplicate welcome messages on HMR or re-renders
        if (prevMessages.some((m) => m.id.startsWith("welcome-"))) {
          return prevMessages;
        }
        return [
          {
            id: "welcome-" + Date.now(),
            text: welcomeMessageText,
            sender: "bot",
          },
        ];
      });

      if (
        synthesizerReady &&
        speechSynthesizerRef.current &&
        userWantsToListenRef.current // Check if user wants to listen
      ) {
        // Only queue TTS if the queue is empty to avoid duplicate speech on fast re-renders
        if (ttsQueueRef.current.length === 0) {
           ttsQueueRef.current.push({ text: welcomeMessageText });
           if (processTTSQueueRef.current) processTTSQueueRef.current();
        }
      }
      setWelcomeMessageSent(true); // Mark as sent to prevent re-triggering easily

      // Start listening after welcome message if conditions are met
      if (
        userWantsToListenRef.current && // User wants to listen
        speechSupported && // Speech is supported
        (!synthesizerReady || ttsQueueRef.current.length === 0) // Either synthesizer not ready (so no TTS) OR TTS queue is empty
      ) {
        if (
          startContinuousAzureListeningRef.current &&
          !isBotTyping && // Not typing
          !isBotSpeakingRef.current && // Not speaking
          !isListeningRef.current // Not already listening
        ) {
           setTimeout(() => { // Add a small delay to allow TTS to potentially start
            if (
                startContinuousAzureListeningRef.current &&
                !isBotTyping &&
                !isBotSpeakingRef.current &&
                !isListeningRef.current &&
                userWantsToListenRef.current && // Re-check intent
                ttsQueueRef.current.length === 0 // Ensure TTS queue is still empty (if TTS was possible)
            ) {
                startContinuousAzureListeningRef.current();
            }
           }, 500); // Delay for TTS to potentially complete or if no TTS, start listening
        }
      }
    }
  }, [
    synthesizerReady,
    speechSupported,
    azureSpeechConfig, // Dependency to re-evaluate when config is ready
    welcomeMessageSent, // Dependency to prevent re-sending
    isBotTyping, // To check if bot is typing before starting listening
    // Removed setMessages from deps as it's stable and can cause loops. Handled by welcomeMessageSent flag.
  ]);

  useEffect(() => {
    // Initial setup on mount
    setConversationStage(0);
    setPoDetails({
      item: "",
      vendor: "",
      deliveryAddress: "",
      quantity: "",
      price: "",
      parsedItem: "",
    });
    setPoPreviewContent(null);
    setInputValue("");
    // setMessages([]); // Welcome message is now handled by its own effect.
    ttsQueueRef.current = [];
    setWelcomeMessageSent(false); // Reset welcome message for potential full re-mount/refresh
    setIsBotTyping(false);
    setIsBotSpeaking(false); // Ensure bot is not marked as speaking initially
    // Clear any pending timeouts from previous instances (e.g., HMR)
    botMessageTimeoutsRef.current.forEach(clearTimeout);
    botMessageTimeoutsRef.current = [];
  }, []); // Empty array: runs on mount

  const handleToggleListening = useCallback(() => {
    if (!speechSupported) {
      setSpeechError("Speech recognition is not supported or configured.");
      return;
    }
    if (isBotSpeakingRef.current || isBotTyping) {
      // Don't toggle if bot is active
      return;
    }

    const newListeningIntent = !userWantsToListenRef.current;
    setUserWantsToListen(newListeningIntent); // Update user's general preference first

    if (newListeningIntent) {
      // If user now wants to listen
      if (startContinuousAzureListeningRef.current && !isListeningRef.current) // And not already listening
        startContinuousAzureListeningRef.current();
    } else {
      // If user now wants to mute
      if (stopContinuousAzureListeningRef.current)
        stopContinuousAzureListeningRef.current(false); // false = don't preserve intent (user explicitly muted)
      setInputValue(""); // Clear any partial input
    }
  }, [speechSupported, isBotTyping]); // isBotTyping added as a guard

  const handleSendPo = () => {
    if (poPreviewContent) {
      const poSummary = `Item: ${poDetails.parsedItem || "N/A"}\nVendor: ${
        poDetails.vendor || vendorName
      }\nQuantity: ${poDetails.quantity || "N/A"}\nPrice: ${
        poDetails.price || "N/A"
      }\nDelivery: ${poDetails.deliveryAddress || "N/A"}`;
      alert(`Purchase Order would be sent now (Simulated):\n\n${poSummary}`);

      const successMessageText = "Purchase Order has been sent!";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + "-bot-sent",
          text: successMessageText,
          sender: "bot",
        },
      ]);
      if (userWantsToListenRef.current && synthesizerReady) {
        ttsQueueRef.current.push({ text: successMessageText });
        // processTTSQueueRef.current(); // Will be processed if queue was empty
      }

      // Reset for a new PO
      setPoPreviewContent(null);
      setPoDetails({
        item: "",
        vendor: "",
        deliveryAddress: "",
        quantity: "",
        price: "",
        parsedItem: "",
      });
      setConversationStage(0);
      setInputValue("");

      // Prompt for new order
      setTimeout(() => {
        const newOrderMsgText =
          "Hello! Let's create a new purchase order. What chemical would you like to order today?";
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + "-bot-new-prompt",
            text: newOrderMsgText,
            sender: "bot",
          },
        ]);
        if (userWantsToListenRef.current && synthesizerReady) {
          ttsQueueRef.current.push({ text: newOrderMsgText });
          if (processTTSQueueRef.current) processTTSQueueRef.current(); // Ensure queue processing is triggered
        } else if ( // If TTS not ready/wanted, but speech is on, try to start listening
          userWantsToListenRef.current &&
          speechSupported &&
          !isListeningRef.current &&
          !isBotSpeakingRef.current && // ensure bot is not about to speak the new prompt
          startContinuousAzureListeningRef.current
        ) {
          if (ttsQueueRef.current.length === 0) { // Only if no TTS is pending
             startContinuousAzureListeningRef.current();
          }
        }
      }, 1000); // Delay before new prompt
    } else {
      const noPoText =
        "No PO to send. Please generate one using voice commands first.";
      alert(noPoText);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + "-bot-no-po", text: noPoText, sender: "bot" },
      ]);
      if (userWantsToListenRef.current && synthesizerReady) {
        ttsQueueRef.current.push({ text: noPoText });
        if (processTTSQueueRef.current) processTTSQueueRef.current();
      }
    }
  };


  const styles = {
    pageContainer: {
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif",
      height: "100vh",
      margin: "0 auto",
      border: "1px solid #ccc",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      overflow: "hidden",
    },
    header: {
      padding: "20px",
      borderBottom: "1px solid #e0e0e0",
      backgroundColor: "#f8f9fa",
    },
    mainTitle: { fontSize: "24px", fontWeight: "bold", marginBottom: "5px" },
    subTitle: { fontSize: "14px", color: "#555", marginBottom: "10px" },
    vendorInfo: { fontSize: "12px", color: "#777" },
    contentArea: { display: "flex", flex: 1, overflow: "hidden" },
    chatPane: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#FFFFFF",
      color: "#212529",
      padding: "20px",
      position: "relative",
      borderRight: "1px solid #E0E0E0",
    },
    voiceUIPrompt: {
      fontSize: "22px",
      fontWeight: "bold",
      textAlign: "left",
      padding: "10px 0",
      color: "#495057",
      minHeight: "60px", // Ensures space for 2 lines of text
      lineHeight: "1.4",
    },
    recognizedTextDisplay: {
      fontSize: "14px",
      fontWeight: "500",
      textAlign: "left",
      padding: "20px 0",
      minHeight: "120px", // Increased min-height for visibility
      flexGrow: 1, // Allows it to take up available space
      display: "flex",
      alignItems: "flex-start", // Align text to the top
      color: "#212529", // User's input color
      lineHeight: "1.3",
      overflowY: "auto", // Add scroll for very long inputs, though unlikely for STT
      maxHeight: "calc(100vh - 450px)", // Example max height
    },
    voiceUIControlsContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingBottom: "20px", // Ensure padding at the bottom
      marginTop: "auto", // Pushes controls to the bottom of chatPane
    },
    waveformDisplay: {
      height: "50px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "15px 0", // Standard margin
    },
    waveformBar: {
      width: "5px",
      height: "35px",
      backgroundColor: "#007bff", // Primary blue
      margin: "0 3px",
      borderRadius: "2px",
      animation: "pulse 1.2s ease-in-out infinite",
    },
    speechErrorText: {
      color: "#DC3545", // Bootstrap danger color
      fontSize: "14px",
      textAlign: "center",
      marginBottom: "10px",
      minHeight: "18px", // Reserve space even if empty
      fontWeight: "bold",
    },
    circularMicButton: {
      width: "70px",
      height: "70px",
      borderRadius: "50%",
      border: "1px solid #ced4da", // Standard border color
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8f9fa", // Light gray background
      color: "#495057", // Dark gray icon/text color
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)", // Subtle shadow
      transition:
        "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease",
    },
    speechStatusText: {
      color: "#6c757d", // Muted text color
      fontSize: "14px",
      textAlign: "center",
      marginTop: "12px", // Space above the text
      minHeight: "20px", // Reserve space
    },
    previewPane: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      padding: "0", // No padding for the pane itself, handled by children
      backgroundColor: "white", // or #f8f9fa for consistency
    },
    previewHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px", // Standard padding
      borderBottom: "1px solid #e0e0e0", // Separator line
    },
    previewTitle: { fontSize: "18px", fontWeight: "bold" },
    sendPoButton: {
      padding: "10px 15px",
      backgroundColor: "#28a745", // Green for send/success
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
    },
    previewContent: {
      flex: 1, // Takes remaining space
      padding: "20px", // Padding for the content area
      overflowY: "auto", // Scroll if content overflows
      fontSize: "14px",
      color: "#333",
    },
    previewPlaceholder: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%", // Fill the previewContent area
      color: "#888", // Muted color for placeholder
      textAlign: "center",
    },
  };

  // Logic for centerDisplayText and mic button appearance
  let centerDisplayText = inputValue || ""; // Default to inputValue
  let micStatusText = "Tap to Speak"; // Default status
  let micButtonDynamicStyle = { // Default style for mic button
    backgroundColor: styles.circularMicButton.backgroundColor,
    color: styles.circularMicButton.color,
    borderColor: styles.circularMicButton.border
      ? styles.circularMicButton.border.split(" ")[2] // Safely access border color
      : "#ced4da",
  };
  const micDisabled = !speechSupported || isBotSpeaking || isBotTyping;


  if (isBotSpeaking) {
    if (inputValue && !isListening) centerDisplayText = inputValue; // If there's lingering input
    else centerDisplayText = "Assistant is speaking...";
    micStatusText = "Assistant Speaking...";
    micButtonDynamicStyle = {
      backgroundColor: "#e9ecef", // Disabled/muted background
      color: "#adb5bd", // Disabled/muted text
      borderColor: "#ced4da",
    };
  } else if (isBotTyping) {
    // When bot is typing, we prioritize "Assistant is processing..."
    // inputValue might have been cleared by now, or might be the user's last speech.
    // If handleSendMessageInternal has delayed clearing inputValue, it will show here.
    // However, the primary state is "processing".
    if (inputValue && !isListening) {
        // This case means user's text is still in inputValue AND bot just started typing.
        // We want to show the user's text for that brief moment before it's cleared by the processing logic.
        // centerDisplayText is already inputValue by default, so this is fine.
    } else {
        centerDisplayText = "Assistant is processing...";
    }
    micStatusText = "Processing...";
    micButtonDynamicStyle = {
      backgroundColor: "#e9ecef",
      color: "#adb5bd",
      borderColor: "#ced4da",
    };
  } else if (isListening) { // Actively listening
    if (!inputValue) centerDisplayText = "Listening..."; // Show "Listening..." if no partial speech yet
    // If inputValue has partial speech, it's already set in centerDisplayText
    micStatusText = "Listening...";
    micButtonDynamicStyle = {
      backgroundColor: "#dc3545", // Red for active listening
      color: "white",
      borderColor: "#dc3545",
    };
  } else if (userWantsToListen) { // Mic is "on" but not actively capturing (e.g., paused between utterances)
    // If inputValue is empty (common state here), show nothing or last prompt.
    // If messages array is empty (very initial state), prompt to tap.
    if (!inputValue && messages.filter((m) => m.sender === "bot").length === 0) {
        centerDisplayText = "Tap the mic to start";
    } else if (!inputValue) {
        // If inputValue is cleared, centerDisplayText becomes empty, effectively showing last bot prompt below it.
        // This is usually desired.
        centerDisplayText = "";
    }
    // if inputValue has content (e.g. user typed, or speech recognized but not yet processed), it will show.
    micStatusText = "Muted"; // Or "Ready to Listen" / "Tap to Unmute"
    micButtonDynamicStyle = {
      backgroundColor: "#007bff", // Blue for "ready" or "muted but armed" state
      color: "white",
      borderColor: "#007bff",
    };
  } else { // Mic is off / user doesn't want to listen
    if (!inputValue) centerDisplayText = "Tap the mic to start";
    // if inputValue has content (e.g. user typed), it will show.
    micStatusText = "Tap to Speak";
    // Default mic button style already set
  }


  if (!speechSupported) {
    micButtonDynamicStyle = {
      backgroundColor: "#e9ecef",
      color: "#adb5bd",
      borderColor: "#ced4da",
    };
    micStatusText = "Speech Unavailable";
    // Override centerDisplayText if it's a generic placeholder, to show speech is unavailable
    const nonInputStates = [
      "Listening...",
      "Muted",
      "Tap the mic to start",
      "Assistant is speaking...",
      "Assistant is processing...",
      "", // Empty string, which happens if inputValue is cleared
    ];
    if (
      !inputValue || // If inputValue is empty
      nonInputStates.includes(centerDisplayText) // Or centerDisplayText is one of the placeholders
    ) {
      centerDisplayText = "Speech services unavailable.";
    }
  }


  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        <div style={styles.mainTitle}>Generate PO</div>
        <div style={styles.subTitle}>
          Use voice to interact with the chatbot for Purchase Orders.
        </div>
       
      </div>
      <div style={styles.contentArea}>
        <div style={styles.chatPane}>
          <div style={styles.voiceUIPrompt}>
            {/* Display the last bot message as the current prompt */}
            {messages.filter((m) => m.sender === "bot").slice(-1)[0]?.text ||
              (speechSupported
                ? "Initializing..."
                : "Speech services unavailable.")}
          </div>
          <div style={styles.recognizedTextDisplay}>
            {/* Display user's live speech input or status like "Listening..." */}
            {centerDisplayText || "\u00A0" /* Non-breaking space for layout */}
          </div>
          <div style={styles.voiceUIControlsContainer}>
            <div style={styles.waveformDisplay}>
              {isListening && !isBotSpeaking && !isBotTyping && (
                <>
                  <div
                    style={{ ...styles.waveformBar, animationDelay: "0s" }}
                  />
                  <div
                    style={{
                      ...styles.waveformBar,
                      backgroundColor: "#17a2b8", // Secondary color for variation
                      animationDelay: "0.15s",
                    }}
                  />
                  <div
                    style={{ ...styles.waveformBar, animationDelay: "0.3s" }}
                  />
                  <div
                    style={{
                      ...styles.waveformBar,
                      backgroundColor: "#17a2b8",
                      animationDelay: "0.45s",
                    }}
                  />
                  <div
                    style={{ ...styles.waveformBar, animationDelay: "0.60s" }}
                  />
                </>
              )}
            </div>
            <div style={styles.speechErrorText}>{speechError}</div>
            <button
              style={{
                ...styles.circularMicButton,
                ...micButtonDynamicStyle, // Apply dynamic styles
                cursor: micDisabled ? "not-allowed" : "pointer",
              }}
              onClick={handleToggleListening}
              disabled={micDisabled}
              title={
                micDisabled
                  ? isBotSpeaking
                    ? "Assistant is speaking"
                    : isBotTyping
                    ? "Assistant is processing"
                    : "Speech not supported"
                  : isListening
                  ? "Listening... (Click to Mute)"
                  : userWantsToListen
                  ? "Muted (Click to Unmute/Listen)"
                  : "Activate Microphone (Click to Speak)"
              }
            >
              <Mic size={32} />
            </button>
            <div style={styles.speechStatusText}>
              {!speechError ? micStatusText : "" /* Show status if no error */}
            </div>
          </div>
          {/* This ref is for scrolling, not directly visible */}
          <div ref={chatMessagesEndRef} />
        </div>

        <div style={styles.previewPane}>
          <div style={styles.previewHeader}>
            <div style={styles.previewTitle}>PO Preview</div>
            <button
              style={{
                ...styles.sendPoButton,
                opacity:
                  !poPreviewContent || isBotTyping || isBotSpeaking ? 0.5 : 1,
                cursor:
                  !poPreviewContent || isBotTyping || isBotSpeaking
                    ? "not-allowed"
                    : "pointer",
              }}
              onClick={handleSendPo}
              disabled={!poPreviewContent || isBotTyping || isBotSpeaking}
            >
              <Send size={18} style={{ marginRight: "5px" }} /> Send PO
            </button>
          </div>
          <div style={styles.previewContent}>
            {poPreviewContent ? (
              <>
                {poPreviewContent === "1" ? (
                  <img
                    src={GeneratedPO1}
                    alt="Generated Purchase Order Preview - Step 1"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                ) : poPreviewContent === "21" ? (
                  <img
                    src={GeneratedPO21}
                    alt="Generated Purchase Order Preview - Step 2.1"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                ) : poPreviewContent === "2" ? (
                  <img
                    src={GeneratedPO2}
                    alt="Generated Purchase Order Preview - Step 2"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                ) : (
                  // Default to GeneratedPO3 for the final PO preview (GeneratedPO maps to this)
                  <img
                    src={GeneratedPO} // Assuming GeneratedPO (imported as GeneratedPO) is the final one.
                    alt="Generated Purchase Order Preview"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                )}
              </>
            ) : (
              <div style={styles.previewPlaceholder}>
                <DocumentIcon size={48} style={{ marginBottom: "10px" }} />
                <div>Purchase Order Preview will appear here...</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* CSS Keyframes for waveform animation */}
      <style>{`
        @keyframes pulse {
          0% { transform: scaleY(0.3); opacity: 0.7; }
          50% { transform: scaleY(1); opacity: 1; }
          100% { transform: scaleY(0.3); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default POGenerationScreen;