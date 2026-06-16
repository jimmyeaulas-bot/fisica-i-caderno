let totalSteps = 0;
let currentStepGlobal = 1;

function toggleTheme() {
    const htmlElement = document.documentElement;
    const themeBtn = document.getElementById('theme-toggle');
    if (htmlElement.getAttribute('data-theme') === 'light') {
        htmlElement.setAttribute('data-theme', 'dark');
        themeBtn.innerText = '☀️ Modo Claro';
    } else {
        htmlElement.setAttribute('data-theme', 'light');
        themeBtn.innerText = '🌙 Modo Escuro';
    }
}

function updateProgress() {
    totalSteps = document.querySelectorAll('.step').length; 
    let percentage = (currentStepGlobal / totalSteps) * 100;
    if(percentage > 100) percentage = 100;
    document.getElementById('progress-bar').style.width = percentage + '%';
    document.getElementById('progress-text').innerText = `Progresso: ${Math.round(percentage)}%`;
}

// Inicializa a barra ao abrir
window.onload = () => {
    updateProgress();
};

function nextStep(current, next) {
    document.getElementById(`step-${current}`).classList.remove('active');
    document.getElementById(`step-${next}`).classList.add('active');
    currentStepGlobal++;
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function vistoConcluido(moduloAtual, currentStepNum, nextStepNum) {
    alert("Parabéns! Visto registrado com sucesso! \nVamos continuar o aprendizado.");
    document.getElementById(`modulo-${moduloAtual}`).classList.remove('active');
    document.getElementById(`modulo-${moduloAtual + 1}`).classList.add('active');
    document.getElementById(`step-${currentStepNum}`).classList.remove('active');
    document.getElementById(`step-${nextStepNum}`).classList.add('active');
    currentStepGlobal++;
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

/**
 * ===================================================================
 * EXPERT MATH WRAP: Sistema dinâmico de quebra semântica de equações
 * ===================================================================
 */
function applySemanticMathWrap() {
    // 1. Limpeza: Removemos quebras anteriores se o usuário virou a tela do celular (Resize)
    document.querySelectorAll('.math-dynamic-break').forEach(el => el.remove());
    document.querySelectorAll('.math-indented').forEach(el => el.classList.remove('math-indented'));

    // 2. Coletamos todos os containers de fórmulas (Modo Display)
    const mathDisplays = document.querySelectorAll('.katex-display');

    mathDisplays.forEach(display => {
        // Encontra o container pai visível e pega sua largura útil (descontando margens)
        const formulaBox = display.closest('.formula-box') || display.parentElement;
        const maxWidth = formulaBox.clientWidth - 40; 
        
        const katexHtml = display.querySelector('.katex-html');
        if (!katexHtml) return;

        // Pega todos os "tokens" matemáticos renderizados pelo KaTeX
        const tokens = katexHtml.querySelectorAll('.base > *');
        let currentWidth = 0;

        tokens.forEach(token => {
            const width = token.getBoundingClientRect().width;
            
            // Se o tamanho acumulado estourar a tela E não for o primeiro item
            if (currentWidth + width > maxWidth && currentWidth > 0) {
                
                // Regra de Ouro: Só quebrar ANTES de Operadores Binários (+) ou Relação (=, <)
                if (token.classList.contains('mrel') || token.classList.contains('mbin')) {
                    
                    // Injeta a quebra de linha estrutural
                    const breakElement = document.createElement('span');
                    breakElement.className = 'math-dynamic-break';
                    token.parentNode.insertBefore(breakElement, token);
                    
                    // Aplica o recuo visual para UX
                    token.classList.add('math-indented');
                    
                    // Reseta o contador de largura com o tamanho do recuo (~30px) + token atual
                    currentWidth = 30 + width;
                } else {
                    currentWidth += width; // Acumula se não puder quebrar aqui
                }
            } else {
                currentWidth += width;
            }
        });
    });
}

// 3. Listener otimizado para recalcular quando o aluno girar o celular (Debounce pattern)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applySemanticMathWrap, 150);
});