const { useState, useEffect, useRef } = React;

// Helper for cursor random colors
function randomColors(count) {
    return new Array(count)
        .fill(0)
        .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
}

const SketchPuppy = ({ isVisible }) => {
    // Note: SVG paths reference CSS variables for theme-aware coloring
    return (
        <div className={`puppy-container ${isVisible ? 'peek' : ''}`}>
            <div className="thank-you-bubble">Thank You!</div>
            <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20,60 C15,40 25,10 50,10 C75,10 85,40 80,60" fill="var(--paper)" />
                <path d="M25,25 C10,25 0,40 10,55 C15,62 25,50 25,40" fill="var(--paper)" />
                <path d="M75,25 C90,25 100,40 90,55 C85,62 75,50 75,40" fill="var(--paper)" />
                <circle cx="35" cy="45" r="2" fill="var(--ink)" />
                <circle cx="65" cy="45" r="2" fill="var(--ink)" />
                <ellipse cx="50" cy="55" rx="5" ry="3" fill="var(--ink)" />
                <path d="M45,60 Q50,65 55,60" />
                <path d="M30,80 C30,70 40,70 40,80" fill="var(--paper)" />
                <path d="M60,80 C60,70 70,70 70,80" fill="var(--paper)" />
            </svg>
        </div>
    );
};

// --- Custom CoolMode Component ---
const CoolMode = ({ children, options }) => {
    const handleEffect = (e) => {
        const particleUrl = options?.particle || "assets/shine.png";
            const particleCount = 24; // Number of particles (bigger effect)
        
        // Get button position
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('img');
            particle.src = particleUrl;
            particle.className = 'cool-mode-particle';
            
            // Random size between 30px and 60px (bigger)
            const size = Math.floor(Math.random() * 30) + 30;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Initial Position (Centered on button)
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;

            document.body.appendChild(particle);

            // Random Angle and Velocity
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 180 + 80; // Distance to travel (faster / farther)
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            // Animate using Web Animations API
            const animation = particle.animate([
                { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
                { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1)`, opacity: 0 }
            ], {
                duration: Math.random() * 800 + 500, // Random duration (longer)
                easing: 'cubic-bezier(0, .9, .57, 1)',
            });

            // Cleanup after animation
            animation.onfinish = () => particle.remove();
        }
    };

    // Clone the child element (the button) to attach the onClick handler
    return React.cloneElement(children, {
        onClick: (e) => {
            handleEffect(e);
            if (children.props.onClick) children.props.onClick(e); // Run existing click logic if any
        }
    });
};
const App = () => {
    const [scrollY, setScrollY] = useState(0);
    const [navbarScrolled, setNavbarScrolled] = useState(false);
    const [glassBlurHeight, setGlassBlurHeight] = useState(0);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [formStatus, setFormStatus] = useState({ submitting: false, success: false, error: false, errorMessage: '' });
    const [showDog, setShowDog] = useState(false);
    const [theme, setTheme] = useState('light'); // Initial theme state
    const [isCardVisible, setIsCardVisible] = useState(false);

    const aboutRef = useRef(null);
    const projectsRef = useRef(null);
    const contactRef = useRef(null);
    const heroRef = useRef(null);
    // Note: The original code used a ref for particlesContainer but didn't assign it in the return, 
    // it's fixed here by relying on the DOM selector within the useEffect logic.
    const digitalCardRef = useRef(null);
    
    // Ref for Cursor Instance
    const cursorRef = useRef(null);

    // Toggle Theme Handler
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    // RGB CURSOR LOGIC + Theme Body Class
    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            
            // Initialize Cursor if not already done
            if (!cursorRef.current) {
                const initCursor = async () => {
                    try {
                        // Dynamically import the external component
                        const module = await import("https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js");
                        const TubesCursor = module.default;
                        const canvas = document.getElementById('canvas');
                        if (canvas) {
                            cursorRef.current = TubesCursor(canvas, {
                                tubes: {
                                    colors: ["#f967fb", "#53bc28", "#6958d5"],
                                    lights: {
                                        intensity: 200,
                                        colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"]
                                    }
                                }
                            });
                        }
                    } catch (e) {
                        console.error("Cursor load error", e);
                    }
                };
                initCursor();
            }
        } else {
            document.body.classList.remove('dark-mode');
            // We don't necessarily destroy the cursor, just hide canvas via CSS
        }
    }, [theme]);

    // Add Click Listener for Random Colors (Global)
    useEffect(() => {
        const handleClick = () => {
            if (theme === 'dark' && cursorRef.current && cursorRef.current.tubes) {
                 const colors = randomColors(3);
                 const lightsColors = randomColors(4);
                 cursorRef.current.tubes.setColors(colors);
                 cursorRef.current.tubes.setLightsColors(lightsColors);
            }
        };

        document.body.addEventListener('click', handleClick);
        return () => document.body.removeEventListener('click', handleClick);
    }, [theme]);

    // GSAP Scroll Animations and Scroll/Nav Logic
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Section Animations
        gsap.fromTo(".hero-title",
            { opacity: 0, y: gsap.utils.random(-100, -50), scale: 0.8, rotation: gsap.utils.random(-5, 5) },
            { opacity: 1, y: 0, scale: 1, rotation: 0, duration: 1.2, delay: 0.2, ease: "elastic.out(1, 0.5)" }
        );

        gsap.to(".hero-subtitle", { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: "power3.out" });
        gsap.to(".gradient-btn", { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: "back.out(1.7)" });

        // Section Title Animations
        gsap.to(".section-title", {
            scrollTrigger: { trigger: "#about", start: "top 80%" },
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out"
        });

        // About Section Animations
        gsap.to(".about-image-container", {
            scrollTrigger: { trigger: "#about", start: "top 70%" },
            opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: "power3.out"
        });

        gsap.to(".about-text", {
            scrollTrigger: { trigger: "#about", start: "top 70%" },
            opacity: 1, x: 0, duration: 0.8, delay: 0.4, ease: "power3.out"
        });

        // Skills Animation
        gsap.to(".skill-pill", {
            scrollTrigger: { trigger: ".skills-container", start: "top 80%" },
            opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)"
        });

        // Projects Animation
        gsap.to(".project-card", {
            scrollTrigger: { trigger: "#projects", start: "top 70%" },
            opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out"
        });

        // Contact Animation
        gsap.to(".contact-container", {
            scrollTrigger: { trigger: "#contact", start: "top 80%" },
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out"
        });
        
        // Initialize EmailJS
        emailjs.init("vSqOUagcr4o5SiJ_9");

        // Scroll Handlers for Nav Bar and Glass Blur Effect
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollY(currentScrollY);
            if (currentScrollY > 50) { setNavbarScrolled(true); } else { setNavbarScrolled(false); }
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = currentScrollY / docHeight;
            // The height calculation is moved out of the GSAP logic
            setGlassBlurHeight(scrollPercent * (window.innerHeight * 0.1));
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Particles (Mouse Move) Effect Logic
    useEffect(() => {
        // Since particlesContainerRef isn't explicitly passed to the component, 
        // we'll get it from the DOM.
        const particlesContainer = document.querySelector('.particles-container');
        if (!particlesContainer) return;

        const handleMouseMove = (e) => {
            const isDarkMode = document.body.classList.contains('dark-mode');
            const darkColors = ['#000000', '#333333', '#666666', '#1a1a1a'];
            const lightColors = ['#ffffff', '#e0e0e0', '#cccccc', '#f0f0f0'];
            
            const colors = isDarkMode ? lightColors : darkColors;

            const particle = document.createElement('div');
            particle.classList.add('particle');
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.backgroundColor = randomColor;
            particle.style.left = `${e.clientX}px`;
            particle.style.top = `${e.clientY}px`;
            const size = Math.random() * 6 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particlesContainer.appendChild(particle);

            gsap.to(particle, {
                opacity: 0,
                x: gsap.utils.random(-20, 20),
                y: gsap.utils.random(-20, 20),
                duration: gsap.utils.random(0.5, 1.0),
                ease: "power1.out",
                onComplete: () => particle.remove()
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => { window.removeEventListener('mousemove', handleMouseMove); };
    }, []); // Removed dependency on particlesContainerRef

    // Initial Digital Card Visibility Timer
    useEffect(() => {
        const timer = setTimeout(() => {
            const shouldShow = Math.random() < 0.8;
            if (shouldShow) { setIsCardVisible(true); }
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    const scrollToSection = (ref) => {
        // Use an offset to account for the fixed navbar height
        window.scrollTo({ top: ref.current.offsetTop - 80, behavior: 'smooth' });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormStatus({ submitting: true, success: false, error: false, errorMessage: '' });
        
        // Simulating the emailjs send call with a timeout for demo purposes
        // In a real app, you'd replace the setTimeout with your emailjs.sendForm call:
        /*
        try {
            await emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', e.target, 'YOUR_PUBLIC_KEY');
            // ... success logic
        } catch (error) {
            // ... error logic
        }
        */

        setTimeout(() => {
            setFormStatus({ submitting: false, success: true, error: false, errorMessage: '' });
            setFormData({ name: '', email: '', message: '' });
            setShowDog(true);
            setTimeout(() => setShowDog(false), 5000);
        }, 1000);

    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDownloadCard = () => {
        const cardElement = digitalCardRef.current;
        if (cardElement) {
            // html2canvas is imported globally in index.html
            html2canvas(cardElement, { backgroundColor: null, useCORS: true, scale: 2 }).then(canvas => {
                const link = document.createElement('a');
                link.download = 'suyash-sketch-card.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(err => { console.error('Error in html2canvas', err); });
        }
    };

    return (
        <div className="app-container">
            <div className="glass-blur" style={{ height: `${glassBlurHeight}px` }}></div>

            <nav className={`navbar ${navbarScrolled ? 'scrolled' : ''}`}>
                <div className="logo">SYH</div>
                <div className="nav-right">
                    <div className="nav-links">
                        <a href="#home" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection(heroRef); }}>Home</a>
                        <a href="#about" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection(aboutRef); }}>About</a>
                        <a href="#projects" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection(projectsRef); }}>Projects</a>
                        <a href="#contact" className="nav-link" onClick={(e) => { e.preventDefault(); scrollToSection(contactRef); }}>Contact</a>
                    </div>
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
                    </button>
                </div>
            </nav>

            <div className={`digital-card ${isCardVisible ? 'visible' : ''}`} ref={digitalCardRef}>
                <div className="card-header">
                    <span className="security">ID CARD // SKETCH</span>
                    <span className="id">No. 034<span className="status-dot"></span></span>
                </div>
                <div className="profile-section">
                    {/* Placeholder for actual image */}
                    <img src="assets/img.jpg" alt="Profile" className="profile-pic" />
                    <div className="profile-info">
                        <h3 className="card-name">SUYASH</h3>
                        <p className="card-title">Code Architect</p>
                        <div className="badges">
                            <span className="level-badge">LVL 15</span>
                            <span className="verified-badge">VERIFIED</span>
                        </div>
                    </div>
                </div>
                <div className="stats-section">
                    <div className="stat-item">
                        <span className="stat-label">WEB DEV</span>
                        <div className="progress-bar-container"><div className="progress-bar" style={{ width: '96%' }}></div></div>
                        <span className="stat-value">96%</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">DSA</span>
                        <div className="progress-bar-container"><div className="progress-bar" style={{ width: '55%' }}></div></div>
                        <span className="stat-value">55%</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">AI / ML</span>
                        <div className="progress-bar-container"><div className="progress-bar" style={{ width: '42%' }}></div></div>
                        <span className="stat-value">42%</span>
                    </div>
                </div>
                <div className="card-footer">
                    <span className="active-projects">suyashdhulap@gmail.com</span>
                    <span className="download-card-btn" onClick={handleDownloadCard}>Save <i className="fas fa-save"></i></span>
                </div>
                <button className="close-card" onClick={() => setIsCardVisible(false)}>&times;</button>
            </div>

            <section className="section hero-section" ref={heroRef} id="home">
                <div className="hero-content">
                    <h1 className="hero-title">Suyash Dhulap</h1>
                    <p className="hero-subtitle">-- Computer Science Student & Full-Stack Developer --</p>
                    <a href="#projects" className="gradient-btn" onClick={(e) => { e.preventDefault(); scrollToSection(projectsRef); }}>Check My Work</a>
                </div>
            </section>

            <section className="section" id="about" ref={aboutRef}>
                <h2 className="section-title">About Me</h2>
                <div className="about-container">
                    <div className="about-content">
                        <div className="about-image-container">
                            <div className="flip-card">
                                <div className="flip-card-inner">
                                    <div className="flip-card-front">
                                        <img src="assets/img.jpg" alt="Profile" /> 
                                    </div>
                                    <div className="flip-card-back">
                                        <img src="assets/suyash.svg" alt="Suyash Logo" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="about-text">
                            <p>Hola! I'm Suyash, a Computer Science student passionate about creating innovative solutions. I'm currently pursuing my degree at Mumbai University at VCET, focusing on software development and artificial intelligence.</p>
                            <p>My journey in tech started when I built my first website at 17. Since then, I've been constantly learning. I love tackling complex problems and turning ideas into reality through code.</p>
                            <p>Contributing to open-source projects or participating in hackathons are my favorite things to do.</p>
                        </div>
                    </div>

                    <div className="skills-container">
                        <div className="skill-pill">React.js</div>
                        <div className="skill-pill">JavaScript</div>
                        <div className="skill-pill">Java</div>
                        <div className="skill-pill">Node.js</div>
                        <div className="skill-pill">Python</div>
                        <div className="skill-pill">SQL</div>
                        <div className="skill-pill">Firebase</div>
                        <div className="skill-pill">UI/UX</div>
                        <div className="skill-pill">Git</div>
                    </div>
                </div>
            </section>

            <section className="section" id="projects" ref={projectsRef}>
                <h2 className="section-title">My Projects</h2>
                <div className="projects-container">
                    {/* Project Card 1 */}
                    <div className="project-card">
                        <div className="project-image"><img src="assets/on_chain.jpg" alt="CryptoVault" /></div>
                        <div className="project-info">
                            <h3 className="project-title">CryptoVault</h3>
                            <p className="project-desc">This project is a basic cryptocurrency wallet. It allows users to manage their cryptocurrency balances and perform basic operations.</p>
                            <div className="project-tags">
                                <span className="project-tag">Javascript</span>
                                <span className="project-tag">Solidity</span>
                                <span className="project-tag">Ethereum</span>
                                <span className="project-tag">MongoDB</span>
                            </div>
                            <div className="project-links">
                                <a href="#" className="project-link">View Demo</a>
                                <a href="https://github.com/7suyash/CryptoVault" className="project-link">Github</a>
                            </div>
                        </div>
                    </div>

                    {/* Project Card 2 */}
                    <div className="project-card">
                        <div className="project-image"><img src="assets/wpm.jpeg" alt="WPM Analyzer" /></div>
                        <div className="project-info">
                            <h3 className="project-title">WPM Analyzer</h3>
                            <p className="project-desc">Python based Words Per Minute checker.</p>
                            <div className="project-tags">
                                <span className="project-tag">Python</span>
                                <span className="project-tag">SQL</span>
                                <span className="project-tag">WebSockets</span>
                            </div>
                            <div className="project-links">
                                <a href="#" className="project-link">View Demo</a>
                                <a href="https://github.com/7suyash/py_courseProject" className="project-link">Github</a>
                            </div>
                        </div>
                    </div>

                    {/* Project Card 3 */}
                    <div className="project-card">
                        <div className="project-image"><img src="assets/notif.jpg" alt="PushAlertX" /></div>
                        <div className="project-info">
                            <h3 className="project-title">PushAlertX</h3>
                            <p className="project-desc">A real time push notification system in Java.</p>
                            <div className="project-tags">
                                <span className="project-tag">Java</span>
                                <span className="project-tag">JDBC</span>
                                <span className="project-tag">SQL</span>
                            </div>
                            <div className="project-links">
                                <a href="#" className="project-link">View Demo</a>
                                <a href="https://github.com/7suyash/PushAlertX" className="project-link">Github</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section" id="contact" ref={contactRef}>
                <h2 className="section-title">Get In Touch</h2>
                <div className="contact-container">
                    <SketchPuppy isVisible={showDog} />
                    {/* The `name` attributes on the inputs are crucial for emailjs.sendForm to work */}
                    <form onSubmit={handleFormSubmit}> 
                        <div className="contact-form-group">
                            <label className="contact-label">Name</label>
                            <input type="text" className="contact-input" placeholder="Your Name" name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div className="contact-form-group">
                            <label className="contact-label">Email</label>
                            <input type="email" className="contact-input" placeholder="Your Email" name="email" value={formData.email} onChange={handleInputChange} required />
                        </div>
                        <div className="contact-form-group">
                            <label className="contact-label">Message</label>
                            <textarea className="contact-textarea" placeholder="Your Message..." name="message" value={formData.message} onChange={handleInputChange} required></textarea>
                        </div>
                        <CoolMode options={{ particle: "assets/shine.png" }}>
                            <button type="submit" className="btn" disabled={formStatus.submitting}>
                                {formStatus.submitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </CoolMode>
                        {formStatus.success && <p style={{ color: 'var(--ink)', marginTop: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Message sent!</p>}
                        {formStatus.error && <p style={{ color: '#ff0000', marginTop: '1rem', textAlign: 'center' }}>{formStatus.errorMessage}</p>}
                    </form>
                </div>
            </section>

            <footer className="footer">
                <div className="footer-content">
                    <p className="copyright">© 2026 Suyash Dhulap</p>
                    <div className="social-links">
                        <a href="https://github.com/7suyash" className="social-link"><i className="fab fa-github"></i></a>
                        <a href="https://www.linkedin.com/in/suyash-dhulap-687942318" className="social-link"><i className="fab fa-linkedin"></i></a>
                        <a href="https://discordapp.com/users/1241347382931886236" className="social-link"><i className="fab fa-discord"></i></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Render the main App component
ReactDOM.render(<App />, document.getElementById("root"));
