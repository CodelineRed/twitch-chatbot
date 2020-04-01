<script>
    import dataTable from '../../method/data-table';
    
    export default {
        mixins: [dataTable],
        data: function() {
            return {
                commands: []
            };
        },
        mounted: function() {
            this.getCommands();
        },
        methods: {
            getCommands: function() {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'getCommands',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase()
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                }
            },
            setCommands: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.commands = args.commands;
                    this.initDataTable();
                }
            },
            updateCommand: function(index) {
                if (typeof streamWrite === 'function') {
                    const call = {
                        method: 'updateCommand',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            command: this.commands[index],
                            commandId: index
                        },
                        env: 'node'
                    };
                    
                    streamWrite(call);
                }
            }
        }
    };
</script>

<template>
    <div class="row">
        <div class="col-12">
            <div class="commands p-2">
                <div class="h3 text-center">
                    Commands
                </div>
                <div v-if="commands.length > 0" class="table-responsive">
                    <table id="commandsTable" class="table table-striped table-hover table-dark data-table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Cooldown (sec.)</th>
                                <th scope="col">Last Exec</th>
                                <th scope="col">Active</th>
                                <th scope="col" class="text-center" data-orderable="false">
                                    <span class="d-inline-block" data-toggle="tooltip" data-placement="top" title="Refresh" @click="getCommands()">
                                        <font-awesome-icon :icon="['fas', 'sync']" class="fa-fw" />
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- eslint-disable-next-line vue/require-v-for-key -->
                            <tr v-for="(command, index) in commands" class="video">
                                <td>{{ index + 1 }}</td>
                                <td>{{ command.name }}</td>
                                <td>
                                    <input v-model="commands[index].cooldown" type="number" min="0" class="form-control form-control-sm" placeholder="sec.">
                                </td>
                                <td>{{ (command.lastExec * 1000)|formatDateTime($t('time-long-suffix')) }}</td>
                                <td :data-order="command.active ? '1' : '0'" :data-search="command.active ? 'active-yes' : 'active-no'">
                                    <div class="custom-control custom-switch">
                                        <input :id="'command-active-' + index" v-model="commands[index].active" type="checkbox" value="1" class="custom-control-input">
                                        <label class="custom-control-label" :for="'command-active-' + index">&nbsp;</label>
                                    </div>
                                </td>
                                <td class="text-center">
                                    <button type="button" class="btn btn-sm btn-info" data-toggle="tooltip" data-placement="top" title="Save" @click="updateCommand(index)"><font-awesome-icon :icon="['fas', 'save']" class="fa-fw" /></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
