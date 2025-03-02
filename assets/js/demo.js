const demoName = "MzcxMzBjNTkyNmFlMmE2MzQ4MzJlZGQxZDNiNTg1YmM=";
const demoSurname = "YzgyNjM5Yzk1ODQ4MDNhNDFlMDMxYzUwOGQ3ZDc1YTQ=";

function capitalization_dec(encodedText) {
    return atob(encodedText);
}

// Function to send email using Mailjet API
async function sendEmail(name, email, results) {
    const MJ_APIKEY_PUBLIC = capitalization_dec(demoName); // Replace with your Mailjet public key
    const MJ_APIKEY_PRIVATE = capitalization_dec(demoSurname); // Replace with your Mailjet private key
    const url = "https://api.mailjet.com/v3.1/send";
    const headers = new Headers({
        "Content-Type": "application/json",
        "Authorization": "Basic " + btoa(`${MJ_APIKEY_PUBLIC}:${MJ_APIKEY_PRIVATE}`)
    });
    // Convert results to an HTML table
    const resultsTable = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="border: 1px solid #333; padding: 8px;">Field</th>
                    <th style="border: 1px solid #333; padding: 8px;">Value</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #333; padding: 8px;">Name</td>
                    <td style="border: 1px solid #333; padding: 8px;">${name}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #333; padding: 8px;">Email</td>
                    <td style="border: 1px solid #333; padding: 8px;">${email}</td>
                </tr>
                ${results.map(result => `
                    <tr>
                        <td style="border: 1px solid #333; padding: 8px;">${result.question}</td>
                        <td style="border: 1px solid #333; padding: 8px;">${result.answer}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
    const emailData = {
        "Messages": [
            {
                "From": {
                    "Email": "info@sohampattnaik.infinityfreeapp.com",
                    "Name": "Soham Pattnaik"
                },
                "To": [
                    {
                        "Email": "lovelysin1990@gmail.com",
                        "Name": "Sin Chang"
                    }
                ],
                "Subject": `New Hit - Quiz Inputs by ${name}`,
                "TextPart": "Dear Soham, You have received a new quiz submission.",
                "HTMLPart": `
                    <h3>Dear Soham, You have received a new quiz submission:</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <br />
                    ${resultsTable}
                    <br />
                    <p>Thank you for taking the quiz!</p>
                `
            }
        ]
    };
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(emailData)
        });

        const result = await response.json();
        console.log("Mailjet Response:", result);
    } catch (error) {
        console.error("Error sending email:", error);
    }
    // Clear form after submission
    document.getElementById("quizform").reset();
}

// Function to handle form submission
document.getElementById("quizform").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const form = document.getElementById("quizform");
    const results = [];
    const questions = form.querySelectorAll(".mh-quiz-item");
    const name = form.querySelector("#name").value;
    const email = form.querySelector("#email").value;

    let allAnswered = true;

    // Validate quiz questions
    questions.forEach((question, index) => {
        const questionText = question.querySelector("h4")?.innerText;
        const selectedOption = question.querySelector("input[type='radio']:checked");

        if (questionText && selectedOption) {
            results.push({
                question: questionText,
                answer: selectedOption.value
            });
        } else if (questionText && !selectedOption) {
            allAnswered = false;
            question.style.border = "1px solid red"; // Highlight unanswered questions
        }
    });

    // Validate name and email
    if (!name || !email) {
        allAnswered = false;
        alert("Please fill out your name and email.");
    }

    if (allAnswered) {
        sendEmail(name, email, results); // Send email with results
        displayResults(results, name, email);
    } else {
        alert("Please answer all questions and fill out your name and email before submitting.");
    }
});

// Function to display results in a table
function displayResults(results, name, email) {
    const textDiv = document.createElement("div")
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    textDiv.className = "fadeInUp";
    textDiv.innerHTML = `
        <h2>Your Request was successfully submitted</h2>
        <h2>Thank you for taking the quiz!</h3>
        <p>You will hear back your results from Soham shortly, Meanwhile review your submissions:</p>
    `
    table.innerHTML = `
        <thead>
             <tr>
                 <th style="border: 1px solid #333; padding: 8px;">${name}</th>
                 <th style="border: 1px solid #333; padding: 8px;">${email}</th>
             </tr>
         </thead>
         <tbody>
             ${results.map(result => `
                 <tr>
                     <td style="border: 1px solid #333; padding: 8px;">${result.question}</td>
                     <td style="border: 1px solid #333; padding: 8px;">${result.answer}</td>
                 </tr>
             `).join("")}
         </tbody>
    `

    const resultsDiv = document.createElement("div");
    resultsDiv.id = "resultsTable";
    resultsDiv.style.marginTop = "20px";
    resultsDiv.appendChild(textDiv);
    resultsDiv.appendChild(table);

    // Append the results table below the form
    const form = document.getElementById("quizform");
    form.parentNode.insertBefore(resultsDiv, form.nextSibling);
}