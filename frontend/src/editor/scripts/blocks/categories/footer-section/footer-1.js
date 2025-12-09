/**
 * Footer 1 - Simple Footer
 * 
 * Clean footer section with:
 * - Logo and description
 * - Navigation links (4 columns)
 * - Social media icons
 * - Copyright text
 */

export const footer1 = {
    id: 'footer-1',
    label: 'Footer 1 - Simple',
    category: '2. Footer Section',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="16" width="20" height="5" rx="1"/>
        <line x1="6" y1="18" x2="10" y2="18"/>
        <line x1="14" y1="18" x2="18" y2="18"/>
        <line x1="6" y1="20" x2="18" y2="20"/>
    </svg>`,
    content: `
        <footer class="pm-footer-1">
            <style>
                .pm-footer-1 {
                    background: #111827;
                    font-family: system-ui, -apple-system, sans-serif;
                    color: #9ca3af;
                }
                .pm-footer-1 * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                /* Container */
                .pm-footer-1 .footer-container {
                    max-width: 80rem;
                    margin: 0 auto;
                    padding: 4rem 1.5rem;
                }
                @media (min-width: 1024px) {
                    .pm-footer-1 .footer-container {
                        padding: 4rem 2rem;
                    }
                }
                
                /* Top Section */
                .pm-footer-1 .footer-top {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 3rem;
                }
                @media (min-width: 768px) {
                    .pm-footer-1 .footer-top {
                        grid-template-columns: 2fr 3fr;
                        gap: 4rem;
                    }
                }
                
                /* Brand Section */
                .pm-footer-1 .footer-brand {
                    max-width: 20rem;
                }
                .pm-footer-1 .footer-logo {
                    margin-bottom: 1.5rem;
                }
                .pm-footer-1 .footer-logo img {
                    height: 2rem;
                    width: auto;
                }
                .pm-footer-1 .footer-description {
                    font-size: 0.875rem;
                    line-height: 1.75;
                    color: #9ca3af;
                    margin-bottom: 1.5rem;
                }
                
                /* Social Links */
                .pm-footer-1 .footer-social {
                    display: flex;
                    gap: 1rem;
                }
                .pm-footer-1 .footer-social a {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 2.5rem;
                    height: 2.5rem;
                    border-radius: 0.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    color: #9ca3af;
                    text-decoration: none;
                    transition: all 0.2s;
                }
                .pm-footer-1 .footer-social a:hover {
                    background: #4f46e5;
                    color: #ffffff;
                }
                .pm-footer-1 .footer-social svg {
                    width: 1.25rem;
                    height: 1.25rem;
                }
                
                /* Navigation Links */
                .pm-footer-1 .footer-nav {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 2rem;
                }
                @media (min-width: 640px) {
                    .pm-footer-1 .footer-nav {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }
                .pm-footer-1 .footer-nav-group h4 {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .pm-footer-1 .footer-nav-group ul {
                    list-style: none;
                }
                .pm-footer-1 .footer-nav-group li {
                    margin-bottom: 0.75rem;
                }
                .pm-footer-1 .footer-nav-group a {
                    font-size: 0.875rem;
                    color: #9ca3af;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .pm-footer-1 .footer-nav-group a:hover {
                    color: #ffffff;
                }
                
                /* Bottom Section */
                .pm-footer-1 .footer-bottom {
                    margin-top: 3rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    align-items: center;
                    text-align: center;
                }
                @media (min-width: 768px) {
                    .pm-footer-1 .footer-bottom {
                        flex-direction: row;
                        justify-content: space-between;
                        text-align: left;
                    }
                }
                .pm-footer-1 .footer-copyright {
                    font-size: 0.875rem;
                    color: #6b7280;
                }
                .pm-footer-1 .footer-legal {
                    display: flex;
                    gap: 1.5rem;
                }
                .pm-footer-1 .footer-legal a {
                    font-size: 0.875rem;
                    color: #6b7280;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .pm-footer-1 .footer-legal a:hover {
                    color: #ffffff;
                }
            </style>
            
            <div class="footer-container">
                <!-- Top Section -->
                <div class="footer-top">
                    <!-- Brand -->
                    <div class="footer-brand">
                        <div class="footer-logo">
                            <img src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" alt="Logo">
                        </div>
                        <p class="footer-description">
                            Making the world a better place through constructing elegant hierarchies.
                        </p>
                        <div class="footer-social">
                            <a href="#" title="Facebook">
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                                </svg>
                            </a>
                            <a href="#" title="Twitter">
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                                </svg>
                            </a>
                            <a href="#" title="GitHub">
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                    <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
                                </svg>
                            </a>
                            <a href="#" title="LinkedIn">
                                <svg fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                    
                    <!-- Navigation -->
                    <div class="footer-nav">
                        <div class="footer-nav-group">
                            <h4>Solutions</h4>
                            <ul>
                                <li><a href="#">Marketing</a></li>
                                <li><a href="#">Analytics</a></li>
                                <li><a href="#">Commerce</a></li>
                                <li><a href="#">Insights</a></li>
                            </ul>
                        </div>
                        <div class="footer-nav-group">
                            <h4>Support</h4>
                            <ul>
                                <li><a href="#">Pricing</a></li>
                                <li><a href="#">Documentation</a></li>
                                <li><a href="#">Guides</a></li>
                                <li><a href="#">API Status</a></li>
                            </ul>
                        </div>
                        <div class="footer-nav-group">
                            <h4>Company</h4>
                            <ul>
                                <li><a href="#">About</a></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Jobs</a></li>
                                <li><a href="#">Press</a></li>
                            </ul>
                        </div>
                        <div class="footer-nav-group">
                            <h4>Legal</h4>
                            <ul>
                                <li><a href="#">Claim</a></li>
                                <li><a href="#">Privacy</a></li>
                                <li><a href="#">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Bottom Section -->
                <div class="footer-bottom">
                    <p class="footer-copyright">
                        © 2024 Your Company, Inc. All rights reserved.
                    </p>
                    <div class="footer-legal">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    `
}
