/**
 * Hero 1 - Hero with Header
 * 
 * Full-width hero section with:
 * - Navigation header (logo + nav links + login)
 * - Gradient background effects
 * - Announcement badge
 * - Title, description, CTA buttons
 */

export const hero1 = {
    id: 'hero-1',
    label: 'Hero 1 - With Header',
    category: '1. Hero Section',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="3" width="20" height="4" rx="1"/>
        <rect x="4" y="10" width="16" height="2" rx="0.5"/>
        <rect x="6" y="14" width="12" height="1" rx="0.5"/>
        <rect x="8" y="17" width="8" height="2" rx="1"/>
    </svg>`,
    content: `
        <section class="pm-hero-1">
            <style>
                .pm-hero-1 {
                    background: #ffffff;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                .pm-hero-1 * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                /* Header */
                .pm-hero-1 .hero-header {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 0;
                    z-index: 50;
                }
                .pm-hero-1 .hero-nav {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1.5rem;
                }
                @media (min-width: 1024px) {
                    .pm-hero-1 .hero-nav {
                        padding-left: 2rem;
                        padding-right: 2rem;
                    }
                }
                .pm-hero-1 .hero-logo {
                    flex: 1;
                }
                .pm-hero-1 .hero-logo a {
                    display: inline-block;
                }
                .pm-hero-1 .hero-logo img {
                    height: 2rem;
                    width: auto;
                }
                .pm-hero-1 .hero-nav-links {
                    display: none;
                    gap: 3rem;
                }
                @media (min-width: 1024px) {
                    .pm-hero-1 .hero-nav-links {
                        display: flex;
                    }
                }
                .pm-hero-1 .hero-nav-links a {
                    font-size: 0.875rem;
                    line-height: 1.5rem;
                    font-weight: 600;
                    color: #111827;
                    text-decoration: none;
                }
                .pm-hero-1 .hero-nav-links a:hover {
                    color: #4f46e5;
                }
                .pm-hero-1 .hero-login {
                    display: none;
                    flex: 1;
                    justify-content: flex-end;
                }
                @media (min-width: 1024px) {
                    .pm-hero-1 .hero-login {
                        display: flex;
                    }
                }
                .pm-hero-1 .hero-login a {
                    font-size: 0.875rem;
                    line-height: 1.5rem;
                    font-weight: 600;
                    color: #111827;
                    text-decoration: none;
                }
                .pm-hero-1 .hero-login a:hover {
                    color: #4f46e5;
                }
                
                /* Hero Content */
                .pm-hero-1 .hero-content {
                    position: relative;
                    isolation: isolate;
                    padding: 0 1.5rem;
                    padding-top: 3.5rem;
                }
                @media (min-width: 1024px) {
                    .pm-hero-1 .hero-content {
                        padding-left: 2rem;
                        padding-right: 2rem;
                    }
                }
                
                /* Gradient Background */
                .pm-hero-1 .hero-gradient {
                    position: absolute;
                    left: 0;
                    right: 0;
                    z-index: -10;
                    transform: translateZ(0);
                    overflow: hidden;
                    filter: blur(64px);
                }
                .pm-hero-1 .hero-gradient-top {
                    top: -10rem;
                }
                .pm-hero-1 .hero-gradient-bottom {
                    top: calc(100% - 13rem);
                }
                @media (min-width: 640px) {
                    .pm-hero-1 .hero-gradient-top {
                        top: -20rem;
                    }
                    .pm-hero-1 .hero-gradient-bottom {
                        top: calc(100% - 30rem);
                    }
                }
                .pm-hero-1 .hero-gradient-shape {
                    position: relative;
                    left: calc(50% - 11rem);
                    aspect-ratio: 1155 / 678;
                    width: 36.125rem;
                    transform: translateX(-50%) rotate(30deg);
                    background: linear-gradient(to top right, #ff80b5, #9089fc);
                    opacity: 0.3;
                    clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%);
                }
                @media (min-width: 640px) {
                    .pm-hero-1 .hero-gradient-shape {
                        left: calc(50% - 30rem);
                        width: 72.1875rem;
                    }
                }
                .pm-hero-1 .hero-gradient-bottom .hero-gradient-shape {
                    left: calc(50% + 3rem);
                }
                @media (min-width: 640px) {
                    .pm-hero-1 .hero-gradient-bottom .hero-gradient-shape {
                        left: calc(50% + 36rem);
                    }
                }
                
                /* Main Content */
                .pm-hero-1 .hero-main {
                    max-width: 42rem;
                    margin: 0 auto;
                    padding: 8rem 0;
                }
                @media (min-width: 640px) {
                    .pm-hero-1 .hero-main {
                        padding: 12rem 0;
                    }
                }
                @media (min-width: 1024px) {
                    .pm-hero-1 .hero-main {
                        padding: 14rem 0;
                    }
                }
                
                /* Announcement Badge */
                .pm-hero-1 .hero-badge {
                    display: none;
                    margin-bottom: 2rem;
                    justify-content: center;
                }
                @media (min-width: 640px) {
                    .pm-hero-1 .hero-badge {
                        display: flex;
                    }
                }
                .pm-hero-1 .hero-badge-inner {
                    position: relative;
                    border-radius: 9999px;
                    padding: 0.25rem 0.75rem;
                    font-size: 0.875rem;
                    line-height: 1.5rem;
                    color: #4b5563;
                    border: 1px solid rgba(17, 24, 39, 0.1);
                }
                .pm-hero-1 .hero-badge-inner:hover {
                    border-color: rgba(17, 24, 39, 0.2);
                }
                .pm-hero-1 .hero-badge-link {
                    font-weight: 600;
                    color: #4f46e5;
                    text-decoration: none;
                }
                
                /* Text Content */
                .pm-hero-1 .hero-text {
                    text-align: center;
                }
                .pm-hero-1 .hero-title {
                    font-size: 3rem;
                    font-weight: 600;
                    letter-spacing: -0.025em;
                    color: #111827;
                    text-wrap: balance;
                    line-height: 1.1;
                }
                @media (min-width: 640px) {
                    .pm-hero-1 .hero-title {
                        font-size: 4.5rem;
                    }
                }
                .pm-hero-1 .hero-description {
                    margin-top: 2rem;
                    font-size: 1.125rem;
                    font-weight: 500;
                    color: #6b7280;
                    text-wrap: pretty;
                    line-height: 1.6;
                }
                @media (min-width: 640px) {
                    .pm-hero-1 .hero-description {
                        font-size: 1.25rem;
                        line-height: 2rem;
                    }
                }
                
                /* CTA Buttons */
                .pm-hero-1 .hero-cta {
                    margin-top: 2.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                }
                .pm-hero-1 .hero-btn-primary {
                    border-radius: 0.375rem;
                    background-color: #4f46e5;
                    padding: 0.625rem 0.875rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #ffffff;
                    text-decoration: none;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    display: inline-block;
                }
                .pm-hero-1 .hero-btn-primary:hover {
                    background-color: #4338ca;
                }
                .pm-hero-1 .hero-btn-secondary {
                    font-size: 0.875rem;
                    line-height: 1.5rem;
                    font-weight: 600;
                    color: #111827;
                    text-decoration: none;
                }
                .pm-hero-1 .hero-btn-secondary:hover {
                    color: #4f46e5;
                }
            </style>
            
            <!-- Header -->
            <header class="hero-header">
                <nav class="hero-nav">
                    <div class="hero-logo">
                        <a href="#">
                            <img src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600" alt="Logo">
                        </a>
                    </div>
                    <div class="hero-nav-links">
                        <a href="#">Product</a>
                        <a href="#">Features</a>
                        <a href="#">Marketplace</a>
                        <a href="#">Company</a>
                    </div>
                    <div class="hero-login">
                        <a href="#">Log in →</a>
                    </div>
                </nav>
            </header>
            
            <!-- Hero Content -->
            <div class="hero-content">
                <!-- Gradient Top -->
                <div class="hero-gradient hero-gradient-top" aria-hidden="true">
                    <div class="hero-gradient-shape"></div>
                </div>
                
                <!-- Main -->
                <div class="hero-main">
                    <!-- Badge -->
                    <div class="hero-badge">
                        <div class="hero-badge-inner">
                            Announcing our next round of funding. 
                            <a href="#" class="hero-badge-link">Read more →</a>
                        </div>
                    </div>
                    
                    <!-- Text -->
                    <div class="hero-text">
                        <h1 class="hero-title">Data to enrich your online business</h1>
                        <p class="hero-description">Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat.</p>
                        
                        <!-- CTA -->
                        <div class="hero-cta">
                            <a href="#" class="hero-btn-primary">Get started</a>
                            <a href="#" class="hero-btn-secondary">Learn more →</a>
                        </div>
                    </div>
                </div>
                
                <!-- Gradient Bottom -->
                <div class="hero-gradient hero-gradient-bottom" aria-hidden="true">
                    <div class="hero-gradient-shape"></div>
                </div>
            </div>
        </section>
    `
}
