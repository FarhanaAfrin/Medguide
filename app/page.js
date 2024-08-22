'use client'

import { useState, useEffect, useRef } from 'react';
import { Box, Button, Stack, TextField, Typography, Tab, Tabs, Grid, Card, CardContent, CardActionArea } from '@mui/material';

export default function Home() {
    const [tabValue, setTabValue] = useState(0);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm Medguide, here to assist you with all your medical help according to WHO and NIH. What can I help you with today?",
        },
    ]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [glossaryResults, setGlossaryResults] = useState([]);
    const messagesEndRef = useRef(null);

    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const sendMessage = async () => {
        if (!message.trim() || isLoading) return;
        setIsLoading(true);
        const newMessage = { role: 'user', content: message };
        setMessages(prevMessages => [...prevMessages, newMessage, { role: 'assistant', content: '' }]);
        setMessage('');
    
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: [...messages, newMessage] }),
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
    
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value, { stream: true });
                setMessages((prevMessages) => {
                    const lastMessage = prevMessages[prevMessages.length - 1];
                    const otherMessages = prevMessages.slice(0, prevMessages.length - 1);
                    return [
                        ...otherMessages,
                        { ...lastMessage, content: lastMessage.content + text },
                    ];
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
            ]);
        }
        setIsLoading(false);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const handleSubmit = async () => {
        if (!text.trim()) {
            alert('Please enter some text to generate flashcards.');
            return;
        }
    
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                body: text,
            });
    
            if (!response.ok) {
                throw new Error('Failed to generate flashcards');
            }
    
            const data = await response.json();
            setFlashcards(data);
        } catch (error) {
            console.error('Error generating flashcards:', error);
            alert('An error occurred while generating flashcards. Please try again.');
        }
    };

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{ backgroundColor: '#75033e', overflow: 'hidden' }}
        >
            <Typography 
                variant="h3"
                component="h1"
                color="#FFFFFF"
                gutterBottom
                sx={{ marginBottom: '20px', marginTop: '40px', fontWeight: 'bold', textAlign: 'center', px: 2 }}
            >
                Welcome to ChatMD!
            </Typography>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
                <Tab label="Chat" />
                <Tab label="Glossary" />
            </Tabs>
            {tabValue === 0 && (
                <Stack
                    direction="column"
                    width="95%"
                    maxWidth="1400px"
                    height="80%"
                    maxHeight="700px"
                    border="6px solid #a1a1a0"
                    p={2}
                    spacing={3}
                    sx={{ backgroundColor: '#FFFFFF', overflow: 'auto' }}
                >
                    <Stack
                        direction="column"
                        spacing={2}
                        flexGrow={1}
                        overflow="auto"
                    >
                        {messages.map((msg, index) => (
                            <Box
                                key={index}
                                display="flex"
                                justifyContent={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
                            >
                                <Box
                                    bgcolor={msg.role === 'assistant' ? '#a1a1a0' : '#75033e'}
                                    color="white"
                                    borderRadius={16}
                                    p={3}
                                    sx={{ maxWidth: '75%', wordWrap: 'break-word' }}
                                >
                                    {msg.content}
                                </Box>
                            </Box>
                        ))}
                        <div ref={messagesEndRef} />
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Enter your message"
                            fullWidth
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <Button 
                            variant="contained" 
                            onClick={sendMessage}
                            disabled={isLoading}
                            sx={{ backgroundColor: '#75033e', color: '#fff' }}
                        >
                            {isLoading ? 'Sending...' : 'Send'}
                        </Button>
                    </Stack>
                </Stack>
            )}
            {tabValue === 1 && (
                <Stack
                    direction="column"
                    width="95%"
                    maxWidth="1400px"
                    height="80%"
                    maxHeight="700px"
                    border="6px solid #a1a1a0"
                    p={2}
                    spacing={3}
                    sx={{ backgroundColor: '#FFFFFF', overflow: 'auto' }}
                >
                    <Box
                        sx={{
                            mt: 4,
                            mb: 6,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Box sx={{ p: 4, width: "100%" }}>
                            <TextField
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                label="Enter text"
                                fullWidth
                                multiline
                                rows={2}
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                fullWidth
                                sx={{
                                    backgroundColor: '#75033e',  // Matching chat UI button color
                                    color: '#fff',
                                    '&:hover': {
                                        backgroundColor: '#a1a1a0',  // Matching hover color
                                    },
                                }}
                            >
                                Submit
                            </Button>
                        </Box>
                    </Box>
                    {flashcards.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                            <Grid container spacing={3}>
                                {flashcards.map((flashcard, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={index}>
                                        <Card>
                                            <CardActionArea onClick={() => handleCardClick(index)}>
                                                <CardContent>
                                                    <Box
                                                        sx={{
                                                            perspective: "1000px",
                                                            "& > div": {
                                                                transition: "transform 0.6s",
                                                                transformStyle: "preserve-3d",
                                                                position: "relative",
                                                                width: "100%",
                                                                height: "200px",
                                                                boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                                                                transform: flipped[index]
                                                                    ? "rotateY(180deg)"
                                                                    : "rotateY(0deg)",
                                                            },
                                                            "& > div > div": {
                                                                position: "absolute",
                                                                width: "100%",
                                                                height: "100%",
                                                                backfaceVisibility: "hidden",
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                padding: 2,
                                                                boxSizing: "border-box",
                                                            },
                                                            "& > div > div:nth-of-type(2)": {
                                                                transform: "rotateY(180deg)",
                                                            },
                                                        }}
                                                    >
                                                        <div>
                                                            <div>
                                                                <Typography variant="h6">
                                                                </Typography>
                                                                <Typography
                                                                    variant="h5"
                                                                    component="div"
                                                                >
                                                                    {flashcard.front}
                                                                </Typography>
                                                            </div>
                                                            <div>
                                                                <Typography variant="h6">
                                                                </Typography>
                                                                <Typography
                                                                    variant="h5"
                                                                    component="div"
                                                                >
                                                                    {flashcard.back}
                                                                </Typography>
                                                            </div>
                                                        </div>
                                                    </Box>
                                                </CardContent>
                                            </CardActionArea>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                            <Box
                                sx={{
                                    mt: 4,
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                            </Box>
                        </Box>
                    )}
                </Stack>
            )}
        </Box>
    );
}
