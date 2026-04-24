const loadDataBtn = document.getElementById('load-data');
const dataOutput = document.getElementById('data-output');
const scoreBtn = document.getElementById('score-btn');
const scoreResult = document.getElementById('score-result');
const historyInput = document.getElementById('history');
const historyValue = document.getElementById('history-value');

historyInput.addEventListener('input', () => {
    historyValue.textContent = Number(historyInput.value).toFixed(2);
});

loadDataBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('data/sample.json');
        if (!response.ok) {
            throw new Error('Не удалось загрузить данные');
        }
        const data = await response.json();
        dataOutput.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        dataOutput.textContent = error.message;
    }
});

scoreBtn.addEventListener('click', () => {
    const income = Number(document.getElementById('income').value);
    const loan = Number(document.getElementById('loan').value);
    const history = Number(historyInput.value);
    const score = Math.max(0, Math.min(100, Math.round((income / (loan + 1) + history * 100) / 2)));
    const verdict = score >= 60 ? 'Хорошая вероятность одобрения' : 'Низкая вероятность одобрения';

    scoreResult.textContent = `Скоринг: ${score} / 100\n${verdict}`;
});
