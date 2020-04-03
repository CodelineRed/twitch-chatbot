/*global dataTables*/

const dataTable = {
    methods: {

        /**
         * Init data table
         * 
         * @returns {undefined}
         */
        initDataTable: function() {
            (function($, $this) {
                $('.data-table.dataTable').each(function() {
                    let id = $(this).attr('id');
                    dataTables[id]['ref'].destroy();
                });

                setTimeout(function() {
                    $('.data-table:not(.dataTable)').each(function() {
                        let id = $(this).attr('id');
                        dataTables[id] = {};
                        dataTables[id]['init'] = false;
                        dataTables[id]['ref'] = $('#' + id).DataTable({ // eslint-disable-line new-cap
                            'language': {
                                'url':  'json/datatables.' + $this.$i18n.locale + '.json'
                            }
                        });
                    });

                    // restore table to last table state
                    $('.data-table').on('init.dt', function(e, settings, json) {
                        let id = $(e.target).attr('id');
                        let tableState = JSON.parse(localStorage.getItem(id));

                        if (typeof dataTables[id] === 'object') {
                            if (typeof tableState === 'object' && tableState !== null) {
                                dataTables[id]['ref'].order([tableState.orderColumn, tableState.orderBy]).draw();
                                dataTables[id]['ref'].search(tableState.search);
                                dataTables[id]['ref'].page.len(tableState.length);
                                dataTables[id]['ref'].page(tableState.page).draw('page');
                            }

                            dataTables[id]['init'] = true;
                            localStorage.setItem(id, JSON.stringify(tableState));
                        }
                    });

                    // on length change
                    $('.data-table').on('length.dt', function(e, settings, len) {
                        $this.setTableState($(e.target).attr('id'));
                    });

                    // on order change
                    $('.data-table').on('order.dt', function(e, settings, ordArr) {
                        $this.setTableState($(e.target).attr('id'));
                    });

                    // on page change
                    $('.data-table').on('page.dt', function(e, settings) {
                        $this.setTableState($(e.target).attr('id'));
                    });

                    // on search change
                    $('.data-table').on('search.dt', function(e, settings) {
                        $this.setTableState($(e.target).attr('id'));
                    });
                }, 100);
            })(jQuery, this);
        },
        
        /**
         * Updates one table row and reorder table
         * 
         * @param {integer} index
         * @param {string} table
         * @returns {undefined}
         */
        updateDataTableRow: function(index, table) {
            // update row in data tables
            setTimeout(function() {
                dataTables[table].ref.row(index).invalidate();
                dataTables[table].ref.order(dataTables[table].ref.order()[0]).draw();
            }, 100);
        },
        
        /**
         * Sets table state to localStorage
         * 
         * @param {string} id
         * @returns {undefined}
         */
        setTableState: function(id) {
            let tableState = JSON.parse(localStorage.getItem(id));

            if (typeof tableState === 'object' 
                    && dataTables[id]['init'] === true) {
                let order = dataTables[id]['ref'].order();
                let pageInfo = dataTables[id]['ref'].page.info();
                let search = dataTables[id]['ref'].search();

                tableState = {
                    'init': false,
                    'length': pageInfo.length,
                    'orderColumn': order[0][0],
                    'orderBy': order[0][1],
                    'page': pageInfo.page,
                    'search': search
                };

                localStorage.setItem(id, JSON.stringify(tableState));
            }
        }
    }
};

export default dataTable;
