/**
 * Enhanced Text Interaction for Scrapbook Pages
 * Manages hover and click events for text expansion
 */

$(document).ready(function() {
    
    // Event delegation for dynamically created scrapbook text elements
    $(document).on('mouseenter', '.scrapbook-text', function() {
        const $this = $(this);
        
        // Store original text if not already stored
        if (!$this.data('original-text')) {
            $this.data('original-text', $this.text());
        }
        
        // Add hover class for additional styling if needed
        $this.addClass('hovering');
    });
    
    $(document).on('mouseleave', '.scrapbook-text', function() {
        const $this = $(this);
        $this.removeClass('hovering');
    });
    
    // Click to toggle expanded state (for touch devices)
    $(document).on('click', '.scrapbook-text', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const $this = $(this);
        
        // Remove expanded class from all other text elements
        $('.scrapbook-text').not($this).removeClass('expanded');
        
        // Toggle expanded state on clicked element
        $this.toggleClass('expanded');
    });
    
    // Click outside to collapse all expanded texts
    $(document).on('click', '.page', function(e) {
        if (!$(e.target).hasClass('scrapbook-text') && !$(e.target).closest('.scrapbook-text').length) {
            $('.scrapbook-text').removeClass('expanded');
        }
    });
    
    // Handle page turning to reset expanded states
    $(document).on('turning turned', '.flipbook', function() {
        $('.scrapbook-text').removeClass('expanded hovering');
    });
    
    // Add smooth transitions for better user experience
    function enhanceTextAnimations() {
        $('.scrapbook-text').each(function() {
            const $text = $(this);
            
            // Ensure transition is applied
            if (!$text.hasClass('enhanced')) {
                $text.addClass('enhanced');
            }
        });
    }
    
    // Call enhancement function when new pages are added
    $(document).on('DOMNodeInserted', '.page', function() {
        setTimeout(enhanceTextAnimations, 100);
    });
    
    // Initial enhancement
    enhanceTextAnimations();
});
