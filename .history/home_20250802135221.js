 // Mobile Navigation Toggle
        const mobileToggle = document.querySelector('.mobile-toggle');
        const navLinks = document.querySelector('.nav-links');

        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Link Block Animation on Scroll
        const linkBlocks = document.querySelectorAll('.link-block');

        const animateBlocksOnScroll = () => {
            linkBlocks.forEach((block, index) => {
                const blockPosition = block.getBoundingClientRect().top;
                const screenPosition = window.innerHeight / 1.3;
                
                if(blockPosition < screenPosition) {
                    setTimeout(() => {
                        block.classList.add('visible');
                    }, 100 * index);
                }
            });
        };

        window.addEventListener('scroll', animateBlocksOnScroll);
        // Initial check in case blocks are already in view
        animateBlocksOnScroll();

        // Auth Modal Functions
        function openLogin() {
            document.getElementById('login-container').style.display = 'flex';
            setTimeout(() => {
                document.getElementById('login-form').classList.add('active');
            }, 10);
        }

        function openSignup() {
            document.getElementById('signup-container').style.display = 'flex';
            setTimeout(() => {
                document.getElementById('signup-form').classList.add('active');
            }, 10);
        }

        function closeAuth() {
            document.getElementById('login-form').classList.remove('active');
            document.getElementById('signup-form').classList.remove('active');
            setTimeout(() => {
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('signup-container').style.display = 'none';
            }, 300);
        }

        function switchToSignup() {
            document.getElementById('login-form').classList.remove('active');
            setTimeout(() => {
                document.getElementById('login-container').style.display = 'none';
                openSignup();
            }, 300);
        }

        function switchToLogin() {
            document.getElementById('signup-form').classList.remove('active');
            setTimeout(() => {
                document.getElementById('signup-container').style.display = 'none';
                openLogin();
            }, 300);
        }

        // Close modals if clicked outside
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('login-container')) {
                closeAuth();
            }
            if (e.target === document.getElementById('signup-container')) {
                closeAuth();
            }
        });