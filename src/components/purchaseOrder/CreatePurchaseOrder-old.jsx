import React, { useState, useEffect, useRef, useCallback } from "react";
import BotIconSVG from "./bot-icon.svg";
import UserIconSVG from "./user-icon.svg";
import { Mic } from "lucide-react";
import GeneratedPO from "./GeneratedPO.png";
import GeneratedPO1 from "./PO1.png";
import GeneratedPO2 from "./PO2.png";
import GeneratedPO3 from "./PO3.png";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

// Simple icons (no changes needed here)
const BotIcon = () => (
  <span style={{ marginRight: "8px", fontSize: "1.5em" }}>
    <img alt="bot icon" className="h-8 w-8" src={BotIconSVG} />
  </span>
);
const UserIcon = () => (
  <span style={{ marginLeft: "8px", fontSize: "1.5em" }}>
    <img alt="user icon" className="h-8 w-8" src={UserIconSVG} />
  </span>
);
const DocumentIcon = () => (
  <span style={{ marginRight: "10px", fontSize: "2em", color: "#555" }}>
    📄
  </span>
);
const SendIcon = () => <span style={{ marginRight: "5px" }}>➢</span>;

const POGenerationScreen = ({
  vendorName = "Miracle Chemicals",
  vendorEmail = "procure@micchecmicals.com",
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [poPreviewContent, setPoPreviewContent] = useState(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatMessagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [conversationStage, setConversationStage] = useState(0);
  const [poDetails, setPoDetails] = useState({
    item: "", vendor: "", deliveryAddress: "", quantity: "", price: "", parsedItem: "",
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

  const userWantsToListenRef = useRef(userWantsToListen);
  useEffect(() => { userWantsToListenRef.current = userWantsToListen; }, [userWantsToListen]);
  const isListeningRef = useRef(isListening);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  const isBotSpeakingRef = useRef(isBotSpeaking);
  useEffect(() => { isBotSpeakingRef.current = isBotSpeaking; }, [isBotSpeaking]);

  // Refs for callbacks to ensure latest versions are always called
  const simulateBotResponseRef = useRef(null);
  const handleSendMessageInternalRef = useRef(null);
  const startContinuousAzureListeningRef = useRef(null);
  const stopContinuousAzureListeningRef = useRef(null);
  const speakTextRef = useRef(null);
  const processTTSQueueRef = useRef(null);


  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Azure Speech SDK Configuration (remains the same)
    const speechKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
    const speechRegion = import.meta.env.VITE_AZURE_SPEECH_REGION;
    if (!speechKey || !speechRegion) {
      console.error("Azure Speech Key or Region not configured.");
      setSpeechError("Speech service credentials not found.");
      setSpeechSupported(false);
      return;
    }
    try {
      const config = SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
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
    }
    return () => { /* cleanup */ 
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.close();
        speechRecognizerRef.current = null;
      }
      if (speechSynthesizerRef.current) {
        speechSynthesizerRef.current.close();
        speechSynthesizerRef.current = null;
      }
      setSynthesizerReady(false);
    };
  }, []);

  // --- Callbacks defined using a two-step ref pattern ---

  // simulateBotResponse
  const simulateBotResponseFn = useCallback((userMessageText) => {
    setIsBotTyping(true);
    let botResponses = [];
    let localNewPoContent = undefined;
    let nextStage = conversationStage; // Use current state for this turn's logic
    let updatedPoDetails = { ...poDetails }; // Use current state

    const addBotMessage = (text, delay = 0) => botResponses.push({ text, delay });
    const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

    // Switch logic remains the same, using current conversationStage
    switch (conversationStage) {
        case 0: {
          const poRequestMatch = userMessageText.toLowerCase().match(/need to create a purchase order for (?:some )?(.*?) from (.*?)(?:\.|$| po$)/i);
          if (poRequestMatch) {
            let itemText = poRequestMatch[1].trim();
            let vendorText = poRequestMatch[2].trim();
            updatedPoDetails.item = itemText;
            updatedPoDetails.vendor = (vendorText.toLowerCase().startsWith("miracle checmicals") || vendorText.toLowerCase().startsWith("miracle chemicals")) ? "Miracle Chemicals" : vendorText;
            addBotMessage("Sure, let me get the supplier information - give me a moment please.");
            addBotMessage(`I was able to locate ${updatedPoDetails.vendor} based in Michigan. I added their supplier information in SAP to the PO.`, 2500);
            addBotMessage("What would you like for the delivery address to be?", 2500);
            nextStage = 1;
          } else {
            addBotMessage("I'm not sure how to start. Try saying: 'I need to create a PO for [item] from [vendor]'.");
          }
          break;
        }
        case 1:
          updatedPoDetails.deliveryAddress = userMessageText;
          addBotMessage(`Sure, marked this for delivery to ${userMessageText}.`, 1200);
          if (updatedPoDetails.item.toLowerCase().includes("hypochlorite") && !updatedPoDetails.item.toLowerCase().includes("sodium hypochlorite")) {
            addBotMessage(`You mentioned ${capitalizeFirst(updatedPoDetails.item)} - were you referring to Sodium Hypochlorite?`, 1200);
            nextStage = 2;
          } else {
            updatedPoDetails.parsedItem = updatedPoDetails.item;
            addBotMessage("Alright, how many do we need to order?", 1200);
            nextStage = 3;
          }
          break;
        case 2:
          if (userMessageText.toLowerCase().match(/^(yes|yeah|yep)/i)) {
            updatedPoDetails.parsedItem = "Sodium Hypochlorite";
          } else if (userMessageText.toLowerCase().match(/^(no|nope)/i)) {
            addBotMessage(`Okay, you didn't want Sodium Hypochlorite. We'll use ${capitalizeFirst(updatedPoDetails.item)}.`, 2200);
            updatedPoDetails.parsedItem = updatedPoDetails.item;
          } else { // Ambiguous
            updatedPoDetails.parsedItem = "Sodium Hypochlorite"; // Default assumption
          }
          addBotMessage("Alright, how many do we need to order?", 1400);
          nextStage = 3;
          break;
        case 3: {
          const quantityMatch = userMessageText.match(/(\d+[\s\w]*gallon[s]?)/i);
          if (quantityMatch) {
            updatedPoDetails.quantity = quantityMatch[1];
            updatedPoDetails.price = "$1.25 per gallon";
            addBotMessage(`I see that they were priced at ${updatedPoDetails.price} in our last order with ${updatedPoDetails.vendor}. Is that the correct price for this PO?`, 2200);
            nextStage = 4;
          } else {
            addBotMessage("I didn't catch the quantity in gallons. How many gallons do we need?", 1200);
          }
          break;
        }
        case 4:
          if (userMessageText.toLowerCase().match(/^(yes|yeah|yep|correct)/i)) {
            addBotMessage("Perfect, I've added all the details. Shall I submit to the supplier via SAP?", 1500);
            nextStage = 5;
          } else {
            addBotMessage("Okay, what should the price be? Or you can tell me to adjust other details.", 2000);
          }
          break;
        case 5:
          if (userMessageText.toLowerCase().match(/^(yes|yeah|yep|please do|go ahead)/i)) {
            addBotMessage("Generating PO...", 1500);
            localNewPoContent = `## Purchase Order Draft ## ...`; // Full PO content
            addBotMessage(`Okay, I've drafted the PO. Please review the details on the right. You can then click "Send PO".`, 1500);
            nextStage = 6;
          } else {
            addBotMessage("Okay, let me know when you're ready to submit, or if you want to make changes.");
          }
          break;
        case 6:
          if (userMessageText.toLowerCase().match(/new po|start over|reset/i)) {
            addBotMessage("Alright, let's start a new Purchase Order. What would you like to order?");
            updatedPoDetails = { item: "", vendor: "", deliveryAddress: "", quantity: "", price: "", parsedItem: "" };
            localNewPoContent = null;
            nextStage = 0;
          } else {
            addBotMessage("The PO is ready on the right. You can click 'Send PO' or say 'new po' to start another one.");
          }
          break;
        default:
          addBotMessage("I'm a bit lost. Let's try starting over. Tell me what you'd like to order.");
          updatedPoDetails = { item: "", vendor: "", deliveryAddress: "", quantity: "", price: "", parsedItem: "" };
          localNewPoContent = null;
          nextStage = 0;
      }

    setConversationStage(nextStage);
    setPoDetails(updatedPoDetails);
    if (localNewPoContent !== undefined) {
      setPoPreviewContent(localNewPoContent);
    }

    let cumulativeDelay = 50;
    botResponses.forEach((response, index) => {
      setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, { id: Date.now() + Math.random() + index, text: response.text, sender: "bot" }]);
        ttsQueueRef.current.push({ text: response.text });
        if (processTTSQueueRef.current) processTTSQueueRef.current();
      }, cumulativeDelay);
      cumulativeDelay += (response.delay || 1200) + Math.random() * 200;
    });

    setTimeout(() => {
      setIsBotTyping(false);
    }, cumulativeDelay);
  }, [conversationStage, poDetails, vendorEmail]); // Dependencies are actual state/props it reads for logic
  useEffect(() => { simulateBotResponseRef.current = simulateBotResponseFn; }, [simulateBotResponseFn]);

  // handleSendMessageInternal
  const handleSendMessageInternalFn = useCallback((textToSend) => {
    if (textToSend.trim() === "") return;
    const newUserMessage = { id: Date.now(), text: textToSend, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    if (simulateBotResponseRef.current) simulateBotResponseRef.current(textToSend);
    setInputValue("");
  }, []); // No direct state dependencies other than setters
  useEffect(() => { handleSendMessageInternalRef.current = handleSendMessageInternalFn; }, [handleSendMessageInternalFn]);

  // startContinuousAzureListening
  const startContinuousAzureListeningFn = useCallback(() => {
    if (!azureSpeechConfig || !speechSupported || isBotSpeakingRef.current) return;
    if (isListeningRef.current && speechRecognizerRef.current) return;
    if (speechRecognizerRef.current) { try { speechRecognizerRef.current.close(); } catch (e) { /* ignore */ } speechRecognizerRef.current = null; }

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(azureSpeechConfig, audioConfig);
    speechRecognizerRef.current = recognizer;
    setSpeechError(null);

    recognizer.recognizing = (s, e) => { if (e.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) setInputValue(e.result.text); };
    recognizer.recognized = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        const transcript = e.result.text;
        setInputValue(transcript);
        if (transcript.trim() && !isBotSpeakingRef.current && handleSendMessageInternalRef.current) {
          handleSendMessageInternalRef.current(transcript);
        } else if (!transcript.trim()) setInputValue("");
      } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) setInputValue("");
    };
    recognizer.canceled = (s, e) => { /* ... error handling ... */ 
        console.error(`STT: CANCELED: Reason=${e.reason}`);
        let errText = "Speech recognition canceled.";
        if (e.reason === SpeechSDK.CancellationReason.Error) {
          if (e.errorDetails.includes("Permission denied")) {
            errText = "Microphone access denied. Please enable it.";
            setSpeechSupported(false); 
            setUserWantsToListen(false); 
          } else if (e.errorCode === SpeechSDK.CancellationErrorCode.ConnectionFailure) {
            errText = "Connection to speech service failed. Check network.";
          } else {
            errText = `STT Error: ${e.errorDetails.substring(0, 100)}`;
          }
        }
        setSpeechError(errText);
        setInputValue("");
        if (speechRecognizerRef.current) { speechRecognizerRef.current.close(); speechRecognizerRef.current = null; }
        setIsListening(false); 
    };
    recognizer.sessionStarted = () => { setIsListening(true); setInputValue(""); setSpeechError(null); };
    recognizer.sessionStopped = () => { setIsListening(false); setInputValue(""); if (recognizer) recognizer.close(); if (speechRecognizerRef.current === recognizer) speechRecognizerRef.current = null; };
    recognizer.startContinuousRecognitionAsync(() => {}, (err) => { /* ... error handling ... */
        console.error("STT: Error starting continuous recognition:", err);
        setSpeechError(`STT Start Error: ${err}`);
        if (speechRecognizerRef.current) { speechRecognizerRef.current.close(); speechRecognizerRef.current = null; }
        setIsListening(false);
     });
  }, [azureSpeechConfig, speechSupported]); // Depends on config/support state
  useEffect(() => { startContinuousAzureListeningRef.current = startContinuousAzureListeningFn; }, [startContinuousAzureListeningFn]);

  // stopContinuousAzureListening
  const stopContinuousAzureListeningFn = useCallback((preserveUserIntent = false) => {
    if (speechRecognizerRef.current) {
      speechRecognizerRef.current.stopContinuousRecognitionAsync(
        () => {}, 
        (err) => { 
          console.error("Error stopping STT:", err); 
          if(speechRecognizerRef.current) {speechRecognizerRef.current.close(); speechRecognizerRef.current = null;}
          setIsListening(false);
        }
      );
    }
    if (!preserveUserIntent) setUserWantsToListen(false);
  }, []); // No state dependencies
  useEffect(() => { stopContinuousAzureListeningRef.current = stopContinuousAzureListeningFn; }, [stopContinuousAzureListeningFn]);

  // speakText
  const speakTextFn = useCallback(async (textToSpeak) => {
    if (isListeningRef.current && speechRecognizerRef.current && stopContinuousAzureListeningRef.current) {
      stopContinuousAzureListeningRef.current(true); // Preserve intent, bot is just interrupting
    }
    if (!speechSynthesizerRef.current || !textToSpeak || !synthesizerReady) {
      ttsQueueRef.current.shift();
      if (ttsQueueRef.current.length > 0 && processTTSQueueRef.current) processTTSQueueRef.current();
      else if (userWantsToListenRef.current && !isListeningRef.current && !isBotSpeakingRef.current && startContinuousAzureListeningRef.current) {
        setTimeout(() => startContinuousAzureListeningRef.current(), 250);
      }
      return;
    }
    setIsBotSpeaking(true);
    setSpeechError(null);
    speechSynthesizerRef.current.speakTextAsync(
      textToSpeak,
      (result) => {
        setIsBotSpeaking(false);
        if (result.reason !== SpeechSDK.ResultReason.SynthesizingAudioCompleted) setSpeechError(`TTS Error: ${result.errorDetails.substring(0,100)}`);
        ttsQueueRef.current.shift();
        if (ttsQueueRef.current.length > 0 && processTTSQueueRef.current) processTTSQueueRef.current();
        else if (userWantsToListenRef.current && !isListeningRef.current && startContinuousAzureListeningRef.current) {
          setTimeout(() => startContinuousAzureListeningRef.current(), 250);
        }
      },
      (error) => {
        setIsBotSpeaking(false); setSpeechError(`TTS Error: ${error}`);
        ttsQueueRef.current.shift();
        if (ttsQueueRef.current.length > 0 && processTTSQueueRef.current) processTTSQueueRef.current();
        else if (userWantsToListenRef.current && !isListeningRef.current && startContinuousAzureListeningRef.current) {
          setTimeout(() => startContinuousAzureListeningRef.current(), 250);
        }
      }
    );
  }, [synthesizerReady]); // Depends on synthesizer readiness
  useEffect(() => { speakTextRef.current = speakTextFn; }, [speakTextFn]);

  // processTTSQueue
  const processTTSQueueFn = useCallback(() => {
    if (ttsQueueRef.current.length > 0 && !isBotSpeakingRef.current && synthesizerReady) {
      setTimeout(() => {
        if (ttsQueueRef.current.length > 0 && !isBotSpeakingRef.current && synthesizerReady && speakTextRef.current) {
          speakTextRef.current(ttsQueueRef.current[0].text);
        }
      }, 100);
    }
  }, [synthesizerReady]); // Depends on synthesizer readiness
  useEffect(() => { processTTSQueueRef.current = processTTSQueueFn; }, [processTTSQueueFn]);


  // Initial Welcome Message
  useEffect(() => {
    const welcomeMessage = { id: Date.now(), text: "Welcome to the MiraAI Voice Agent for PO Creation - let's get started", sender: "bot" };
    setMessages([welcomeMessage]);
    // Reset states for a fresh start
    setConversationStage(0);
    setPoDetails({ item: "", vendor: "", deliveryAddress: "", quantity: "", price: "", parsedItem: "" });
    setPoPreviewContent(null);

    if (synthesizerReady) {
      ttsQueueRef.current.push({ text: welcomeMessage.text });
      if (processTTSQueueRef.current) processTTSQueueRef.current();
    } else if (userWantsToListenRef.current && speechSupported && azureSpeechConfig && startContinuousAzureListeningRef.current) {
      startContinuousAzureListeningRef.current();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [synthesizerReady, speechSupported, azureSpeechConfig]); // Only run on initial setup/readiness change

  const handleToggleListening = useCallback(() => {
    if (!speechSupported) { setSpeechError("Speech recognition is not supported or configured."); return; }
    if (isBotSpeakingRef.current) { setSpeechError("Please wait for the assistant to finish speaking."); return; }
    const newListeningIntent = !userWantsToListenRef.current; // Read from ref for immediate value
    setUserWantsToListen(newListeningIntent); // Update state
    if (newListeningIntent && startContinuousAzureListeningRef.current) {
      startContinuousAzureListeningRef.current();
    } else if (!newListeningIntent && stopContinuousAzureListeningRef.current) {
      stopContinuousAzureListeningRef.current(false); // User explicitly turned it off
    }
  }, [speechSupported]); // Depends on speechSupported for initial check

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleSendFromInput = () => {
    if (inputValue.trim() === "" || !handleSendMessageInternalRef.current) return;
    handleSendMessageInternalRef.current(inputValue);
  };

  const handleSendPo = () => {
    if (poPreviewContent) {
      alert(`Purchase Order for ${poDetails.vendor || vendorName} would be sent now!\n\nContent:\n${poPreviewContent}`);
      const successMessage = { id: Date.now(), text: "Purchase Order has been sent!", sender: "bot", type: "success" };
      setMessages((prev) => [...prev, successMessage]);
      ttsQueueRef.current.push({ text: successMessage.text });
      if (processTTSQueueRef.current) processTTSQueueRef.current();
      setPoPreviewContent(null);
      setPoDetails({ item: "", vendor: "", deliveryAddress: "", quantity: "", price: "", parsedItem: "" });
      setConversationStage(0);
      setTimeout(() => {
        const newOrderMsg = { id: Date.now() + 1, text: "You can now create a new Purchase Order.", sender: "bot" };
        setMessages((prev) => [...prev, newOrderMsg]);
        ttsQueueRef.current.push({ text: newOrderMsg.text });
        if (processTTSQueueRef.current) processTTSQueueRef.current();
      }, 500);
    } else {
      alert("No PO to send. Please generate one using the chat first.");
    }
  };

  const styles = { /* ... STYLES UNCHANGED ... */ 
    pageContainer: { display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif", height: "100vh", margin: "0 auto", border: "1px solid #ccc", boxShadow: "0 0 10px rgba(0,0,0,0.1)", overflow: "hidden", },
    header: { padding: "20px", borderBottom: "1px solid #e0e0e0" }, mainTitle: { fontSize: "24px", fontWeight: "bold", marginBottom: "5px" }, subTitle: { fontSize: "14px", color: "#555", marginBottom: "10px" }, vendorInfo: { fontSize: "12px", color: "#777" },
    contentArea: { display: "flex", flex: 1, overflow: "hidden" },
    chatPane: { flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid #e0e0e0", backgroundColor: "#f9f9f9", },
    chatHeader: { backgroundColor: "#004A7F", color: "white", padding: "15px", fontSize: "16px", fontWeight: "bold", display: "flex", alignItems: "center", },
    chatMessages: { flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", },
    messageBubble: { maxWidth: "75%", padding: "10px 15px", borderRadius: "18px", fontSize: "14px", lineHeight: "1.4", wordWrap: "break-word", },
    botMessage: { backgroundColor: "#e9e9eb", color: "#333", alignSelf: "flex-start", borderBottomLeftRadius: "4px", },
    userMessage: { backgroundColor: "#0078D4", color: "white", alignSelf: "flex-end", borderBottomRightRadius: "4px", },
    successMessage: { backgroundColor: "#e8f5e9", color: "#2e7d32", alignSelf: "flex-start", border: "1px solid #a5d6a7", borderBottomLeftRadius: "4px", },
    chatInputContainer: { padding: "10px 10px 0px 10px", borderTop: "1px solid #e0e0e0", backgroundColor: "white", },
    speechErrorText: { color: "red", fontSize: "12px", textAlign: "center", marginBottom: "8px", minHeight: "16px",  },
    chatInputArea: { display: "flex", paddingBottom: "10px", alignItems: "center", },
    chatInput: { flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "20px", marginRight: "10px", fontSize: "14px", },
    micButton: { padding: "10px 12px", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", marginRight: "8px", },
    sendButton: { padding: "10px 15px", backgroundColor: "#0078D4", color: "white", border: "none", borderRadius: "20px", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", },
    previewPane: { flex: 1, display: "flex", flexDirection: "column", padding: "0", backgroundColor: "white", },
    previewHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #e0e0e0", },
    previewTitle: { fontSize: "18px", fontWeight: "bold" },
    sendPoButton: { padding: "10px 15px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", },
    previewContent: { flex: 1, padding: "20px", overflowY: "auto", fontSize: "14px", color: "#333", },
    previewPlaceholder: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#888", textAlign: "center", },
    typingIndicator: { fontSize: "12px", fontStyle: "italic", color: "#777", padding: "5px 15px", alignSelf: "flex-start", },
  };
  const commonInputDisabled = isBotTyping || isBotSpeaking || isListening;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.header}>
        {/* ... Header content ... */}
        <div style={styles.mainTitle}>Generate PO</div>
        <div style={styles.subTitle}>Use voice or text to interact with the chatbot for Purchase Orders.</div>
        <div style={styles.vendorInfo}>Vendor Name: {poDetails.vendor || vendorName} | Vendor Email: {vendorEmail}</div>
      </div>
      <div style={styles.contentArea}>
        <div style={styles.chatPane}>
          <div style={styles.chatHeader}><BotIcon /> MiraAI Assistant</div>
          <div style={styles.chatMessages}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ ...styles.messageBubble, ...(msg.sender === "bot" ? styles.botMessage : styles.userMessage), ...(msg.type === "success" ? styles.successMessage : {}), display: "flex", alignItems: "center", }}>
                {msg.sender === "bot" && <BotIcon />} <span style={{ flex: 1 }}>{msg.text}</span> {msg.sender === "user" && <UserIcon />}
              </div>
            ))}
            {isBotTyping && <div style={styles.typingIndicator}>Assistant is thinking...</div>}
            {isBotSpeaking && <div style={styles.typingIndicator}>Assistant is speaking...</div>}
            <div ref={chatMessagesEndRef} />
          </div>
          <div style={styles.chatInputContainer}>
            <div style={styles.speechErrorText}>{speechError && speechError}</div>
            <div style={styles.chatInputArea}>
              <button
                style={{ ...styles.micButton, backgroundColor: isListening ? "#FF6347" : !speechSupported || isBotSpeaking || isBotTyping ? "#cccccc" : userWantsToListen ? "#0078D4" : "#6c757d", color: "white", cursor: !speechSupported || isBotSpeaking || isBotTyping ? "not-allowed" : "pointer", }}
                onClick={handleToggleListening} disabled={!speechSupported || isBotSpeaking || isBotTyping}
                title={!speechSupported ? "Speech not supported/configured" : isBotSpeaking ? "Assistant is speaking" : isBotTyping ? "Assistant is processing" : isListening ? "Listening... (Click to Mute)" : userWantsToListen ? "Muted (Click to Unmute/Listen)" : "Voice Inactive (Click to Activate)"}>
                <Mic /> {isListening ? "Listening..." : userWantsToListen ? "Muted" : "Speak"}
              </button>
              <input ref={inputRef} type="text" style={styles.chatInput} value={inputValue} onChange={handleInputChange}
                onKeyPress={(e) => e.key === "Enter" && !commonInputDisabled && handleSendFromInput()}
                placeholder={isListening ? "Listening..." : isBotSpeaking ? "Assistant is speaking..." : isBotTyping ? "Assistant is processing..." : userWantsToListen ? "Muted. Type or unmute." : "Type or activate microphone..."}
                disabled={commonInputDisabled} />
              <button style={{ ...styles.sendButton, opacity: commonInputDisabled || inputValue.trim() === "" ? 0.6 : 1, }} onClick={handleSendFromInput} disabled={commonInputDisabled || inputValue.trim() === ""}>
                <SendIcon /> Send
              </button>
            </div>
          </div>
        </div>
        <div style={styles.previewPane}>
          <div style={styles.previewHeader}>
            <div style={styles.previewTitle}>PO Preview</div>
            <button style={{ ...styles.sendPoButton, opacity: !poPreviewContent || isBotTyping || isBotSpeaking ? 0.5 : 1, }} onClick={handleSendPo} disabled={!poPreviewContent || isBotTyping || isBotSpeaking}>
              <SendIcon /> Send PO
            </button>
          </div>
          <div style={styles.previewContent}>
            {poPreviewContent ? <img src={GeneratedPO} alt="Generated Purchase Order Preview" style={{ maxWidth: "100%", height: "auto" }} />
             : <div style={styles.previewPlaceholder}><DocumentIcon /><div>Purchase Order Preview will appear here...</div></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POGenerationScreen;