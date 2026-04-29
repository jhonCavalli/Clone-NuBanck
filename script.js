(function(){
            // ======================== TOAST NOTIFICATION ======================
            function showToast(message, duration = 2800) {
                let existingToast = document.querySelector('.toast-message');
                if(existingToast) existingToast.remove();
                const toast = document.createElement('div');
                toast.className = 'toast-message';
                toast.innerText = message;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }, duration);
            }

            // ======================== MÁSCARA E VALIDAÇÃO CPF =================
            const cpfInput = document.getElementById('cpfInput');
            const cpfFeedback = document.getElementById('cpfFeedback');
            const continuarBtn = document.getElementById('continuarCpfBtn');

            function formatCPF(value) {
                let clean = value.replace(/\D/g, '');
                if(clean.length > 11) clean = clean.slice(0,11);
                let formatted = clean;
                if(clean.length > 3) formatted = clean.slice(0,3) + '.' + clean.slice(3);
                if(clean.length > 6) formatted = formatted.slice(0,7) + '.' + formatted.slice(7);
                if(clean.length > 9) formatted = formatted.slice(0,11) + '-' + formatted.slice(11);
                return formatted;
            }

            function validateCPF(cpfRaw) {
                let numbers = cpfRaw.replace(/\D/g, '');
                if(numbers.length !== 11) return false;
                if (/^(\d)\1{10}$/.test(numbers)) return false;
                let sum = 0;
                for(let i=0; i<9; i++) sum += parseInt(numbers.charAt(i)) * (10-i);
                let rev = 11 - (sum % 11);
                let dig1 = (rev === 10 || rev === 11) ? 0 : rev;
                if(parseInt(numbers.charAt(9)) !== dig1) return false;
                sum = 0;
                for(let i=0; i<10; i++) sum += parseInt(numbers.charAt(i)) * (11-i);
                rev = 11 - (sum % 11);
                let dig2 = (rev === 10 || rev === 11) ? 0 : rev;
                return parseInt(numbers.charAt(10)) === dig2;
            }

            function updateCPFFeedback() {
                let raw = cpfInput.value;
                let digits = raw.replace(/\D/g, '');
                let isValid = (digits.length === 11) && validateCPF(raw);
                if(digits.length === 0) {
                    cpfFeedback.innerHTML = '';
                    cpfInput.classList.remove('cpf-error');
                } else if(digits.length < 11) {
                    cpfFeedback.innerHTML = '⚠️ CPF incompleto (11 dígitos)';
                    cpfFeedback.style.color = '#ffb347';
                    cpfInput.classList.add('cpf-error');
                } else if(!isValid) {
                    cpfFeedback.innerHTML = '❌ CPF inválido. Verifique os números.';
                    cpfFeedback.style.color = '#ff8a8a';
                    cpfInput.classList.add('cpf-error');
                } else {
                    cpfFeedback.innerHTML = '✅ CPF válido!';
                    cpfFeedback.style.color = '#c0ffb0';
                    cpfInput.classList.remove('cpf-error');
                }
            }

            cpfInput.addEventListener('input', function(e) {
                let formatted = formatCPF(this.value);
                this.value = formatted;
                updateCPFFeedback();
            });

            continuarBtn.addEventListener('click', function(e) {
                e.preventDefault();
                let raw = cpfInput.value;
                let digits = raw.replace(/\D/g, '');
                if(digits.length === 11 && validateCPF(raw)) {
                    showToast('📱 CPF confirmado! Em breve entraremos em contato.', 2500);
                } else {
                    showToast('❌ Digite um CPF válido antes de continuar.', 2500);
                    updateCPFFeedback();
                }
            });

            // ======================== SISTEMA DE VOTAÇÃO (ARENA) ==================
            let votingData = JSON.parse(localStorage.getItem('arenaVotes')) || {
                "Nubank Arena": 12,
                "Estádio Roxo": 8,
                "Arena Roxa": 5
            };
            
            function saveVotes() {
                localStorage.setItem('arenaVotes', JSON.stringify(votingData));
            }

            function renderRanking() {
                const container = document.getElementById('arenaVotingContainer');
                if(!container) return;
                const sorted = Object.entries(votingData).sort((a,b) => b[1] - a[1]);
                const totalVotes = Object.values(votingData).reduce((a,b) => a+b, 0);
                let html = `
                    <div class="voting-module">
                        <div class="voting-title">
                            🏟️ Votação Arena Nubank <span>ao vivo</span>
                            <span style="margin-left:auto; font-size:0.75rem;">🗳️ ${totalVotes} votos</span>
                        </div>
                        <div class="vote-input-group">
                            <input type="text" id="sugestaoNome" placeholder="Ex: Arena XPTO, Estádio Roxo..." autocomplete="off">
                            <button id="enviarVotoBtn">➕ Votar agora</button>
                        </div>
                        <ul class="ranking-list" id="rankingList">
                `;
                if(sorted.length === 0) {
                    html += `<li class="empty-rank">✨ Nenhum voto ainda. Seja o primeiro a sugerir! ✨</li>`;
                } else {
                    sorted.forEach(([nome, votos], idx) => {
                        let leaderTag = (idx === 0 && votos > 0) ? '<span class="leader-badge">⭐ LÍDER</span>' : '';
                        html += `
                            <li>
                                <div><strong>${nome}</strong> ${leaderTag}</div>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <span class="vote-count">${votos} voto${votos !== 1 ? 's' : ''}</span>
                                    <button class="btn-small-vote" data-name="${nome.replace(/"/g, '&quot;')}">Votar</button>
                                </div>
                            </li>
                        `;
                    });
                }
                html += `</ul><p style="font-size: 11px; margin-top: 10px; color:#555;">💡 Seu nome pode aparecer no topo da arena! Vote e compartilhe.</p></div>`;
                container.innerHTML = html;
                
                document.getElementById('enviarVotoBtn')?.addEventListener('click', () => {
                    const inputNome = document.getElementById('sugestaoNome');
                    let novoNome = inputNome.value.trim();
                    if(novoNome === "") {
                        showToast("Digite um nome para arena antes de votar!", 2000);
                        return;
                    }
                    if(novoNome.length > 35) novoNome = novoNome.substring(0,32)+"...";
                    votarEmNome(novoNome);
                    inputNome.value = "";
                });
                
                document.querySelectorAll('.btn-small-vote').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        let nomeRaw = btn.getAttribute('data-name');
                        if(nomeRaw) votarEmNome(nomeRaw);
                    });
                });
            }
            
            function votarEmNome(nome) {
                let nomeLimpo = nome.trim();
                if(nomeLimpo === "") return;
                if(votingData[nomeLimpo]) {
                    votingData[nomeLimpo] += 1;
                } else {
                    votingData[nomeLimpo] = 1;
                }
                saveVotes();
                renderRanking();
                showToast(`✨ Seu voto para "${nomeLimpo}" foi confirmado! ✨`, 2000);
                // Efeito extra: destaca líder momentaneamente
                const topName = Object.entries(votingData).sort((a,b)=>b[1]-a[1])[0]?.[0];
                if(topName) {
                    let msg = `🏆 Agora "${topName}" lidera a votação!`;
                    if(nomeLimpo === topName && votingData[nomeLimpo] > 1) msg = `🎉 "${nomeLimpo}" virou líder! 🎉`;
                    setTimeout(() => showToast(msg, 1800), 500);
                }
            }
            
            // Botão hero "Votar agora" -> usa o input da sugestão atual ou dispara modal
            const votarHeroBtn = document.getElementById('votarAgoraBtn');
            if(votarHeroBtn) {
                votarHeroBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const inputSugestao = document.getElementById('sugestaoNome');
                    if(inputSugestao) {
                        let nome = inputSugestao.value.trim();
                        if(nome === "") {
                            showToast("✏️ Escreva um nome no campo acima e confirme seu voto!", 2200);
                            inputSugestao.focus();
                        } else {
                            votarEmNome(nome);
                            inputSugestao.value = "";
                        }
                    } else {
                        showToast("⚡ Aguarde, carregando sistema de votação... tente novamente.", 1500);
                    }
                });
            }
            
            // ========== GERAL: INTERATIVIDADE EM BOTÕES, SERVIÇOS, FOOTER, NAV ==========
            function addInteractToButtons() {
                // Quero ser Nubank (header)
                const queroBtn = document.getElementById('queroSerBtn');
                if(queroBtn) queroBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showToast("💜 Abra sua conta digital em minutos! Acesse o app ou site oficial.", 2500);
                });
                
                // Pedir cartão (seção roxa)
                const pedirCartao = document.getElementById('pedirCartaoBtn');
                if(pedirCartao) pedirCartao.addEventListener('click', (e) => {
                    e.preventDefault();
                    showToast("💳 Ótima escolha! Cartão sem anuência e cheio de vantagens. Em breve análise de crédito.", 2800);
                });
                
                // Abrir conta grátis (CTA)
                const abrirConta = document.getElementById('abrirContaBtn');
                if(abrirConta) abrirConta.addEventListener('click', (e) => {
                    e.preventDefault();
                    showToast("🚀 Vamos simplificar sua vida! Faça seu cadastro em menos de 5 minutos.", 2500);
                });
                
                // Navegação header (links informativos)
                const navLinks = [
                    {id:'navNubank', msg:'Nubank: mais de 80M clientes, tecnologia e liberdade financeira.'},
                    {id:'navUltra', msg:'✨ Nubank Ultravioleta: cashback 1% + tag de aproximação.'},
                    {id:'navEmpresa', msg:'🏢 Nu Empresa: conta PJ grátis e maquininha.'},
                    {id:'navSeguranca', msg:'🔐 Segurança Nubank: criptografia e proteção 24h.'},
                    {id:'navSaiba', msg:'📘 Saiba mais sobre o mundo Nubank no nosso blog.'}
                ];
                navLinks.forEach(link => {
                    const el = document.getElementById(link.id);
                    if(el) el.addEventListener('click', (e) => {
                        e.preventDefault();
                        showToast(link.msg, 2300);
                    });
                });
                
                // Serviços interativos (toast em cada um)
                const serviceItems = document.querySelectorAll('#servicesSection a');
                serviceItems.forEach(service => {
                    service.addEventListener('click', (e) => {
                        e.preventDefault();
                        const servName = service.getAttribute('data-service') || service.innerText.trim();
                        showToast(`📌 ${servName} - Em breve novidades incríveis! Fique ligado.`, 2100);
                    });
                });
                
                // Footer links (todas as categorias com mensagem simples)
                const footerProd = document.querySelectorAll('.footerProd, .footerSobre, .footerAjuda');
                footerProd.forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const textLink = link.innerText;
                        showToast(`🔍 ${textLink} - Conteúdo disponível em breve no nosso site.`, 1800);
                    });
                });
                const footerLogoLink = document.getElementById('footerLogoLink');
                if(footerLogoLink) footerLogoLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    showToast("🏦 Volte ao topo! Nubank: seu banco digital.", 1500);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
            
            // ========== EFEITO MOUSE NO CARTÃO (INTERATIVIDADE EXTRA) ==========
            const card = document.getElementById('interactiveCard');
            if(card) {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width/2;
                    const centerY = rect.height/2;
                    const rotateX = (y - centerY) / 12;
                    const rotateY = (centerX - x) / 12;
                    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
                    card.style.transition = 'transform 0.1s';
                });
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
                    card.style.transition = 'transform 0.3s ease';
                });
            }
            
            // Bônus: interação dinâmica no cpf label / efeito de pulso mais suave nos botões
            const allActionBtns = document.querySelectorAll('.btn-nubank, .btn-purple, .btn-cta, .btn-confirm');
            allActionBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if(btn.id === 'continuarCpfBtn' || btn.id === 'votarAgoraBtn' || btn.id === 'enviarVotoBtn') return;
                    if(!btn.classList.contains('btn-confirm-cpf-handled')) {
                        // pequena animação de clique (efeito)
                        btn.style.transform = 'scale(0.97)';
                        setTimeout(() => { btn.style.transform = ''; }, 120);
                    }
                });
            });
            
            // Elegância: mostrar pontuação de voto ao carregar
            function initVotingAndMore() {
                const containerVote = document.getElementById('arenaVotingContainer');
                if(containerVote) {
                    renderRanking();
                } else {
                    console.warn("container não encontrado, mas criando via JS");
                    const targetDiv = document.querySelector('.hero-text');
                    if(targetDiv && !document.getElementById('arenaVotingContainer')) {
                        const newDiv = document.createElement('div');
                        newDiv.id = 'arenaVotingContainer';
                        targetDiv.appendChild(newDiv);
                        renderRanking();
                    }
                }
                addInteractToButtons();
                // prevenção para qualquer link vazio # causar scroll
                document.querySelectorAll('a[href="#"]').forEach(link => {
                    link.addEventListener('click', (e) => {
                        if(!link.closest('#servicesSection') && !link.classList.contains('btn-small-vote') && !link.classList.contains('btn-nubank') && !link.classList.contains('btn-purple') && !link.classList.contains('btn-cta') && !link.classList.contains('btn-confirm')) {
                            if(link.id !== 'votarAgoraBtn' && !link.classList.contains('footerProd')) e.preventDefault();
                        }
                    });
                });
            }
            
            if(document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initVotingAndMore);
            } else {
                initVotingAndMore();
            }
            
            // Extra: Validação realtime CPF já ativa + efeito card flutuante
            // também melhoramos o carregamento de persistência caso já tenha votações
        })();