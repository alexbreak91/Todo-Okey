document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("taskInput");
    const todoList = document.getElementById("todoList");
    const doneList = document.getElementById("doneList");
    const assistantButton = document.getElementById("assistantButton");

    function addTask(taskText) {
        const li = document.createElement("li");
        li.textContent = taskText;
        
        const bell = document.createElement("span");
        bell.textContent = "🔔";
        bell.classList.add("bell");
        bell.onclick = function () {
            openScheduleModal(taskText);
        };
        
        li.appendChild(bell);
        li.onclick = function (event) {
            if (event.target !== bell) {
                moveTask(li);
            }
        };
        
        todoList.appendChild(li);
    }

    function moveTask(taskElement) {
        if (taskElement.parentNode === todoList) {
            doneList.appendChild(taskElement);
        } else {
            todoList.appendChild(taskElement);
        }
    }

    function openScheduleModal(taskText) {
        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Pianifica Attività</h3>
                <p>${taskText}</p>
                <label>Data:</label>
                <input type="date" id="taskDate">
                <label>Ora:</label>
                <input type="time" id="taskTime">
                <button onclick="saveSchedule('${taskText}')">Salva</button>
                <button onclick="closeModal()">Chiudi</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    window.closeModal = function () {
        document.querySelector(".modal").remove();
    };

    window.saveSchedule = function (taskText) {
        const date = document.getElementById("taskDate").value;
        const time = document.getElementById("taskTime").value;
        
        if (date && time) {
            setTimeout(() => {
                new Notification("Promemoria", { body: `È ora di: ${taskText}` });
            }, new Date(`${date}T${time}`).getTime() - Date.now());
        }

        closeModal();
    };

    // Funzione per attivare l'Assistente IA (OpenAI)
    async function askAI(question) {
        const apiKey = "TUO_API_KEY"; // Sostituisci con la tua API Key OpenAI
        const url = "https://api.openai.com/v1/chat/completions";
        
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "user", content: question }]
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }

    function startVoiceRecognition() {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "it-IT";
        recognition.start();
        
        recognition.onresult = async function (event) {
            const command = event.results[0][0].transcript.toLowerCase();
            console.log("Comando vocale ricevuto:", command);

            if (command.includes("aggiungi")) {
                const task = command.replace("aggiungi", "").trim();
                if (task) addTask(task);
            } else if (command.includes("elenca le attività")) {
                let tasks = [...todoList.children].map(li => li.textContent).join(", ");
                alert("Attività da fare: " + tasks);
            } else {
                const aiResponse = await askAI(command);
                alert("AI: " + aiResponse);
            }
        };
    }

    assistantButton.addEventListener("click", startVoiceRecognition);
});
