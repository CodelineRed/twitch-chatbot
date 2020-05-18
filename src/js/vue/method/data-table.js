/*global dataTables*/
import bsComponent from './bs-component';

const dataTable = {
    mixins: [bsComponent],
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
                        let tableState = JSON.parse(window.localStorage.getItem(id));

                        if (typeof dataTables[id] === 'object') {
                            if (typeof tableState === 'object' && tableState !== null) {
                                dataTables[id]['ref'].order([tableState.orderColumn, tableState.orderBy]).draw();
                                dataTables[id]['ref'].search(tableState.search);
                                dataTables[id]['ref'].page.len(tableState.length);
                                dataTables[id]['ref'].page(tableState.page).draw('page');
                            }

                            dataTables[id]['init'] = true;
                            localStorage.setItem(id, JSON.stringify(tableState));
                            $this.initTooltip();
                            $this.initPopover();
                        }
                    });

                    // on length change
                    $('.data-table').on('length.dt', function(e, settings, len) {
                        $this.setDataTableState($(e.target).attr('id'));
                        $('[data-toggle="popover"]').popover('hide');
                    });

                    // on order change
                    $('.data-table').on('order.dt', function(e, settings, ordArr) {
                        $this.setDataTableState($(e.target).attr('id'));
                        $('[data-toggle="popover"]').popover('hide');
                    });

                    // on page change
                    $('.data-table').on('page.dt', function(e, settings) {
                        $this.setDataTableState($(e.target).attr('id'));
                        $('[data-toggle="popover"]').popover('hide');
                    });

                    // on search change
                    $('.data-table').on('search.dt', function(e, settings) {
                        $this.setDataTableState($(e.target).attr('id'));
                        $('[data-toggle="popover"]').popover('hide');
                    });
                }, 300);
            })(jQuery, this);
        },

        removeDataTableRow: function(index, table) {
            // update row in data tables
            if (typeof dataTables[table] !== 'undefined') {
                dataTables[table].ref.row(index).remove().draw();
                dataTables[table].ref.order(dataTables[table].ref.order()[0]).draw();
            }
        },

        /**
         * Sets table state to localStorage
         * 
         * @param {string} table
         * @returns {undefined}
         */
        setDataTableState: function(table) {
            let tableState = JSON.parse(window.localStorage.getItem(table));

            if (typeof tableState === 'object' 
                    && dataTables[table]['init'] === true) {
                let order = dataTables[table]['ref'].order();
                let pageInfo = dataTables[table]['ref'].page.info();
                let search = dataTables[table]['ref'].search();

                tableState = {
                    'init': false,
                    'length': pageInfo.length,
                    'orderColumn': order[0][0],
                    'orderBy': order[0][1],
                    'page': pageInfo.page,
                    'search': search
                };

                window.localStorage.setItem(table, JSON.stringify(tableState));
            }
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
                if (typeof dataTables[table] !== 'undefined') {
                    dataTables[table].ref.row(index).invalidate();
                    dataTables[table].ref.order(dataTables[table].ref.order()[0]).draw();
                }
            }, 100);
        },

        /**
         * Updates all table rows and reorder table
         * 
         * @param {integer} index
         * @param {string} table
         * @returns {undefined}
         */
        updateDataTableRows: function(table) {
            // update row in data tables
            setTimeout(function() {
                if (typeof dataTables[table] !== 'undefined') {
                    dataTables[table].ref.rows().invalidate();
                    dataTables[table].ref.order(dataTables[table].ref.order()[0]).draw();
                }
            }, 100);
        }
    }
};

export default dataTable;
