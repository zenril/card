

// Initialize Alpine app
document.addEventListener('alpine:init', () => {
    Alpine.data('cardApp', () => ({
        cardData,
        currentCard: null,
        isFlipping: false,
        isFlipped: false,
        cardHistory: [],
        dragStartX: null,
        dragStartY: null,
        dragOffsetX: 0,
        dragOffsetY: 0,
        isDragging: false,
        hasDragged: false,
        zAngle: 0,
        showModal: false,
        showHistoryModal: false,
        selectedPreviewCard: null,
        selectedHistoryCard: null,
        isPreviewAnimating: false,
        isHistoryAnimating: false,
        isListExpanded: false,
        historyUpdateTrigger: 0,

        init() {
            console.log('Card app initialized');
            console.log('Total cards:', this.cardData.cards.length);
            
            // Load history from localStorage
            this.loadHistory();
            
            // Keyboard event listener for 'd' and 'h' keys
            window.addEventListener('keydown', (e) => {
                if (e.key === 'd' || e.key === 'D') {
                    this.toggleModal();
                }
                if (e.key === 'h' || e.key === 'H') {
                    this.toggleHistoryModal();
                }
                if (e.key === 'Escape') {
                    if (this.showModal) {
                        this.closeModal();
                    }
                    if (this.showHistoryModal) {
                        this.closeHistoryModal();
                    }
                }
            });

            // Swipe from edges to open modals (mobile) - DISABLED, using tap areas instead
            // this.setupEdgeSwipe();
        },

        setupEdgeSwipe() {
            let touchStartX = 0;
            let touchStartY = 0;
            let touchStartTime = 0;
            const edgeWidth = 30; // pixels from edge

            document.addEventListener('touchstart', (e) => {
                if (this.showModal || this.showHistoryModal) return; // Don't detect swipe if modal is already open
                
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
            }, { passive: true });

            document.addEventListener('touchend', (e) => {
                if (this.showModal || this.showHistoryModal) return;
                
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const touchEndTime = Date.now();
                
                const deltaX = touchEndX - touchStartX;
                const deltaY = touchEndY - touchStartY;
                const deltaTime = touchEndTime - touchStartTime;
                
                const screenWidth = window.innerWidth;
                
                // Check if swipe started from left edge
                const startedFromLeftEdge = touchStartX <= edgeWidth;
                
                // Check if swipe started from right edge
                const startedFromRightEdge = touchStartX >= (screenWidth - edgeWidth);
                
                // Check if it's mostly horizontal (not vertical scroll)
                const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 2;
                
                // Check if it's quick enough (flick)
                const isQuick = deltaTime < 300;
                
                // Left edge swipe (rightward) - opens deck modal
                if (startedFromLeftEdge && deltaX > 50 && isHorizontal && isQuick) {
                    this.toggleModal();
                }
                
                // Right edge swipe (leftward) - opens history modal
                if (startedFromRightEdge && deltaX < -50 && isHorizontal && isQuick) {
                    this.toggleHistoryModal();
                }
            }, { passive: true });
        },

        flipCard(event) {
            // Prevent flip if this was actually a drag
            if (this.hasDragged) {
                this.hasDragged = false;
                return;
            }

            // If card is already flipping, ignore clicks
            if (this.isFlipping) return;

            // If card is already flipped, don't flip again (wait for drag to remove)
            if (this.isFlipped) return;

            // Select a random card
            const randomIndex = Math.floor(Math.random() * this.cardData.cards.length);
            this.currentCard = this.cardData.cards[randomIndex];

            this.zAngle = Math.floor(Math.random() * 11) - 5;
            
            // Track history with timestamp and save to localStorage
            this.cardHistory.push({
                card: this.currentCard,
                timestamp: Date.now()
            });
            this.saveHistory();

            // Trigger flip animation
            this.isFlipping = true;
            this.$nextTick(() => {
                setTimeout(() => {
                    this.isFlipped = true;
                    this.isFlipping = false;
                }, 500); // Half of animation duration (0.6s)
            });
        },

        startDrag(event) {
            // Only detect drag if card is flipped and visible
            if (!this.isFlipped) return;

            event.preventDefault();
            this.isDragging = true;
            this.hasDragged = false;
            
            // Get starting position
            if (event.touches) {
                // Touch event
                this.dragStartX = event.touches[0].clientX;
                this.dragStartY = event.touches[0].clientY;
            } else {
                // Mouse event
                this.dragStartX = event.clientX;
                this.dragStartY = event.clientY;
            }
        },

        onDrag(event) {
            if (!this.isDragging || this.dragStartX === null) return;

            // Get current position
            let currentX, currentY;
            if (event.touches) {
                // Touch event
                currentX = event.touches[0].clientX;
                currentY = event.touches[0].clientY;
            } else {
                // Mouse event
                currentX = event.clientX;
                currentY = event.clientY;
            }

            // Calculate offset from start position
            this.dragOffsetX = -(currentX - this.dragStartX);
            this.dragOffsetY = currentY - this.dragStartY;
            
            // Calculate distance dragged
            const distance = Math.sqrt(this.dragOffsetX * this.dragOffsetX + this.dragOffsetY * this.dragOffsetY);

            // Mark as dragged if moved more than 5px (prevents accidental drags)
            if (distance > 5) {
                this.hasDragged = true;
            }

            // Check if dragged far enough to dismiss
            if (distance > 150) {
                this.resetCard();
            }
        },

        endDrag(event) {
            this.isDragging = false;
            this.dragStartX = null;
            this.dragStartY = null;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            // this.zAngle = 0;
            
            // Reset hasDragged after a short delay to allow click to check it
            setTimeout(() => {
                this.hasDragged = false;
            }, 100);
        },

        resetCard() {
            this.currentCard = null;
            this.isFlipped = false;
            this.isFlipping = false;
            this.isDragging = false;
            this.hasDragged = false;
            this.dragStartX = null;
            this.dragStartY = null;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.zAngle = 0;
        },

        // Modal methods
        toggleModal() {
            this.showModal = !this.showModal;
            if (!this.showModal) {
                this.selectedPreviewCard = null;
                this.isListExpanded = false;
            }
        },

        closeModal() {
            this.showModal = false;
            this.selectedPreviewCard = null;
            this.isListExpanded = false;
        },

        toggleListExpansion() {
            this.isListExpanded = !this.isListExpanded;
        },

        selectCard(cardPath) {
            this.selectedPreviewCard = cardPath;
            this.isPreviewAnimating = true;
            setTimeout(() => {
                this.isPreviewAnimating = false;
            }, 400);
        },

        getCardName(cardPath) {
            // Extract filename from path and normalize it
            const filename = cardPath.split('/').pop();
            // Remove extension and dimensions
            const name = filename.replace(/\.(jpg|png|jpeg)$/i, '')
                                 .replace(/[^a-zA-Z0-9]/g, ' ');
            // Capitalize first letter of each word
            return name.split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
        },

        // Helper methods for history with timestamps
        getHistoryCardPath(historyEntry) {
            // Handle both old format (string) and new format (object)
            return typeof historyEntry === 'string' ? historyEntry : historyEntry.card;
        },

        getHistoryTimestamp(historyEntry) {
            // Handle both old format (string) and new format (object)
            return typeof historyEntry === 'string' ? null : historyEntry.timestamp;
        },

        getTimeAgo(historyEntry) {
            // Reference historyUpdateTrigger to force recalculation when it changes
            this.historyUpdateTrigger;
            const timestamp = this.getHistoryTimestamp(historyEntry);
            return timestamp ? timeAgo(timestamp) : '';
        },

        getPlayCount(cardPath) {
            return this.cardHistory.filter(entry => {
                const entryCard = this.getHistoryCardPath(entry);
                return entryCard === cardPath;
            }).length;
        },

        // History modal methods
        toggleHistoryModal() {
            this.showHistoryModal = !this.showHistoryModal;
            if (!this.showHistoryModal) {
                this.selectedHistoryCard = null;
                this.isListExpanded = false;
            } else {
                // Update the trigger to force recalculation of time ago values
                this.historyUpdateTrigger++;
            }
        },

        closeHistoryModal() {
            this.showHistoryModal = false;
            this.selectedHistoryCard = null;
            this.isListExpanded = false;
        },

        selectHistoryCard(historyEntry) {
            this.selectedHistoryCard = this.getHistoryCardPath(historyEntry);
            this.isHistoryAnimating = true;
            setTimeout(() => {
                this.isHistoryAnimating = false;
            }, 400);
        },

        clearHistory() {
            if (confirm('Are you sure you want to clear all history?')) {
                this.cardHistory = [];
                this.selectedHistoryCard = null;
                this.saveHistory();
            }
        },

        // localStorage methods
        saveHistory() {
            try {
                localStorage.setItem('cardHistory', JSON.stringify(this.cardHistory));
            } catch (e) {
                console.error('Failed to save history to localStorage:', e);
            }
        },

        loadHistory() {
            try {
                const saved = localStorage.getItem('cardHistory');
                if (saved) {
                    this.cardHistory = JSON.parse(saved);
                    console.log('Loaded history:', this.cardHistory.length, 'cards');
                }
            } catch (e) {
                console.error('Failed to load history from localStorage:', e);
                this.cardHistory = [];
            }
        }
    }));
});

// Initialize Alpine
Alpine.start();
