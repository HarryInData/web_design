// JavaScript Application Engine for Ætheris Luxury Watch Website

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Premium Custom Cursor Logic
    // ==========================================
    const cursorRing = document.getElementById('custom-cursor-ring');
    const cursorDot = document.getElementById('custom-cursor-dot');
    
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Immediate dot position
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Lerp-based smooth trailing ring position
    function updateCursor() {
        // Lerp equation: current += (target - current) * factor
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        
        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover effect triggers
    const addHoverTriggers = () => {
        const hoverables = document.querySelectorAll('.hover-trigger');
        hoverables.forEach(item => {
            item.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-active');
            });
            item.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-active');
            });
        });
    };
    
    // Initial call
    addHoverTriggers();

    // ==========================================
    // 2. Preloading 240 Frame Images
    // ==========================================
    const canvas = document.getElementById('watch-canvas');
    const ctx = canvas.getContext('2d');
    
    const preloader = document.getElementById('site-preloader');
    const progressCircle = document.getElementById('loading-progress-circle');
    const progressText = document.getElementById('loading-text');
    const statusMsg = document.getElementById('loading-status-msg');

    const frameCount = 240;
    const images = [];
    let loadedCount = 0;
    
    // Circle circumference for SVG loading dial (2 * pi * r) where r = 45 -> ~282.7
    const dialCircumference = 282.74;

    // Update the circular SVG indicator and percentage text
    function updateLoadProgress(percent) {
        progressText.textContent = `${Math.floor(percent)}%`;
        const offset = dialCircumference - (dialCircumference * percent) / 100;
        progressCircle.style.strokeDashoffset = offset;
        
        // Change status messaging based on milestone
        if (percent < 30) {
            statusMsg.textContent = "CALIBRATING ESCAPEMENT MECHANISM...";
        } else if (percent < 60) {
            statusMsg.textContent = "INDEXING DOUBLE-AXIS TOURBILLON...";
        } else if (percent < 90) {
            statusMsg.textContent = "SYNCHRONIZING TUNGSTEN MASS GEARS...";
        } else {
            statusMsg.textContent = "READY FOR CHRONO-MIGRATION";
        }
    }

    // Canvas size optimization based on high-DPI screens
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        // Redraw immediately when canvas is resized
        if (images[Math.floor(currentFrame)]) {
            drawImageCover(ctx, images[Math.floor(currentFrame)]);
        }
    }
    
    window.addEventListener('resize', resizeCanvas);

    // Cover drawing algorithm for Canvas (emulating background-size: cover)
    function drawImageCover(ctx, img) {
        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = canvas.width / dpr;
        const canvasHeight = canvas.height / dpr;
        
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        const canvasRatio = canvasWidth / canvasHeight;
        const imgRatio = imgWidth / imgHeight;
        
        let sx, sy, sWidth, sHeight;
        
        if (canvasRatio > imgRatio) {
            // Canvas is wider than image (fit width, crop height)
            sWidth = imgWidth;
            sHeight = imgWidth / canvasRatio;
            sx = 0;
            sy = (imgHeight - sHeight) / 2;
        } else {
            // Canvas is taller than image (fit height, crop width)
            sHeight = imgHeight;
            sWidth = imgHeight * canvasRatio;
            sx = (imgWidth - sWidth) / 2;
            sy = 0;
        }
        
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
    }

    // Start loading frames asynchronously
    function preloadFrames() {
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            
            // Padding frame index with zeros, matching format: frame_00000.png, frame_00001.png, etc.
            const indexStr = String(i).padStart(5, '0');
            img.src = `frames/frame_${indexStr}.png`;
            
            img.onload = () => {
                loadedCount++;
                const percent = (loadedCount / frameCount) * 100;
                updateLoadProgress(percent);
                
                // Draw first frame as soon as it's ready so there's no blank canvas during load
                if (i === 0 && loadedCount < frameCount) {
                    drawImageCover(ctx, img);
                }
                
                if (loadedCount === frameCount) {
                    onPreloadComplete();
                }
            };
            
            img.onerror = () => {
                console.error(`Failed to load frame_${indexStr}.png`);
                // Continue loading sequence in case of error
                loadedCount++;
                if (loadedCount === frameCount) {
                    onPreloadComplete();
                }
            };
            
            images.push(img);
        }
    }

    // Preload complete callback
    function onPreloadComplete() {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            document.body.style.overflow = 'auto'; // Re-enable scrolling
            resizeCanvas();
            initScrollEngine();
        }, 800); // Small aesthetic hold for luxury experience
    }

    // Force scroll lock during preloader
    document.body.style.overflow = 'hidden';
    preloadFrames();

    // ==========================================
    // 3. Smooth Lerp Scroll & Canvas Player
    // ==========================================
    let targetFrame = 0;
    let currentFrame = 0;
    let isScrollActive = false;

    const scrollTrackerFill = document.getElementById('scroll-bar-fill');
    const scrollFrameVal = document.getElementById('scroll-frame-val');
    const slides = document.querySelectorAll('.slide');

    function initScrollEngine() {
        const heroSection = document.getElementById('hero-scroll');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const sectionTop = heroSection.offsetTop;
            const driverHeight = heroSection.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            // Scroll relative to the hero section bounds
            const relativeScroll = scrollTop - sectionTop;
            const maxScroll = driverHeight - viewportHeight;
            
            let scrollPercent = relativeScroll / maxScroll;
            scrollPercent = Math.max(0, Math.min(1, scrollPercent));
            
            // Compute target frame index (0 - 239)
            targetFrame = scrollPercent * (frameCount - 1);
            
            // Update HUD progress bar
            scrollTrackerFill.style.width = `${scrollPercent * 100}%`;
        });
        
        // Start animation frame drawing loop
        requestAnimationFrame(renderLoop);
    }

    function renderLoop() {
        // Calculate difference to check if drawing is required
        const diff = targetFrame - currentFrame;
        
        // Lerp equation for frame transition smoothness
        if (Math.abs(diff) > 0.01) {
            currentFrame += diff * 0.08; // 0.08 for elegant, slightly delayed deceleration
            
            // Clamp currentFrame
            currentFrame = Math.max(0, Math.min(frameCount - 1, currentFrame));
            
            // Render the active frame
            const activeFrameIndex = Math.floor(currentFrame);
            if (images[activeFrameIndex]) {
                drawImageCover(ctx, images[activeFrameIndex]);
            }
            
            // Update HUD text index
            scrollFrameVal.textContent = `FRAME: ${String(activeFrameIndex).padStart(3, '0')} / 239`;
            
            // Check slide opacities based on current frame position
            updateSlideOverlays(activeFrameIndex);
        }
        
        requestAnimationFrame(renderLoop);
    }

    // Toggle active state for text overlay panels based on scroll landmarks
    function updateSlideOverlays(frameIndex) {
        slides.forEach(slide => {
            const start = parseInt(slide.getAttribute('data-start'));
            const end = parseInt(slide.getAttribute('data-end'));
            
            if (frameIndex >= start && frameIndex <= end) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }

    // ==========================================
    // 4. Interactive Specifications Section
    // ==========================================
    const specItems = document.querySelectorAll('.spec-item');
    const schematicHighlight = document.getElementById('schematic-highlight');
    const schematicLabel = document.getElementById('schematic-active-label');
    const hourHand = document.getElementById('schematic-hour-hand');
    const minuteHand = document.getElementById('schematic-minute-hand');

    // Coordinate matrix mapping highlight locations on the vector schematic
    const specCoordinates = {
        movement: { cx: 200, cy: 200, r: 65, label: "Caliber A-90 Tourbillon", hRot: 45, mRot: 280 },
        case: { cx: 200, cy: 200, r: 175, label: "Titanium & Rose Gold Case", hRot: 90, mRot: 180 },
        dial: { cx: 200, cy: 200, r: 120, label: "Smoky Obsidian Sapphire Dial", hRot: 120, mRot: 40 },
        reserve: { cx: 280, cy: 200, r: 35, label: "Bidirectional Power Barrel", hRot: 210, mRot: 330 }
    };

    // Transition elements to the chosen spec coordinates
    function updateSchematicSpec(specKey) {
        const coords = specCoordinates[specKey];
        if (!coords) return;
        
        // Move the SVG target highlights
        schematicHighlight.setAttribute('cx', coords.cx);
        schematicHighlight.setAttribute('cy', coords.cy);
        schematicHighlight.setAttribute('r', coords.r);
        
        // Update label text
        schematicLabel.textContent = coords.label;
        schematicLabel.style.opacity = 0;
        setTimeout(() => {
            schematicLabel.style.opacity = 1;
        }, 150);
        
        // Rotate vector clock hands as secondary visual feedback
        hourHand.style.transform = `rotate(${coords.hRot}deg)`;
        minuteHand.style.transform = `rotate(${coords.mRot}deg)`;
    }

    // Bind event handlers to specs list
    specItems.forEach(item => {
        // Mouse enter tracking
        item.addEventListener('mouseenter', () => {
            // Clear current active
            specItems.forEach(i => i.classList.remove('active'));
            
            // Activate hovered
            item.classList.add('active');
            
            const specKey = item.getAttribute('data-highlight');
            updateSchematicSpec(specKey);
        });
    });

    // Initialize with movement active
    updateSchematicSpec('movement');

    // ==========================================
    // 5. Interactive Bespoke Customizer
    // ==========================================
    const optionBtns = document.querySelectorAll('.option-btn');
    const optionAccents = document.querySelectorAll('.option-accent');
    
    // Preview targets
    const strapTop = document.getElementById('strap-render-top');
    const strapBottom = document.getElementById('strap-render-bottom');
    const dialAccent = document.getElementById('dial-accent-render');
    const watchCase = document.querySelector('.watch-case-render');

    // Summary text targets
    const summaryStrap = document.getElementById('summary-strap-label');
    const summaryAccent = document.getElementById('summary-accent-label');
    const summaryPrice = document.getElementById('summary-price-val');
    
    // Form sync target
    const formBadgeContainer = document.getElementById('form-badge-container');
    const formBadgeText = document.getElementById('form-badge-text');

    // Strap select handler
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Highlight selector
            optionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const strapType = btn.getAttribute('data-strap');
            const price = btn.getAttribute('data-price');
            const label = btn.getAttribute('data-label');
            
            // Update preview textures using class swaps
            strapTop.className = `watch-strap-render top strap-${strapType}`;
            strapBottom.className = `watch-strap-render bottom strap-${strapType}`;
            
            // Update UI specs text
            summaryStrap.textContent = label;
            summaryPrice.textContent = `${price} USD`;
            
            syncBespokeForm();
        });
    });

    // Accent select handler
    optionAccents.forEach(btn => {
        btn.addEventListener('click', () => {
            optionAccents.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const accent = btn.getAttribute('data-accent');
            const label = btn.getAttribute('data-label');
            
            // Update UI specs text
            summaryAccent.textContent = label;
            
            // Update mockup dial color accents
            if (accent === 'gold') {
                dialAccent.style.borderColor = '#D4AF37';
                watchCase.style.borderColor = '#D4AF37';
            } else if (accent === 'titanium') {
                dialAccent.style.borderColor = '#E5E5EA';
                watchCase.style.borderColor = '#8E8E93';
            } else if (accent === 'stealth') {
                dialAccent.style.borderColor = '#2C2C2E';
                watchCase.style.borderColor = '#1C1C1F';
            }
            
            syncBespokeForm();
        });
    });

    // Synchronize selector inputs with details inside reservation form
    function syncBespokeForm() {
        const strapLabel = summaryStrap.textContent;
        const accentLabel = summaryAccent.textContent;
        
        formBadgeText.textContent = `${strapLabel} / ${accentLabel}`;
        formBadgeContainer.style.display = 'flex';
    }

    // Initialize customizer straps
    strapTop.className = "watch-strap-render top strap-titanium";
    strapBottom.className = "watch-strap-render bottom strap-titanium";

    // ==========================================
    // 6. Reservation Form Validation & Processing
    // ==========================================
    const bookingForm = document.getElementById('booking-form');
    const formSubmitBtn = document.getElementById('form-submit-btn');
    const formSpinner = document.getElementById('form-spinner');
    const successMsg = document.getElementById('form-success-msg');
    
    // Input Fields
    const inputName = document.getElementById('input-name');
    const inputEmail = document.getElementById('input-email');
    const inputDate = document.getElementById('input-date');

    // Validation rules helper
    function validateField(inputElement, errorElementId) {
        const errorElement = document.getElementById(errorElementId);
        const parent = inputElement.parentElement;
        
        let isValid = true;
        
        // Custom validations based on fields
        if (inputElement.required && !inputElement.value.trim()) {
            isValid = false;
        } else if (inputElement.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(inputElement.value.trim())) {
                isValid = false;
            }
        }
        
        if (!isValid) {
            parent.classList.add('has-error');
        } else {
            parent.classList.remove('has-error');
        }
        
        return isValid;
    }

    // Input handlers to clear errors on key stroke
    inputName.addEventListener('input', () => validateField(inputName, 'error-name'));
    inputEmail.addEventListener('input', () => validateField(inputEmail, 'error-email'));
    inputDate.addEventListener('change', () => validateField(inputDate, 'error-date'));

    // Handle Form Submit event
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Execute validation scans
        const isNameValid = validateField(inputName, 'error-name');
        const isEmailValid = validateField(inputEmail, 'error-email');
        const isDateValid = validateField(inputDate, 'error-date');
        
        if (isNameValid && isEmailValid && isDateValid) {
            processAcquisitionBooking();
        }
    });

    function processAcquisitionBooking() {
        // Toggle submission classes
        bookingForm.classList.add('form-submitting');
        
        // Disable fields
        const inputs = bookingForm.querySelectorAll('.form-input, .form-select, .form-textarea, button');
        inputs.forEach(i => i.setAttribute('disabled', 'true'));
        
        // Simulate response from secure reservation backend API
        setTimeout(() => {
            // Reveal success elements
            bookingForm.classList.remove('form-submitting');
            
            // Hide standard form elements with class hides
            const groups = bookingForm.querySelectorAll('.form-row, .form-group, .form-submit-row, .form-configured-badge');
            groups.forEach(g => g.style.display = 'none');
            
            // Smoothly flex reveal success screen
            successMsg.style.display = 'flex';
        }, 1800);
    }
});
