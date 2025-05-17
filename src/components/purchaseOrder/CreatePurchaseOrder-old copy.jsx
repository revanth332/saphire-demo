import React, { useState, useEffect, useRef, useCallback } from "react";
// import BotIconSVG from "./bot-icon.svg"; // Not used
// import UserIconSVG from "./user-icon.svg"; // Not used
import { Mic, Check, Send, FileText as DocumentIcon } from "lucide-react";
import GeneratedPO from "./GeneratedPO.png";
import GeneratedPO1 from "./PO1.png"; 
import GeneratedPO2 from "./PO2.png"; 
import GeneratedPO3 from "./PO3.png"; 
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
      // let localNewPoContent = poPreviewContent; // Not strictly needed at this scope anymore
      let nextStage = conversationStage;
      let updatedPoDetails = { ...poDetails };

      // poUpdate: undefined (no change), null (clear PO), or actual PO content (e.g., image path)
      const addBotMessage = (text, delay = 0, poUpdate = undefined) => {
        botResponses.push({ text, delay, poUpdate });
      };

      switch (conversationStage) {
        case 0:
          updatedPoDetails.item = userMessageText.trim();
          updatedPoDetails.parsedItem = userMessageText.trim();
          addBotMessage(`Got it: ${updatedPoDetails.parsedItem}.`,1200,'1');
          addBotMessage(
            "Who’s the supplier and where should the delivery be made? Please state it like 'Supplier Name, Delivery Address'.",
            1200
          );
          nextStage = 1;
          break;

        case 1: {
          const parts = userMessageText.match(/^(.*?),\s*(.*)$/i);
          if (parts && parts.length === 3) {
            let vendorText = parts[1].trim();
            let deliveryAddressText = parts[2].trim();
            updatedPoDetails.vendor = vendorText
              .toLowerCase()
              .includes("miracle chem")
              ? "Miracle Chemicals"
              : vendorText;
            updatedPoDetails.deliveryAddress = deliveryAddressText;
            addBotMessage(
              `Understood. Supplier is ${updatedPoDetails.vendor} and delivery to ${updatedPoDetails.deliveryAddress}.`,2000,'2'
            );
            addBotMessage(
              "How much quantity do you need? For example, '10 gallons'.",
              1200
            );
            nextStage = 2;
          } else {
            addBotMessage(
              "Sorry, I didn't quite catch that. Please provide the supplier and delivery address in the format: 'Supplier Name, Delivery Address'."
            );
          }
          break;
        }

        case 2: {
          const quantityMatch = userMessageText.match(/(\d+\s*gallon[s]?)/i);
          if (quantityMatch) {
            updatedPoDetails.quantity = quantityMatch[1];
            updatedPoDetails.price = "$1.25 per gallon";
            addBotMessage(
              `Perfect. Quantity: ${updatedPoDetails.quantity}. I have all the details.`
            );
            addBotMessage("Generating the purchase order now.", 1500);
            // The PO (GeneratedPO image) will be shown when the *next* message is displayed
            addBotMessage(
              `Okay, I've drafted the PO. Please review the details on the right. You can then click "Send PO".`,
              1500,
              GeneratedPO
            );
            nextStage = 3;
          } else {
            addBotMessage(
              "I didn't catch the quantity in gallons. How many gallons do we need?",
              1200
            );
          }
          break;
        }

        case 3:
          if (
            userMessageText
              .toLowerCase()
              .match(/new po|start over|reset|create new/i)
          ) {
            addBotMessage(
              "Alright, let's start a new Purchase Order.",
              0,
              null
            ); // Clear PO when this message is shown
            addBotMessage("What chemical would you like to order today?", 1200);
            updatedPoDetails = {
              item: "",
              vendor: "",
              deliveryAddress: "",
              quantity: "",
              price: "",
              parsedItem: "",
            };
            // localNewPoContent = null; // Not needed here due to poUpdate mechanism
            nextStage = 0;
          } else {
            addBotMessage(
              "The PO is ready on the right. You can click 'Send PO' or say 'new po' to start another one."
            );
          }
          break;

        default:
          addBotMessage("I'm a bit lost. Let's try starting over.", 0, null); // Clear PO
          addBotMessage("What chemical would you like to order today?", 1200);
          updatedPoDetails = {
            item: "",
            vendor: "",
            deliveryAddress: "",
            quantity: "",
            price: "",
            parsedItem: "",
          };
          // localNewPoContent = null; // Not needed here
          nextStage = 0;
      }

      setConversationStage(nextStage);
      setPoDetails(updatedPoDetails);
      // REMOVED: Direct update of poPreviewContent here
      // if (localNewPoContent !== poPreviewContent) {
      //   setPoPreviewContent(localNewPoContent);
      // }

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
          ttsQueueRef.current.push({ text: response.text });
          if (processTTSQueueRef.current) processTTSQueueRef.current();

          // If this response object has a poUpdate defined, apply it
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
    [conversationStage, poDetails, speechSupported]
  ); // Removed poPreviewContent from deps
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
    if (simulateBotResponseRef.current) {
      simulateBotResponseRef.current(textToSend);
    }
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
    []
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
          setTimeout(() => startContinuousAzureListeningRef.current(), 250);
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
            setTimeout(() => startContinuousAzureListeningRef.current(), 250);
          }
        },
        (error) => {
          setIsBotSpeaking(false);
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
            setTimeout(() => startContinuousAzureListeningRef.current(), 250);
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
      synthesizerReady
    ) {
      setTimeout(() => {
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
      (!synthesizerReady && speechSupported && !azureSpeechConfig)
    ) {
      return;
    }

    if (!speechSupported || synthesizerReady) {
      const welcomeMessageText =
        "Hello! Let's create a new purchase order. What chemical would you like to order today?";
      setMessages([
        {
          id: "welcome-" + Date.now(),
          text: welcomeMessageText,
          sender: "bot",
        },
      ]);

      if (synthesizerReady && speechSynthesizerRef.current) {
        ttsQueueRef.current.push({ text: welcomeMessageText });
        if (processTTSQueueRef.current) processTTSQueueRef.current();
      }
      setWelcomeMessageSent(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    synthesizerReady,
    speechSupported,
    azureSpeechConfig,
    welcomeMessageSent,
  ]);

  useEffect(() => {
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
    setMessages([]);
    ttsQueueRef.current = [];
    setWelcomeMessageSent(false);
    setIsBotTyping(false);
    setIsBotSpeaking(false);
    botMessageTimeoutsRef.current.forEach(clearTimeout);
    botMessageTimeoutsRef.current = [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleListening = useCallback(() => {
    if (!speechSupported) {
      setSpeechError("Speech recognition is not supported or configured.");
      return;
    }
    if (isBotSpeakingRef.current || isBotTyping) {
      return;
    }

    const newListeningIntent = !userWantsToListenRef.current;
    setUserWantsToListen(newListeningIntent);

    if (newListeningIntent) {
      if (startContinuousAzureListeningRef.current)
        startContinuousAzureListeningRef.current();
    } else {
      if (stopContinuousAzureListeningRef.current)
        stopContinuousAzureListeningRef.current(false);
      setInputValue("");
    }
  }, [speechSupported, isBotTyping]);

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
      ttsQueueRef.current.push({ text: successMessageText });

      setPoPreviewContent(null); // Clear PO immediately on send
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
        ttsQueueRef.current.push({ text: newOrderMsgText });
        if (processTTSQueueRef.current) processTTSQueueRef.current();
      }, 1000);
    } else {
      const noPoText =
        "No PO to send. Please generate one using voice commands first.";
      alert(noPoText);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + "-bot-no-po", text: noPoText, sender: "bot" },
      ]);
      ttsQueueRef.current.push({ text: noPoText });
      if (processTTSQueueRef.current) processTTSQueueRef.current();
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
      minHeight: "60px",
      lineHeight: "1.4",
    },
    recognizedTextDisplay: {
      fontSize: "32px",
      fontWeight: "500",
      textAlign: "left",
      padding: "20px 0",
      minHeight: "120px",
      flexGrow: 1,
      display: "flex",
      alignItems: "flex-start",
      color: "#212529",
      lineHeight: "1.3",
      overflowY: "auto",
      maxHeight: "calc(100vh - 450px)",
    },
    voiceUIControlsContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingBottom: "20px",
      marginTop: "auto",
    },
    waveformDisplay: {
      height: "50px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "15px 0",
    },
    waveformBar: {
      width: "5px",
      height: "35px",
      backgroundColor: "#007bff",
      margin: "0 3px",
      borderRadius: "2px",
      animation: "pulse 1.2s ease-in-out infinite",
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
      transition: "background-color 0.2s ease, color 0.2s ease",
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
    },
    previewPlaceholder: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: "#888",
      textAlign: "center",
    },
  };

  let centerDisplayText = inputValue || "";
  let micStatusText = "Tap to Speak";
  let micButtonDynamicStyle = {
    backgroundColor: styles.circularMicButton.backgroundColor,
    color: styles.circularMicButton.color,
    borderColor: styles.circularMicButton.border
      ? styles.circularMicButton.border.split(" ")[2]
      : "#ced4da",
  };
  const micDisabled = !speechSupported || isBotSpeaking || isBotTyping;

  if (isBotSpeaking) {
    if (inputValue && !isListening) centerDisplayText = inputValue;
    else centerDisplayText = "Assistant is speaking...";
    micStatusText = "Assistant Speaking...";
    micButtonDynamicStyle = {
      backgroundColor: "#e9ecef",
      color: "#adb5bd",
      borderColor: "#ced4da",
    };
  } else if (isBotTyping) {
    if (inputValue && !isListening) centerDisplayText = inputValue;
    else centerDisplayText = "Assistant is processing...";
    micStatusText = "Processing...";
    micButtonDynamicStyle = {
      backgroundColor: "#e9ecef",
      color: "#adb5bd",
      borderColor: "#ced4da",
    };
  } else if (isListening) {
    if (!inputValue) centerDisplayText = "Listening...";
    micStatusText = "Listening...";
    micButtonDynamicStyle = {
      backgroundColor: "#dc3545",
      color: "white",
      borderColor: "#dc3545",
    };
  } else if (userWantsToListen) {
    if (!inputValue) centerDisplayText = "";
    micStatusText = "Muted";
    micButtonDynamicStyle = {
      backgroundColor: "#007bff",
      color: "white",
      borderColor: "#007bff",
    };
  } else {
    if (!inputValue) centerDisplayText = "Tap the mic to start";
    micStatusText = "Tap to Speak";
  }

  if (!speechSupported) {
    micButtonDynamicStyle = {
      backgroundColor: "#e9ecef",
      color: "#adb5bd",
      borderColor: "#ced4da",
    };
    micStatusText = "Speech Unavailable";
    const nonInputStates = [
      "Listening...",
      "Muted. Tap to unmute.",
      "Tap the mic to start",
      "Assistant is speaking...",
      "Assistant is processing...",
    ];
    if (!inputValue || nonInputStates.includes(centerDisplayText)) {
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
        <div style={styles.vendorInfo}>
          Vendor Name: {poDetails.vendor || vendorName} | Vendor Email:{" "}
          {vendorEmail}
        </div>
      </div>
      <div style={styles.contentArea}>
        <div style={styles.chatPane}>
          <div style={styles.voiceUIPrompt}>
            {messages.filter((m) => m.sender === "bot").slice(-1)[0]?.text ||
              "Initializing..."}
          </div>
          <div style={styles.recognizedTextDisplay}>
            {centerDisplayText || "\u00A0"}
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
                      backgroundColor: "#17a2b8",
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
                {poPreviewContent == 1 ? (
                  <img
                    src={GeneratedPO1}
                    alt="Generated Purchase Order Preview"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                ) : poPreviewContent == 2 ? (
                  <img
                    src={GeneratedPO2}
                    alt="Generated Purchase Order Preview"
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                ) : (
                  <img
                    src={GeneratedPO3}
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
