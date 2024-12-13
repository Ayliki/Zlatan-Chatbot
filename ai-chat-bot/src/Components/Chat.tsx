import { useEffect, useRef, useState } from "react";
import useOpenAi from "../Hooks/useOpenAi";

export interface IMessage {
    sender: "AI" | "You";
    text: string;
}

const Chat = () => {
    const [messages, setMessages] = useState<IMessage[]>(() => {
        const savedMessages = localStorage.getItem("chatMessages");
        return savedMessages ? JSON.parse(savedMessages) : [{ sender: "AI", text: "Hello! How can I help you today?" },]
    });
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);

    const { getAIResponse, loading } = useOpenAi();

    //Reference to the bottom of the messages
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    //Scroll to the bottom of the messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const sendMessage = async () => {
        if (!input.trim()) return; //Prevent empty message

        //Add user Mesage
        const updatedMessages: IMessage[] = [...messages, { sender: "You", text: input }];
        setMessages(updatedMessages);
        setInput("");

        //Show typing indicator
        setMessages((prev) => [
            ...prev,
            { sender: "AI", text: "AI is typing..." }
        ]);

        try {
            //get AI Response
            const aiResponse = await getAIResponse(updatedMessages);

            //Update the AI's Response
            setMessages((prev) => [
                ...prev.slice(0, -1), // Remove "AI is typing..." message
                { sender: "AI", text: aiResponse ?? "Error: No response from AI" },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev.slice(0, -1),
                { sender: "AI", text: "Error: Unable to fetch AI response." },
            ])
        } finally {
            setTyping(false);
        }


    };

    //Scroll whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, loading])

    //Store chat data
    useEffect(() => {
        localStorage.setItem("chatMessages", JSON.stringify(messages));
    }, [messages])


    //Load messages from localStorage
    useEffect(() => {
        const savedMessages = localStorage.getItem("chatMessages");
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (error) {
                console.error("Failed to parse chatMessages from localStorage", error);
            }
        }
    }, []);



    //Clear messages from localStorage
    const clearChat = () => {
        setMessages([{ sender: "AI", text: "Hello! How can I help you today?" },]);
        localStorage.removeItem("chatMessages")
    }

    return (
        <div className="flex flex-col h-screen flex-1">
            {/*Chat Area*/}
            <div className="flex-1 overflow-y-auto border-b p-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 ${msg.sender === "You" ? "text-right" : "text-left"}`}
                    >
                        <span className={`inline-block px-4 py-2 rounded-lg ${msg.sender === "You"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800"
                            }`}>
                            {msg.text}
                        </span>
                    </div>
                ))}

                {/*AI Typing Indicator*/}
                {typing && (
                    <div className="text-left text-gray-500">
                        <span className="italic">AI is typing...</span>
                    </div>
                )}

                <div ref={messagesEndRef}></div>
            </div>

            <div className="p-2 flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Type your message..."
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    disabled={loading}
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-300 border rounded md hover:bg-blue-600"
                >
                    {loading ? "Waiting..." : "Send"}
                </button>
                <button
                    className="px-4 py-2 bg-gray-300 border rounded-md hover:bg-gray-400"
                    onClick={clearChat}
                >
                    Clear
                </button>
            </div>
        </div>
    )
}

export default Chat;