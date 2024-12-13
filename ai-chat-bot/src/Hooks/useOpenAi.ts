import axios from "axios";
import { useState } from "react";
import { IMessage } from "../Components/Chat";


const useOpenAi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAIResponse = async (messages: IMessage[]): Promise<string> => {
        setLoading(true);
        setError(null);

        try {
            console.log("Requesting AI response...");
            const response = await axios.post(
                "http://localhost:3000/api/chat",
                {
                    messages: messages.map(msg => ({
                        role: msg.sender === "You" ? "user" : "assistant",
                        content: msg.text,
                    })),
                },);

            return response.data.content; 
        } catch (err) {
            console.error("Error communicationg with backend", err);
            setError("Failed to fetch API response. Please try again.");
            return "Error: unable to process your request. ";
        } finally {
            setLoading(false);
        }
    };
    return { getAIResponse, loading, error }
}

export default useOpenAi;