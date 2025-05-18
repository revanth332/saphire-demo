import React, { useState, useEffect, useRef, useCallback } from "react";
// import BotIconSVG from "./bot-icon.svg"; // Not used
// import UserIconSVG from "./user-icon.svg"; // Not used
import { Mic, Send, FileText as DocumentIcon } from "lucide-react";
import GeneratedPO from "./GeneratedPO.png"; // Path to GeneratedPO.png - Maintained for original reference, not used in new flow explicitly by "GeneratedPO" name
import GeneratedPO1 from "./PO1.png"; // Used for first PO preview
import GeneratedPO2 from "./PO2.png"; // Used for second PO preview
// import GeneratedPO21 from "./PO21.png"; // Not used in the new flow
import GeneratedPO3 from "./PO3.png"; // Used for final PO preview
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import SiriWave from "siriwave"; // Import SiriWave: npm install siriwave

const POGenerationScreen = ({
  // vendorName and vendorEmail props are not directly used in the new flow's PO details
  // but can be kept for general context or future use.
  vendorName = "Default Vendor Inc.", // Default example
  vendorEmail = "sales@defaultvendor.com", // Default example
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [poPreviewContent, setPoPreviewContent] = useState(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatMessagesEndRef = useRef(null); // Used for scrolling chat history

  const siriContainerRef = useRef(null); // For the div that will host SiriWave
  const siriWaveInstanceRef = useRef(null); // To store the SiriWave instance

  const [conversationStage, setConversationStage] = useState(0);
  const [poDetails, setPoDetails] = useState({
    item: "",
    vendor: "",
    deliveryAddress: "",
    quantity: "",
    price: "", // Price might be set based on item/quantity later
    parsedItem: "", // For displaying item name
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

  // State for animating the bot prompt in voiceUIPrompt
  const [animatingOutPrompt, setAnimatingOutPrompt] = useState({
    text: null,
    key: null,
  });
  
  const getInitialPromptText = useCallback(() => {
    const lastBotMessage = messages
      .filter((m) => m.sender === "bot")
      .slice(-1)[0]?.text;
    return (
      lastBotMessage ||
      (speechSupported ? "Initializing..." : "Speech services unavailable.")
    );
  }, [messages, speechSupported]);

  const [currentDisplayPromptText, setCurrentDisplayPromptText] = useState(
    getInitialPromptText()
  );
  
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


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

  // --- NEW CONVERSATIONAL FLOW ---
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
      const resetPoData = () => ({
        item: "", vendor: "", deliveryAddress: "",
        quantity: "", price: "", parsedItem: "",
      });

      const newWelcomePrompt = "Welcome to the Miraxeon Voice Agent for PO Creation - how can I help you today?";

      switch (conversationStage) {
        case 0: // Initial request: "PO for [Vendor] for [Item]"
          // Simple parsing - enhance for robustness
          let parsedVendor = "Unknown Vendor";
          let parsedItemName = "Unknown Item";
          const lowerUserMessage = userMessageText.toLowerCase();

          if (lowerUserMessage.includes("detroit chemical")) {
            parsedVendor = "Detroit Chemical Corporation";
          }
          // Try to extract item name
          const itemKeywords = ["sodium hypochlorite", "hydrochloric acid", "caustic soda"]; // Add more items
          for (const keyword of itemKeywords) {
            if (lowerUserMessage.includes(keyword)) {
              parsedItemName = keyword.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); // Capitalize
              break;
            }
          }
          if(parsedItemName === "Unknown Item" && lowerUserMessage.includes("for some ")) {
              const parts = lowerUserMessage.split("for some ");
              if (parts.length > 1) parsedItemName = parts[1].split(" ")[0] + (parts[1].split(" ")[1] || ""); // Take first one or two words after "for some"
              parsedItemName = parsedItemName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          }


          updatedPoDetails.vendor = parsedVendor;
          updatedPoDetails.item = parsedItemName;
          updatedPoDetails.parsedItem = parsedItemName;

          addBotMessage(
            "Sure, let me get the supplier information from SAP - give me a moment please.",
            1200
          );
          addBotMessage(
            `I was able to locate ${updatedPoDetails.vendor} based in Michigan. I have added the supplier details to the PO.`,
            15000,
            "1" // Generate PO1
          );
          addBotMessage("What would you like for the delivery address to be?", 6000);
          nextStage = 1;
          break;

        case 1: // User provides delivery address
          updatedPoDetails.deliveryAddress = userMessageText.trim();
          // Simulate a more specific address based on general input
          let confirmedAddress = updatedPoDetails.deliveryAddress;
          if (confirmedAddress.toLowerCase().includes("flint plant")) {
            confirmedAddress = "23817 Miraxeon Drive, Flint, Michigan";
            updatedPoDetails.deliveryAddress = confirmedAddress; // Update with specific
          }
          addBotMessage(
            `Sure, marked this for delivery to ${confirmedAddress}.`,
            7000,
            "2" // Generate PO2
          );
          addBotMessage(
            `Alright, how many gallons of ${updatedPoDetails.item || "the item"} do we need?`,
            6200
          );
          nextStage = 2;
          break;

        case 2: // User provides quantity
          const quantityMatch = userMessageText.match(/(\d+)\s*gallon[s]?/i);
          if (quantityMatch && quantityMatch[1]) {
            updatedPoDetails.quantity = `${quantityMatch[1]} gallons`;
            // You might want to set a price here based on item/quantity
            updatedPoDetails.price = "$1.25 per gallon"; // Example price
            addBotMessage(
              `Perfect, I’ve added all the details. Quantity: ${updatedPoDetails.quantity}.`,
              4000
            );
            addBotMessage(
              "Please review the PO and let me know if you need any other changes.",
              5500,
              "3" // Generate Final PO (PO3)
            );
            nextStage = 3;
          } else {
            addBotMessage(
              `I didn't quite catch the quantity in gallons for ${updatedPoDetails.item || "the item"}. How many gallons do we need?`,
              1200
            );
            // Stays in stage 2
          }
          break;

        case 3: // PO is ready, awaiting "Send PO" or "New PO"
          if (
            userMessageText
              .toLowerCase()
              .match(/new po|start over|reset|create new/i)
          ) {
            addBotMessage(
              "Alright, let's start a new Purchase Order.",
              0,
              null // Clear PO preview
            );
            addBotMessage(newWelcomePrompt, 1200);
            updatedPoDetails = resetPoData();
            nextStage = 0;
          } else {
            addBotMessage(
              "The PO is ready on the right. You can click 'Send PO' or say 'New PO' to start another one.",
              0
            );
          }
          break;

        default:
          addBotMessage("I'm a bit lost. Let's try starting over.", 0, null);
          addBotMessage(newWelcomePrompt, 1200);
          updatedPoDetails = resetPoData();
          nextStage = 0;
      }

      setConversationStage(nextStage);
      setPoDetails(updatedPoDetails);
      
      let cumulativeTimeoutForMessageAppearance = 0;
      let totalDurationForBotTyping = 0;
      const BASE_INTERVAL = 1000; // Base interval if no specific delay
      const RANDOM_INTERVAL_SPAN = 500; // Random addition to interval

      botResponses.forEach((response) => {
        const messageAppearDelay = cumulativeTimeoutForMessageAppearance + (response.delay || 0);
        
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
            ttsQueueRef.current.push({ text: response.text });
            // FIX: Defer TTS processing slightly to allow React to render the message first
            setTimeout(() => {
              if (processTTSQueueRef.current && !isBotSpeakingRef.current) {
                processTTSQueueRef.current();
              }
            }, 50); // Small delay, adjust if necessary
          }
          if (response.poUpdate !== undefined) { // Allows null to clear PO
            setPoPreviewContent(response.poUpdate);
          }
        }, messageAppearDelay);
        botMessageTimeoutsRef.current.push(timeoutId);
        
        const intervalForThisMessage = (response.delay || (BASE_INTERVAL + Math.random() * RANDOM_INTERVAL_SPAN)) + Math.random() * 200;
        cumulativeTimeoutForMessageAppearance += (response.delay || 0); // This correctly sums only the explicit delays for appearance scheduling
        totalDurationForBotTyping += intervalForThisMessage; // This sums up total "activity time" for the bot_typing flag
      });

      const finalTimeoutId = setTimeout(() => {
        setIsBotTyping(false);
        if (
          userWantsToListenRef.current &&
          !isListeningRef.current &&
          !isBotSpeakingRef.current && // Ensure bot is not speaking
          speechSupported &&
          startContinuousAzureListeningRef.current &&
          ttsQueueRef.current.length === 0 // FIX: Ensure TTS queue is empty
        ) {
          startContinuousAzureListeningRef.current();
        }
      }, totalDurationForBotTyping); 
      botMessageTimeoutsRef.current.push(finalTimeoutId);
    },
    [conversationStage, poDetails, speechSupported] // Ensure dependencies are correct
  );
  // --- END NEW CONVERSATIONAL FLOW ---

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
    
    setInputValue(""); 
    
    setTimeout(() => {
      if (simulateBotResponseRef.current) {
        simulateBotResponseRef.current(textToSend);
      }
    }, 50); 
  }, []);
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
        setInputValue(transcript); 
        if (
          transcript.trim() &&
          !isBotSpeakingRef.current &&
          handleSendMessageInternalRef.current
        ) {
          setTimeout( 
            () => handleSendMessageInternalRef.current(transcript),
            500 
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
      if (speechRecognizerRef.current === recognizer) { // Check if it's the current recognizer before closing
        try {
          recognizer.close();
        } catch (err) {
          /*ignore*/
        }
        speechRecognizerRef.current = null;
      }
      setIsListening(false); // Ensure state is updated
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
        if (speechRecognizerRef.current === recognizer) { // Check if it's the current recognizer
          try {
            recognizer.close();
          } catch (err) {
            /*ignore*/
          }
          speechRecognizerRef.current = null;
        }
        setIsListening(false); // Ensure state is updated
      }
    );
  }, [azureSpeechConfig, speechSupported]);
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
              recognizerToStop.close(); // sessionStopped should handle setIsListening(false)
            } catch (e) {
              console.warn("Error closing recognizer on stop:", e);
               setIsListening(false); // Fallback if close errors before sessionStopped
            }
            // If sessionStopped is reliable, this might not be needed here.
            // setIsListening(false); // FIX: More direct control, sessionStopped can be delayed
          },
          (err) => {
            console.error("Error stopping STT:", err);
            try {
              recognizerToStop.close();
            } catch (e) {
              console.warn("Error closing recognizer on stop error:", e);
            }
            setIsListening(false); // FIX: Ensure isListening is false on error too
          }
        );
      } else {
         // If no recognizerRef, ensure isListening is false if it was somehow true.
         setIsListening(false);
      }
      
      // FIX: Always update isListening state if we are actively stopping.
      // The recognizer's sessionStopped might take time or might not fire if closed abruptly.
      setIsListening(false);


      if (!preserveUserIntent) { 
        setUserWantsToListen(false);
      }
    },
    [] 
  );
  useEffect(() => {
    stopContinuousAzureListeningRef.current = stopContinuousAzureListeningFn;
  }, [stopContinuousAzureListeningFn]);

  const speakTextFn = useCallback(
    async (textToSpeak) => {
      if (isListeningRef.current && stopContinuousAzureListeningRef.current) {
        stopContinuousAzureListeningRef.current(true); // true to preserve user intent to listen later
      }

      if (!speechSynthesizerRef.current || !textToSpeak || !synthesizerReady) {
        console.warn("TTS: Synthesizer not ready or no text to speak. Text:", textToSpeak, "Synthesizer Ready:", synthesizerReady);
        // If speech fails to start, remove it from queue and try next or allow STT restart
        if (ttsQueueRef.current.length > 0 && ttsQueueRef.current[0].text === textToSpeak) {
            ttsQueueRef.current.shift();
        }
        if (processTTSQueueRef.current) {
             processTTSQueueRef.current(); 
        } else if ( // This else-if might be redundant if processTTSQueue calls STT restart logic
          userWantsToListenRef.current &&
          !isListeningRef.current &&
          !isBotSpeakingRef.current && 
          speechSupported &&
          startContinuousAzureListeningRef.current &&
          ttsQueueRef.current.length === 0 // Ensure queue is empty
        ) {
          setTimeout(() => { 
            if (
              userWantsToListenRef.current &&
              !isListeningRef.current &&
              !isBotSpeakingRef.current &&
              speechSupported &&
              startContinuousAzureListeningRef.current &&
              ttsQueueRef.current.length === 0 
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
          
          // Remove spoken item from queue
          if (ttsQueueRef.current.length > 0 && ttsQueueRef.current[0].text === textToSpeak) {
            ttsQueueRef.current.shift();
          }

          // Process next item in queue or restart listening
          if (ttsQueueRef.current.length > 0 && processTTSQueueRef.current) {
            processTTSQueueRef.current(); 
          } else if ( 
            userWantsToListenRef.current &&
            !isListeningRef.current && // Should be true as we just stopped speaking
            speechSupported &&
            startContinuousAzureListeningRef.current // Function exists
            // !isBotSpeakingRef.current is implicitly true here
            // ttsQueueRef.current.length === 0 is also implicitly true
          ) {
            setTimeout(() => { // Add a small delay before restarting listening
              if (
                userWantsToListenRef.current &&
                !isListeningRef.current &&
                !isBotSpeakingRef.current && // Double check, should be false
                speechSupported &&
                startContinuousAzureListeningRef.current &&
                ttsQueueRef.current.length === 0 // Explicit check
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

          // Remove failed item from queue
          if (ttsQueueRef.current.length > 0 && ttsQueueRef.current[0].text === textToSpeak) {
            ttsQueueRef.current.shift();
          }
          
          // Process next item in queue or restart listening
          if (ttsQueueRef.current.length > 0 && processTTSQueueRef.current) {
            processTTSQueueRef.current();
          } else if (
            userWantsToListenRef.current &&
            !isListeningRef.current &&
            speechSupported &&
            startContinuousAzureListeningRef.current
            // !isBotSpeakingRef.current is implicitly true here
            // ttsQueueRef.current.length === 0 is also implicitly true
          ) {
             setTimeout(() => { // Add a small delay
              if (
                userWantsToListenRef.current &&
                !isListeningRef.current &&
                !isBotSpeakingRef.current && // Double check
                speechSupported &&
                startContinuousAzureListeningRef.current &&
                ttsQueueRef.current.length === 0 // Explicit check
              ) {
                startContinuousAzureListeningRef.current();
              }
            }, 250);
          }
        }
      );
    },
    [synthesizerReady, speechSupported] 
  );
  useEffect(() => {
    speakTextRef.current = speakTextFn;
  }, [speakTextFn]);

  const processTTSQueueFn = useCallback(() => {
    if (
      ttsQueueRef.current.length > 0 &&    
      !isBotSpeakingRef.current &&         
      synthesizerReady &&                  
      speakTextRef.current                 
    ) {
      speakTextRef.current(ttsQueueRef.current[0].text);
    }
    // If queue is empty and bot is not speaking, conditions for STT restart might be met.
    // This is handled in speakTextFn completion and simulateBotResponseFn final timeout.
  }, [synthesizerReady]); 
  
  useEffect(() => {
    processTTSQueueRef.current = processTTSQueueFn;
  }, [processTTSQueueFn]);

  const [welcomeMessageSent, setWelcomeMessageSent] = useState(false);
  useEffect(() => {
    if (
      welcomeMessageSent ||
      (!synthesizerReady && speechSupported && !azureSpeechConfig) // Still waiting for config/synthesizer
    ) {
      return;
    }

    // Proceed if speech is not supported (text-only welcome) OR if synthesizer is ready
    if (!speechSupported || synthesizerReady) {
      const welcomeMessageText = "Welcome to the Miraxeon Voice Agent for PO Creation - how can I help you today?";
      
      setMessages((prevMessages) => {
        // Avoid adding duplicate welcome messages on hot reloads if state isn't fully reset
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
        userWantsToListenRef.current 
      ) {
        if (!ttsQueueRef.current.some(item => item.text === welcomeMessageText)) {
             ttsQueueRef.current.push({ text: welcomeMessageText });
        }
        // Call processTTSQueue after a slight delay to ensure message is rendered
        setTimeout(() => {
            if (processTTSQueueRef.current && !isBotSpeakingRef.current) {
                processTTSQueueRef.current();
            }
        }, 50);
      }
      setWelcomeMessageSent(true); 

      // Delay for starting listening, give TTS a chance to start/finish for welcome message
      const listenStartDelay = (synthesizerReady && userWantsToListenRef.current && ttsQueueRef.current.length > 0) ? 2000 : 500; // Increased delay if TTS is active for welcome

      setTimeout(() => {
        if (
          userWantsToListenRef.current &&
          speechSupported &&
          !isBotTyping &&                 
          !isBotSpeakingRef.current &&    
          !isListeningRef.current &&      
          ttsQueueRef.current.length === 0 && // CRITICAL: Ensure TTS queue is empty
          startContinuousAzureListeningRef.current
        ) {
          startContinuousAzureListeningRef.current();
        }
      }, listenStartDelay);
    }
  }, [
    synthesizerReady,
    speechSupported,
    azureSpeechConfig, 
    welcomeMessageSent,
    isBotTyping, 
    // Removed userWantsToListen from deps to avoid re-triggering welcome logic on mic toggle
    // It's captured by userWantsToListenRef.current inside the effect.
  ]);

  useEffect(() => {
    const newText =
      messages.filter((m) => m.sender === "bot").slice(-1)[0]?.text ||
      (speechSupported ? "Initializing..." : "Speech services unavailable.");
    if (newText !== currentDisplayPromptText) {
      setAnimatingOutPrompt({
        text: currentDisplayPromptText,
        key: `out-${Date.now()}`,
      });
      setCurrentDisplayPromptText(newText);
    }
  }, [messages, speechSupported, currentDisplayPromptText]);

  // Initial setup on mount
  useEffect(() => {
    setConversationStage(0);
    setPoDetails({
      item: "", vendor: "", deliveryAddress: "",
      quantity: "", price: "", parsedItem: "",
    });
    setPoPreviewContent(null);
    setMessages([]); // Clear messages on mount to ensure welcome sequence re-runs cleanly if component remounts
    setInputValue("");
    ttsQueueRef.current = [];
    setWelcomeMessageSent(false); 
    setIsBotTyping(false);
    setIsBotSpeaking(false);
    botMessageTimeoutsRef.current.forEach(clearTimeout);
    botMessageTimeoutsRef.current = [];
    // getInitialPromptText will use the now-empty messages array
    setCurrentDisplayPromptText(getInitialPromptText()); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    let siriwave = null;
    if (
      siriContainerRef.current &&
      speechSupported &&
      !siriWaveInstanceRef.current 
    ) {
      siriwave = new SiriWave({
        container: siriContainerRef.current,
        width: siriContainerRef.current.offsetWidth || 200, 
        height: siriContainerRef.current.offsetHeight || 50, 
        style: "ios9", 
        speed: 0.1,
        amplitude: 1, 
        autostart: true, 
      });
      siriWaveInstanceRef.current = siriwave;
    }
    return () => {
      if (siriWaveInstanceRef.current) {
        siriWaveInstanceRef.current.dispose();
        siriWaveInstanceRef.current = null;
      } else if (siriwave) { // Should not happen if instanceRef is managed correctly, but as a fallback
        siriwave.dispose();
      }
    };
  }, [speechSupported]); // Re-run if speechSupported changes (e.g. permissions)

  useEffect(() => {
    if (siriWaveInstanceRef.current) {
      if (isListening && !isBotSpeaking && !isBotTyping) {
        siriWaveInstanceRef.current.setAmplitude(inputValue ? 3: 1); 
        siriWaveInstanceRef.current.setSpeed(0.1);
      } else if (isBotSpeaking) {
        siriWaveInstanceRef.current.setAmplitude(1);
        siriWaveInstanceRef.current.setSpeed(0.05);
      } else { // Idle or BotTyping
        siriWaveInstanceRef.current.setAmplitude(0.1); 
        siriWaveInstanceRef.current.setSpeed(0.05);
      }
    }
  }, [isListening, isBotSpeaking, isBotTyping, inputValue]); 

  const handleToggleListening = useCallback(() => {
    if (!speechSupported) {
      setSpeechError("Speech recognition is not supported or configured.");
      return;
    }
    if (isBotSpeakingRef.current || isBotTyping) { // isBotTyping is the state, isBotSpeakingRef is the ref
      return; // Don't allow toggle if bot is busy
    }

    const newListeningIntent = !userWantsToListenRef.current; // Toggle the desire to listen
    setUserWantsToListen(newListeningIntent); 

    if (newListeningIntent) {
      // If user wants to listen, and we are not already listening
      if (startContinuousAzureListeningRef.current && !isListeningRef.current) {
        startContinuousAzureListeningRef.current();
      }
    } else {
      // If user wants to stop listening (mute)
      if (stopContinuousAzureListeningRef.current) {
        stopContinuousAzureListeningRef.current(false); // false: don't preserve intent, effectively mute
      }
      setInputValue(""); // Clear any partial transcript
    }
  }, [speechSupported, isBotTyping]); // isBotTyping is a direct dependency

  const resetPoData = () => ({ // Moved helper function for wider use
    item: "", vendor: "", deliveryAddress: "",
    quantity: "", price: "", parsedItem: "",
  });

  const handleSendPo = () => {
    if (poPreviewContent) { // Check if a PO is actually generated
      const poSummary = `Item: ${poDetails.item || "N/A"}\nVendor: ${
        poDetails.vendor
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
        setTimeout(() => { // Defer TTS processing
            if (processTTSQueueRef.current && !isBotSpeakingRef.current) processTTSQueueRef.current();
        }, 50);
      }
      
      setPoPreviewContent(null);
      setPoDetails(resetPoData()); 
      setConversationStage(0); 
      setInputValue("");

      setTimeout(() => {
        const newOrderMsgText = "Welcome to the Miraxeon Voice Agent for PO Creation - how can I help you today?";
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
          setTimeout(() => { // Defer TTS processing
            if (processTTSQueueRef.current && !isBotSpeakingRef.current) processTTSQueueRef.current();
          }, 50);
        } else if ( 
          userWantsToListenRef.current &&
          speechSupported &&
          !isListeningRef.current &&
          !isBotSpeakingRef.current && 
          startContinuousAzureListeningRef.current &&
          ttsQueueRef.current.length === 0  // FIX: Ensure TTS queue is empty
        ) {
          startContinuousAzureListeningRef.current();
        }
      }, 1000); 
    } else {
      const noPoText =
        "No PO to send. Please complete the PO generation process first.";
      alert(noPoText); 
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + "-bot-no-po", text: noPoText, sender: "bot" },
      ]);
      if (userWantsToListenRef.current && synthesizerReady) {
        ttsQueueRef.current.push({ text: noPoText });
        setTimeout(() => { // Defer TTS processing
            if (processTTSQueueRef.current && !isBotSpeakingRef.current) processTTSQueueRef.current();
        }, 50);
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
    chatHistoryContainer: {
      flex: 1, 
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px', 
      marginBottom: '15px', 
      paddingRight: '5px', 
    },
    chatMessage: {
      padding: '10px 15px',
      borderRadius: '18px',
      maxWidth: '80%',
      wordWrap: 'break-word',
      fontSize: '14px',
      lineHeight: '1.5',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },
    userMessage: {
      backgroundColor: '#007bff',
      color: 'white',
      alignSelf: 'flex-end',
      borderBottomRightRadius: '4px',
    },
    botMessage: {
      backgroundColor: '#e9ecef',
      color: '#212529',
      alignSelf: 'flex-start',
      borderBottomLeftRadius: '4px',
    },
    voiceUIPrompt: {
      fontSize: "22px",
      fontWeight: "bold",
      textAlign: "center",
      padding: "10px 0",
      color: "#495057",
      minHeight: "60px", 
      lineHeight: "1.4",
      position: "relative", 
      overflow: "hidden", 
    },
    recognizedTextDisplay: {
      fontSize: "20px",
      fontWeight: "500",
      textAlign: "center",
      padding: "15px 0",
      minHeight: "50px", 
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#212529",
      lineHeight: "1.3",
      width: "100%",
    },
    voiceUIControlsContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingBottom: "0", 
      marginTop: "auto", 
    },
    waveformDisplay: {
      width: "80%", 
      height: "50px", 
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "15px 0", 
      position: "relative", 
    },
    speechErrorText: {
      color: "#DC3545",
      fontSize: "14px",
      textAlign: "center",
      marginBottom: "10px",
      minHeight: "18px", 
      fontWeight: "bold",
    },
    circularMicButton: {
      width: "70px",
      height: "70px",
      borderRadius: "50%",
      border: "1px solid #ced4da", 
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8f9fa", 
      color: "#495057", 
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      transition:
        "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease",
    },
    speechStatusText: {
      color: "#6c757d",
      fontSize: "14px",
      textAlign: "center",
      marginTop: "12px", 
      minHeight: "20px", 
    },
    previewPane: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      padding: "0", 
      backgroundColor: "white", 
    },
    previewHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px", 
      borderBottom: "1px solid #e0e0e0",
    },
    previewTitle: { fontSize: "18px", fontWeight: "bold" },
    sendPoButton: {
      padding: "10px 15px",
      backgroundColor: "#28a745", 
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
    },
    previewContent: {
      flex: 1, 
      padding: "20px", 
      overflowY: "auto", 
      fontSize: "14px",
      color: "#333",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
    },
    previewPlaceholder: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "#888", 
      textAlign: "center",
    },
    poImage: { 
        maxWidth: "100%",
        maxHeight: "100%", 
        height: "auto",
        objectFit: "contain", 
    },
  };
  
  styles.userMessage = { ...styles.chatMessage, ...styles.userMessage };
  styles.botMessage = { ...styles.chatMessage, ...styles.botMessage };


  let micStatusText = "Tap to Speak";
  let micButtonDynamicStyle = { 
    backgroundColor: styles.circularMicButton.backgroundColor,
    color: styles.circularMicButton.color,
    borderColor: styles.circularMicButton.border ? styles.circularMicButton.border.split(" ")[2] : "#ced4da", 
  };
  const micDisabled = !speechSupported || isBotSpeaking || isBotTyping;

  if (isBotSpeaking) {
    micStatusText = "Assistant Speaking...";
    micButtonDynamicStyle = { backgroundColor: "#e9ecef", color: "#adb5bd", borderColor: "#ced4da" };
  } else if (isBotTyping) {
    micStatusText = "Processing...";
    micButtonDynamicStyle = { backgroundColor: "#e9ecef", color: "#adb5bd", borderColor: "#ced4da" };
  } else if (isListening) {
    micStatusText = "Listening...";
    micButtonDynamicStyle = { backgroundColor: "#dc3545", color: "white", borderColor: "#dc3545" }; 
  } else if (userWantsToListen && speechSupported) { 
    micStatusText = "Muted (Tap to Unmute)"; 
    // Changed style for "Muted" to be more distinct yet not alarming like red.
    micButtonDynamicStyle = { backgroundColor: "#6c757d", color: "white", borderColor: "#6c757d" };  
  } else if (!userWantsToListen && speechSupported) { // Explicitly not wanting to listen (mic off)
     micStatusText = "Tap to Speak"; // Default state if mic is enabled but user chose not to listen
     micButtonDynamicStyle = { backgroundColor: styles.circularMicButton.backgroundColor, color: styles.circularMicButton.color, borderColor: "#ced4da" };
  } else if (!speechSupported) { 
     micStatusText = "Speech Unavailable";
     micButtonDynamicStyle = { backgroundColor: "#e9ecef", color: "#adb5bd", borderColor: "#ced4da" };
  } else { 
    micStatusText = "Tap to Speak"; // Default fallback
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
          <div style={styles.chatHistoryContainer}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={msg.sender === "user" ? styles.userMessage : styles.botMessage}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatMessagesEndRef} />
          </div>

          <div style={styles.voiceUIPrompt}>
            {animatingOutPrompt.text && (
              <div
                key={animatingOutPrompt.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  fontSize: "inherit",
                  fontWeight: "inherit",
                  lineHeight: "inherit",
                  padding: "inherit",
                  color: "#adb5bd", 
                  animation: "moveUpAndFadeOut 0.4s ease-out forwards",
                }}
              >
                {animatingOutPrompt.text}
              </div>
            )}
            <div
              key={`current-${currentDisplayPromptText}-${
                messages.filter((m) => m.sender === "bot").length 
              }`}
              style={{
                fontSize: "inherit",
                fontWeight: "inherit",
                lineHeight: "inherit",
                padding: "inherit",
                color: "inherit",
                animation: animatingOutPrompt.text 
                  ? "fadeInCurrent 0.3s 0.1s ease-in forwards"
                  : "none",
                opacity: animatingOutPrompt.text ? 0 : 1, 
              }}
            >
              {currentDisplayPromptText}
            </div>
          </div>

          <div style={styles.recognizedTextDisplay}>
            {speechSupported
              ? inputValue || "\u00A0" // Non-breaking space for layout consistency
              : "Speech input unavailable."}
          </div>

          <div style={styles.voiceUIControlsContainer}>
            <div ref={siriContainerRef} style={styles.waveformDisplay}>
              {/* SiriWave will attach here. */}
            </div>
            <div style={styles.speechErrorText}>{speechError}</div>
            <button
              style={{
                ...styles.circularMicButton,
                ...micButtonDynamicStyle, 
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
              {!speechError ? micStatusText : ""}
            </div>
          </div>
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
            {poPreviewContent === "1" ? (
              <img
                src={GeneratedPO1}
                alt="PO Preview - Supplier Details"
                style={styles.poImage}
              />
            ) : poPreviewContent === "2" ? (
              <img
                src={GeneratedPO2}
                alt="PO Preview - Delivery Address"
                style={styles.poImage}
              />
            ) : poPreviewContent === "3" ? (
              <img
                src={GeneratedPO3}
                alt="PO Preview - Final"
                style={styles.poImage}
              />
            ) : (
              <div style={styles.previewPlaceholder}>
                <DocumentIcon size={48} style={{ marginBottom: "10px" }} />
                <div>Purchase Order Preview will appear here...</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes moveUpAndFadeOut {
          from { transform: translateY(0%); opacity: 1; }
          to { transform: translateY(-50%); opacity: 0; }
        }
        @keyframes fadeInCurrent {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default POGenerationScreen;