import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// Default voice - "Rachel" is a warm, conversational voice
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

let client = null;
let currentAudio = null;

function getClient() {
  if (!client) {
    if (!API_KEY) {
      throw new Error("VITE_ELEVENLABS_API_KEY is not set in environment variables");
    }
    client = new ElevenLabsClient({ apiKey: API_KEY });
  }
  return client;
}

export async function speakText(text, voiceId = DEFAULT_VOICE_ID) {
  // Stop any currently playing audio
  stopAudio();

  try {
    const elevenlabs = getClient();

    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
    });

    // Convert stream to blob
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBlob = new Blob(chunks, { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Play the audio
    currentAudio = new Audio(audioUrl);
    currentAudio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      currentAudio = null;
    };

    await currentAudio.play();
    return currentAudio;
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    throw error;
  }
}

export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export function isPlaying() {
  return currentAudio !== null && !currentAudio.paused;
}
