let totalSteps = 0;
let currentStepGlobal = 1;
let currentModuleGlobal = 1;

// 1. SISTEMA DE MEMÓRIA PERSISTENTE
window.onload = () => {
    // Restaura o Tema
    const savedTheme = localStorage.getItem('fisicaTheme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('theme-toggle').innerText = savedTheme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro';
    }

    // Restaura o Progresso
    const savedStep = localStorage.getItem('fisicaActiveStep');
    const savedModule = localStorage.getItem('fisicaActiveModule');

    if (savedStep && savedModule) {
        document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));

        const modEl = document.getElementById(`modulo-${savedModule}`);
        const stepEl = document.getElementById(`step-${savedStep}`);

        if (modEl && stepEl) {
            modEl.classList.add('active');
            stepEl.classList.add('active');
            currentStepGlobal = parseInt(savedStep);
            currentModuleGlobal = parseInt(savedModule);
        }
    }
    
    updateProgress();
    setTimeout(applySemanticMathWrap, 300); // Garante a quebra de fórmulas no recarregamento
};

function saveProgress() {
    localStorage.setItem('fisicaActiveStep', currentStepGlobal);
    localStorage.setItem('fisicaActiveModule', currentModuleGlobal);
}

function toggleTheme() {
    const htmlElement = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle');
    let newTheme = 'light';
    
    if (htmlElement.getAttribute('data-theme') === 'light') {
        newTheme = 'dark';
        themeBtn.innerText = '☀️ Modo Claro';
    } else {
        newTheme = 'light';
        themeBtn.innerText = '🌙 Modo Escuro';
    }
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('fisicaTheme', newTheme);
}

function updateProgress() {
    totalSteps = document.querySelectorAll('.step').length; 
    let percentage = (currentStepGlobal / totalSteps) * 100;
    if(percentage > 100) percentage = 100;
    document.getElementById('progress-bar').style.width = percentage + '%';
    document.getElementById('progress-text').innerText = `Progresso: ${Math.round(percentage)}%`;
}

// 2. NAVEGAÇÃO DE PASSOS
function nextStep(current, next) {
    document.getElementById(`step-${current}`).classList.remove('active');
    document.getElementById(`step-${next}`).classList.add('active');
    currentStepGlobal++;
    saveProgress();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(current, prev) {
    document.getElementById(`step-${current}`).classList.remove('active');
    document.getElementById(`step-${prev}`).classList.add('active');
    currentStepGlobal--;
    saveProgress();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 3. GAMIFICAÇÃO DO VISTO
function mostrarVisto(idVisto, btn) {
    document.getElementById(idVisto).style.display = 'block';
    btn.style.display = 'none'; // Esconde o botão original
}

// 4. NAVEGAÇÃO DE MÓDULOS
function vistoConcluido(moduloAtual, currentStepNum, nextStepNum) {
    document.getElementById(`modulo-${moduloAtual}`).classList.remove('active');
    document.getElementById(`modulo-${moduloAtual + 1}`).classList.add('active');
    document.getElementById(`step-${currentStepNum}`).classList.remove('active');
    document.getElementById(`step-${nextStepNum}`).classList.add('active');
    
    currentStepGlobal++;
    currentModuleGlobal++;
    saveProgress();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevModule(moduloAtual, currentStepNum, prevStepNum) {
    document.getElementById(`modulo-${moduloAtual}`).classList.remove('active');
    document.getElementById(`modulo-${moduloAtual - 1}`).classList.add('active');
    document.getElementById(`step-${currentStepNum}`).classList.remove('active');
    document.getElementById(`step-${prevStepNum}`).classList.add('active');
    
    currentStepGlobal--;
    currentModuleGlobal--;
    saveProgress();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 5. ZERAR MEMÓRIA DO CURSO
function reiniciarCurso() {
    if(confirm("Tem certeza que deseja reiniciar o curso? Seu progresso será apagado.")) {
        localStorage.removeItem('fisicaActiveModule');
        localStorage.removeItem('fisicaActiveStep');
        window.location.reload();
    }
}

// 6. QUIZ E GABARITO
function checkAnswer(button, isCorrect) {
    let feedback = button.parentElement.querySelector('.feedback');
    if (isCorrect) {
        feedback.innerText = "✅ Resposta Correta! Muito bem.";
        feedback.className = "feedback correct";
        button.style.backgroundColor = "#2ecc71";
        button.style.color = "#fff";
    } else {
        feedback.innerText = "❌ Ops, tente novamente! Revise a teoria.";
        feedback.className = "feedback wrong";
        button.style.backgroundColor = "#e74c3c";
        button.style.color = "#fff";
    }
}

function mostrarGabarito(idGabarito, btn) {
    let gabarito = document.getElementById(idGabarito);
    if (gabarito.style.display === 'block') {
        gabarito.style.display = 'none';
        btn.innerText = '👀 Ver Gabarito';
    } else {
        gabarito.style.display = 'block';
        btn.innerText = '🙈 Esconder Gabarito';
    }
}

// 7. QUEBRA DE LINHAS KATEX (EXPERT MODE)
function applySemanticMathWrap() {
    document.querySelectorAll('.math-dynamic-break').forEach(el => el.remove());
    document.querySelectorAll('.math-indented').forEach(el => el.classList.remove('math-indented'));

    document.querySelectorAll('.katex-display').forEach(display => {
        const formulaBox = display.closest('.formula-box') || display.parentElement;
        const maxWidth = formulaBox.clientWidth - 40; 
        const katexHtml = display.querySelector('.katex-html');
        if (!katexHtml) return;

        const tokens = katexHtml.querySelectorAll('.base > *');
        let currentWidth = 0;

        tokens.forEach(token => {
            const width = token.getBoundingClientRect().width;
            if (currentWidth + width > maxWidth && currentWidth > 0) {
                if (token.classList.contains('mrel') || token.classList.contains('mbin')) {
                    const breakElement = document.createElement('span');
                    breakElement.className = 'math-dynamic-break';
                    token.parentNode.insertBefore(breakElement, token);
                    token.classList.add('math-indented');
                    currentWidth = 30 + width;
                } else { currentWidth += width; }
            } else { currentWidth += width; }
        });
    });
}

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applySemanticMathWrap, 150);
});