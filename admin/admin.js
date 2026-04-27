// admin.js
document.addEventListener("DOMContentLoaded", () => {
    // Globals
    let activeDropdown = null;

    // Toast Container Initialization
    const toastContainer = document.createElement("div");
    toastContainer.classList.add("toast-container");
    document.body.appendChild(toastContainer);

    function showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.classList.add("toast", type);
        let icon = "fa-circle-info";
        if (type === "success") icon = "fa-circle-check";
        if (type === "error") icon = "fa-circle-xmark";
        
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);
        
        // Trick to allow animation to play
        setTimeout(() => toast.classList.add("show"), 10);
        
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function showConfirmModal(title, message, onConfirm) {
        openModal("modal-dynamic-confirm", title, `<p style="font-size:14px;color:var(--text-gray);">${message}</p>`, onConfirm);
    }

    // Modal Helper
    window.openModal = function(modalId, overrideTitle = null, overrideBody = null, onConfirm = null) {
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = createModal(modalId, overrideTitle, overrideBody);
        }
        
        // Setup confirm action if dynamic
        if (modalId === "modal-dynamic-confirm" && onConfirm) {
            const btnSave = modal.querySelector(".btn-save");
            btnSave.textContent = "Confirmar";
            // Replace click listener
            btnSave.onclick = () => { onConfirm(); closeModal(modalId); };
        }

        modal.classList.add("active");
    }

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove("active");
            if (modal.id === "modal-dynamic-confirm") {
                setTimeout(() => modal.remove(), 300);
            }
        }
    }

    function createModal(modalId, titleOverride, bodyOverride) {
        const overlay = document.createElement("div");
        overlay.id = modalId;
        overlay.classList.add("modal-overlay");

        let title = titleOverride || "Informação";
        let bodyContent = bodyOverride || "<p>Conteúdo não definido.</p>";

        if (modalId === "modal-adicionar-usuario") {
            title = "Adicionar Novo Usuário";
            bodyContent = `
                <div class="form-group"><label>Nome</label><input type="text" class="modal-input" placeholder="Ex: João Silva"></div>
                <div class="form-group"><label>E-mail</label><input type="email" class="modal-input" placeholder="joao@example.com"></div>
                <div class="form-group"><label>Departamento</label>
                    <select class="modal-input">
                        <option>Marketing</option>
                        <option>Engenharia</option>
                        <option>Vendas</option>
                        <option>RH</option>
                        <option>Design</option>
                    </select>
                </div>
            `;
        } else if (modalId === "modal-novo-ciclo") {
            title = "Novo Ciclo de Avaliação";
            bodyContent = `
                <div class="form-group"><label>Nome do Ciclo</label><input type="text" class="modal-input" placeholder="Ex: Q4 2026"></div>
                <div class="form-group"><label>Data Início</label><input type="date" class="modal-input"></div>
                <div class="form-group"><label>Data Final</label><input type="date" class="modal-input"></div>
            `;
        } else if (modalId === "modal-cv") {
            title = "Perfil do Colaborador";
            bodyContent = `
                <div style="display:flex; gap:16px; align-items:center;">
                    <img src="https://i.pravatar.cc/150?img=11" style="width:64px; height:64px; border-radius:50%;">
                    <div><strong style="font-size:16px; color:var(--text-dark);">Carlos Silva</strong><br><span style="color:var(--text-gray); font-size:13px;">Engenheiro Backend</span></div>
                </div>
                <div style="margin-top:16px; font-size:13px; color:var(--text-dark); display:flex; flex-direction:column; gap:8px;">
                    <p><strong>Departamento:</strong> Engenharia</p>
                    <p><strong>Entrada:</strong> 15 Jan, 2024</p>
                    <p><strong>Resultados Recentes:</strong> 85% de OKRs concluídas</p>
                </div>
            `;
        } else if (modalId === "modal-atividade") {
            title = "Histórico de Atividades";
            bodyContent = `
                <ul style="list-style:none; display:flex; flex-direction:column; gap:12px; max-height:200px; overflow-y:auto; padding-right:8px;">
                    <li style="font-size:13px; border-bottom:1px solid var(--border-color); padding-bottom:8px;"><strong>Ana Martins</strong> finalizou Avaliação 360 - <span style="color:var(--text-gray);font-size:11px;">2 min atrás</span></li>
                    <li style="font-size:13px; border-bottom:1px solid var(--border-color); padding-bottom:8px;"><strong>Carlos Silva</strong> iniciou autoavaliação - <span style="color:var(--text-gray);font-size:11px;">14 min atrás</span></li>
                    <li style="font-size:13px; padding-bottom:8px;"><strong>Rh</strong> agendou "Novos Talentos" - <span style="color:var(--text-gray);font-size:11px;">1 hora atrás</span></li>
                </ul>
            `;
        }

        const defaultSaveAction = modalId !== "modal-dynamic-confirm" ? `showToast('Ação concluída com sucesso!', 'success'); closeModal('${modalId}');` : '';
        const saveButtonHtml = (modalId === "modal-cv" || modalId === "modal-atividade")
            ? `<button class="btn-save" onclick="closeModal('${modalId}')">Fechar</button>`
            : `<button class="btn-cancel" onclick="closeModal('${modalId}')">Cancelar</button>
               <button class="btn-save" onclick="${defaultSaveAction}">Salvar</button>`;

        const content = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="closeModal('${modalId}')"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="modal-body">
                    ${bodyContent}
                </div>
                <div class="modal-footer">
                    ${saveButtonHtml}
                </div>
            </div>
        `;
        
        overlay.innerHTML = content;
        document.body.appendChild(overlay);

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeModal(modalId);
            }
        });

        return overlay;
    }

    // 1. Sidebar Links (Sair)
    const sidebarLinks = document.querySelectorAll(".sidebar a, .sidebar-footer a");
    sidebarLinks.forEach(link => {
        if (link.textContent.includes("Sair")) {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                showConfirmModal("Encerrar Sessão", "Deseja realmente sair do sistema agora?", () => {
                    window.location.href = "../index.html"; // Assume login at root
                });
            });
        }
    });

    const btnNovoSidebar = document.querySelector(".sidebar-footer .btn-novo");
    if(btnNovoSidebar) {
        btnNovoSidebar.addEventListener("click", () => window.location.href="relatorios.html");
    }

    // 2. Icones do Topbar (Notificações)
    const iconesAcoes = document.querySelectorAll(".icones-acoes i");
    iconesAcoes.forEach(icon => {
        if (icon.classList.contains("fa-bell")) {
            icon.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleDropdown(icon, [
                    { icon: "fa-envelope-open-text", text: "Respostas pendentes de Ana", action: () => showToast("Lembrete foi enfileirado.") },
                    { icon: "fa-bullhorn", text: "Novo ciclo agendado: Tech", action: () => showToast("Redirecionando para ciclo...") }
                ]);
            });
        }
        if (icon.classList.contains("fa-gear")) {
            icon.addEventListener("click", () => window.location.href = "configuracoes.html");
        }
    });

    // 3. Botões primários (btn-adicionar)
    const btnsAdicionar = document.querySelectorAll(".btn-adicionar");
    btnsAdicionar.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const text = btn.textContent.trim();
            if (text.includes("Adicionar Usuário")) {
                openModal("modal-adicionar-usuario");
            } else if (text.includes("Nova Avaliação") || text.includes("Novo Ciclo")) {
                openModal("modal-novo-ciclo");
            } else if (text.includes("Exportar Dados") || text.includes("Gerar CSV")) {
                showToast("Seu arquivo CSV está sendo exportado...", "success");
            } else if (text.includes("Salvar Alterações")) {
                showToast("Configurações salvas e aplicadas a todos os usuários.", "success");
            } else if (text.includes("Enviar Chamado")) {
                showToast("Chamado de suporte registrado com sucesso! A equipe entrará em contato.", "success");
                setTimeout(() => window.location.href="index.html", 2500);
            }
        });
    });

    // 4. Botões Outline
    const btnsOutline = document.querySelectorAll(".btn-outline");
    btnsOutline.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const label = btn.textContent.trim();
            if (label === "Ver Toda a Atividade") {
                openModal("modal-atividade");
            } else if (label.includes("Lembrar Alvos")) {
                showToast("Foram enviados e-mails de lembrete aos responsáveis.", "success");
            } else if (label.includes("Resultados") || label.includes("Gerar Visualização") || label.includes("Acessar Gráficos")) {
                showToast("O relatório 9-Box e Resultados Históricos estão carregando.", "info");
            } else if (!btn.querySelector('i') && label) {
                // Outros
            } else {
                if (btn.querySelector('.fa-pen')) {
                    showToast("Edição rápida habilitada nesta linha.", "info");
                } else if (btn.querySelector('.fa-id-card')) {
                    openModal("modal-cv");
                }
            }
        });
    });

    // 5. Links no meio da página
    const linkAddCiclo = document.querySelector(".link-add");
    if (linkAddCiclo) linkAddCiclo.addEventListener("click", (e) => { e.preventDefault(); openModal("modal-novo-ciclo"); });

    const linkFooter = document.querySelector(".link-footer");
    if (linkFooter && linkFooter.textContent.includes("Ver todos os ciclos")) {
        linkFooter.addEventListener("click", (e) => { e.preventDefault(); window.location.href = "avaliacoes.html"; });
    }

    // 6. Action Dots / Context Menus
    const actionDots = document.querySelectorAll(".action-dots");
    actionDots.forEach(dot => {
        dot.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleDropdown(dot, [
                { icon: "fa-pen-to-square", text: "Editar Detalhes", action: () => openModal("modal-novo-ciclo") },
                { icon: "fa-lock", text: "Travar Respostas", action: () => showToast("O formulário não aceita novas respostas no momento.", "info") },
                { icon: "fa-trash", text: "Excluir Definitivo", danger: true, action: () => {
                    showConfirmModal("Confirmar Exclusão", "Tem certeza que deseja apagar os registros deste ciclo permanentemente?", () => {
                        dot.closest("tr").style.opacity = "0.3";
                        setTimeout(() => dot.closest("tr").remove(), 300);
                        showToast("O item foi excluído do sistema.", "success");
                    });
                }}
            ]);
        });
    });

    // Função auxiliar para Dropdowns Contextuais
    function toggleDropdown(targetElement, items) {
        if (activeDropdown) activeDropdown.remove();

        const rect = targetElement.getBoundingClientRect();
        const menu = document.createElement("div");
        menu.classList.add("dropdown-menu", "active");
        menu.style.top = (rect.bottom + window.scrollY + 8) + "px";
        
        // Ensure menu doesn't overflow right edge
        let leftPx = rect.left + window.scrollX - 120;
        if (leftPx < 0) leftPx = rect.left + window.scrollX + 8;
        menu.style.left = leftPx + "px";

        items.forEach(item => {
            const div = document.createElement("div");
            div.className = "dropdown-item " + (item.danger ? "danger" : "");
            div.innerHTML = `<i class="fa-solid ${item.icon}" style="width:16px;"></i> ${item.text}`;
            div.addEventListener("click", (e) => {
                e.stopPropagation();
                item.action();
                menu.remove();
            });
            menu.appendChild(div);
        });

        document.body.appendChild(menu);
        activeDropdown = menu;
    }

    // Fecha dropdown ao clicar fora
    document.addEventListener("click", () => {
        if (activeDropdown) {
            activeDropdown.remove();
            activeDropdown = null;
        }
    });

});
