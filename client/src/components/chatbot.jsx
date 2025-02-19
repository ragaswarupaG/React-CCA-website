/* eslint-disable no-unused-vars */
import React from 'react';
import ChatBot from 'react-chatbotify';

const Chatbot = () => {


    const helpOptions = ["Know more about CCA", "CCA timings", "Selection Process"];

    const flow = {
        start: {
            message: "Hi there! Welcome to TP Badminton! What is your name?",
            path: "name"
        },
    
        name: {
            message: (params) => `Hi ${params.userInput}! Did you play badminton before?`,
            path: "show_options"
        },
    
        show_options: {
            message: "Here are some things you might want to know about TP Badminton:",
            options: helpOptions,
            path: "process_options"
        },
    
        process_options: {
            message: (params) => {
                switch(params.userInput) {
                    case "Know more about CCA":
                        return "We are a fun and chill CCA where you can learn and play badminton with friends!";
                    case "CCA timings":
                        return "Training and session timings are usually 7PM to 10 PM but it varies.";
                    case "Selection Process":
                        return "We welcome players of all skill levels! No prior experience needed.";
                    default:
                        return "Please select one of the available options.";
                }
            },
            path: "show_options_again"
        },

        show_options_again: {
            message: "Here are some more things you might want to know!:",
            options: helpOptions,
            path: "process_options"
        },
    
        end: {
            message: "Thanks for chatting! Hope to see you at TP Badminton!",
            chatDisabled: true
        }
    };

    return <ChatBot flow={flow}   />;
};

export default Chatbot;
