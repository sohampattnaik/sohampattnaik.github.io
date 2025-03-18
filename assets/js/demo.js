async function sendData(data) {
    const submitButton = document.getElementById("form-submit");
    const buttonText = document.getElementById("button-text");
    const buttonSpinner = document.getElementById("button-spinner");

    try {
        // Change button text and show spinner
        buttonText.textContent = "Submitting in progress...";
        buttonSpinner.style.display = "inline";
        submitButton.disabled = true;

        const response = await fetch('https://demomailer-brevo-app.orangesky-e75b328a.westus2.azurecontainerapps.io/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            console.log(result);
        } else {
            alert(result.error);
            console.log(result);
        }
    } catch (error) {
        alert('An error occurred while submitting the form.');
    } finally {
        // Restore button text and hide spinner
        buttonText.textContent = "Submit";
        buttonSpinner.style.display = "none";
        submitButton.disabled = false;
    }
}

// Function to validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    return emailRegex.test(email);
}

// Function to validate the form
function validateForm(form) {
    let isValid = true;

    // Validate name
    const name = form.querySelector("#name").value.trim();
    if (!name) {
        isValid = false;
        alert("Please fill out your name.");
    }

    // Validate email
    const email = form.querySelector("#email").value.trim();
    if (!email) {
        isValid = false;
        alert("Please fill out your email.");
    } else if (!validateEmail(email)) {
        isValid = false;
        alert("Please enter a valid email address.");
    }

    // Validate quiz questions
    const questions = form.querySelectorAll(".mh-quiz-item");
    questions.forEach((question) => {
        const selectedOption = question.querySelector("input[type='radio']:checked");
        if (!selectedOption) {
            isValid = false;
            question.style.border = "1px solid red"; // Highlight unanswered questions
        } else {
            question.style.border = ""; // Reset border if answered
        }
    });

    return isValid;
}

// Function to collect form data
function collectFormData(form) {
    const name = form.querySelector("#name").value.trim();
    const email = form.querySelector("#email").value.trim();
    const grade = form.querySelector("#grade").value.trim();
    const feedback = form.querySelector("#feedback").value.trim();
    const questions = form.querySelectorAll(".mh-quiz-item");

    const results = [];
    questions.forEach((question) => {
        const questionText = question.querySelector("h4")?.innerText;
        const selectedOption = question.querySelector("input[type='radio']:checked");
        if (questionText && selectedOption) {
            results.push({
                question: questionText,
                answer: selectedOption.value,
            });
        }
    });

    return {
        name: name,
        email: email,
        grade: grade,
        feedback: feedback,
        questions: results,
    };
}

// Function to handle file upload
function handleFileUpload(formData) {
    return new Promise((resolve) => {
        const fileInput = document.getElementById('imageUpload');
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = function () {
                // Add file data to formData
                formData.file = reader.result;  // Base64-encoded file
                formData.filename = file.name;
                resolve(formData);
            };
            reader.readAsDataURL(file);
        } else {
            resolve(formData); // No file to upload
        }
    });
}

// Function to display results in a table
function displayResults(results, name, email) {
    const textDiv = document.createElement("div");
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    textDiv.className = "fadeInUp";
    textDiv.innerHTML = `
        <h2>Your Request was successfully submitted</h2>
        <h2>Thank you for taking the quiz!</h3>
        <p>You will hear back your results shortly, Meanwhile review your submissions:</p>
    `;
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
    `;

    const resultsDiv = document.createElement("div");
    resultsDiv.id = "resultsTable";
    resultsDiv.style.marginTop = "20px";
    resultsDiv.appendChild(textDiv);
    resultsDiv.appendChild(table);

    // Append the results table below the form
    const form = document.getElementById("quizform");
    form.parentNode.insertBefore(resultsDiv, form.nextSibling);

    // Add fade-in animation
    resultsDiv.classList.add("fadeIn");

    // Set timeout for fade-out animation after 5 seconds
    setTimeout(() => {
        // Add fade-out animation
        resultsDiv.classList.add("fadeOut");

        // Remove the resultsDiv from the DOM after the fade-out animation completes
        resultsDiv.addEventListener("animationend", () => {
            resultsDiv.remove();
        }, { once: true }); // Ensure the event listener is removed after firing once
    }, 5000); // 5000ms = 5 seconds
}

// Function to handle form submission
document.getElementById("quizform").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const form = document.getElementById("quizform");

    // Validate the form
    if (!validateForm(form)) {
        alert("Please answer all questions and fill out your name and email before submitting.");
        return;
    }

    // Collect form data
    const formData = collectFormData(form);

    // Handle file upload (if any)
    const finalFormData = await handleFileUpload(formData);

    // Send data to the Flask backend
    await sendData(finalFormData);

    // Display results
    displayResults(finalFormData.questions, finalFormData.name, finalFormData.email);

    // Reset the form
    form.reset();
});