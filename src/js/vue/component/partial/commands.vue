<script>
    import btnAnimation from '../../method/btn-animation';
    import dataTable from '../../method/data-table';

    export default {
        mixins: [btnAnimation, dataTable],
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
            updateCommand: function(commandIndex) {
                if (typeof streamWrite === 'function' 
                    && (this.commands[commandIndex].cooldown >= 0 && this.commands[commandIndex].cooldown <= 3600)) {
                    const call = {
                        method: 'updateCommand',
                        args: {
                            channel: this.$root._route.params.channel.toLowerCase(),
                            command: this.commands[commandIndex],
                            commandIndex: commandIndex
                        },
                        env: 'node'
                    };

                    streamWrite(call);
                    this.btnAnimation(event.target, 'success');
                    this.updateDataTableRow(commandIndex, 'commandsTable');
                } else {
                    this.btnAnimation(event.target, 'error');
                    this.updateDataTableRow(commandIndex, 'commandsTable');
                }
            },
            updateCommandLastExec: function(args) {
                if (this.$root._route.params.channel.toLowerCase() === args.channel.toLowerCase()) {
                    this.commands[args.commandIndex].lastExec = args.lastExec;
                    this.updateDataTableRow(args.commandIndex, 'commandsTable');
                }
            }
        }
    };
</script>

<template>
    <div class="row">
        <div class="col-12">
            <div class="commands p-2">
                <div class="h4 text-center">
                    Commands
                </div>
                <div v-if="commands.length > 0" class="table-responsive">
                    <table id="commandsTable" class="table table-striped table-hover table-dark data-table">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Cooldown</th>
                                <th scope="col">Last Exec</th>
                                <th scope="col">Active</th>
                                <th scope="col" class="text-center" data-orderable="false">
                                    <span class="d-none" data-toggle="tooltip" data-placement="top" title="Refresh" @click="getCommands()">
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
                                <td :data-order="command.cooldown">
                                    <div class="input-group input-group-sm">
                                        <input v-model.number="commands[index].cooldown" type="number" min="0" max="3600" class="form-control" :class="{'is-invalid': commands[index].cooldown < 0 || commands[index].cooldown > 3600}">
                                        <div class="input-group-append">
                                            <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
                                            <div class="input-group-text">s</div>
                                        </div>
                                    </div>
                                </td>
                                <td :data-order="command.lastExec">
                                    <span class="d-inline-block text-nowrap" data-toggle="tooltip" data-placement="top" :title="command.lastExec|formatDateTime($t('datetime'))">
                                        {{ command.lastExec|formatDateTime($t('time-long-suffix')) }}
                                    </span>
                                </td>
                                <td :data-order="command.active ? '1' : '0'" :data-search="command.active ? 'active-yes' : 'active-no'">
                                    <div class="custom-control custom-switch">
                                        <input :id="'command-active-' + index" v-model.number="commands[index].active" type="checkbox" class="custom-control-input">
                                        <label class="custom-control-label" :for="'command-active-' + index">&nbsp;</label>
                                    </div>
                                </td>
                                <td class="text-center">
                                    <button type="button" class="btn btn-sm btn-primary btn-animation" data-animation-success="success" data-animation-error="error" data-toggle="tooltip" data-placement="top" title="Save" @click="updateCommand(index)"><font-awesome-icon :icon="['fas', 'save']" class="fa-fw" /></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
