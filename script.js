document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start-btn");
    const stopBtn = document.getElementById("stop-btn");
    const output = document.getElementById("output");
    const wikiLink = document.getElementById("wiki-link");
    const wikiImage = document.getElementById("wiki-image");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;

    if (!SpeechRecognition || !SpeechSynthesis) {
        output.textContent = "Your browser does not support voice recognition.";
        startBtn.disabled = true;
        stopBtn.disabled = true;
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        output.textContent = `You said: "${transcript}"`;
        respond(transcript);
    };

    recognition.onerror = (event) => {
        output.textContent = "Error recognizing speech. Try again.";
        console.error(event.error);
        recognition.stop();
        setTimeout(() => recognition.start(), 1000);
    };

    recognition.onend = () => {
        console.log("Restarting recognition...");
        recognition.start();
    };

    startBtn.addEventListener("click", () => {
        output.textContent = "Listening...";
        recognition.start();
    });

    stopBtn.addEventListener("click", () => {
        SpeechSynthesis.cancel();
        output.textContent = "Stopped speaking.";
        wikiLink.innerHTML = "";
        wikiImage.style.display = "none";
    });
    
    function respond(text) {
        let response = "I didn't understand that.";

        if (text.includes("hello")) {
            response = "Hello! How can I assist you?";
        } else if (text.includes("who are you")) {
            response = "I am your friendly voice assistant.";
        } else if (text.includes("what is your name")) {
            response = "My name is ChatBot.";
        } else if (text.includes("tell me a joke")) {
            response = "Why don’t skeletons fight each other? Because they don’t have the guts!";
        } else if (text.includes("time")) {
            response = `The current time is ${new Date().toLocaleTimeString()}.`;
        } else if (text.includes("date")) {
            response = `Today's date is ${new Date().toLocaleDateString()}.`;
        } else if (text.includes("goodbye")) {
            response = "Goodbye! Have a great day!";
        } 
        else if (text.includes("search wikipedia for")) {
            const query = text.replace("search wikipedia for", "").trim();
            response = `Searching Wikipedia for ${query}...`;
            searchWikipedia(query);
        } 
        else if (text.includes("open youtube")) {
            response = "Opening YouTube...";
            window.open("https://www.youtube.com", "_blank");
        }
        else if (text.includes("search google for")) {
            const query = text.replace("search google for", "").trim();
            response = `Searching Google for ${query}...`;
            window.open(`https://www.google.com/search?q=${query}`, "_blank");
        }
        else if (text.includes("play a song on youtube")) {
            response = "Playing a song on YouTube...";
            window.open("https://www.youtube.com/results?search_query=popular+music", "_blank");
        }
        else if (text.includes("open google")) {
            response = "Opening Google...";
            window.open("https://www.google.com", "_blank");
        }
        else if (text.includes("what is the weather")) {
            response = "I can't check real-time weather yet, but you can check it on Google!";
            window.open("https://www.google.com/search?q=current+weather", "_blank");
        }
        else if (text.includes("set a timer for")) {
            const time = text.match(/\d+/);
            if (time) {
                response = `Setting a timer for ${time} seconds.`;
                setTimeout(() => speak("Time's up!"), time * 1000);
            } else {
                response = "Please specify a time in seconds.";
            }
        }

        speak(response);
    }

    function speak(message) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = "en-US";
        utterance.rate = 1;
        SpeechSynthesis.speak(utterance);
    }

    function searchWikipedia(query) {
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${query}`)
            .then(response => response.json())
            .then(data => {
                if (data.extract) {
                    output.innerHTML = `<strong>${data.title}</strong>: ${data.extract}`;
                    wikiLink.innerHTML = `<br><a href="${data.content_urls.desktop.page}" target="_blank">Read more on Wikipedia</a>`;
                    
                    speak(data.extract);

                    if (data.thumbnail && data.thumbnail.source) {
                        wikiImage.src = data.thumbnail.source;
                        wikiImage.style.display = "block";
                    } else {
                        wikiImage.style.display = "none";
                    }
                } else {
                    output.textContent = "No results found on Wikipedia.";
                    wikiLink.innerHTML = "";
                    wikiImage.style.display = "none";
                }
            })
            .catch(error => {
                console.error("Error fetching Wikipedia data:", error);
                output.textContent = "Failed to fetch Wikipedia data.";
                wikiImage.style.display = "none";
            });
    }
});
