const bsComponent = {
    methods: {
        initPopover: function() {
            jQuery('[data-toggle="popover"]').popover('dispose');
            jQuery('[data-toggle="popover"]').popover({
                html: true,
                placement: 'top'
            });
        },
        initTooltip: function() {
            jQuery('[data-toggle="tooltip"]').tooltip('dispose');
            jQuery('[data-toggle="tooltip"]').tooltip();
        }
    }
};

export default bsComponent;
