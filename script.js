document.addEventListener('DOMContentLoaded', () => {
    
    // ================================================================
    // 1. GERENCIADOR DE TEMAS (LIGHT / DARK MODE)
    // ================================================================
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    const htmlElement = document.documentElement;

    // Recupera tema salvo ou usa preferência do SO
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
        htmlElement.classList.add('light-mode');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        htmlElement.classList.remove('light-mode');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLight = htmlElement.classList.toggle('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            
            if (isLight) {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            } else {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            }
        });
    }

    // ================================================================
    // 2. MENU MOBILE RESPONSIVO (HAMBURGUER E DRAWER)
    // ================================================================
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const closeDrawerBtn = document.getElementById('close-drawer');
    const drawerOverlay = document.getElementById('drawer-overlay');
    const drawerLinks = document.querySelectorAll('.drawer-nav a');

    function openDrawer() {
        mobileDrawer.classList.add('open');
        drawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Impede scroll
    }

    function closeDrawer() {
        mobileDrawer.classList.remove('open');
        drawerOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restaura scroll
    }

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', openDrawer);
    }

    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', closeDrawer);
    }

    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', closeDrawer);
    }

    drawerLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    // ================================================================
    // 3. ANIMAÇÕES AO ROLAR A PÁGINA (SCROLL OBSERVATION)
    // ================================================================
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer para os elementos que surgem na tela
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const fadeSections = document.querySelectorAll('.section-fade');
    fadeSections.forEach(section => {
        fadeObserver.observe(section);
    });

    // Active state na navbar conforme o scroll passa pelas seções
    const sections = document.querySelectorAll('section, header');
    const navItems = document.querySelectorAll('.nav-desktop ul li a');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        sections.forEach(sec => {
            const sectionTop = sec.offsetTop;
            const sectionHeight = sec.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                currentSectionId = sec.getAttribute('id') || '';
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    });

    // ================================================================
    // 4. INTERATIVIDADE DO FLIP CARD (Redes, Linux, Servidores)
    // ================================================================
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });

    // ================================================================
    // 5. SELEÇÃO VISUAL DO QUIZ (PILLS SELECTION CLASS)
    // ================================================================
    const quizForms = document.querySelectorAll('form[id^="quiz-"]');
    quizForms.forEach(form => {
        const labels = form.querySelectorAll('label');
        labels.forEach(label => {
            const radio = label.querySelector('input[type="radio"]');
            if (radio) {
                radio.addEventListener('change', () => {
                    // Limpa classe selecionada de outros labels com o mesmo 'name'
                    const questionName = radio.getAttribute('name');
                    form.querySelectorAll(`input[name="${questionName}"]`).forEach(r => {
                        r.closest('label').classList.remove('selected-label');
                    });
                    // Adiciona na opção marcada
                    label.classList.add('selected-label');
                });
            }
        });
    });

    // ================================================================
    // 6. PROGRESSO DO CURSO & LMS VIDEO HUB
    // ================================================================
    const mainVideo = document.getElementById('main-course-video');
    const playlistItems = document.querySelectorAll('.playlist-item');
    const currentVideoTitle = document.getElementById('current-video-title');
    const currentVideoDesc = document.getElementById('current-video-desc');
    const playlistProgressFill = document.getElementById('playlist-progress-fill');
    const playlistProgressPercent = document.getElementById('playlist-progress-percent');
    const prevVideoBtn = document.getElementById('prevVideoBtn');
    const nextVideoBtn = document.getElementById('nextVideoBtn');
    const autoplayStatus = document.getElementById('autoplay-status');

    // Rastreia o progresso do curso
    const courseProgress = {
        quizCompleted: false,
        quizScore: { score: 0, total: 0 },
        videosCompleted: new Set() // Guarda o src de cada vídeo assistido
    };

    function updateProgressBar() {
        const totalVideos = playlistItems.length;
        const completedVideos = courseProgress.videosCompleted.size;
        const percent = Math.min(Math.round((completedVideos / totalVideos) * 100), 100);

        if (playlistProgressFill) playlistProgressFill.style.width = `${percent}%`;
        if (playlistProgressPercent) playlistProgressPercent.textContent = `${percent}%`;

    }

    function getCertificateStats() {
        const stats = courseProgress.quizScore;

        return {
            ...stats,
            percent: stats.total > 0 ? Math.round((stats.score / stats.total) * 100) : 0
        };
    }

    function markVideoCompleted(item) {
        if (!item) return;

        const videoSrc = item.getAttribute('data-src');
        courseProgress.videosCompleted.add(videoSrc);

        const statusIcon = item.querySelector('.status-icon');
        if (statusIcon) {
            statusIcon.className = 'status-icon icon-completed';
        }

        updateProgressBar();
    }

    function updateVideoNavigation() {
        const activeIndex = Array.from(playlistItems).findIndex(item => item.classList.contains('active'));
        const hasPrevVideo = activeIndex > 0;
        const hasNextVideo = activeIndex >= 0 && activeIndex < playlistItems.length - 1;

        if (prevVideoBtn) {
            prevVideoBtn.disabled = !hasPrevVideo;
            prevVideoBtn.hidden = !hasPrevVideo;
            prevVideoBtn.textContent = 'Vídeo anterior';
        }

        if (nextVideoBtn) {
            nextVideoBtn.disabled = !hasNextVideo;
            nextVideoBtn.textContent = hasNextVideo ? 'Próximo vídeo' : 'Último vídeo';
        }
    }

    function selectPlaylistItem(item, shouldPlay = true) {
        if (!item) return;

        const videoSrc = item.getAttribute('data-src');
        const title = item.getAttribute('data-title');
        const desc = item.getAttribute('data-desc');
        const currentSource = mainVideo ? mainVideo.querySelector('source') : null;
        const isSameVideo = currentSource && currentSource.getAttribute('src') === videoSrc;

        // Remove classe ativa de outros e adiciona neste
        playlistItems.forEach(p => p.classList.remove('active'));
        item.classList.add('active');

        // Carrega novo vídeo
        if (mainVideo) {
            if (isSameVideo) {
                if (shouldPlay) {
                    mainVideo.play().catch(error => {
                        console.log('Autoplay impedido pelo navegador:', error);
                    });
                }
            } else if (currentSource) {
                // Pausa antes de mudar de fonte
                mainVideo.pause();
                currentSource.setAttribute('src', videoSrc);
                mainVideo.load();

                // Inicia a reprodução
                if (shouldPlay) {
                    mainVideo.play().catch(error => {
                        console.log('Autoplay impedido pelo navegador:', error);
                    });
                }
            }
        }

        // Atualiza metadados na tela
        if (currentVideoTitle) currentVideoTitle.textContent = title;
        if (currentVideoDesc) currentVideoDesc.textContent = desc;
        if (autoplayStatus) autoplayStatus.textContent = 'Avanço automático ativado';
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        updateVideoNavigation();
    }

    function playNextVideo() {
        const activeIndex = Array.from(playlistItems).findIndex(item => item.classList.contains('active'));
        const nextItem = playlistItems[activeIndex + 1];

        if (nextItem) {
            selectPlaylistItem(nextItem, true);
        } else if (autoplayStatus) {
            autoplayStatus.textContent = 'Todas as vídeo aulas foram concluídas';
        }
    }

    function playPrevVideo() {
        const activeIndex = Array.from(playlistItems).findIndex(item => item.classList.contains('active'));
        const prevItem = playlistItems[activeIndex - 1];

        if (prevItem) {
            selectPlaylistItem(prevItem, true);
        }
    }

    // Playlist Item Click Controller
    playlistItems.forEach(item => {
        item.addEventListener('click', () => {
            selectPlaylistItem(item, true);
        });
    });

    if (prevVideoBtn) {
        prevVideoBtn.addEventListener('click', playPrevVideo);
    }

    if (nextVideoBtn) {
        nextVideoBtn.addEventListener('click', playNextVideo);
    }

    updateVideoNavigation();

    // Quando um vídeo é tocado, marca-o como completado na playlist e atualiza o progresso
    if (mainVideo) {
        mainVideo.addEventListener('play', () => {
            const activeItem = document.querySelector('.playlist-item.active');
            markVideoCompleted(activeItem);
        });

        mainVideo.addEventListener('ended', () => {
            const activeItem = document.querySelector('.playlist-item.active');
            markVideoCompleted(activeItem);
            playNextVideo();
        });
    }

    // ================================================================
    // 7. LÓGICA DE VALIDAÇÃO DOS QUIZZES
    // ================================================================
    const correctAnswers = {
        'general': {
            q1: 'B',
            q2: 'A',
            q3: 'A',
            q4: 'B',
            q5: 'A',
            q6: 'C',
            q7: 'A',
            q8: 'B',
            q9: 'A',
            q10: 'B'
        }
    };

    function validateQuiz(form, answers) {
        let score = 0;
        const total = Object.keys(answers).length;

        form.querySelectorAll('label').forEach(lbl => {
            lbl.classList.remove('correct-answer', 'wrong-answer');
        });

        for (let question in answers) {
            const selected = form.querySelector(`input[name="${question}"]:checked`);
            const allInputs = form.querySelectorAll(`input[name="${question}"]`);

            if (selected && selected.value === answers[question]) {
                score++;
                selected.closest('label').classList.add('correct-answer');
            } else {
                if (selected) selected.closest('label').classList.add('wrong-answer');
                allInputs.forEach(input => {
                    if (input.value === answers[question]) {
                        input.closest('label').classList.add('correct-answer');
                    }
                });
            }
        }

        return { score, total };
    }

    function openCertificate() {
        const stats = getCertificateStats();
        if (certificatePercent) certificatePercent.textContent = `${stats.percent}%`;
        if (certificateDetails) {
            certificateDetails.textContent = `${stats.score} de ${stats.total}`;
        }
        if (congratsModal) congratsModal.classList.add('show-modal');
    }

    quizForms.forEach(form => {
        const module = form.getAttribute('data-module');
        const answers = correctAnswers[module];
        const questions = Array.from(form.querySelectorAll('.quiz-question'));
        const stages = Array.from(form.querySelectorAll('.quiz-stage'));
        const prevBtn = form.querySelector('#prevQuizBtn');
        const nextBtn = form.querySelector('#nextQuizBtn');
        const stepText = form.querySelector('#quizStepText');
        const stepFill = form.querySelector('#quizStepFill');
        const resultDiv = form.querySelector('.quiz-result');
        let currentQuestion = 0;

        const stageByQuestion = questions.map((question) => {
            let stage = question.previousElementSibling;
            while (stage && !stage.classList.contains('quiz-stage')) {
                stage = stage.previousElementSibling;
            }
            return stage;
        });

        function showQuestion(index) {
            questions.forEach((question, questionIndex) => {
                question.classList.toggle('active-question', questionIndex === index);
            });
            stages.forEach(stage => stage.classList.remove('active-stage'));
            if (stageByQuestion[index]) stageByQuestion[index].classList.add('active-stage');

            if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
            if (nextBtn) nextBtn.textContent = index === questions.length - 1 ? 'Finalizar' : 'Próxima';
            if (stepText) stepText.textContent = `Pergunta ${index + 1} de ${questions.length}`;
            if (stepFill) stepFill.style.width = `${Math.round(((index + 1) / questions.length) * 100)}%`;
            if (resultDiv) resultDiv.style.display = 'none';
        }

        function showStepWarning(message) {
            if (!resultDiv) return;
            resultDiv.textContent = message;
            resultDiv.classList.remove('success');
            resultDiv.classList.add('error');
            resultDiv.style.display = 'block';
        }

        function currentQuestionAnswered() {
            const input = questions[currentQuestion].querySelector('input[type="radio"]');
            return input ? !!form.querySelector(`input[name="${input.name}"]:checked`) : true;
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentQuestion > 0) {
                    currentQuestion--;
                    showQuestion(currentQuestion);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (!currentQuestionAnswered()) {
                    showStepWarning('Selecione uma alternativa antes de continuar.');
                    return;
                }

                if (currentQuestion < questions.length - 1) {
                    currentQuestion++;
                    showQuestion(currentQuestion);
                    return;
                }

                const stats = validateQuiz(form, answers);
                courseProgress.quizCompleted = true;
                courseProgress.quizScore = stats;
                if (resultDiv) {
                    resultDiv.textContent = `Você acertou ${stats.score} de ${stats.total} perguntas.`;
                    resultDiv.classList.remove('error');
                    resultDiv.classList.add('success');
                    resultDiv.style.display = 'block';
                }
                openCertificate();
            });
        }

        showQuestion(currentQuestion);
    });
    // ================================================================
    // 8. TRILHA DOS MODULOS ATE O QUESTIONARIO
    // ================================================================
    const trailSteps = {
        about: { target: '#networks', label: 'Iniciar o Curso' },
        networks: { target: '#linux', label: 'Ir para o Próximo Módulo' },
        linux: { target: '#servers', label: 'Ir para o Próximo Módulo' },
        servers: { target: '#videos', label: 'Ir para as Vídeo aulas' }
    };

    Object.entries(trailSteps).forEach(([sectionId, step]) => {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const sectionAccordions = section.querySelectorAll('.custom-accordion');
        const acc = sectionAccordions[sectionAccordions.length - 1];
        if (!acc) return;

        const content = acc.querySelector('.accordion-content');

        if (content) {
            const nextStepBtn = document.createElement('button');
            nextStepBtn.className = 'btn btn-primary';
            nextStepBtn.style.marginTop = '20px';
            nextStepBtn.style.padding = '12px 24px';
            nextStepBtn.style.fontSize = '0.85rem';
            nextStepBtn.textContent = step.label;

            content.appendChild(nextStepBtn);

            nextStepBtn.addEventListener('click', (e) => {
                e.preventDefault();
                acc.removeAttribute('open');
                const targetSection = document.querySelector(step.target);
                if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
            });
        }
    });

    // ================================================================
    // 9. MODAL DE CONCLUSAO FINAL
    // ================================================================
    const congratsModal = document.getElementById('congratsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const downloadCertificateBtn = document.getElementById('downloadCertificateBtn');
    const certificatePercent = document.getElementById('certificatePercent');
    const certificateDetails = document.getElementById('certificateDetails');

    function escapePdfText(text) {
        return String(text)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[()\\]/g, '\\$&');
    }

    function buildPdf(stats, dateLabel) {
        const percentLabel = `${stats.percent}%`;
        const detailLabel = `${stats.score} de ${stats.total}`;
        const performanceLabel = stats.percent >= 80 ? 'Excelente desempenho' : stats.percent >= 60 ? 'Bom desempenho' : 'Participacao concluida';
        const percentX = stats.percent === 100 ? 367 : stats.percent < 10 ? 397 : 382;
        const text = (x, y, size, color, value, font = 'F1') => {
            return `BT /${font} ${size} Tf ${color} rg 1 0 0 1 ${x} ${y} Tm (${escapePdfText(value)}) Tj ET`;
        };
        const contentLines = [
            'q',
            '0.97 0.99 1 rg 0 0 842 595 re f',
            '0.12 0.52 0.78 rg 0 520 842 75 re f',
            '0.95 0.99 1 rg 48 70 746 412 re f',
            '0.12 0.52 0.78 RG 36 46 770 500 re S',
            '0.20 0.83 0.60 RG 48 58 746 476 re S',
            '0.12 0.52 0.78 rg 158 375 526 2 re f',
            '0.20 0.83 0.60 rg 324 210 194 96 re f',
            '0.12 0.52 0.78 rg 336 222 170 72 re f',
            '0.92 0.98 1 rg 602 348 118 70 re f',
            '0.12 0.52 0.78 RG 602 348 118 70 re S',
            text(352, 552, 14, '1 1 1', 'SIMPLIFICA DIGITAL'),
            text(248, 450, 34, '0.12 0.52 0.78', 'Certificado de Conclusao'),
            text(291, 413, 16, '0.07 0.09 0.16', 'Mini curso de Redes, Linux e Servidores'),
            text(172, 344, 15, '0.20 0.25 0.33', 'Certificamos que voce concluiu a pratica do curso.'),
            text(188, 322, 15, '0.20 0.25 0.33', 'Voce respondeu ao quiz geral e finalizou a trilha.'),
            text(629, 390, 13, '0.12 0.52 0.78', 'RESULTADO'),
            text(630, 365, 13, '0.20 0.25 0.33', detailLabel),
            text(percentX, 250, 42, '1 1 1', percentLabel),
            text(353, 229, 13, '1 1 1', 'DE APROVEITAMENTO'),
            text(350, 178, 16, '0.20 0.83 0.60', performanceLabel),
            text(378, 148, 12, '0.35 0.40 0.48', `Emitido em ${dateLabel}`),
            text(174, 112, 24, '0.12 0.52 0.78', 'Simplifica Digital', 'F2'),
            text(528, 112, 24, '0.12 0.52 0.78', 'Simplifica Digital', 'F2'),
            '0.12 0.52 0.78 rg 132 102 220 1 re f',
            '0.12 0.52 0.78 rg 490 102 220 1 re f',
            text(166, 84, 11, '0.35 0.40 0.48', 'Grupo Simplifica Digital Voluntario'),
            text(526, 84, 11, '0.35 0.40 0.48', 'Projeto educacional voluntario'),
            'Q'
        ];
        const content = contentLines.join('\n');
        const objects = [
            '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
            '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
            '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj',
            '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
            '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >> endobj',
            `6 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`
        ];

        let pdf = '%PDF-1.4\n';
        const offsets = [0];
        objects.forEach(object => {
            offsets.push(pdf.length);
            pdf += `${object}\n`;
        });
        const xrefOffset = pdf.length;
        pdf += `xref\n0 ${objects.length + 1}\n`;
        pdf += '0000000000 65535 f \n';
        offsets.slice(1).forEach(offset => {
            pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
        });
        pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

        return new Blob([pdf], { type: 'application/pdf' });
    }

    function downloadCertificatePdf() {
        const stats = getCertificateStats();
        const today = new Date().toLocaleDateString('pt-BR');
        const pdfBlob = buildPdf(stats, today);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = 'certificado-simplifica-digital.pdf';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        link.remove();
    }

    if (congratsModal && closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            congratsModal.classList.remove('show-modal');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        if (downloadCertificateBtn) {
            downloadCertificateBtn.addEventListener('click', downloadCertificatePdf);
        }
    }
});
