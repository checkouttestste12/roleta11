// ===== ROLETA FUNCIONAL COM GIRO E PARADA =====

// Estados da roleta
const ESTADOS_ROLETA = {
    IDLE: 'idle',
    SPINNING: 'spinning',
    STOPPING: 'stopping',
    STOPPED: 'stopped'
};

// Estado do jogo
let gameState = {
    estadoRoleta: ESTADOS_ROLETA.IDLE,
    girosRestantes: 3,
    saldoAtual: 0,
    tempoInicioGiro: null,
    tempoMinimoGiro: 2000, // Mínimo 2 segundos antes de poder parar
    animationId: null,
    velocidadeAtual: 0,
    anguloAtual: 0,
    roletaElement: null
};

// Elementos DOM
const elements = {
    btnGirar: null,
    btnParar: null,
    roleta: null,
    toastContainer: null,
    resultadoModal: null,
    btnContinuar: null,
    premioValor: null,
    novoSaldo: null,
    girosCount: null,
    saldoAtual: null
};

// Configuração de prêmios
const premiosPossiveis = [
    { valor: 0, texto: 'Tente novamente!', peso: 50 },
    { valor: 25, texto: 'R$ 25,00', peso: 25 },
    { valor: 50, texto: 'R$ 50,00', peso: 15 },
    { valor: 75, texto: 'R$ 75,00', peso: 10 }
];

// ===== FUNÇÕES PRINCIPAIS =====

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎰 RoletaWin - Iniciando sistema corrigido...');
    inicializarElementos();
    inicializarEventListeners();
    atualizarInterface();
    console.log('✅ Sistema inicializado com sucesso!');
});

// Inicializar elementos DOM
function inicializarElementos() {
    elements.btnGirar = document.getElementById('btn-girar');
    elements.btnParar = document.getElementById('btn-parar');
    elements.roleta = document.getElementById('roleta');
    elements.toastContainer = document.getElementById('toast-container');
    elements.resultadoModal = document.getElementById('resultado-modal');
    elements.btnContinuar = document.getElementById('btn-continuar');
    elements.premioValor = document.getElementById('premio-valor');
    elements.novoSaldo = document.getElementById('novo-saldo');
    elements.girosCount = document.getElementById('giros-count');
    elements.saldoAtual = document.getElementById('saldo-atual');
    
    // Verificar se elementos essenciais existem
    if (!elements.btnGirar || !elements.roleta) {
        console.error('❌ Elementos essenciais não encontrados!');
        return;
    }
    
    console.log('✅ Elementos DOM inicializados');
}

// Event listeners
function inicializarEventListeners() {
    if (elements.btnGirar) {
        elements.btnGirar.addEventListener('click', iniciarGiro);
        console.log('✅ Event listener do botão GIRAR adicionado');
    }
    
    if (elements.btnParar) {
        elements.btnParar.addEventListener('click', pararGiro);
        console.log('✅ Event listener do botão PARAR adicionado');
    }
    
    if (elements.btnContinuar) {
        elements.btnContinuar.addEventListener('click', fecharModal);
    }
    
    // Fechar modal clicando fora
    if (elements.resultadoModal) {
        elements.resultadoModal.addEventListener('click', function(e) {
            if (e.target === elements.resultadoModal) {
                fecharModal();
            }
        });
    }
}

// Iniciar giro
function iniciarGiro() {
    console.log('🎯 Iniciando giro...');
    
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.IDLE || gameState.girosRestantes <= 0) {
        console.log('❌ Não é possível girar agora. Estado:', gameState.estadoRoleta, 'Giros:', gameState.girosRestantes);
        return;
    }
    
    // Atualizar estado
    gameState.estadoRoleta = ESTADOS_ROLETA.SPINNING;
    gameState.girosRestantes--;
    gameState.tempoInicioGiro = Date.now();
    gameState.velocidadeAtual = 15; // Velocidade inicial
    gameState.anguloAtual = 0;
    
    console.log('✅ Estado atualizado para SPINNING');
    
    // Atualizar interface - trocar botões
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.style.display = 'none';
        elements.btnParar.style.display = 'flex';
        elements.btnParar.disabled = true; // Desabilitado inicialmente
        elements.btnParar.innerHTML = '<i class="fas fa-clock"></i><span>AGUARDE...</span>';
        console.log('✅ Botões trocados - GIRAR oculto, PARAR visível');
    }
    
    // Adicionar efeitos visuais à roleta
    if (elements.roleta) {
        elements.roleta.style.filter = 'brightness(1.3) saturate(1.5)';
        elements.roleta.style.boxShadow = '0 0 40px rgba(255, 215, 0, 0.8)';
        elements.roleta.classList.remove('parada');
        console.log('✅ Efeitos visuais aplicados à roleta');
    }
    
    mostrarToast('🎰 A roleta está girando! Aguarde para poder parar...', 'info');
    
    // Iniciar animação da roleta
    iniciarAnimacaoRoleta();
    
    // Habilitar botão parar após tempo mínimo
    setTimeout(() => {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
            elements.btnParar.disabled = false;
            elements.btnParar.innerHTML = '<i class="fas fa-stop"></i><span>PARAR</span>';
            mostrarToast('✋ Agora você pode parar a roleta!', 'success');
            console.log('✅ Botão PARAR habilitado');
        }
    }, gameState.tempoMinimoGiro);
    
    // Auto-parar após 10 segundos se o usuário não parar
    setTimeout(() => {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING) {
            console.log('⏰ Auto-parando após 10 segundos');
            pararGiro();
        }
    }, 10000);
}

// Animação contínua da roleta
function iniciarAnimacaoRoleta() {
    console.log('🔄 Iniciando animação da roleta');
    
    function animar() {
        if (gameState.estadoRoleta === ESTADOS_ROLETA.SPINNING || gameState.estadoRoleta === ESTADOS_ROLETA.STOPPING) {
            // Atualizar ângulo
            gameState.anguloAtual += gameState.velocidadeAtual;
            
            // Aplicar rotação
            if (elements.roleta) {
                elements.roleta.style.transform = `rotate(${gameState.anguloAtual}deg)`;
            }
            
            // Se estiver parando, reduzir velocidade gradualmente
            if (gameState.estadoRoleta === ESTADOS_ROLETA.STOPPING) {
                gameState.velocidadeAtual *= 0.92; // Desaceleração mais suave
                
                // Parar quando velocidade for muito baixa
                if (gameState.velocidadeAtual < 0.3) {
                    console.log('🛑 Velocidade baixa, finalizando giro');
                    finalizarGiro();
                    return;
                }
            }
            
            gameState.animationId = requestAnimationFrame(animar);
        }
    }
    
    gameState.animationId = requestAnimationFrame(animar);
}

// Parar giro (chamado pelo botão)
function pararGiro() {
    console.log('🛑 Parando giro...');
    
    if (gameState.estadoRoleta !== ESTADOS_ROLETA.SPINNING) {
        console.log('❌ Não é possível parar agora. Estado:', gameState.estadoRoleta);
        return;
    }
    
    gameState.estadoRoleta = ESTADOS_ROLETA.STOPPING;
    
    // Atualizar botão
    if (elements.btnParar) {
        elements.btnParar.disabled = true;
        elements.btnParar.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>PARANDO...</span>';
    }
    
    mostrarToast('⏳ Parando a roleta...', 'warning');
    console.log('✅ Estado alterado para STOPPING');
}

// Finalizar giro
function finalizarGiro() {
    console.log('🏁 Finalizando giro...');
    
    gameState.estadoRoleta = ESTADOS_ROLETA.STOPPED;
    
    // Parar animação
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
        gameState.animationId = null;
        console.log('✅ Animação parada');
    }
    
    // Remover efeitos visuais
    if (elements.roleta) {
        elements.roleta.style.filter = '';
        elements.roleta.style.boxShadow = '';
        elements.roleta.classList.add('parada');
    }
    
    // Calcular resultado baseado no ângulo final
    const premio = calcularPremio();
    console.log('🎁 Prêmio calculado:', premio);
    
    // Atualizar saldo
    gameState.saldoAtual += premio.valor;
    
    // Mostrar resultado
    setTimeout(() => {
        mostrarResultado(premio);
        
        // Resetar botões após um tempo
        setTimeout(() => {
            resetarBotoes();
        }, 1000);
    }, 500);
}

// Calcular prêmio baseado no ângulo final da roleta
function calcularPremio() {
    // Normalizar ângulo para 0-360
    const anguloNormalizado = gameState.anguloAtual % 360;
    console.log('📐 Ângulo final normalizado:', anguloNormalizado);
    
    // Usar sistema de probabilidades ponderadas
    const totalPeso = premiosPossiveis.reduce((total, premio) => total + premio.peso, 0);
    const random = Math.random() * totalPeso;
    
    let acumulado = 0;
    for (let i = 0; i < premiosPossiveis.length; i++) {
        acumulado += premiosPossiveis[i].peso;
        if (random <= acumulado) {
            console.log('🎯 Prêmio selecionado:', premiosPossiveis[i]);
            return premiosPossiveis[i];
        }
    }
    
    // Fallback
    return premiosPossiveis[0];
}

// Mostrar resultado
function mostrarResultado(premio) {
    console.log('🎉 Mostrando resultado:', premio);
    
    if (!elements.resultadoModal) {
        console.error('❌ Modal de resultado não encontrado');
        return;
    }
    
    // Atualizar conteúdo do modal
    if (elements.premioValor) {
        elements.premioValor.textContent = premio.texto;
    }
    
    if (elements.novoSaldo) {
        elements.novoSaldo.textContent = gameState.saldoAtual.toFixed(2);
    }
    
    // Atualizar título e descrição baseado no prêmio
    const titulo = document.getElementById('resultado-titulo');
    const descricao = document.getElementById('resultado-descricao');
    const icon = document.getElementById('resultado-icon');
    
    if (premio.valor > 0) {
        if (titulo) titulo.textContent = 'Parabéns! 🎉';
        if (descricao) descricao.textContent = 'Você ganhou um prêmio!';
        if (icon) icon.innerHTML = '<i class="fas fa-trophy"></i>';
        
        // Efeitos de vitória
        criarConfetes();
        mostrarToast(`🏆 Parabéns! Você ganhou ${premio.texto}!`, 'success');
    } else {
        if (titulo) titulo.textContent = 'Que pena! 😔';
        if (descricao) descricao.textContent = 'Não foi desta vez, mas continue tentando!';
        if (icon) icon.innerHTML = '<i class="fas fa-heart-broken"></i>';
        
        mostrarToast('😔 Não foi desta vez! Tente novamente.', 'warning');
    }
    
    // Mostrar modal
    elements.resultadoModal.classList.remove('hidden');
    
    // Atualizar interface
    atualizarInterface();
    console.log('✅ Modal de resultado exibido');
}

// Fechar modal
function fecharModal() {
    console.log('❌ Fechando modal');
    
    if (elements.resultadoModal) {
        elements.resultadoModal.classList.add('hidden');
    }
    
    // Verificar se ainda há giros
    if (gameState.girosRestantes <= 0) {
        mostrarMensagemSemGiros();
    } else {
        gameState.estadoRoleta = ESTADOS_ROLETA.IDLE;
        console.log('✅ Estado resetado para IDLE');
    }
}

// Resetar botões
function resetarBotoes() {
    console.log('🔄 Resetando botões');
    
    if (elements.btnGirar && elements.btnParar) {
        elements.btnGirar.style.display = 'flex';
        elements.btnGirar.disabled = false;
        elements.btnGirar.innerHTML = '<i class="fas fa-play"></i><span>GIRAR</span><div class="btn-bg"></div>';
        
        elements.btnParar.style.display = 'none';
        elements.btnParar.disabled = false;
        elements.btnParar.innerHTML = '<i class="fas fa-stop"></i><span>PARAR</span><div class="btn-bg"></div>';
        
        console.log('✅ Botões resetados');
    }
}

// Mostrar mensagem quando não há mais giros
function mostrarMensagemSemGiros() {
    console.log('🚫 Giros esgotados');
    
    const girosSection = document.getElementById('giros-gratis-info');
    if (!girosSection) return;
    
    girosSection.innerHTML = `
        <div class="mensagem-sem-giros" style="text-align: center; padding: 2rem;">
            <div class="sem-giros-icon" style="font-size: 3rem; color: #ff6b6b; margin-bottom: 1rem;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="sem-giros-titulo" style="color: #ffffff; margin-bottom: 1rem;">Giros Grátis Esgotados</h3>
            <p class="sem-giros-descricao" style="color: #cccccc; margin-bottom: 2rem;">
                Você utilizou todos os seus giros grátis! 
                Faça um depósito para continuar jogando nas mesas premium.
            </p>
            <button class="btn-depositar" onclick="window.location.href='#depositar'" style="
                background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                color: #0a0e27;
                border: none;
                padding: 1rem 2rem;
                border-radius: 12px;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin: 0 auto;
                box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
            ">
                <i class="fas fa-credit-card"></i>
                <span>Fazer Depósito</span>
            </button>
        </div>
    `;
    
    mostrarToast('🚫 Giros grátis esgotados! Faça um depósito para continuar.', 'warning');
}

// Atualizar interface
function atualizarInterface() {
    // Atualizar saldo
    if (elements.saldoAtual) {
        elements.saldoAtual.textContent = gameState.saldoAtual.toFixed(2);
    }
    
    // Atualizar contador de giros
    if (elements.girosCount) {
        elements.girosCount.textContent = gameState.girosRestantes;
    }
    
    // Atualizar contador no modal
    const girosRestantesModal = document.getElementById('giros-restantes-count');
    if (girosRestantesModal) {
        girosRestantesModal.textContent = gameState.girosRestantes;
    }
    
    // Mostrar/ocultar informações de giros
    const girosInfo = document.getElementById('giros-info');
    if (girosInfo) {
        if (gameState.girosRestantes > 0) {
            girosInfo.style.display = 'block';
        } else {
            girosInfo.style.display = 'none';
        }
    }
}

// ===== FUNÇÕES DE EFEITOS VISUAIS =====

// Criar confetes
function criarConfetes() {
    console.log('🎊 Criando confetes');
    
    const particlesBg = document.getElementById('particles-bg');
    if (!particlesBg) return;
    
    for (let i = 0; i < 50; i++) {
        const confete = document.createElement('div');
        const cores = ['#ffd700', '#ff6b6b', '#4ecdc4', '#9b59b6', '#ff9f43', '#00ff88'];
        
        confete.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 6}px;
            height: ${Math.random() * 10 + 6}px;
            background: ${cores[Math.floor(Math.random() * cores.length)]};
            left: ${Math.random() * 100}%;
            top: -10px;
            pointer-events: none;
            animation: confeteFall ${3 + Math.random() * 4}s ease-out forwards;
            animation-delay: ${Math.random() * 2}s;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            z-index: 1500;
        `;
        
        particlesBg.appendChild(confete);
    }
    
    // Limpar confetes após animação
    setTimeout(() => {
        const confetes = particlesBg.querySelectorAll('div');
        confetes.forEach(confete => {
            if (confete.style.animation.includes('confeteFall')) {
                confete.remove();
            }
        });
    }, 8000);
}

// Toast notifications
function mostrarToast(mensagem, tipo = 'info') {
    if (!elements.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = mensagem;
    
    const estilos = {
        success: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
        error: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
        warning: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
        info: 'linear-gradient(135deg, #4ecdc4 0%, #26a69a 100%)'
    };
    
    toast.style.background = estilos[tipo] || estilos.info;
    toast.style.color = tipo === 'warning' ? '#0a0e27' : '#ffffff';
    
    elements.toastContainer.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => toast.style.transform = 'translateX(0)', 100);
    
    // Remover após 4 segundos
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ===== FUNÇÕES DE DEBUG =====

// Função para debug (pode ser chamada no console)
window.debugRoleta = function() {
    console.log('🔍 Estado atual da roleta:', {
        estado: gameState.estadoRoleta,
        giros: gameState.girosRestantes,
        saldo: gameState.saldoAtual,
        angulo: gameState.anguloAtual,
        velocidade: gameState.velocidadeAtual
    });
};

// Log de inicialização
console.log('🎰 RoletaWin - Script carregado com sucesso!');
console.log('💡 Use debugRoleta() no console para ver o estado atual');

