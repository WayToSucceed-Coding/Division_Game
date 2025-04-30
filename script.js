document.addEventListener('DOMContentLoaded', function () {
    // Game elements
    const wheel = document.getElementById('wheel');
    const divisorEl = document.getElementById('divisor');
    const currentNumberEl = document.getElementById('currentNumber');
    const answerInput = document.getElementById('answerInput');
    const submitBtn = document.getElementById('submitBtn');
    const messageEl = document.getElementById('message');
    const spinBtn = document.getElementById('spinBtn');
    const scoreValue = document.getElementById('scoreValue');
    const celebration = document.getElementById('celebration');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const finalScore = document.getElementById('finalScore');

    // Sound elements
    const celebrationSound = document.getElementById('celebrationSound');
    const spinSound = document.getElementById('spinSound');
    const correctSound = document.getElementById('correctSound');
    const wrongSound = document.getElementById('wrongSound');

    // Instruction elements
    const infoBtn = document.getElementById('infoBtn');
    const instructionsPopup = document.getElementById('instructionsPopup');
    const closeInstructions = document.getElementById('closeInstructions');

    // Game state
    let score = 0;
    let correctAnswer = null;
    let currentDividend = null;
    let spinning = false;
    let spinCount = 0;

    //Loading Animation
    var animation = lottie.loadAnimation({
        container: document.getElementById('lottie-celebration'),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'assets/celebration.json' // path to your downloaded Lottie .json file
    });

    // Initialize game
    initGame();


    // Event listeners
    spinBtn.addEventListener('click', spinWheel);
    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') checkAnswer();
    });
    playAgainBtn.addEventListener('click', function () {

        initGame()
    });
    infoBtn.addEventListener('click', function () {
        instructionsPopup.classList.add('active');
    });

    closeInstructions.addEventListener('click', function () {
        instructionsPopup.classList.remove('active');
    });

    instructionsPopup.addEventListener('click', function (e) {
        if (e.target === instructionsPopup) {
            instructionsPopup.classList.remove('active');
        }
    });

    function initGame() {
        // Reset game state
        score = 0;
        scoreValue.textContent = score;
        spinCount = 0;
        completedDividends = [];
        celebration.style.display = 'none';
        messageEl.textContent = '';
        currentNumberEl.textContent = 'Spin the wheel to start!';
        answerInput.value = '';
        answerInput.disabled = true;
        submitBtn.disabled = true;
        spinBtn.disabled = false;

        // Generate new divisor (between 2-12)
        const divisor = Math.floor(Math.random() * 11) + 2;
        divisorEl.textContent = divisor;

        // Generate dividends that are multiples of the divisor
        const dividendsCount = 8;
        const newDividends = [];

        for (let i = 0; i < dividendsCount; i++) {
            const multiplier = Math.floor(Math.random() * 10) + 2;
            newDividends.push(divisor * multiplier);
        }

        // Update dividend elements
        document.querySelectorAll('.dividend').forEach((el, i) => {
            el.textContent = newDividends[i];
            el.style.opacity = '1';
        });
    }

    function spinWheel() {
        if (spinning) return;
        if (spinCount >= 8) return;

        spinning = true;
        spinBtn.disabled = true;
        answerInput.disabled = true;
        submitBtn.disabled = true;
        currentNumberEl.textContent = 'Spinning...';
        spinSound.currentTime = 0;
        spinSound.play();

        // NEW: Generate fresh divisor + dividends
        const divisor = Math.floor(Math.random() * 11) + 2;
        divisorEl.textContent = divisor;

        const newDividends = [];
        for (let i = 0; i < 8; i++) {
            const multiplier = Math.floor(Math.random() * 10) + 2;
            newDividends.push(divisor * multiplier);
        }

        // Update wheel dividends
        const allDividends = document.querySelectorAll('.dividend');
        allDividends.forEach((el, i) => {
            el.textContent = newDividends[i];
        });

        // Spin setup: Create the stop angle
        const stopIndex = Math.floor(Math.random() * 8); // 0–7
        const stopAngle = stopIndex * 45;
        const extraRotation = 360 * 5; // 5 full spins for effect (more dramatic)
        const finalAngle = extraRotation + stopAngle; // total angle to spin to

        // Apply direct transform for the wheel spin
        wheel.style.transition = 'transform 3s cubic-bezier(0.17, 0.67, 0.21, 0.99)';
        wheel.style.transform = `rotate(${finalAngle}deg)`; // Apply the calculated rotation angle

        // Save the final rotation for the next spin (we need to know where it ends)
        currentRotation = finalAngle;

        // Reset the transform before the next spin (important to make each spin independent)
        setTimeout(() => {
            spinning = false;

            spinSound.pause()

            // Lock wheel at stop angle
            wheel.style.transition = 'none';
            wheel.style.transform = `rotate(${stopAngle}deg)`;

            // Fix the numbers visually after wheel rotates
            const correctedAngle = finalAngle % 360;

            const allDividends = document.querySelectorAll('.dividend');
            allDividends.forEach((div, i) => {
                div.style.transition = 'transform 0.5s ease';
                // Recalculate their transform to adjust for wheel's new rotation
                div.style.transform = `
            rotate(${i * 45}deg)
            translate(120px)
            rotate(${-(i * 45 + correctedAngle)}deg)
        `;
            });

            // Fix the center divisor to stay upright
            const centerDivisor = document.querySelector('.center-divisor');
            centerDivisor.style.transition = 'transform 0.5s ease';
            centerDivisor.style.transform = `rotate(${-correctedAngle}deg)`;

            // Find the closest dividend to the pointer
            const pointer = document.querySelector('.pointer');
            const pointerBox = pointer.getBoundingClientRect();

            const dividends = document.querySelectorAll('.dividend');
            let closest = null;
            let minDistance = Infinity;

            dividends.forEach(div => {
                const box = div.getBoundingClientRect();
                const centerX = box.left + box.width / 2;
                const centerY = box.top + box.height / 2;
                const pointerX = pointerBox.left + pointerBox.width / 2;
                const pointerY = pointerBox.top + pointerBox.height / 2;
                const distance = Math.hypot(centerX - pointerX, centerY - pointerY);

                if (distance < minDistance) {
                    minDistance = distance;
                    closest = div;
                }
            });

            // Get the current dividend at the pointer
            currentDividend = parseInt(closest.textContent);

            // Calculate the correct answer
            const divisor = parseInt(divisorEl.textContent);
            correctAnswer = currentDividend / divisor;

            currentNumberEl.textContent = `${currentDividend} ÷ ${divisor} = ?`;

            // Re-enable buttons for the next round
            answerInput.disabled = false;
            submitBtn.disabled = false;
            spinBtn.disabled = false;
            answerInput.value = '';
            answerInput.focus();

            spinCount++;
        }, 3000); // Wait for the spinning animation to complete
    }


    function checkAnswer() {
        const userAnswer = parseFloat(answerInput.value);

        if (isNaN(userAnswer)) {
            messageEl.textContent = "Please enter a valid number!";
            messageEl.style.color = "#f44336";

            setTimeout(() => {
                messageEl.textContent = ''
            }, 3000); // Auto-hide after 3 seconds
            wrongSound.currentTime = 0;
            wrongSound.play();
            return;
        }

        if (Math.abs(userAnswer - correctAnswer) < 0.001) {
            // Correct answer
            score++;
            scoreValue.textContent = score;
            messageEl.textContent = "Correct! Great job!";
            messageEl.style.color = "#4CAF50";
            messageEl.classList.add('correct-answer');

            setTimeout(() => {
                messageEl.textContent = ''
            }, 3000); // Auto-hide after 3 seconds

            correctSound.play();

            submitBtn.disabled = true;
            spinBtn.disabled = false;
            answerInput.disabled = true;


            // Check if game is complete
            if (score === 8) {
                showCelebration();
            } else {
                // Prepare for next spin
                answerInput.value = '';
                answerInput.disabled = true;
                submitBtn.disabled = true;
                currentNumberEl.textContent = 'Spin again!';

                // Remove animation class after it completes
                setTimeout(() => {
                    messageEl.classList.remove('correct-answer');
                }, 500);
            }
        } else {
            // Incorrect answer
            messageEl.textContent = `Oops! Try again!`;
            messageEl.style.color = "#f44336";
            setTimeout(() => {
                messageEl.textContent = ''
            }, 3000); // Auto-hide after 3 seconds
            wrongSound.currentTime = 0;
            wrongSound.play();
        }
    }

    function showCelebration() {
        finalScore.textContent = score;
        celebration.style.display = 'flex';
        celebrationSound.currentTime = 0;
        celebrationSound.play();

        animation.stop();
        animation.goToAndPlay(0, true);



    }
});
