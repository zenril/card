

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

        init() {
            console.log('Card app initialized');
            console.log('Total cards:', this.cardData.cards.length);
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
            
            // Track history
            this.cardHistory.push(this.currentCard);

            // Trigger flip animation
            this.isFlipping = true;
            this.$nextTick(() => {
                setTimeout(() => {
                    this.isFlipped = true;
                    this.isFlipping = false;
                }, 300); // Half of animation duration (0.6s)
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
            if (distance > 250) {
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
        }
    }));
});

// Initialize Alpine
Alpine.start();
