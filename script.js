// ============ AUTHENTICATION MANAGER ============
const AuthManager = {
    init() {
        this.authModal = document.getElementById('auth-modal');
        this.authForm = document.getElementById('auth-form');
        this.userGreeting = document.getElementById('user-greeting');
        this.logoutBtn = document.getElementById('logout-btn');
        this.footerName = document.getElementById('footer-developer-name');
        
        this.checkAuth();
        this.authForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
    },
    
    checkAuth() {
        const userData = localStorage.getItem('pranayama_user');
        if (userData) {
            this.showApp(JSON.parse(userData));
        }
    },
    
    handleLogin(e) {
        e.preventDefault();
        const name = document.getElementById('user-name').value;
        if (!name.trim()) return;
        const userData = { name };
        localStorage.setItem('pranayama_user', JSON.stringify(userData));
        this.showApp(userData);
    },
    
    handleLogout() {
        localStorage.removeItem('pranayama_user');
        location.reload();
    },
    
    showApp(user) {
        this.authModal.classList.add('hidden');
        this.userGreeting.textContent = `Welcome, ${user.name.split(' ')[0]} 🙏`;
        this.footerName.textContent = user.name;
    }
};

// ============ BREATHING TIMER CLASS ============
class BreathingTimer {
    constructor(element, inhaleTime, holdTime, exhaleTime, maxRounds) {
        this.element = element;
        this.circle = document.getElementById(`${element}-circle`);
        this.phaseEl = document.getElementById(`${element}-phase`);
        this.countEl = document.getElementById(`${element}-count`);
        this.startBtn = document.getElementById(`${element}-start`);
        this.resetBtn = document.getElementById(`${element}-reset`);
        this.roundsEl = document.getElementById(`${element}-rounds`);
        
        this.inhaleTime = inhaleTime;
        this.holdTime = holdTime;
        this.exhaleTime = exhaleTime;
        this.maxRounds = maxRounds;
        
        this.isRunning = false;
        this.currentRound = 0;
        this.timer = null;
        this.init();
    }

    init() {
        this.startBtn.addEventListener('click', () => this.toggle());
        this.resetBtn.addEventListener('click', () => this.reset());
    }

    toggle() {
        if (this.isRunning) {
            clearInterval(this.timer);
            this.isRunning = false;
            this.startBtn.textContent = "Resume";
        } else {
            this.isRunning = true;
            this.startBtn.textContent = "Pause";
            this.startCycle();
        }
    }

    startCycle() {
        if (this.currentRound >= this.maxRounds) return this.complete();
        this.currentRound++;
        this.updateRounds();
        this.inhale();
    }

    inhale() {
        this.updateUI("Inhale", this.inhaleTime, "inhale");
        this.startTimer(this.inhaleTime, () => this.hold());
    }

    hold() {
        if (this.holdTime === 0) {
            this.exhale();
        } else {
            this.updateUI("Hold", this.holdTime, "hold");
            this.startTimer(this.holdTime, () => this.exhale());
        }
    }

    exhale() {
        this.updateUI("Exhale", this.exhaleTime, "exhale");
        this.startTimer(this.exhaleTime, () => this.startCycle());
    }

    startTimer(seconds, callback) {
        let remaining = seconds;
        this.countEl.textContent = remaining;
        this.timer = setInterval(() => {
            remaining--;
            this.countEl.textContent = remaining;
            if (remaining <= 0) {
                clearInterval(this.timer);
                callback();
            }
        }, 1000);
    }

    updateUI(phase, count, className) {
        this.phaseEl.textContent = phase;
        this.countEl.textContent = count;
        this.circle.className = `breath-circle ${className}`;
    }

    updateRounds() {
        this.roundsEl.textContent = `${this.currentRound} / ${this.maxRounds}`;
    }

    reset() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.currentRound = 0;
        this.startBtn.textContent = "Start Practice";
        this.updateUI("Ready", 0, "");
        this.updateRounds();
    }

    complete() {
        this.updateUI("Done 🙏", "✓", "");
        this.isRunning = false;
        this.startBtn.textContent = "Restart";
    }
}

// ============ NAVIGATION MANAGER ============
const NavigationManager = {
    init() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.section');
        
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
        
        window.addEventListener('scroll', () => this.updateActiveNav());
    },
    
    handleNavClick(e) {
        e.preventDefault();
        const section = e.target.dataset.section;
        const element = document.getElementById(section);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            this.setActiveLink(e.target);
        }
    },
    
    setActiveLink(link) {
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    },
    
    updateActiveNav() {
        this.sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 200 && rect.bottom >= 200) {
                const navLink = document.querySelector(`[data-section="${section.id}"]`);
                if (navLink) this.setActiveLink(navLink);
            }
        });
    }
};

// ============ CONTACT FORM HANDLER ============
const ContactFormHandler = {
    init() {
        this.form = document.getElementById('contact-form');
        this.statusDiv = document.getElementById('form-status');
        
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    },
    
    handleSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value;
        
        if (!name || !email || !subject || !message) {
            this.showStatus('Please fill in all fields', 'error');
            return;
        }
        
        // Save to localStorage (or you can replace with actual backend)
        const contactData = {
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString()
        };
        
        let contacts = JSON.parse(localStorage.getItem('pranayama_contacts')) || [];
        contacts.push(contactData);
        localStorage.setItem('pranayama_contacts', JSON.stringify(contacts));
        
        this.showStatus('✓ Message saved! Thank you for your feedback 🙏', 'success');
        this.form.reset();
        setTimeout(() => this.showStatus('', ''), 3000);
    },
    
    showStatus(message, type) {
        this.statusDiv.textContent = message;
        this.statusDiv.className = `form-status ${type}`;
    }
};

// ============ SMOOTH SCROLL & ANIMATIONS ============
const AnimationManager = {
    init() {
        this.observeElements();
    },
    
    observeElements() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, options);
        
        document.querySelectorAll('.info-card, .timer-card, .contact-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
};

// ============ DOM READY - INITIALIZE ALL ============
document.addEventListener('DOMContentLoaded', () => {
    AuthManager.init();
    NavigationManager.init();
    ContactFormHandler.init();
    AnimationManager.init();
    
    // Initialize all breathing timers
    // Bhramari (Earth) - 4s inhale, 0s hold, 6s exhale, 10 rounds
    new BreathingTimer('earth', 4, 0, 6, 10);
    
    // Sheetali (Water) - 5s inhale, 3s hold, 5s exhale, 12 rounds
    new BreathingTimer('water', 5, 3, 5, 12);
    
    // Kapalbhati (Fire) - 1s quick breaths, 0s hold, 0s exhale per breath, 5 rounds
    new BreathingTimer('fire', 1, 0, 0, 5);
    
    // Nadi Shodhana (Air) - 4s inhale, 4s hold, 4s exhale, 15 rounds
    new BreathingTimer('air', 4, 4, 4, 15);
    
    // Ujjayi (Ether) - 5s inhale, 2s hold, 5s exhale, 20 rounds
    new BreathingTimer('ether', 5, 2, 5, 20);
    
    console.log('✨ Pranayama App Initialized Successfully!');
});

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', (e) => {
    const elementMap = {
        '1': 'earth',
        '2': 'water',
        '3': 'fire',
        '4': 'air',
        '5': 'ether'
    };
    
    if (elementMap[e.key]) {
        const element = document.getElementById(elementMap[e.key]);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
});